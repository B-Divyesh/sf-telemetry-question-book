/* global process, URL, console, localStorage, sessionStorage, getComputedStyle, document, scrollTo, scrollY, navigator */
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const base = 'https://telemetry-question-book.sociobot.in';
const evidenceDir = process.env.POLISH4_EVIDENCE_DIR || '.factory/evidence/polish-4/live';
await mkdir(evidenceDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
const page = await context.newPage();
const origins = new Set();
const consoleErrors = [];
const pageErrors = [];
page.on('request', (request) => origins.add(new URL(request.url()).origin));
page.on('console', (message) => message.type() === 'error' && consoleErrors.push(message.text()));
page.on('pageerror', (error) => pageErrors.push(String(error)));

const seriousAxe = async () => (await new AxeBuilder({ page }).analyze()).violations
  .filter((item) => ['serious', 'critical'].includes(item.impact || ''))
  .map((item) => item.id);

await page.goto(base, { waitUntil: 'networkidle' });
assert.deepEqual(await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) })), { local: [], session: [] });
await page.getByText('Question cards stay in this browser.').waitFor();
await page.getByText('Saved questions reopen offline after one online visit.').waitFor();
const factBounds = await page.locator('.plain-facts li').evaluateAll((items) => items.map((item) => {
  const box = item.getBoundingClientRect();
  return { text: item.textContent?.trim(), top: box.top, bottom: box.bottom };
}));
assert.equal(factBounds.length, 3);
assert.ok(factBounds.every((item) => item.top >= 0 && item.bottom <= 844));
assert.deepEqual(await seriousAxe(), []);
await page.getByRole('link', { name: 'Try it with sample data' }).click();
await page.waitForURL(`${base}/demo`);
assert.equal(await page.locator('.question-card').count(), 3);
const first = page.locator('.question-card').first();
const firstReadingBounds = {};
for (const text of ['Did Northstar orders arrive?', '1,842', 'On track', 'Fresh for 60 min']) {
  const locator = first.getByText(text, { exact: text !== 'Did Northstar orders arrive?' });
  await locator.waitFor();
  const box = await locator.boundingBox();
  assert.ok(box && box.y >= 0 && box.y + box.height <= 844, `${text} must be in the first phone viewport`);
  firstReadingBounds[text] = box;
}
assert.deepEqual(await seriousAxe(), []);

await page.evaluate(() => {
  localStorage.setItem('tqb:v1', JSON.stringify([{
    id: 'real', question: 'REAL QUESTION SENTINEL', owner: 'Real owner', source: 'Real source',
    sourceUrl: 'https://example.test/real', value: 1, unit: 'event', threshold: 1,
    comparison: 'eq', observedAt: new Date().toISOString(), freshMinutes: 60, note: ''
  }]));
  sessionStorage.setItem('tqb:snapshot-preview', 'REAL PREVIEW SENTINEL');
  sessionStorage.setItem('tqb:shares', '[{"token":"real-share-sentinel"}]');
  const sample = JSON.parse(localStorage.getItem('demo:tqb:v1') || '[]');
  sample[0].value = 9999;
  localStorage.setItem('demo:tqb:v1', JSON.stringify(sample));
});
await page.reload({ waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'Reset demo' }).click();
await page.locator('.question-card').first().getByText('1,842', { exact: true }).waitFor();

