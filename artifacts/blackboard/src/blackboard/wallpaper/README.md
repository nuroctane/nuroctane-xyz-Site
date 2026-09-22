# Wallpaper Engine ports

The Blackboard's wallpapers come from Wallpaper Engine workshop items. Nine are
WebGL ports of `scene` items, one is a CSS animation ported as maths, and two
ship as a finished loop that is played rather than reproduced. This is how the
sources were read, so the ports can be re-derived or re-checked.

| variant | workshop item | workshop title | type | effects ported |
|---|---|---|---|---|
| `abstract` | [2207944762](https://steamcommunity.com/sharedfiles/filedetails/?id=2207944762) | Black & White Abstract | scene | `tint`, `clouds`, `godrays`, `shine`, `waterripple` (five passes; `tint` is modelled by the tone curve rather than as a shader) |
| `clouds` | [3612455067](https://steamcommunity.com/sharedfiles/filedetails/?id=3612455067) | Black & White Clouds | scene | `shake`, `waterflow` |
| `japanese` | [2791515879](https://steamcommunity.com/sharedfiles/filedetails/?id=2791515879) | Black and White Japanese | scene | `foliagesway` |
| `forest` | [3679836853](https://steamcommunity.com/sharedfiles/filedetails/?id=3679836853) | black and white forest | scene | `clouds` |
| `sakura` | [3493394392](https://steamcommunity.com/sharedfiles/filedetails/?id=3493394392) | White sakura | scene | `shake` |
| `blossom` | [3613577930](https://steamcommunity.com/sharedfiles/filedetails/?id=3613577930) | White sakura (the second item of that name) | scene | `shake`, `waterflow` |
| `waves` | [2279430364](https://steamcommunity.com/sharedfiles/filedetails/?id=2279430364) | Black Waves | scene | `waterflow` (disabled in the source), `waterripple` |
| `roses` | [2549515627](https://steamcommunity.com/sharedfiles/filedetails/?id=2549515627) | Black Roses (Music) | scene | `foliagesway`, `shine`, `filmgrain`, `tint` |
| `gears` | [3128684611](https://steamcommunity.com/sharedfiles/filedetails/?id=3128684611) | Ender Rotating Gears WUHD (4K) | scene | `spin` ×6, `tint`, grade LUT |
| `lattice` | [1760275007](https://steamcommunity.com/sharedfiles/filedetails/?id=1760275007) | Black | scene | `fog` particles, `shake` |
| `sweep` | [3036482397](https://steamcommunity.com/sharedfiles/filedetails/?id=3036482397) | Angular Gradient - Black White (Animated) | **web** | none — a CSS `conic-gradient`, evaluated directly |
| `dots` | [3759381233](https://steamcommunity.com/sharedfiles/filedetails/?id=3759381233) | Abstract Black & White Oled | **video** | none — the loop *is* the artwork |
| `topography` | [3636465548](https://steamcommunity.com/sharedfiles/filedetails/?id=3636465548) | white-on-black-topographical-map-clean | **video** | none — the loop *is* the artwork |

The nine `scene` items are each one fullscreen image object with live effects on
top. `variants.ts` reproduces the effect maths; the constants are the ones
`scene.json` overrides. Three of the scenes ship more objects than that —
`blossom` adds two audio objects, `waves` adds an invisible normal-map object,
and `roses` adds a second image layer — and none of them are ported; only the
image object's effect chain is.

## Labels

The switcher's label is not the workshop title. Titles there carry uploader
noise — `(Music)`, `(Animated)`, `-clean`, file-style lowercasing — and two of
the originals are actively misleading: `lattice`'s is just "Black", and `dots`'s
calls a dot field an OLED. The convention matches the seven that were already
shipping (`Black & White Clouds`, `White Sakura in Fog`, `Black Waves`): **tone
then subject**, Title Case, no suffixes, and the slug is the lowercase subject
alone.

| slug | shipped label | slug | shipped label |
|---|---|---|---|
| `abstract` | Black & White Abstract | `roses` | Black Roses |
| `clouds` | Black & White Clouds | `lattice` | Black Lattice |
| `japanese` | Black & White Japanese | `sweep` | Black & White Sweep |
| `forest` | Black & White Forest | `dots` | Black & White Dots |
| `sakura` | White Sakura | `topography` | White Topography |
| `blossom` | White Sakura in Fog | `gears` | Black Gears |
| `blossom` | White Sakura in Fog | | |
| `waves` | Black Waves | | |

Every `title` and `aria-label` in the switcher is derived from
`VARIANTS[id].label`, so a rename only ever has to touch the label.

## The preset that is not a wallpaper

[2871807573](https://steamcommunity.com/sharedfiles/filedetails/?id=2871807573)
"Black'n White" has no media of its own: its folder holds only `preview.jpg` and
a `project.json` with **no `type` and no `file`**, just a `"dependency"` on
`2406911626`. It is a settings preset layered over someone else's scene, so there
is nothing to extract and it is not a variant.

Its settings are still the useful part — they are the *look* the new scenes are
wanted in, and its dependency scene renders a purple prism that this preset
flattens to monochrome:

```
darkmode: true   colorshifting: true   saturation(wec_sa): 0
brightness(wec_brs): 58   contrast(wec_con): 49   bloomstrength: 1.5
shiftstrength: 0.41   smoothrate: 13   responsiveness: 75   rate: 100
particles: true   pattern: rings   particlecolor: 1 1 1   walls: 0 0 0
```

`lattice`'s plate is composited at `saturation 0 / brightness 58 / contrast 49`
for exactly this reason: what is stored is what the scene looks like under the
preset, not what it renders bare.

## Where the source lives

Wallpaper Engine keeps subscribed items unpacked at

```
<steam>/steamapps/workshop/content/431960/<published_file_id>/
  project.json     metadata: title, type, tags, preview, scheme colour
  scene.pkg        a `scene` item: scene.json, shaders, textures, mask maps
  shaders/         compiled SM40 blobs (not needed — the GLSL sources are packed)
  index.html       a `web` item: the whole wallpaper is just this
  <name>.mp4       a `video` item: the whole wallpaper is just this
  preview.gif|jpg  the author's preview
```

`431960` is Wallpaper Engine's app id.

`project.json`'s `type` field is the fastest triage there is, because each type
needs completely different work:

- **`scene`** → unpack `scene.pkg` and decode `.tex` (sections 1–2 below).
- **`web`** → read `index.html`. A web wallpaper is usually a few lines of CSS
  or canvas, and if it is CSS the port can evaluate the same maths instead of
  re-deriving it. `sweep` is one line of `conic-gradient`, reproduced exactly.
- **`video`** → transcode the `.mp4` and let a `<video>` element play it. There
  is no shader to write; the master *is* the artwork.

A `project.json` with **no `type`, no `file`, and a `dependency`** is not a
wallpaper at all — it is a settings preset. See the 2871807573 section.

## 1. Unpack `scene.pkg`

A simple container — no tooling required.

```
u32  magic_len (=8)
char magic[magic_len]      "PKGV0023"
u32  entry_count
entry_count x {
  u32  name_len
  char name[name_len]      UTF-8, '/'-separated
  u32  offset              relative to the start of the data section
  u32  size
}
<data section>
```

Writing that out gives `scene.json`, `shaders/effects/*.frag|.vert` (WE packs the
author's shader **sources**, not just the compiled blobs) and the materials.

## 2. Decode the `.tex` textures

```
TEXV0005\0 TEXI0001\0
u32 format            0 = RGBA8888, 8 = RG8
u32 flags
u32 textureWidth, u32 textureHeight
u32 width, u32 height
u32 pad
TEXB0004\0
u32 imageCount
u32 freeImageFormat   -1 = raw mipmap pixels, 2 = the mipmap IS a JPEG file
u32 isVideoMp4
per image:
  u32 mipmapCount
  per mipmap:  u32 width, u32 height, u32 isLZ4, u32 decompressedLen, u32 byteLen, bytes
```

Two cases matter:

- **`freeImageFormat == 2`** — the mipmap bytes are a complete JPEG. The clouds
  plate is stored this way, so it is simply extracted, not reconstructed.
- **`freeImageFormat == -1`** — raw pixels in `format`. The flow masks are
  `format == 8` (RG8, 2 bytes per pixel: `R = flow.x`, `G = flow.y`), LZ4
  block-compressed. The LZ4 block format is small enough to decode directly;
  no `lz4` binding is needed.

RG8 is widened to RGBA with `B = 0, A = 255` so the shaders' `.rg` reads behave
identically to the originals.

The **neutral value of a WE flow map is 0.498** (≈127/255), and the shaders
resolve it as `(texel.rg - 0.498) * 2`. The clouds scene's masks sit at exactly
neutral across the sky, which is what keeps the sky perfectly still.

## 3. Assets shipped

`scripts` are kept out of the repo; the built files live in
`public/assets/blackboard/<scene>/`. The flow maps are **lossless** WebP on
purpose — lossy WebP subsamples chroma, and these channels *are* the flow
vectors; lossy noise in the neutral sky would shimmer. Wallpaper Engine's own
built-in textures are copied **byte for byte** rather than re-encoded, so the
cloud, noise and no-flow patterns are the exact ones the shaders sample.

| file | size | notes |
|---|---|---|
| `clouds/clouds.webp` | 3413x1920, q90, 180 KB | plate, desktop |
| `clouds/clouds-1280.webp` | 1280x720, q88, 38 KB | plate, mobile |
| `clouds/clouds-shake-mask.webp` | 1024x576, lossless, 138 KB | shake flow map |
| `clouds/clouds-waterflow-mask.webp` | 1024x576, lossless, 34 KB | waterflow flow map |
| `clouds/clouds-waterflow-phase.png` | 32x32, 2 KB | scalar phase noise |
| `japanese/japanese.webp` | 2560x1440, 305 KB | plate, desktop (source 3840x2160) |
| `japanese/japanese-portrait.webp` | 1215x2160, 207 KB | plate, mobile |
| `japanese/japanese-foliage-mask.webp` | 1024x576, lossless, 39 KB | foliagesway mask (source 1920x1080, half the plate in both axes) |
| `japanese/japanese-noise.png` | 256x256, 257 KB | `util/noise`, copied byte for byte |
| `forest/forest.webp` | 1920x1080, 342 KB | plate, desktop |
| `forest/forest-portrait.webp` | 606x1080, 171 KB | plate, mobile |
| `forest/forest-clouds.png` | 256x256, 24 KB | `util/clouds_256`, copied byte for byte |
| `sakura/sakura.webp` | 2560x1440, 619 KB | plate, desktop |
| `sakura/sakura-portrait.webp` | 810x1440, 351 KB | plate, mobile |
| `sakura/sakura-shake-mask.webp` | 1024x576, lossless, 116 KB | shake flow map (source 1280x720, half the plate) |
| `blossom/blossom.webp` | 2560x1441, 225 KB | plate, desktop (source 3412x1920) |
| `blossom/blossom-portrait.webp` | 1080x1920, 144 KB | plate, mobile |
| `blossom/blossom-shake-mask.webp` | 1024x576, lossless, 139 KB | shake flow map (source 1706x960, half the plate) |
| `blossom/blossom-waterflow-mask.webp` | 1024x576, lossless, 57 KB | waterflow flow map (source 1706x960) |
| `blossom/blossom-phase.png` | 32x32, 2 KB | scalar phase noise |
| `waves/waves.webp` | 2560x1440, 363 KB | plate, desktop (the source is an 8192x1536 pano, cropped to 16:9) |
| `waves/waves-portrait.webp` | 864x1536, 140 KB | plate, mobile |
| `waves/waves-normal.webp` | 256x256, lossless, 99 KB | the scene's real `effects/waterripplenormal` |
| `waves/waves-phase.png` | 32x32, 2 KB | scalar phase noise |
| `waves/waves-noflow.png` | 32x32, 169 B | `util/noflow`, copied byte for byte |
| `roses/roses.webp` | 2560x1080, 252 KB | plate, desktop |
| `roses/roses-portrait.webp` | 1080x1920, 152 KB | plate, mobile |
| `gears/gears.webp` | 2580x1413 | plate, desktop (exact half of the 5160x2825 scene) |
| `gears/gears-portrait.webp` | 1080x1920 | plate, mobile (center crop) |
| `gears/g1.webp` … `g7.webp` | 1179–1417px, q90 | the six gear layers, pre-tinted grey 192 |
| `gears/simple-film.png` | 32x1024, 30 KB | the scene's grade LUT, copied byte for byte |
| `lattice/lattice.webp` | 2560x1080, 23 KB | plate, desktop (near-black, so it compresses hard) |
| `lattice/lattice-portrait.webp` | 1080x1920, 12 KB | plate, mobile |
| `sweep/sweep.webp` | 2560x1080, 10 KB | poster, desktop — the canvas paints over it |
| `sweep/sweep-portrait.webp` | 1080x1920, 8 KB | poster, mobile |
| `dots/dots.webp` | 1920x1080, 135 KB | poster, desktop |
| `dots/dots-portrait.webp` | 1080x1920, 79 KB | poster, mobile |
| `dots/dots-1920.mp4` | 1920x1080, 24fps, 15.2 MB | desktop loop (source 3840x2160 @ 60fps) |
| `dots/dots-960.mp4` | 960x540, 24fps, 7.0 MB | mobile loop |
| `topography/topography.webp` | 1920x1080, 109 KB | poster, desktop |
| `topography/topography-portrait.webp` | 1080x1920, 62 KB | poster, mobile |
| `topography/topography-1920.mp4` | 1920x1080, 24fps, 10.4 MB | desktop loop (source 4K60) |
| `topography/topography-960.mp4` | 960x540, 24fps, 4.1 MB | mobile loop |

The three portrait plates for `roses`, `lattice` and `sweep` are 1080x1920 and
their desktop plates 2560x1080 — 21:9, matching each source's own aspect rather
than being cropped to 16:9, because these are already monochrome fields where
the corners carry as much of the look as the centre.

Every source mask is half its plate in both axes — 1280x720 against 2560x1440 for
`sakura`, 1706x960 against 3412x1920 for `blossom`, 1920x1080 against 3840x2160
for `japanese` — and the shipped assets keep that aspect at a smaller pixel size.
The aspect is the part that matters: a shader samples a mask with the object's
own uv, so a uniform rescale of the mask changes nothing.

## 4. Deviations from the source

Documented in full at each site in `variants.ts`; the short version:

- **`shake`** (`clouds`, `sakura`, `blossom`) — the source's
  `sin(frac(time / PI_HALF) * PI_HALF)` ramps and resets every 2.12 s. Replayed
  through this port that reset measures as a **~10x frame-to-frame motion
  spike** (verified with a CPU reference render), i.e. a periodic jolt. The port
  eases the same period into a swell — amplitude, speed and cloud-only gating are
  unchanged, the step is gone. The author's own 192px preview could not resolve
  the step, so it was checked numerically rather than by eye.
- **`waterflow`** (`blossom`, `waves`) — the shader build both scenes ship
  computes a linear crossfade, `2 * abs(cycles.x - 0.5)`, with no feather term at
  all; the vertex's smoothed blend is not even read by its own fragment. The port
  keeps the clouds scene's eased crossfade rather than adding a third variant of
  the same maths. Amplitude and period are identical, only the shape of the
  crossfade differs, and for `waves` it cannot be seen at all (next bullet).
- **`waves` / `waterflow` is inert** — the scene points the flow map at
  `util/noflow`, a flat neutral 127. `(127/255 - 0.498) * 2` is 8e-5, so the pass
  displaces the plate by about **4e-7 uv** — a thousandth of a pixel. The source
  also has it `"visible": false`. It is ported because the scene defines it, not
  because it does anything: the visible motion is the `waterripple` pass.
- **`forest`'s tone curve is a fit, not the per-pixel output** — the cloud veil
  is a real level change, so this variant needs a curve; it is fitted in linear
  light because that is what the luminance field averages (see the `toneMap`
  note in `variants.ts`). The fit reproduces the field's time-average to **0.7%**
  and stays within **6.9% mean / 18.9% max** at any single instant. That residual
  is the cloud drift, not curve error: the veil's own spatial mean swings between
  0.297 and 0.612 over a drift period, taking the rendered linear field between
  0.117 and 0.163. The sRGB-domain curve this port used first was biased **10.4%
  low on average and 29.6% at worst**, because the sRGB decode is convex and the
  field averages after linearising.
- **`japanese`'s sway is faithfully near-invisible** — the amplitude is
  `strength² * 0.005` gated by the mask, so the summed displacement tops out
  around 1.3e-3 uv: **about one pixel at 1024 px wide**. It is not amplified. On
  a 2560 px plate it reads as a slow breath, not a visible motion.
- **`blossom`'s audio objects are dropped** — the scene carries two audio
  objects (`machine girl - MG1`, a second mp3) that the site has no audio bus
  for. Nothing else in the scene references them.
- **`abstract`** — the raw plate is very dark, so the port applies the same
  exposure lift the original's tone mapping implies. Unchanged from the shipped
  implementation.
- Every scene pins `schemecolor` to grey; the ports render pure monochrome
  (luminance) to match the Blackboard's palette.
- **`roses`' `foliagesway` is the MODE 0 fragment branch, ported whole** — the
  same maths as the `japanese` port with this scene's own constants (scale 0.19,
  ratio 1.36, scrolldirection -2.7109, phase 0.34, power 2, speeduv 2.82,
  strength 0.47, no mask). The source's vertex-displacement branch (MODE 1, with
  corner and direction weights) is dead code for this scene, exactly as for
  `japanese`. Per-pixel phase from `util/noise` is what rustles leaves against
  the branch sway. Its `tint` is a no-op: white at alpha 0.15 over a plate this
  dark lifts blacks by a fraction of a percent, far below the filmgrain it ships
  alongside. The shine pass is not ported: it is a bloom-shaped highlight
  catcher with no bloom buffer to catch on, and the plate already carries the
  highlights it would lift.
- **Both sakuras carry a petal rustle the sources do not** — each source's
  `shake` drives every masked pixel with one global phase, so the whole branch
  breathes as a sheet. A second displacement with per-pixel phase from
  `util/noise` (two incommensurate frequency pairs, ~1.4px max, gated by the
  shake flow amount so the masked-out sky stays still) flutters petals against
  that sway. Uv-only like the shake, so the identity tone curves still hold.
- **`clouds` travels by luminance, churns near source strength** — the flow
  mask is sparse (median flow is zero), so gating travel by it left most of
  the mass static; the plate's own luminance gates instead (clouds bright, sky
  black). A 50s ping-pong along a rising leftward wind at ±5% uv, faded to
  zero at the borders so the clamped plate never smears. The waterflow replays
  at 0.16 — its churn is the clouds' texture-life, and taming it further left
  the scene static.
- **`gears` runs at the local settings, not the project defaults** — color ON,
  gears grey 192, background black, rate 151%, `simple_film` grade, taken from
  `WallpaperEngine/config.json` on DISPLAY1. The defaults (color off, red gears,
  grey backdrop) never ship. The additive composite is an inference, but a
  forced one: the six layer textures are opaque black squares, so anything but
  addition would paste visible squares — the shipped scene reads clean, so the
  layers add. If overlaps ever read hotter than the desktop, the suspect is
  this choice (screen would be the softer alternative), not the geometry.
- **Nature moves harder on phones** — `clouds`, `japanese`, `forest`, `sakura`,
  `blossom`, `waves` and `roses` carry a `uBoost` uniform (1.0 desktop,
  2.5 mobile) over their displacement amplitudes and drift rates. The same uv
  offset shrinks to a fraction of its desktop pixels on a phone canvas, so the
  sway is re-amplified there to read the same. Levels never change, so every
  identity tone curve still holds.
- **`lattice`'s fog is a parallax, not particles** — the source runs a fog
  particle pass, and the preset asks for `rate 100 / smoothrate 13`, i.e. long
  smooth drifts. The port reproduces the drift as a two-axis parallax with a
  second deeper sample for body, which is what the particles read as at that
  smoothness. The plate itself is the source's four beam layers composited at
  the preset's own `saturation 0 / brightness 58 / contrast 49`.
- **`sweep`'s ink is a local average of the ramp** — the live field is sampled
  over the switcher's own box, and that box sits about 95 px from the conic
  origin, so it spans roughly 18° of the gradient. The pole therefore changes
  slightly later in the cycle than the value at the box's exact centre would
  suggest. This is deliberate: averaging over the glyph's actual footprint is a
  better description of what is behind the glyph than a point sample. Measured
  over a full revolution, the worst contrast anywhere in the cycle is **3.17:1**,
  against a floor of 3.0.
- **`dots` and `topography` are downscaled, not reproduced** — both sources are
  4K60 H.264 loops (163 MB and 300 MB). They ship at 1080p24 desktop / 540p24
  mobile: 15.2 MB and 10.4 MB. A frame-diff against the full-rate encode of
  `dots` measures mean 2.4 / p99 31, and a side-by-side of the dot field at 8x
  zoom shows the dots still round with no ringing — these are slow, low-contrast
  fields, so the frame rate buys nothing visible and costs 45% of the payload.
- **The ink tolerates an unseen darkening, because the field cannot see UI** —
  the ink field describes the WALLPAPER, but the eye sees the COMPOSITE, and the
  composite includes overlays no wallpaper-derived field can know about. The
  wallpaper switcher sits directly under the player panel's shadow: measured on
  `blossom`, the field reads **0.60** (linear) at the switcher where the screen
  reads **0.34** — a 1.7x darkening contributed by a soft shadow cast by a
  different element, with the switcher's own `background: transparent`.
  Attribution was measured rather than reasoned, by capturing the same region
  with each layer removed in turn (`.nur/we/layer_probe.mjs`): the `.blackboard`
  scrim model is accurate to within 1.3% of its true alpha (measured 0.4202
  against a modelled 0.4148), and the canvas contributes nothing the plate does
  not. Both a plate-derived field and one read back from the rendered canvas
  therefore read ~0.60 there and neither can be fixed by resolution or by a
  cleverer decision rule — a coverage-of-the-floor rule was written, measured and
  rejected on exactly this evidence.
  What the field *can* know is that **every unmodelled overlay here darkens** —
  a shadow, dark glass, a scrim; nothing brightens. So the real backdrop sits at
  or below the estimate, and the pole that survives a darker backdrop is light:
  dark ink is the one that fails when the composite comes out darker than
  expected. `INK_DARK_MARGIN` (1.08) requires the dark pole to win by 8% before
  it is taken, which only re-decides the band where the two poles are within 8%
  of each other — i.e. where both are comfortably legible, so the choice cannot
  lose contrast. A decisively bright plate is untouched: `clouds` carries a
  **1.79x** margin at its backdrop and stays on the dark pole.
  `blossom` now resolves to light ink at **4.55:1** on mobile and **4.73:1** on
  desktop, from the same 0.112 backdrop that was measuring 2.83:1. Both
  breakpoints pass 12/12, and `sweep`'s worst moment over a full revolution is
  unchanged at 3.17:1.
- The one thing deliberately **not** reproduced anywhere: Wallpaper Engine's
  audio response. No port reads an audio spectrum, so `shake`'s
  `AUDIOPROCESSING` branches and the audio objects are all outside these ports.

## 5. Verification

`scripts/test_wallpaper_shaders.ts` (run by `pnpm build` as `check:wallpapers`)
statically checks that every variant's shader declares every uniform it reads.

This exists because of a real failure: `sweep` spliced in `COMMON_GLSL`, whose
`coverUv()` reads `uImageAspect`, and declared only `uAspect`. The fragment then
failed to compile, `createProgram` returned null, and the render path treated
that as "nothing to draw" — so the canvas sat at `opacity: 0` and the viewer saw
the static poster while the animation this variant exists for never ran.

What made it hard to catch is that the ink is driven from `liveField`, which is
plain maths and never touches the canvas. So the switcher's glyph kept flipping
correctly, every DOM-level probe reported a healthy, animating variant, and the
only symptom was an animation that was not there.

A shader compile failure is silent by construction, so it has to be caught
statically. The check reads the assembled source — after `COMMON_GLSL` is
spliced in — because that is what the compiler sees; uniform names here are `u`
plus a capital, which GLSL ES built-ins never are, so no type analysis is needed.

Behaviour worth re-measuring after any change to `sweep`, all under `.nur/we/`:

| check | what it proves |
|---|---|
| `sweepdir.mjs` + `sweepdir_report.py` | the phase of the rendered conic advances **+5.97°/s** against an ideal +6.00, i.e. clockwise, measured from pixels rather than from a second copy of the maths |
| `sweep_contrast.py` | worst glyph contrast across a full revolution |
| `videopause.mjs` | only the active `<video>` decodes; the inactive loop is paused, not merely transparent |
| `contrast_gate.py [desktop\|mobile]` | every variant meets the contrast floor on both viewports |
