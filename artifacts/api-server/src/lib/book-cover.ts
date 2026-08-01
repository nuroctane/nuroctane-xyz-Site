export const BOOK_COVER_WIDTH = 600;
export const BOOK_COVER_HEIGHT = 900;
export const BOOK_COVER_MAX_BYTES = 300 * 1024;
export const BOOK_COVER_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export interface CoverUpload {
  dataUrl?: unknown;
}

export interface ValidatedCover {
  mimeType: typeof BOOK_COVER_TYPES[number];
  base64: string;
  bytes: Uint8Array;
  width: number;
  height: number;
}

export type CoverValidation =
  | { ok: true; cover: ValidatedCover }
  | { ok: false; error: string };

function uint16(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function uint32(bytes: Uint8Array, offset: number): number {
  return (
    bytes[offset] * 0x1000000 +
    (bytes[offset + 1] << 16) +
    (bytes[offset + 2] << 8) +
    bytes[offset + 3]
  );
}

function pngDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length < 33 || !signature.every((value, index) => bytes[index] === value)) return null;
  if (String.fromCharCode(...bytes.slice(12, 16)) !== "IHDR") return null;
  return { width: uint32(bytes, 16), height: uint32(bytes, 20) };
}

function jpegDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 12 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  const startOfFrame = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;
  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset++;
      continue;
    }
    while (bytes[offset] === 0xff) offset++;
    const marker = bytes[offset++];
    if (marker === 0xd8 || marker === 0xd9) continue;
    if (offset + 1 >= bytes.length) return null;
    const length = uint16(bytes, offset);
    if (length < 2 || offset + length > bytes.length) return null;
    if (startOfFrame.has(marker) && length >= 7) {
      return { height: uint16(bytes, offset + 3), width: uint16(bytes, offset + 5) };
    }
    offset += length;
  }
  return null;
}

function webpDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  if (
    bytes.length < 30 ||
    String.fromCharCode(...bytes.slice(0, 4)) !== "RIFF" ||
    String.fromCharCode(...bytes.slice(8, 12)) !== "WEBP"
  ) return null;
  const chunk = String.fromCharCode(...bytes.slice(12, 16));
  if (chunk === "VP8X") {
    const width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16);
    const height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16);
    return { width, height };
  }
  if (chunk === "VP8 " && bytes.length >= 30) {
    if (bytes[23] !== 0x9d || bytes[24] !== 0x01 || bytes[25] !== 0x2a) return null;
    return {
      width: (bytes[26] | (bytes[27] << 8)) & 0x3fff,
      height: (bytes[28] | (bytes[29] << 8)) & 0x3fff,
    };
  }
  if (chunk === "VP8L" && bytes.length >= 25 && bytes[20] === 0x2f) {
    const bits = bytes[21] | (bytes[22] << 8) | (bytes[23] << 16) | (bytes[24] << 24);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }
  return null;
}

function detectDimensions(mimeType: string, bytes: Uint8Array): { width: number; height: number } | null {
  if (mimeType === "image/png") return pngDimensions(bytes);
  if (mimeType === "image/jpeg") return jpegDimensions(bytes);
  if (mimeType === "image/webp") return webpDimensions(bytes);
  return null;
}

export function validateCoverUpload(upload: unknown): CoverValidation {
  const dataUrl = upload && typeof upload === "object"
    ? (upload as CoverUpload).dataUrl
    : undefined;
  if (typeof dataUrl !== "string") return { ok: false, error: "Missing cover image" };

  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl);
  if (!match || !BOOK_COVER_TYPES.includes(match[1] as typeof BOOK_COVER_TYPES[number])) {
    return { ok: false, error: "Cover must be a JPEG, PNG, or WebP image" };
  }
  const mimeType = match[1] as typeof BOOK_COVER_TYPES[number];
  const base64 = match[2];
  if (base64.length > Math.ceil(BOOK_COVER_MAX_BYTES / 3) * 4 + 4) {
    return { ok: false, error: "Cover must be 300 KB or smaller" };
  }

  let bytes: Uint8Array;
  try {
    const binary = atob(base64);
    bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return { ok: false, error: "Cover contains invalid image data" };
  }
  if (bytes.byteLength === 0 || bytes.byteLength > BOOK_COVER_MAX_BYTES) {
    return { ok: false, error: "Cover must be 300 KB or smaller" };
  }

  const dimensions = detectDimensions(mimeType, bytes);
  if (!dimensions) return { ok: false, error: "Cover file does not match its image format" };
  if (dimensions.width !== BOOK_COVER_WIDTH || dimensions.height !== BOOK_COVER_HEIGHT) {
    return {
      ok: false,
      error: `Cover must be exactly ${BOOK_COVER_WIDTH} × ${BOOK_COVER_HEIGHT} pixels`,
    };
  }

  return {
    ok: true,
    cover: { mimeType, base64, bytes, ...dimensions },
  };
}

export function storedCoverBytes(base64: string): Uint8Array | null {
  try {
    const binary = atob(base64);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}