const durations = [
  { label: '1 hour', seconds: 3_600 },
  { label: '24 hours', seconds: 86_400 },
  { label: '7 days', seconds: 604_800 }
];
const shares = [];
for (const duration of durations) {
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Make answer copy' }).first().click();
  await page.locator('select[name="ttl"]').selectOption(String(duration.seconds));
  await page.getByRole('button', { name: 'Review answer copy' }).click();
  assert.equal(await page.getByText('Demo — sample data, nothing is saved').count(), 1);
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.demo-banner')).position), 'sticky');
  assert.equal(await page.evaluate(() => sessionStorage.getItem('tqb:snapshot-preview')), 'REAL PREVIEW SENTINEL');
  assert.match(await page.evaluate(() => sessionStorage.getItem('demo:tqb:snapshot-preview') || ''), /Northstar/);

  const requestedAt = Date.now();
  const responsePromise = page.waitForResponse((response) => response.url().endsWith('/api/snapshots') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Create expiring link' }).click();
  const response = await responsePromise;
  assert.equal(response.status(), 201);
  const requestBody = response.request().postDataJSON();
  const responseBody = await response.json();
  assert.equal(requestBody.ttlSeconds, duration.seconds);
  const measuredDuration = Date.parse(responseBody.expiresAt) - requestedAt;
  assert.ok(measuredDuration >= duration.seconds * 1000 - 5000 && measuredDuration <= duration.seconds * 1000 + 5000);
  const link = await page.getByLabel('Expiring link').inputValue();
  const token = new URL(link).pathname.split('/').pop();
  assert.match(token, /^d_[a-f0-9]+$/);
  assert.equal((await context.request.get(`${base}/api/snapshots/${token}`)).status(), 200);
  if (duration.seconds === 3_600) {
    await page.evaluate(() => {
      const result = document.querySelector('.share-result');
      if (result) scrollTo(0, result.getBoundingClientRect().top + scrollY - 160);
    });
    await page.waitForTimeout(100);
    await page.screenshot({ path: `${evidenceDir}/share-controls-mobile.png` });
    await page.goto(link, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Did Northstar orders arrive?' }).waitFor();
    assert.deepEqual(await seriousAxe(), []);
    await page.screenshot({ path: `${evidenceDir}/shared-answer-mobile.png`, fullPage: true });
    await page.goto(`${base}/demo/snapshot`, { waitUntil: 'networkidle' });
  }
  await page.getByRole('button', { name: 'Revoke link now' }).click();
  await page.getByText('Link revoked.').waitFor();
  assert.equal((await context.request.get(`${base}/api/snapshots/${token}`)).status(), 410);
  shares.push({ ...duration, requestSeconds: requestBody.ttlSeconds, measuredDuration, tokenPrefix: token.slice(0, 2), revokedStatus: 410 });
}

await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
await page.evaluate(() => sessionStorage.setItem('demo:extra', 'remove me'));
await page.getByRole('button', { name: 'Start for real' }).click();
await page.waitForURL(`${base}/book`);
const isolation = await page.evaluate(() => ({
  realQuestion: localStorage.getItem('tqb:v1'),
  realPreview: sessionStorage.getItem('tqb:snapshot-preview'),
  realShares: sessionStorage.getItem('tqb:shares'),
  demoKeys: [...Object.keys(localStorage), ...Object.keys(sessionStorage)].filter((key) => key.startsWith('demo:'))
}));
assert.match(isolation.realQuestion || '', /REAL QUESTION SENTINEL/);
assert.equal(isolation.realPreview, 'REAL PREVIEW SENTINEL');
assert.match(isolation.realShares || '', /real-share-sentinel/);
assert.deepEqual(isolation.demoKeys, []);

const directContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const directPage = await directContext.newPage();
await directPage.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
assert.equal(await directPage.getByText('Demo — sample data, nothing is saved').count(), 1);
assert.equal(await directPage.locator('.question-card').count(), 3);
await directContext.close();

const offlineContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const offlinePage = await offlineContext.newPage();
await offlinePage.goto(`${base}/demo`, { waitUntil: 'networkidle' });
await offlinePage.evaluate(async () => { await navigator.serviceWorker.ready; });
await offlinePage.reload({ waitUntil: 'networkidle' });
await offlineContext.setOffline(true);
await offlinePage.reload({ waitUntil: 'domcontentloaded' });
await offlinePage.getByText('You are offline. Saved questions are still available.').waitFor();
assert.equal(await offlinePage.locator('.question-card').count(), 3);
await offlineContext.close();

const expectedRoutes = {
  '/': 'Telemetry Question Book — track approved readings',
  '/demo': 'Demo — Telemetry Question Book',
  '/book': 'My question book — Telemetry Question Book',
  '/privacy': 'Privacy — Telemetry Question Book',
  '/terms': 'Terms — Telemetry Question Book',
  '/snapshot': 'Answer copy — Telemetry Question Book',
  '/demo/snapshot': 'Demo answer copy — Telemetry Question Book',
  '/sample-sources/northstar-orders': 'Northstar order feed — Telemetry Question Book',
  '/sample-sources/atlas-webhooks': 'Atlas webhook queue — Telemetry Question Book',
  '/sample-sources/harbor-export': 'Harbor daily export — Telemetry Question Book'
};
const routes = [];
for (const [path, title] of Object.entries(expectedRoutes)) {
  const response = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200);
  assert.equal(await page.title(), title);
  assert.equal(await page.locator('h1').count(), 1);
  assert.equal(await page.locator('main').count(), 1);
  routes.push({ path, status: response.status(), title });
}
const missing = await page.goto(`${base}/definitely-missing-polish-4`, { waitUntil: 'networkidle' });
assert.equal(missing.status(), 404);
assert.equal(await page.title(), 'Not found — Telemetry Question Book');
assert.equal(await page.locator('h1').count(), 1);
assert.equal(await page.locator('main').count(), 1);
assert.deepEqual(await seriousAxe(), []);
await page.screenshot({ path: `${evidenceDir}/404-mobile.png`, fullPage: true });

const healthResponse = await context.request.get(`${base}/api/health`);
assert.equal(healthResponse.status(), 200);
const health = await healthResponse.json();
assert.equal(health.ok, true);
assert.equal(health.snapshotStoreConfigured, true);

assert.deepEqual([...origins], [base]);
assert.deepEqual(pageErrors, []);
const unexpectedConsoleErrors = consoleErrors.filter((message) => !/status of 404/.test(message));
assert.deepEqual(unexpectedConsoleErrors, []);

const result = {
  generatedAt: new Date().toISOString(),
  base,
  factBounds,
  firstReadingBounds,
  shares,
  isolation,
  directDemo: { cards: 3, banner: true },
  offline: { cards: 3, notice: true },
  routes,
  missing: { status: 404, title: await page.title() },
  health,
  origins: [...origins],
  consoleErrors: unexpectedConsoleErrors,
  pageErrors
};
await writeFile(`${evidenceDir}/cold-browser-check.json`, JSON.stringify(result, null, 2));
await browser.close();
console.log(JSON.stringify(result, null, 2));
