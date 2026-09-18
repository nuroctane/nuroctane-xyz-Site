# Wallpaper Engine ports

The Blackboard's wallpapers are WebGL ports of Wallpaper Engine workshop scenes.
This is how the source scenes were read, so the ports can be re-derived or
re-checked.

| variant | workshop item | title | type | effects ported |
|---|---|---|---|---|
| `abstract` | [2207944762](https://steamcommunity.com/sharedfiles/filedetails/?id=2207944762) | Black & White Abstract | scene | `tint`, `clouds`, `godrays`, `shine`, `waterripple` (five passes; `tint` is modelled by the tone curve rather than as a shader) |
| `clouds` | [3612455067](https://steamcommunity.com/sharedfiles/filedetails/?id=3612455067) | Black & White Clouds | scene | `shake`, `waterflow` |
| `japanese` | [2791515879](https://steamcommunity.com/sharedfiles/filedetails/?id=2791515879) | Black and White Japanese | scene | `foliagesway` |
| `forest` | [3679836853](https://steamcommunity.com/sharedfiles/filedetails/?id=3679836853) | black and white forest | scene | `clouds` |
| `sakura` | [3493394392](https://steamcommunity.com/sharedfiles/filedetails/?id=3493394392) | White sakura | scene | `shake` |
| `blossom` | [3613577930](https://steamcommunity.com/sharedfiles/filedetails/?id=3613577930) | White sakura (the second item of that name) | scene | `shake`, `waterflow` |
| `waves` | [2279430364](https://steamcommunity.com/sharedfiles/filedetails/?id=2279430364) | Black Waves | scene | `waterflow` (disabled in the source), `waterripple` |

All seven are `"type": "scene"`: one fullscreen image object with live effects
on top. `variants.ts` reproduces the effect maths; the constants are the ones
`scene.json` overrides. Two of the scenes ship more objects than that —
`blossom` adds two audio objects and `waves` adds an invisible normal-map
object — and none of them are ported; only the image object's effect chain is.

## Where the source lives

Wallpaper Engine keeps subscribed items unpacked at

```
<steam>/steamapps/workshop/content/431960/<published_file_id>/
  project.json     metadata: title, tags, preview, scheme colour
  scene.pkg        the scene: scene.json, shaders, textures, mask maps
  shaders/         compiled SM40 blobs (not needed — the GLSL sources are packed)
  preview.gif|jpg  the author's preview
```

`431960` is Wallpaper Engine's app id. Only the `scene.pkg` is actually needed.

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
- The one thing deliberately **not** reproduced anywhere: Wallpaper Engine's
  audio response. No port reads an audio spectrum, so `shake`'s
  `AUDIOPROCESSING` branches and the audio objects are all outside these ports.
