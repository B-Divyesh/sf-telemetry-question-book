const assert = require('node:assert/strict');
const { chmod, mkdir, mkdtemp, readFile, rm, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const { spawn, spawnSync } = require('node:child_process');
const { createServer } = require('node:http');
const test = require('node:test');

test('@claim:deploy-integrity deployment stamps and uploads one committed artifact, then verifies static and API identity', async () => {
  const fixture = await mkdtemp(join(tmpdir(), 'tqb-deploy-'));
  const bin = join(fixture, 'bin');
  const log = join(fixture, 'calls.log');
  const build = join(fixture, 'dist');
  const commit = '0123456789abcdef0123456789abcdef01234567';
  const script = resolve(__dirname, '../../scripts/deploy.sh');
  const buildInfoScript = resolve(__dirname, '../../scripts/write-build-info.mjs');
  const liveVerifier = resolve(__dirname, '../../scripts/verify-live-api.mjs');
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
  await executable('npm', 'printf "npm %s build-id=%s\\n" "$*" "${BUILD_ID:-}" >> "$DEPLOY_TEST_LOG"');
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
      `npm run build build-id=${commit}`,
      `az staticwebapp appsettings set --name sf-telemetry-question-book --resource-group sociobot --setting-names BUILD_ID=${commit} --output none`,
      'deploy telemetry-question-book dist',
      `npm run verify:live-api -- ${commit} build-id=`
    ]);

    const writeMarker = (buildId) => spawnSync(process.execPath, [buildInfoScript], {
      cwd: resolve(__dirname, '../..'),
      encoding: 'utf8',
      env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, BUILD_DIR: build, BUILD_ID: buildId }
    });
    const markerResult = writeMarker(commit);
    assert.equal(markerResult.status, 0, markerResult.stderr);
    assert.deepEqual(JSON.parse(await readFile(join(build, 'build-info.json'), 'utf8')), { buildId: commit });
    const mismatchResult = writeMarker('fedcba9876543210fedcba9876543210fedcba98');
    assert.notEqual(mismatchResult.status, 0);
    assert.match(mismatchResult.stderr, /BUILD_ID must match/);

    let staticBuildId = commit;
    let snapshotRequests = 0;
    const server = createServer((request, response) => {
      if (request.url === '/build-info.json') {
        response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        response.end(JSON.stringify({ buildId: staticBuildId }));
        return;
      }
      if (request.url === '/api/health') {
        response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        response.end(JSON.stringify({ ok: true, snapshotStoreConfigured: true, buildId: commit }));
        return;
      }
      if (request.url?.startsWith('/api/snapshots/')) {
        const remaining = Math.max(0, 99 - snapshotRequests);
        const status = snapshotRequests < 100 ? 404 : 429;
        snapshotRequests += 1;
        response.writeHead(status, {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': String(remaining),
          ...(status === 429 ? { 'Retry-After': '1' } : {})
        });
        response.end(JSON.stringify({ error: 'not found' }));
        return;
      }
      response.writeHead(404).end();
    });
    await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const origin = `http://127.0.0.1:${address.port}`;
    const runLiveVerifier = () => new Promise((resolveVerifier) => {
      const child = spawn(process.execPath, [liveVerifier, commit], {
        cwd: resolve(__dirname, '../..'),
        env: { ...process.env, DEPLOY_ORIGIN: origin }
      });
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (chunk) => { stdout += chunk; });
      child.stderr.on('data', (chunk) => { stderr += chunk; });
      child.on('close', (status) => resolveVerifier({ status, stdout, stderr }));
    });

    try {
      const verified = await runLiveVerifier();
      assert.equal(verified.status, 0, verified.stderr);
      assert.match(verified.stdout, new RegExp(`buildId=${commit}`));
      assert.equal(snapshotRequests, 101);

      staticBuildId = 'fedcba9876543210fedcba9876543210fedcba98';
      const rejected = await runLiveVerifier();
      assert.notEqual(rejected.status, 0);
      assert.match(rejected.stderr, /static build marker must equal the deployed commit/);
    } finally {
      await new Promise((resolveClose) => server.close(resolveClose));
    }
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});
