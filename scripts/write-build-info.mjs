import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const buildId = process.env.BUILD_ID || commit;

if (!/^[0-9a-f]{40}$/.test(commit)) {
  throw new Error('Build identity must be the current full Git commit ID.');
}
if (!/^[0-9a-f]{40}$/.test(buildId)) {
  throw new Error('BUILD_ID must be a full 40-character Git commit ID.');
}
if (buildId !== commit) {
  throw new Error('BUILD_ID must match the commit used to build the static artifact.');
}

const dist = resolve(process.env.BUILD_DIR || 'dist');
await mkdir(dist, { recursive: true });
await writeFile(resolve(dist, 'build-info.json'), `${JSON.stringify({ buildId })}\n`);
