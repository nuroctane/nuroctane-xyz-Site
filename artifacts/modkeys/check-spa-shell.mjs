#!/usr/bin/env node
/* Post-build guard for the modkeys mobile shell on the SPA.
 *
 * Five consecutive "fixes" shipped green builds while the phone showed the
 * desktop shell, because verification stopped at "build passed". This check
 * inspects the BUILT ModkeysPage chunk — the exact bytes the phone downloads —
 * and fails the build unless it contains:
 *   1. the mobile.css sentinel  (proves the stylesheet is in the bundle)
 *   2. the mShellHost marker    (proves React renders the mobile shell natively)
 *   3. the mk-mobile class ref  (proves shell.js classing survives)
 * Run from repo root: node artifacts/modkeys/check-spa-shell.mjs
 * Wired into the root build script, so it also runs inside Vercel's deploy. */
import fs from 'node:fs';
import path from 'node:path';

const assetsDir = path.resolve('artifacts/digital-sea/dist/public/assets');
if (!fs.existsSync(assetsDir)) {
  console.error('check-spa-shell: dist assets not found — run the digital-sea build first');
  process.exit(1);
}
const chunk = fs.readdirSync(assetsDir).find((f) => /^ModkeysPage-.*\.js$/.test(f));
if (!chunk) {
  console.error('check-spa-shell: no ModkeysPage-*.js chunk in dist');
  process.exit(1);
}
const src = fs.readFileSync(path.join(assetsDir, chunk), 'utf-8');

const musts = [
  ['__MODKEYS_MOBILE_CSS_v072__', 'mobile.css sentinel (stylesheet bundled)'],
  ['mShellHost', 'React-rendered mobile shell host'],
  ['mk-mobile', 'mk-mobile class reference'],
];
let fail = 0;
for (const [needle, why] of musts) {
  if (!src.includes(needle)) {
    console.error(`check-spa-shell FAIL: "${needle}" missing from ${chunk} — ${why}`);
    fail++;
  }
}
if (fail) process.exit(1);
console.log(`SPA SHELL OK — ${chunk} contains mobile css sentinel + shell host + class ref`);
