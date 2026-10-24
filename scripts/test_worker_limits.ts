// API write limits (worker/limits.ts) with fake rate-limit bindings.
import assert from "node:assert/strict";
import { limitWrite } from "../worker/limits";

function fake(limit: number) {
  const seen = new Map<string, number>();
  return {
    async limit({ key }: { key: string }) {
      const n = (seen.get(key) ?? 0) + 1;
      seen.set(key, n);
      return { success: n <= limit };
    },
  } as unknown as RateLimit;
}

const post = (body: unknown, ip = "1.1.1.1") =>
  new Request("https://www.nuroctane.xyz/api/visitor-books", {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": ip },
    body: JSON.stringify(body),
  });

// Reads are never limited.
assert.equal(await limitWrite(new Request("https://x/api/visitor-books"), { API_WRITES: fake(0) }), null);

// Plain writes stop at the write limit, per IP.
let env = { API_WRITES: fake(2), ADMIN_TRIES: fake(1) };
assert.equal(await limitWrite(post({ action: "add" }), env), null);
assert.equal(await limitWrite(post({ action: "add" }), env), null);
const third = await limitWrite(post({ action: "add" }), env);
assert.equal(third?.status, 429);
assert.equal(third?.headers.get("retry-after"), "60");
assert.equal(await limitWrite(post({ action: "add" }, "2.2.2.2"), env), null);

// Password attempts have their own, tighter limit; the body stays readable.
env = { API_WRITES: fake(100), ADMIN_TRIES: fake(1) };
const first = post({ action: "verifyAdmin", password: "guess" });
assert.equal(await limitWrite(first, env), null);
assert.equal((await first.json()).password, "guess");
assert.equal((await limitWrite(post({ action: "verifyAdmin", password: "guess2" }), env))?.status, 429);
assert.equal(await limitWrite(post({ action: "add", password: "" }), env), null);

// No bindings (local dev) or a broken limiter never blocks.
assert.equal(await limitWrite(post({ action: "add" }), {}), null);
const broken = { async limit() { throw new Error("down"); } } as unknown as RateLimit;
assert.equal(await limitWrite(post({ action: "add" }), { API_WRITES: broken }), null);

console.log("WORKER LIMITS OK: reads free, per-IP write limit, tighter admin-attempt limit, body intact, fail-open");
