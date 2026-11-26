import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdir, mkdtemp, readFile, rename, rm, stat, writeFile} from 'node:fs/promises';
import {join, resolve} from 'node:path';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {parseArgs} from 'node:util';
import {FX} from '../effects/index.js';
import {P, PN} from '../palettes.js';
import {renderLoopFrame} from '../render.js';

const {values: options} = parseArgs({options: {
  scene: {type: 'string', default: 'save-point'},
  palette: {type: 'string'},
  width: {type: 'string', default: '1920'},
  height: {type: 'string', default: '1080'},
  fps: {type: 'string', default: '24'},
  'pixel-size': {type: 'string', default: '4'},
  out: {type: 'string'},
  ffmpeg: {type: 'string', default: process.env.FFMPEG_PATH || 'ffmpeg'},
  help: {type: 'boolean'},
}});

if (options.help) {
  console.log(`npm run export:hero -- [--scene save-point] [--palette stashtab]
  [--width 1920] [--height 1080] [--fps 24] [--pixel-size 4]
  [--out tmp/hero/save-point-stashtab] [--ffmpeg /path/to/ffmpeg]

Outputs silent WebM and MP4 loops, desktop and mobile PNG posters, and preview.html.
FFmpeg must have libvpx-vp9 and libx264. The default palette comes from the scene.`);
} else {
  await exportHero().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

function integerOption(name, min, max) {
  const number = Number(options[name]);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new Error(`--${name} must be an integer between ${min} and ${max}.`);
  }
  return number;
}

function rawInput(width, height, fps) {
  return ['-f', 'rawvideo', '-pixel_format', 'rgba', '-video_size', `${width}x${height}`,
    '-framerate', String(fps), '-i', 'pipe:0'];
}

async function encode(args, frames) {
  const child = spawn(options.ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
    stdio: ['pipe', 'ignore', 'inherit'],
  });
  const completion = once(child, 'close').then(([code, signal]) => {
    if (code !== 0) throw new Error(`FFmpeg failed (${signal || code}).`);
  });
  try {
    await Promise.all([pipeline(Readable.from(frames), child.stdin), completion]);
  } catch (error) {
    child.kill();
    await completion.catch(() => {});
    if (error.code === 'ENOENT') {
      throw new Error('FFmpeg was not found. Install FFmpeg or pass --ffmpeg /path/to/ffmpeg.');
    }
    if (error.code === 'EPIPE') throw new Error('FFmpeg stopped accepting frames. See its error above.');
    throw error;
  }
}

async function exportHero() {
  const scene = FX.find(item => item.name === options.scene);
  if (!scene) throw new Error(`Unknown scene: ${options.scene}. Use a name from effects/index.js.`);
  const paletteIndex = options.palette === undefined ? scene.pal : PN.indexOf(options.palette);
  if (paletteIndex < 0) throw new Error(`Unknown palette: ${options.palette}. Choose from ${PN.join(', ')}.`);
  const palette = P[paletteIndex];
  const width = integerOption('width', 16, 7680);
  const height = integerOption('height', 16, 4320);
  const fps = integerOption('fps', 1, 60);
  const pixelSize = integerOption('pixel-size', 1, 16);
  if ([width, height].some(dimension => dimension % 2 || dimension % pixelSize)) {
    throw new Error('Width and height must both be even and divisible by --pixel-size.');
  }

  const duration = scene.loopSeconds ?? 6;
  const stem = `${scene.name}-${PN[paletteIndex]}`;
  const out = resolve(options.out ?? join('tmp', 'hero', stem));
  const files = {
    webm: `${stem}.webm`,
    mp4: `${stem}.mp4`,
    poster: `${stem}-poster.png`,
    mobile: `${stem}-mobile.png`,
    preview: 'preview.html',
  };
  const phase = 2.5 % duration;

  function* frames(frameWidth, frameHeight, count) {
    const image = {width: frameWidth, height: frameHeight, data: new Uint8ClampedArray(frameWidth * frameHeight * 4)};
    for (let i = 0; i < count; i++) {
      const time = (phase + i / fps) % duration;
      renderLoopFrame(image, palette, scene, time, duration);
      yield Buffer.from(image.data);
    }
  }

  async function poster(target, posterWidth, posterHeight, cellSize) {
    const w = posterWidth / cellSize, h = posterHeight / cellSize;
    await encode([...rawInput(w, h, fps), '-vf', `scale=${posterWidth}:${posterHeight}:flags=neighbor`,
      '-frames:v', '1', '-c:v', 'png', '-pix_fmt', 'rgb24', '-compression_level', '9', '-update', '1', target], frames(w, h, 1));
  }

  await mkdir(out, {recursive: true});
  const stage = await mkdtemp(join(out, '.encoding-'));
  const target = file => join(stage, file);
  try {
    const w = width / pixelSize, h = height / pixelSize;
    const videoFilter = `scale=${width}:${height}:flags=neighbor:out_color_matrix=bt709,format=yuv420p,split=2[vp9][h264]`;
    const videoOptions = ['-an', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-g', String(fps * 2)];
    console.log(`Rendering ${scene.label ?? scene.name} · ${width}×${height}, ${fps} fps, ${duration}s`);
    await encode([...rawInput(w, h, fps), '-filter_complex', videoFilter,
      '-map', '[vp9]', ...videoOptions, '-c:v', 'libvpx-vp9', '-crf', '28', '-b:v', '0',
      '-deadline', 'good', '-cpu-used', '3', '-row-mt', '1', '-threads', '4', target(files.webm),
      '-map', '[h264]', ...videoOptions, '-c:v', 'libx264', '-crf', '21', '-preset', 'fast',
      '-threads', '4', '-movflags', '+faststart', target(files.mp4)], frames(w, h, fps * duration));
    await poster(target(files.poster), width, height, pixelSize);
    await poster(target(files.mobile), 960, 1200, 4);

    const formats = await Promise.all([
      [files.webm, 'video/webm; codecs=vp9'],
      [files.mp4, 'video/mp4'],
    ].map(async ([name, type]) => ({name, type, size: (await stat(target(name))).size})));
    const sources = formats.sort((a, b) => a.size - b.size)
      .map(({name, type}) => `<source data-src="${name}" type="${type}">`).join('\n      ');
    const template = await readFile(new URL('./hero-preview.html', import.meta.url), 'utf8');
    const html = template.replaceAll('%%STEM%%', stem).replace('%%SOURCES%%', sources)
      .replace('%%BACKGROUND%%', `rgb(${palette[0].join(', ')})`);
    await writeFile(target(files.preview), html);
    for (const file of Object.values(files)) {
      await rename(target(file), join(out, file));
      const {size} = await stat(join(out, file));
      console.log(`${file}  ${(size / 1024).toFixed(1)} KiB`);
    }
    console.log(out);
  } finally {
    await rm(stage, {recursive: true, force: true});
  }
}
