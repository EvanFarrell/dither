import {build, transform} from 'esbuild';
import {mkdir, readFile, writeFile, cp, rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = root + 'dist/';

// 1. Bundle every effect module into one IIFE
const {outputFiles} = await build({
  entryPoints: [root + 'app.js'],
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2020',
  legalComments: 'none',
  write: false
});
const js = outputFiles[0].text.replace(/<\/script/gi, '<\\/script');

// 2. Inline the bundle and minified CSS into the page
let html = await readFile(root + 'index.html', 'utf8');

const style = html.match(/<style>([\s\S]*?)<\/style>/);
if (style) {
  const css = await transform(style[1], {loader: 'css', minify: true});
  html = html.replace(style[0], () => `<style>${css.code.trim()}</style>`);
}

const tag = '<script type="module" src="./app.js"></script>';
if (!html.includes(tag)) throw new Error('could not find the app.js script tag');
// function replacement, so `$` sequences in the bundle are never expanded
html = html.replace(tag, () => `<script>${js}</script>`);

// 3. Emit dist/ with the static assets next to it
await rm(out, {recursive: true, force: true});
await mkdir(out, {recursive: true});
await writeFile(out + 'index.html', html);
await cp(root + 'audio', out + 'audio', {recursive: true});
await cp(root + 'og.png', out + 'og.png');

const kb = n => (n / 1024).toFixed(1) + ' kB';
console.log(`dist/index.html  ${kb(Buffer.byteLength(html))}  (js ${kb(Buffer.byteLength(js))})`);
