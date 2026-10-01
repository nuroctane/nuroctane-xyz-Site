import { mkdir, writeFile } from 'node:fs/promises';
import handler from '../api/og.mjs';

// Keep the CLI share card in the same deployment as its page. The renderer
// remains the source of truth; never edit the generated PNG by hand.
const destination = new URL('../artifacts/blackboard/public/assets/nur-cli-og.png', import.meta.url);
await mkdir(new URL('.', destination), { recursive: true });
const response = await handler(new Request('https://www.nuroctane.xyz/api/og?page=cli'));
if (response.status !== 200 || !response.headers.get('content-type')?.startsWith('image/')) {
  throw new Error(`CLI share card rendering failed (${response.status})`);
}
await writeFile(destination, Buffer.from(await response.arrayBuffer()));
console.log('Rendered CLI share card.');
