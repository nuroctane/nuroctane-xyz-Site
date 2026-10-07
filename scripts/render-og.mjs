import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import handler, { THEMES } from "../api/og.mjs";

// The CLI card is locked by the owner: the clean type-only card settled with
// Codex on 2026-10-01 (thread 01a0f957); its stats line was refreshed to 114
// Jev systems at the owner's request on 2026-10-07. No imagery, demo frames,
// badges or extra headers and footers. Any change to it fails the build until the owner
// asks for a new card and this pin is updated with it. Locked cards are also
// written as <page>-<hash8>.png; the share tags point there, so a changed card
// always gets a new URL (update worker/og-meta.ts and pageMeta.ts with it).
const LOCKED = {
  cli: "927bae55b16738f8a2dd83389a62c901482877b9f78c53fe4ee26cfa2bc8e78f",
};

// Share cards ship atomically with their pages. Never hand-edit generated PNGs.
const destination = new URL(
  "../artifacts/blackboard/public/assets/og/",
  import.meta.url,
);
await mkdir(destination, { recursive: true });
for (const page of Object.keys(THEMES)) {
  const response = await handler(
    new Request(`https://www.nuroctane.xyz/api/og?page=${page}`),
  );
  if (
    response.status !== 200 ||
    response.headers.get("content-type") !== "image/png"
  ) {
    throw new Error(
      `${page} share card rendering failed: ${await response.text()}`,
    );
  }
  const png = Buffer.from(await response.arrayBuffer());
  const digest = createHash("sha256").update(png).digest("hex");
  if (LOCKED[page] && digest !== LOCKED[page]) {
    throw new Error(
      `${page} share card changed (sha256 ${digest}); it is locked to the owner's approved card. See LOCKED in scripts/render-og.mjs.`,
    );
  }
  await writeFile(new URL(`${page}.png`, destination), png);
  if (LOCKED[page]) {
    await writeFile(new URL(`${page}-${digest.slice(0, 8)}.png`, destination), png);
  }
}
console.log(`Rendered ${Object.keys(THEMES).length} Cloudflare share cards.`);
