import { readFileSync, writeFileSync, cpSync, rmSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const configPath = path.join(root, 'site.config.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const designs = ['blackboard', 'digital-sea'];
const command = process.argv[2];
if (!designs.includes(config.active)) throw new Error('Unknown active site design');
if (designs.includes(command)) {
  config.active = command;
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
  console.log(`Active design: ${command}. Run pnpm dev to preview, or pnpm deploy to publish.`);
} else if (command === 'stage') {
  const source = path.join(root, 'artifacts', config.active, 'dist/public');
  const destination = path.join(root, 'dist/public');
  if (!existsSync(path.join(source, 'index.html'))) throw new Error('Build the selected site first');
  if (path.resolve(destination) !== path.resolve(root, 'dist', 'public')) throw new Error('Invalid output path');
  rmSync(destination, { recursive: true, force: true });
  cpSync(source, destination, { recursive: true });
  console.log(`Staged ${config.active} for deployment.`);
} else if (command === 'dev') {
  const result = spawnSync(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
    ['--filter', `@workspace/${config.active}`, 'dev', ...process.argv.slice(3)],
    { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
  process.exit(result.status ?? 1);
} else {
  console.log(`Active design: ${config.active}\nSwitch with: pnpm site blackboard | pnpm site digital-sea`);
  if (command) process.exitCode = 1;
}
