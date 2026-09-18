/* ═══════════════════════════════════════════════════════════════════════════
   Shared WebGL + procedural-texture helpers for the Blackboard wallpapers.

   Both wallpaper variants (abstract, clouds) are fullscreen fragment-shader
   passes over a single image plate. Everything that is not variant-specific
   lives here so the variants stay readable.
   ═══════════════════════════════════════════════════════════════════════════ */

export function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function createProgram(
  gl: WebGLRenderingContext,
  vertexSrc: string,
  fragmentSrc: string,
): WebGLProgram | null {
  const vert = compile(gl, gl.VERTEX_SHADER, vertexSrc);
  const frag = compile(gl, gl.FRAGMENT_SHADER, fragmentSrc);
  if (!vert || !frag) {
    if (vert) gl.deleteShader(vert);
    if (frag) gl.deleteShader(frag);
    return null;
  }
  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vert);
    gl.deleteShader(frag);
    return null;
  }
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  // Shaders are refcounted by the program: detaching them here frees the
  // objects immediately while the linked program stays valid.
  gl.deleteShader(vert);
  gl.deleteShader(frag);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  gl.useProgram(program);
  return program;
}

/** Release a program and everything still attached to it. */
export function destroyProgram(gl: WebGLRenderingContext, program: WebGLProgram): void {
  const shaders = gl.getAttachedShaders(program) ?? [];
  for (const shader of shaders) {
    gl.detachShader(program, shader);
    gl.deleteShader(shader);
  }
  gl.deleteProgram(program);
}

/**
 * Bind a fullscreen triangle-strip quad to the program's `a_Position`.
 * Returns the buffer so the owner can delete it — a fullscreen quad never
 * changes, but a variant switch remounts and would otherwise leak one per swap.
 */
export function createQuad(gl: WebGLRenderingContext, program: WebGLProgram): WebGLBuffer | null {
  const position = gl.getAttribLocation(program, 'a_Position');
  if (position < 0) return null;
  const buffer = gl.createBuffer();
  if (!buffer) return null;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  return buffer;
}

/** Intrinsic pixel size of any TexImageSource. */
function sourceSize(source: TexImageSource): { width: number; height: number } {
  if (typeof HTMLVideoElement !== 'undefined' && source instanceof HTMLVideoElement) {
    return { width: source.videoWidth, height: source.videoHeight };
  }
  if (typeof HTMLImageElement !== 'undefined' && source instanceof HTMLImageElement) {
    return { width: source.naturalWidth, height: source.naturalHeight };
  }
  const sized = source as { width?: number; height?: number };
  return { width: sized.width ?? 0, height: sized.height ?? 0 };
}

function isPowerOfTwo(value: number): boolean {
  return value > 0 && (value & (value - 1)) === 0;
}

/**
 * The texture flags that are actually legal for a source of this size.
 *
 * Under WebGL 1 a non-power-of-two texture is INCOMPLETE — and an incomplete
 * texture samples as solid BLACK, with no GL error — if it uses REPEAT wrapping
 * or a mipmapped minification filter. Both are silently accepted by the API, so
 * the failure surfaces only as a wallpaper that renders as an empty black field.
 *
 * That is not hypothetical: every photographic plate here is NPOT (2560x1080,
 * 1920x1080, 2560x1440), and a full-frame plate uploaded with REPEAT rendered as
 * a black canvas over a perfectly good plate, hiding it entirely.
 *
 * Exported and pure so the rule can be tested directly, rather than only through
 * the accident of a caller passing the right flag.
 */
export function textureMode(
  width: number,
  height: number,
  repeat: boolean,
  mipmap: boolean,
): { repeat: boolean; mipmap: boolean } {
  const legal = isPowerOfTwo(width) && isPowerOfTwo(height);
  return { repeat: repeat && legal, mipmap: mipmap && legal };
}

