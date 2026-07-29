import type { Context } from "hono";

/* Replaces express.json() + express.urlencoded().
 *
 * Express installed those as global middleware and handed routes a plain object,
 * defaulting to {} for an absent or unparseable body. Route code here reads
 * `body?.action` and friends, so preserving the "never throws, worst case {}"
 * behaviour keeps every existing status code intact — notably the 400 "Unknown
 * action" path, which the smoke test asserts.
 */
export async function readBody<T = Record<string, unknown>>(c: Context): Promise<T> {
  const contentType = c.req.header("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      return (await c.req.json()) as T;
    }
    if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const form = await c.req.formData();
      return Object.fromEntries(form.entries()) as T;
    }
    // Missing or unrecognised content-type — clients occasionally omit it on
    // fetch(). Try JSON anyway rather than rejecting a well-formed body.
    const text = await c.req.text();
    return text ? (JSON.parse(text) as T) : ({} as T);
  } catch {
    return {} as T;
  }
}
