# Wallpaper Engine ports

The Blackboard's two wallpapers are WebGL ports of Wallpaper Engine workshop
scenes. This is how the source scenes were read, so the ports can be re-derived
or re-checked.

| variant | workshop item | title |
|---|---|---|
| `abstract` | [2207944762](https://steamcommunity.com/sharedfiles/filedetails/?id=2207944762) | Black & White Abstract |
| `clouds` | [3612455067](https://steamcommunity.com/sharedfiles/filedetails/?id=3612455067) | Black & White Clouds |

Both are `"type": "scene"`: one fullscreen image object with live effects on
top. `variants.ts` reproduces the effect maths; the constants are the ones
`scene.json` overrides.

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
`public/assets/blackboard/clouds/`. The flow maps are **lossless** WebP on
purpose — lossy WebP subsamples chroma, and these channels *are* the flow
vectors; lossy noise in the neutral sky would shimmer.

| file | size | notes |
|---|---|---|
| `clouds.webp` | 3413x1920, q90, 180 KB | plate, desktop |
| `clouds-1280.webp` | 1280x720, q88, 38 KB | plate, mobile |
| `clouds-shake-mask.webp` | 1024x576, lossless, 138 KB | shake flow map |
| `clouds-waterflow-mask.webp` | 1024x576, lossless, 34 KB | waterflow flow map |
| `clouds-waterflow-phase.png` | 32x32, 2 KB | scalar phase noise |

## 4. Deviations from the source

Documented in full at each site in `variants.ts`; the short version:

- **`clouds` / `shake`** — the source's `sin(frac(time / PI_HALF) * PI_HALF)`
  ramps and resets every 2.12 s. Replayed through this port that reset measures
  as a **~10x frame-to-frame motion spike** (§verified with a CPU reference
  render), i.e. a periodic jolt. The port eases the same period into a swell —
  amplitude, speed and cloud-only gating are unchanged, the step is gone. The
  author's own 192px preview could not resolve the step, so it was checked
  numerically rather than by eye.
- **`abstract`** — the raw plate is very dark, so the port applies the same
  exposure lift the original's tone mapping implies. Unchanged from the shipped
  implementation.
- Both scenes pin `schemecolor` to grey; the ports render pure monochrome
  (luminance) to match the Blackboard's palette.
