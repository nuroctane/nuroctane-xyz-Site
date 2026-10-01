import { mkdir, writeFile } from "node:fs/promises";
import handler, { THEMES } from "../api/og.mjs";

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
  await writeFile(
    new URL(`${page}.png`, destination),
    Buffer.from(await response.arrayBuffer()),
  );
}
console.log(`Rendered ${Object.keys(THEMES).length} Cloudflare share cards.`);
