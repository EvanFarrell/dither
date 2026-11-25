# retro-loops

![Collage of twelve retro-loops styles: Tokyo neon, poolrooms, black hole, sliced sunset, Saturn, Escher stairs, nebula, clouds, vortex, dreamfield, arches, ocean world](./og.png)

**Live:** [retro-loops.vercel.app](https://retro-loops.vercel.app) · [∞.vercel.app](https://xn--59g.vercel.app)

Dithered animated backdrops and dreamcore loops for screenshots and video exports. Paste a screenshot to frame it in the middle of a moving scene, pick an instrumental soundtrack, and record a 6-second MP4/WebM loop with audio baked in.

Built with [fx](https://fx.sh).

No build step, no dependencies, no framework. One `index.html`, one ES module, and a folder of effect definitions.

## How it works

Every effect is a pure scalar field:

```js
fn(u, v, t) -> [0, 1)
```

`u` and `v` are centered screen coordinates, `t` is seconds. The renderer evaluates that field per pixel, then:

1. **Quantizes** the value into 4 levels.
2. **Dithers** with a 4×4 Bayer matrix, so the `0..1` gradient becomes a stable dot pattern instead of banding.
3. **Maps** each of the 5 resulting indexes to a color from a 5-stop palette.
4. Renders at quarter resolution and upscales with `imageSmoothingEnabled = false`, which gives the chunky pixel grid its retro texture.

Because a scene is just a function, a whole new style is ~20–80 lines of math: signed distance fields for architecture, domain-warped value noise for clouds and nebulae, and DDA raymarching/raycasting for the first-person rooms.

Audio is decoded with Web Audio and routed through `MediaStreamAudioDestinationNode`, then muxed with `canvas.captureStream()` into `MediaRecorder`, so exported clips carry sound.

## Effects (34)

| Category | Effects |
| --- | --- |
| `classic` | `vortex` `plasma` `tunnel` `aurora` `metaballs` `grid` |
| `skies` | `clouds` `godrays` `sunslice` `storm` `cumulus` |
| `planets` | `saturn` `eclipse` `jupiter` `moons` `oceanworld` |
| `space` | `starfield` `blackhole` `galaxy` `pulsar` `nebula` |
| `dreamcore` | `poolrooms` `portals` `dreamfield` `arches` `halo` `memory` |
| `impossible` | `droste` `escher` `atrium` `backrooms` `mirrors` `labyrinth` `tokyo` |

Standouts:

- **`droste`** — Escher's *Print Gallery*, a logarithmic conformal spiral where the map tiles exactly on itself.
- **`escher`** — *Relativity* staircases folded along three perpendicular gravity axes.
- **`backrooms`**, **`labyrinth`**, **`tokyo`** — 2D DDA raycasters with perspective-correct floors, ceilings, wet reflections and neon signage.
- **`atrium`**, **`mirrors`** — 3D SDF scenes: an endless balcony shaft, and a Kusama infinity room.

## Palettes (11)

`sunset` `cyan` `ember` `synth` `phosphor` `mono` `daydream` `poolrooms` `deepspace` `ochre` `tokyo`

Each effect ships with a default palette, and `p` cycles through all of them.

## Controls

| | |
| --- | --- |
| `←` `→`, click canvas | previous / next effect |
| `p` | next palette |
| paste `⌘V` or drop an image | frame a screenshot |
| `−` `+` | shrink / grow the background margin |
| `♪` | preview the selected soundtrack |
| `● 6s` / `↻ loop` | record a clip, optionally as a seamless 6s loop |

## URL parameters

- `#<effect>` or `?e=<effect>` — open on an effect, e.g. `?e=tokyo#tokyo`
- `?p=<palette>` — override the palette, e.g. `?e=saturn&p=mono`
- `?a=<track|none>` — soundtrack: `liminal-poolrooms`, `vhs-daydream`, or `none`

Opening a URL with audio selected shows a **click to start** gate: it pre-decodes the track behind a still frame, then starts the motion and the music on the same frame, so nothing is out of sync.

## Soundtracks

Two instrumental dreamcore loops composed with Suno and shipped in `audio/`:

- `Liminal Poolrooms` — warm detuned Rhodes, underwater bells, cavernous reverb
- `VHS Daydream` — tape-wobbled analog arpeggios, music-box celesta, lo-fi hiss

You can also drop in your own audio file; it plays and records the same way.

## Project structure

```text
index.html          markup, UI, styles
app.js              renderer, dithering, audio, recorder, URL/state handling
palettes.js         11 five-stop palettes
og.png              1200×630 collage used for the social card
effects/
  index.js          stitches every category together into one ordered list
  noise.js          shared math: clamp, smoothstep, hash, value noise, fbm, ridged noise
  classic.js        6   abstract fields
  skies.js          5   clouds, rays, sun, storm, cumulus
  planets.js        5   saturn, eclipse, jupiter, moons, ocean world
  space.js          5   starfield, black hole, galaxy, pulsar, nebula
  dreamcore.js      6   poolrooms, portals, dreamfield, arches, halo, memory
  impossible.js     7   droste, escher, atrium, backrooms, mirrors, labyrinth, tokyo
audio/              two instrumental loops
```

Adding an effect means adding one entry to a category file — `{name, cat, pal, fn}` — and it shows up in the dropdown, the URL router, and the recorder automatically.

## Running locally

No build step needed — the ES modules just need HTTP, not `file://`:

```bash
npm run dev            # python3 -m http.server 8420
# open http://127.0.0.1:8420
```

## Building

`npm run build` bundles the ten modules into one minified inline script with esbuild and writes `dist/`:

```bash
npm run build          # dist/index.html + dist/audio + dist/og.png
npm run preview        # build, then serve dist/ on :8420
```

The bundle and CSS are inlined, so the built page is a single HTML request plus the audio files (~40 kB total, zero JS requests). Local development never needs this step.

## Deployment

Static output: run `npm run build` and serve `dist/` from any static host. `og.png` is referenced by the Open Graph and Twitter tags in `index.html`, so update those URLs if you host it on another domain.