export function uploadTexture(
  gl: WebGLRenderingContext,
  index: number,
  source: TexImageSource,
  repeat: boolean,
  mipmap: boolean,
): WebGLTexture | null {
  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + index);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

  // Decided from the source itself, not from the caller's belief about it: a
  // caller that asks for tiling on a photographic plate would otherwise get an
  // incomplete texture and no warning at all. Tiling stays available for the
  // procedural maps that are genuinely POT (256x256, 32x32), which is where it
  // is actually wanted.
  const { width, height } = sourceSize(source);
  const mode = textureMode(width, height, repeat, mipmap);
  const wrap = mode.repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mode.mipmap ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  if (mode.mipmap) gl.generateMipmap(gl.TEXTURE_2D);
  gl.activeTexture(gl.TEXTURE0);
  return tex;
}

/** Decode an image off the main thread where supported. */
export function loadImage(src: string): HTMLImageElement {
  const image: HTMLImageElement = new Image();
  image.decoding = 'async';
  image.src = src;
  return image;
}

/** Tileable value-noise texture, standing in for WE's util/clouds_256. */
export function makeNoiseCanvas(size: number): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const img = ctx.createImageData(size, size);
  const octaves = [
    { cells: 4, amp: 0.52 },
    { cells: 8, amp: 0.27 },
    { cells: 16, amp: 0.14 },
    { cells: 32, amp: 0.07 },
  ];
  const grids = octaves.map(({ cells }) => {
    const g = new Float32Array(cells * cells);
    for (let i = 0; i < g.length; i++) g[i] = Math.random();
    return g;
  });
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let v = 0;
      for (let k = 0; k < octaves.length; k++) {
        const { cells, amp } = octaves[k];
        const fx = (x / size) * cells;
        const fy = (y / size) * cells;
        const x0 = Math.floor(fx);
        const y0 = Math.floor(fy);
        const tx = fx - x0;
        const ty = fy - y0;
        const sx = tx * tx * (3 - 2 * tx);
        const sy = ty * ty * (3 - 2 * ty);
        const g = grids[k];
        const r0 = (y0 % cells) * cells;
        const r1 = ((y0 + 1) % cells) * cells;
        const c0 = x0 % cells;
        const c1 = (x0 + 1) % cells;
        const a = g[r0 + c0] + (g[r0 + c1] - g[r0 + c0]) * sx;
        const b = g[r1 + c0] + (g[r1 + c1] - g[r1 + c0]) * sx;
        v += (a + (b - a) * sy) * amp;
      }
      const p = (y * size + x) * 4;
      const val = Math.max(0, Math.min(255, Math.round(v * 255)));
      img.data[p] = val;
      img.data[p + 1] = val;
      img.data[p + 2] = val;
      img.data[p + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/** Tileable normal map for the waterripple UV perturbation. */
export function makeNormalCanvas(size: number): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  // Smooth wrapped height field — two low-frequency octaves.
  const height = new Float32Array(size * size);
  const layers = [
    { cells: 3, amp: 1 },
    { cells: 6, amp: 0.4 },
  ];
  const grids = layers.map(({ cells }) => {
    const g = new Float32Array(cells * cells);
    for (let i = 0; i < g.length; i++) g[i] = Math.random();
    return g;
  });
  const sample = (x: number, y: number) => {
    let v = 0;
    for (let k = 0; k < layers.length; k++) {
      const { cells, amp } = layers[k];
      const fx = (x / size) * cells;
      const fy = (y / size) * cells;
      const x0 = Math.floor(fx);
      const y0 = Math.floor(fy);
      const tx = fx - x0;
      const ty = fy - y0;
      const sx = tx * tx * (3 - 2 * tx);
      const sy = ty * ty * (3 - 2 * ty);
      const g = grids[k];
      const r0 = (y0 % cells) * cells;
      const r1 = ((y0 + 1) % cells) * cells;
      const c0 = x0 % cells;
      const c1 = (x0 + 1) % cells;
      const a = g[r0 + c0] + (g[r0 + c1] - g[r0 + c0]) * sx;
      const b = g[r1 + c0] + (g[r1 + c1] - g[r1 + c0]) * sx;
      v += (a + (b - a) * sy) * amp;
    }
    return v;
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      height[y * size + x] = sample(x, y);
    }
  }
  const img = ctx.createImageData(size, size);
  const strength = 3.2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const l = height[y * size + ((x - 1 + size) % size)];
      const r = height[y * size + ((x + 1) % size)];
      const u = height[((y - 1 + size) % size) * size + x];
      const d = height[((y + 1) % size) * size + x];
      let nx = (l - r) * strength;
      let ny = (u - d) * strength;
      let nz = 1;
      const len = Math.hypot(nx, ny, nz) || 1;
      nx /= len; ny /= len; nz /= len;
      const p = (y * size + x) * 4;
      img.data[p] = Math.round((nx * 0.5 + 0.5) * 255);
      img.data[p + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      img.data[p + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      img.data[p + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/**
 * Render the active scene into an offscreen framebuffer and read the pixels
 * back, so the luminance field can be built from what the shader actually
 * produces rather than from the plate it samples.
 *
 * The scene is re-rendered at a reduced size that PRESERVES the viewport's
 * aspect. That matters: every variant's `frame` sets `uAspect` from
 * `gl.drawingBufferWidth / drawingBufferHeight` — the canvas backing store,
 * which this does not change — so a same-aspect target reproduces the on-screen
 * composition exactly, just at lower resolution.
 *
 * Leaves the default framebuffer and the previous viewport bound, so the caller's
 * render loop is undisturbed. The texture is NPOT, which under WebGL 1 is only
 * sampleable with CLAMP + LINEAR and no mipmaps — the same rule the plates obey.
 *
 * Returns null if any GL object cannot be created, or if the context is lost;
 * callers fall back to the plate-backed field.
 */
export function readRenderedPixels(
  gl: WebGLRenderingContext,
  draw: (gl: WebGLRenderingContext) => boolean,
  targetWidth = 384,
): { pixels: Uint8Array; width: number; height: number } | null {
  if (gl.isContextLost()) return null;
  const viewWidth = gl.drawingBufferWidth;
  const viewHeight = gl.drawingBufferHeight;
  if (!viewWidth || !viewHeight) return null;

  // Same aspect as the viewport; never bigger than it.
  const width = Math.max(2, Math.min(viewWidth, Math.round(targetWidth)));
  const height = Math.max(2, Math.round((width * viewHeight) / viewWidth));

  const texture = gl.createTexture();
  const framebuffer = gl.createFramebuffer();
  if (!texture || !framebuffer) {
    if (texture) gl.deleteTexture(texture);
    if (framebuffer) gl.deleteFramebuffer(framebuffer);
    return null;
  }

  const prevTexture = gl.getParameter(gl.TEXTURE_BINDING_2D) as WebGLTexture | null;
  const prevFramebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING) as WebGLFramebuffer | null;
  const prevViewport = gl.getParameter(gl.VIEWPORT) as Int32Array;

  let pixels: Uint8Array | null = null;
  try {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error('incomplete framebuffer');
    }

    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (!draw(gl)) throw new Error('scene did not draw');

    pixels = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    if (gl.getError() !== gl.NO_ERROR) pixels = null;
  } catch {
    pixels = null;
  } finally {
    // Unconditional: a thrown draw must not leave the caller rendering into an
    // offscreen buffer, which would look like the wallpaper freezing.
    gl.bindFramebuffer(gl.FRAMEBUFFER, prevFramebuffer);
    gl.bindTexture(gl.TEXTURE_2D, prevTexture);
    gl.viewport(prevViewport[0], prevViewport[1], prevViewport[2], prevViewport[3]);
    gl.deleteFramebuffer(framebuffer);
    gl.deleteTexture(texture);
  }

  if (!pixels) return null;
  // readPixels origin is bottom-left; the field indexes top-down like the plates.
  const flipped = new Uint8Array(pixels.length);
  const stride = width * 4;
  for (let y = 0; y < height; y++) {
    flipped.set(pixels.subarray((height - 1 - y) * stride, (height - y) * stride), y * stride);
  }
  return { pixels: flipped, width, height };
}
