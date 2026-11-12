/* Types for validBuild.js, so the API (a TypeScript package) can import it. */

export type Build = Record<string, unknown>;

export interface GalleryEntry {
  id: string;
  name: string;
  snap: Build;
  layout?: string;
  createdAt?: string;
}

export const MAX_LEGEND: number;
export const MAX_NAME: number;
export const MAX_IMAGE_DATA: number;
export const MAX_OVERRIDES: number;
export const BUILD_FIELDS: string[];

export function cleanText(v: unknown, max: number): string | undefined;
export function isHex(v: unknown): boolean;
export function isKeyId(v: unknown): boolean;
export function isImageData(v: unknown): boolean;
export function isMark(v: unknown): boolean;
export function isLayout(v: unknown): boolean;
export function validOverride(v: unknown): Record<string, unknown> | undefined;
export function validOverrides(v: unknown, opts?: { images?: boolean }): Record<string, Record<string, unknown>> | undefined;
export function validBuild(raw: unknown, opts?: { images?: boolean }): Build | null;
export function validGalleryEntry(t: unknown): GalleryEntry | null;
