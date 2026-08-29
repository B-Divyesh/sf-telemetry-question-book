const assert = require('node:assert/strict');
const { chmod, mkdir, mkdtemp, readFile, rm, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

test('deployment uploads the committed artifact, sets its exact BUILD_ID, and verifies live API identity', async () => {
  const fixture = await mkdtemp(join(tmpdir(), 'tqb-deploy-'));
  const bin = join(fixture, 'bin');
  const log = join(fixture, 'calls.log');
  const commit = '0123456789abcdef0123456789abcdef01234567';
  const script = resolve(__dirname, '../../scripts/deploy.sh');
  await mkdir(bin);

  const executable = async (name, contents) => {
    const path = join(bin, name);
    await writeFile(path, `#!/usr/bin/env bash\nset -euo pipefail\n${contents}\n`);
    await chmod(path, 0o755);
    return path;
  };

  await executable('git', `
if [[ "$1 $2" == "rev-parse HEAD" ]]; then echo "${commit}"; exit 0; fi
if [[ "$1" == "status" ]]; then exit 0; fi
exit 2`);
  await executable('npm', 'printf "npm %s\\n" "$*" >> "$DEPLOY_TEST_LOG"');
  await executable('az', 'printf "az %s\\n" "$*" >> "$DEPLOY_TEST_LOG"');
  const deploy = await executable('deploy-static', 'printf "deploy %s\\n" "$*" >> "$DEPLOY_TEST_LOG"');

  try {
    const result = spawnSync('bash', [script], {
      cwd: resolve(__dirname, '../..'),
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${bin}:${process.env.PATH}`,
        DEPLOY_STATIC_SCRIPT: deploy,
        DEPLOY_TEST_LOG: log
      }
    });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual((await readFile(log, 'utf8')).trim().split('\n'), [
      'npm run build',
      'deploy telemetry-question-book dist',
      `az staticwebapp appsettings set --name sf-telemetry-question-book --resource-group sociobot --setting-names BUILD_ID=${commit} --output none`,
      `npm run verify:live-api -- ${commit}`
    ]);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});
