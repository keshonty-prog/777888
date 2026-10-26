import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist-pages');
const result = spawnSync(process.execPath, [
  path.join(root, 'node_modules/expo/bin/cli'),
  'export', '--platform', 'web', '--output-dir', output,
  ...process.argv.slice(2),
], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, GITHUB_PAGES: 'true' },
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
if (result.status !== 0) process.exit(result.status ?? 1);

// GitHub Pages must serve Expo's _expo directory as ordinary static files.
writeFileSync(path.join(output, '.nojekyll'), '');
