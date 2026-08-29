import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

const validCsv = (value = 180, question = 'Is Beacon latency within limit?') =>
  `question,owner,source,sourceUrl,value,unit,threshold,comparison,observedAt,freshMinutes,note\n"${question}",Reliability,Approved CSV,https://telemetry.example.test/beacon,${value},ms,250,lte,2026-08-28T09:30:00Z,10080,"Pilot account"\n`;

async function importCsv(page: import('@playwright/test').Page, csv: string): Promise<void> {
  await page.getByRole('button', { name: 'Import CSV' }).click();
  await page.locator('input[type="file"]').setInputFiles({ name: 'questions.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  await page.getByRole('button', { name: 'Import questions' }).click();
}

test('@claim:demo-sandbox opens three realistic questions in isolated storage', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('.question-card')).toHaveCount(3);
  const first = page.locator('.question-card').first();
  await expect(first.getByRole('heading', { name: 'Did Northstar orders arrive?' })).toBeVisible();
  await expect(first.getByText('1,842', { exact: true })).toBeVisible();
  await expect(first.getByText('On track', { exact: true })).toBeVisible();
  await expect(first.getByText('Fresh for 60 min')).toBeVisible();
  for (const value of ['Did Northstar orders arrive?', '1,842', 'On track', 'Fresh for 60 min']) {
    const box = await first.getByText(value, { exact: value !== 'Did Northstar orders arrive?' }).boundingBox();
    expect(box && box.y < 844 && box.y + box.height > 0, `${value} must intersect the first phone viewport`).toBeTruthy();
  }
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys).toContain('demo:tqb:v1');
  expect(keys).not.toContain('tqb:v1');
  await page.goto('/?demo=1');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('.question-card')).toHaveCount(3);
});

test('@claim:demo-controls reset sample changes and leave real data untouched', async ({ page, request }) => {
  await page.goto('/demo');
  await page.evaluate(() => {
    localStorage.setItem('tqb:v1', JSON.stringify([{ id: 'real', question: 'Real sentinel question', owner: 'Real owner', source: 'Real source', sourceUrl: 'https://example.test/real', value: 1, unit: 'event', threshold: 1, comparison: 'eq', observedAt: new Date().toISOString(), freshMinutes: 60, note: '' }]));
    sessionStorage.setItem('tqb:snapshot-preview', 'REAL PREVIEW SENTINEL');
    sessionStorage.setItem('tqb:shares', '[{"token":"real-share-sentinel"}]');
    localStorage.setItem('demo:tqb:v1', '[]');
    sessionStorage.setItem('demo:extra', 'remove me');
  });
  await page.reload();
  await expect(page.locator('.question-card')).toHaveCount(0);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('.question-card')).toHaveCount(3);
  await page.getByRole('button', { name: 'Make answer copy' }).first().click();
  await page.getByRole('button', { name: 'Review answer copy' }).click();
  await expect(page).toHaveURL(/\/demo\/snapshot$/);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem('tqb:snapshot-preview'))).toBe('REAL PREVIEW SENTINEL');
  expect(await page.evaluate(() => sessionStorage.getItem('demo:tqb:snapshot-preview'))).toContain('Northstar');
  await page.getByRole('button', { name: 'Create expiring link' }).click();
  const demoToken = new URL(await page.getByLabel('Expiring answer link').inputValue()).pathname.split('/').pop()!;
  expect((await request.get(`/api/snapshots/${demoToken}`)).status()).toBe(200);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/book$/);
  expect(await page.evaluate(() => localStorage.getItem('tqb:v1'))).toContain('Real sentinel question');
  expect(await page.evaluate(() => sessionStorage.getItem('tqb:snapshot-preview'))).toBe('REAL PREVIEW SENTINEL');
  expect(await page.evaluate(() => sessionStorage.getItem('tqb:shares'))).toContain('real-share-sentinel');
  expect(await page.evaluate(() => [...Object.keys(localStorage), ...Object.keys(sessionStorage)].filter((key) => key.startsWith('demo:')))).toEqual([]);
  expect((await request.get(`/api/snapshots/${demoToken}`)).status()).toBe(410);
});

test('@claim:card-fields retains owner, freshness, threshold, and source across reload', async ({ page }) => {
  await page.goto('/demo');
  const first = page.locator('.question-card').first();
  await expect(first).toContainText('Owner Data Platform');
  await expect(first).toContainText('Fresh for 60 min');
  await expect(first).toContainText('Passes when at least 1,500 orders');
  await expect(first).toContainText('Approved Grafana view');
  await expect(first.getByRole('link', { name: /Open approved source/ })).toHaveAttribute('href', /sample-sources\/northstar-orders$/);
  await page.reload();
  await expect(page.locator('.question-card').first()).toContainText('Owner Data Platform');
  await expect(page.locator('.question-card').first()).toContainText('Fresh for 60 min');
  await expect(page.locator('.question-card').first()).toContainText('at least 1,500 orders');
});

test('@claim:threshold-states shows on track, needs attention, and stale', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('On track', { exact: true })).toHaveCount(2);
  await expect(page.getByText('Stale', { exact: true })).toHaveCount(1);
  await page.evaluate(() => {
    const questions = JSON.parse(localStorage.getItem('demo:tqb:v1') || '[]');
    questions.push({ ...questions[0], id: 'failing', question: 'Are failed jobs below limit?', value: 20, threshold: 5, comparison: 'lte', observedAt: new Date().toISOString() });
    localStorage.setItem('demo:tqb:v1', JSON.stringify(questions));
  });
  await page.reload();
  await expect(page.getByText('Needs attention', { exact: true })).toHaveCount(1);
  await expect(page.getByText('Fresh for 60 min').first()).toBeVisible();
});

test('@claim:local-browser keeps question and answer-copy data local with no analytics', async ({ page }) => {
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Update reading' }).first().click();
  await page.getByLabel('Current value').fill('1901');
  await page.getByRole('button', { name: 'Save updated reading' }).click();
  await page.goto('/');
  expect([...origins]).toEqual(['http://127.0.0.1:4173']);
  expect(await page.evaluate(() => localStorage.getItem('demo:tqb:v1'))).not.toBeNull();
  await expect(page.locator('input[type="password"], [data-account], [data-analytics], [data-query-builder], [data-alert-control]')).toHaveCount(0);
  await expect(page.getByText('It does not ingest logs or metrics.')).toBeVisible();
  await expect(page.getByText('It does not write query language.')).toBeVisible();
  await expect(page.getByText('It does not alert or monitor systems.')).toBeVisible();
});

test('@claim:free-core keeps all question workflows available without an account or purchase', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('button', { name: 'Update reading' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Import CSV' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Make answer copy' }).first()).toBeVisible();
  await expect(page.locator('input[type="password"], a[href*="checkout"], [data-action="download-pack"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Make answer copy' }).first().click();
  await page.getByRole('button', { name: 'Review answer copy' }).click();
  await expect(page.getByRole('button', { name: 'Create expiring link' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download JSON' })).toBeVisible();
});

test('@claim:offline-reload reloads the visited demo offline', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect(page.locator('.question-card')).toHaveCount(3);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('You are offline. Saved questions are still available.')).toBeVisible();
  await expect(page.locator('.question-card')).toHaveCount(3);
});

test('@claim:question-update changes one recurring card without a duplicate', async ({ page }) => {
  await page.goto('/demo');
  const card = page.locator('.question-card').first();
  await card.getByRole('button', { name: 'Update reading' }).click();
  await page.getByLabel('Current value').fill('1900');
  await page.getByRole('button', { name: 'Save updated reading' }).click();
  await expect(page.locator('.question-card')).toHaveCount(3);
  await expect(page.locator('.question-card').first().getByText('1,900', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator('.question-card')).toHaveCount(3);
  await expect(page.locator('.question-card').first().getByText('1,900', { exact: true })).toBeVisible();
});

test('@claim:csv-import adds a new row and updates a matching recurring question', async ({ page }) => {
  await page.goto('/demo');
  await importCsv(page, validCsv());
  await expect(page.locator('.question-card')).toHaveCount(4);
  await expect(page.getByRole('heading', { name: 'Is Beacon latency within limit?' })).toBeVisible();
  await importCsv(page, validCsv(210));
  await expect(page.locator('.question-card')).toHaveCount(4);
  const beacon = page.locator('.question-card').filter({ hasText: 'Is Beacon latency within limit?' });
  await expect(beacon.getByText('210', { exact: true })).toBeVisible();
});

test('@claim:csv-validation enforces required fields, HTTPS, and whole-minute limits in both inputs', async ({ page }) => {
  await page.goto('/demo');
  const invalid = 'question,owner,source,sourceUrl,value,unit,threshold,comparison,observedAt,freshMinutes,note\n,,,,1,,0,gte,2026-08-28T09:30:00Z,10081,\n';
  await importCsv(page, invalid);
  await expect(page.getByRole('alert')).toContainText('Row 2 needs question.');
  await expect(page.locator('.question-card')).toHaveCount(3);
  const invalidUrl = validCsv().replace('https://telemetry.example.test/beacon', 'https://');
  await page.locator('input[type="file"]').setInputFiles({ name: 'questions.csv', mimeType: 'text/csv', buffer: Buffer.from(invalidUrl) });
  await page.getByRole('button', { name: 'Import questions' }).click();
  await expect(page.getByRole('alert')).toContainText('valid HTTPS source URL');
  const invalidFreshness = validCsv().replace(',10080,', ',10081,');
  await page.locator('input[type="file"]').setInputFiles({ name: 'questions.csv', mimeType: 'text/csv', buffer: Buffer.from(invalidFreshness) });
  await page.getByRole('button', { name: 'Import questions' }).click();
  await expect(page.getByRole('alert')).toContainText('whole number from 1 to 10080');
  for (const invalid of ['0', '1.5']) {
    const csv = validCsv(180, `Freshness ${invalid}`).replace(',10080,', `,${invalid},`);
    await page.locator('input[type="file"]').setInputFiles({ name: 'questions.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
    await page.getByRole('button', { name: 'Import questions' }).click();
    await expect(page.getByRole('alert')).toContainText('whole number from 1 to 10080');
  }
  await page.locator('input[type="file"]').setInputFiles({ name: 'questions.csv', mimeType: 'text/csv', buffer: Buffer.from(validCsv(180, 'One minute').replace(',10080,', ',1,')) });
  await page.getByRole('button', { name: 'Import questions' }).click();
  await expect(page.getByRole('heading', { name: 'One minute' })).toBeVisible();
  await page.getByRole('button', { name: 'Add a question' }).click();
  const freshness = page.getByLabel('Fresh for minutes');
  await expect(freshness).toHaveAttribute('min', '1');
  await expect(freshness).toHaveAttribute('max', '10080');
  await expect(freshness).toHaveAttribute('type', 'number');
  await expect(page.locator('.question-card')).toHaveCount(4);
});

test('@claim:csv-template downloads a usable template', async ({ page }) => {
  await page.goto('/demo');
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download CSV template' }).click();
  const artifact = await pending;
  expect(artifact.suggestedFilename()).toBe('question-book-template.csv');
  const stream = await artifact.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const csv = Buffer.concat(chunks).toString('utf8');
  expect(csv).toContain('question,owner,source,sourceUrl,value,unit,threshold,comparison,observedAt,freshMinutes,note');
  expect(csv.trim().split('\n')).toHaveLength(2);
});

test('@claim:answer-copy-security keeps data out of URLs and ignores forged fragments', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Make answer copy' }).first().click();
  await page.getByRole('button', { name: 'Review answer copy' }).click();
  expect(new URL(page.url()).hash).toBe('');
  await expect(page).toHaveURL(/\/demo\/snapshot$/);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  const snapshot = await page.evaluate(() => JSON.parse(sessionStorage.getItem('demo:tqb:snapshot-preview') || 'null'));
  expect(snapshot).toMatchObject({ version: 2, redacted: true, demo: true });
  expect(snapshot).not.toHaveProperty('owner');
  expect(snapshot).not.toHaveProperty('source');
  expect(snapshot).not.toHaveProperty('note');
  expect(snapshot).not.toHaveProperty('expiresAt');

  await page.evaluate(() => sessionStorage.clear());
  const forged = Buffer.from(JSON.stringify({ question: 'Forged customer answer', answer: 'CUSTOMER-SECRET-4242' })).toString('base64');
  await page.goto(`/snapshot#${forged}`);
  await expect(page.getByRole('heading', { name: 'No answer copy is open' })).toBeVisible();
  await expect(page.getByText('Forged customer answer')).toHaveCount(0);
  await expect(page.getByText('CUSTOMER-SECRET-4242')).toHaveCount(0);
  expect(new URL(page.url()).hash).toBe('');
});

test('@claim:answer-copy-download exports exactly the reviewed redacted fields', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Make answer copy' }).first().click();
  await page.getByRole('button', { name: 'Review answer copy' }).click();
  await expect(page.getByText(/Downloaded files do not expire/)).toBeVisible();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download JSON' }).click();
  const artifact = await pending;
  expect(artifact.suggestedFilename()).toBe('telemetry-answer-copy.json');
  const stream = await artifact.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  expect(body).toMatchObject({ version: 2, question: 'Did Northstar orders arrive?', redacted: true });
  expect(Object.keys(body)).not.toEqual(expect.arrayContaining(['owner', 'source', 'note', 'expiresAt']));
});

test('@claim:expiring-share creates an opaque link that expires server-side and rejects tampering', async ({ page, request }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Make answer copy' }).first().click();
  await page.getByRole('button', { name: 'Review answer copy' }).click();
  await page.getByRole('button', { name: 'Create expiring link' }).click();
  const link = page.getByLabel('Expiring answer link');
  await expect(link).toHaveValue(/\/s\/d_[a-f0-9]+$/);
  const sharedUrl = await link.inputValue();
  expect(sharedUrl).not.toContain('Northstar');
  const token = new URL(sharedUrl).pathname.split('/').pop()!;
  const live = await request.get(`/api/snapshots/${token}`);
  expect(live.status()).toBe(200);
  const tampered = await request.get(`/api/snapshots/${token.slice(0, -1)}0`);
  expect(tampered.status()).toBe(404);

  const preview = await page.evaluate(() => JSON.parse(sessionStorage.getItem('demo:tqb:snapshot-preview') || 'null'));
  const short = await request.post('/api/snapshots', { data: { snapshot: preview, demo: true, ttlSeconds: 1 } });
  expect(short.status()).toBe(201);
  const shortToken = (await short.json()).token;
  await new Promise((resolve) => setTimeout(resolve, 1100));
  expect((await request.get(`/api/snapshots/${shortToken}`)).status()).toBe(410);
});

test('@claim:share-redaction keeps hidden fields out of the stored recipient payload', async ({ page, request }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Make answer copy' }).first().click();
  await page.getByRole('button', { name: 'Review answer copy' }).click();
  await page.getByRole('button', { name: 'Create expiring link' }).click();
  const token = new URL(await page.getByLabel('Expiring answer link').inputValue()).pathname.split('/').pop()!;
  const stored = await (await request.get(`/api/snapshots/${token}`)).json();
  expect(stored.snapshot).toMatchObject({ question: 'Did Northstar orders arrive?', redacted: true, demo: true });
  expect(stored.snapshot).not.toHaveProperty('owner');
  expect(stored.snapshot).not.toHaveProperty('source');
  expect(stored.snapshot).not.toHaveProperty('note');
  await page.goto(`/s/${token}`);
  await expect(page.getByRole('heading', { name: 'Did Northstar orders arrive?' })).toBeVisible();
  await expect(page.getByText('Owner, source, and internal note were hidden.')).toBeVisible();
});

test('@claim:share-revocation makes a recipient link unavailable immediately', async ({ page, request }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Make answer copy' }).first().click();
  await page.getByRole('button', { name: 'Review answer copy' }).click();
  await page.getByRole('button', { name: 'Create expiring link' }).click();
  const token = new URL(await page.getByLabel('Expiring answer link').inputValue()).pathname.split('/').pop()!;
  expect((await request.get(`/api/snapshots/${token}`)).status()).toBe(200);
  await page.getByRole('button', { name: 'Revoke link now' }).click();
  await expect(page.getByText('Link revoked.')).toBeVisible();
  expect((await request.get(`/api/snapshots/${token}`)).status()).toBe(410);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/book$/);
});

test('@claim:least-privilege-input accepts HTTPS links and never asks for credentials', async ({ page }) => {
  await page.goto('/book');
  await page.getByRole('button', { name: 'Add a question' }).click();
  await expect(page.getByLabel('Approved source URL')).toHaveAttribute('type', 'url');
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
  await expect(page.getByText('Do not paste dashboard credentials.')).toBeVisible();
});

test('@claim:sample-sources gives every demo card a working local source page', async ({ page, request }) => {
  await page.goto('/demo');
  const hrefs = await page.getByRole('link', { name: /Open approved source/ }).evaluateAll((links) => links.map((link) => new URL((link as HTMLAnchorElement).href).pathname));
  expect(hrefs).toHaveLength(3);
  for (const path of hrefs) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    await page.goto(path);
    await expect(page.getByText('Demo source · not live telemetry')).toBeVisible();
    const expected = path.includes('northstar') ? 'Northstar order feed' : path.includes('atlas') ? 'Atlas webhook queue' : 'Harbor daily export';
    await expect(page).toHaveTitle(`${expected} — Telemetry Question Book`);
  }
});

test('regression: every route has a distinct title, metadata, and navigation focus', async ({ page }) => {
  const expected: Record<string, string> = {
    '/': 'Telemetry Question Book — track approved readings',
    '/demo': 'Demo — Telemetry Question Book',
    '/book': 'My question book — Telemetry Question Book',
    '/privacy': 'Privacy — Telemetry Question Book',
    '/terms': 'Terms — Telemetry Question Book',
    '/snapshot': 'Answer copy — Telemetry Question Book'
  };
  for (const [route, title] of Object.entries(expected)) {
    await page.goto(route);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{20,}/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://telemetry-question-book.sociobot.in${route}`);
  }
  await page.goto('/');
  await page.getByRole('link', { name: 'Demo', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
});

test('regression: desktop and mobile routes have no serious accessibility issues', async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    for (const route of ['/', '/demo', '/demo/snapshot', '/book', '/privacy', '/terms', '/snapshot', '/sample-sources/northstar-orders', '/not-a-route']) {
      await page.goto(route);
      await expect(page.locator('main')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveCount(1);
      expect(await page.locator('body').evaluate((body) => body.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact || '')), `${route} at ${viewport.width}px`).toEqual([]);
    }
  }
});

test('regression: mobile navigation and footer targets meet 44px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (const locator of [page.getByLabel('Telemetry Question Book home'), page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Demo' }), page.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link', { name: 'Privacy' }), page.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link', { name: 'Terms' })]) {
    const box = await locator.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

test('regression: keyboard focus and dialog restoration remain visible', async ({ page }) => {
  await page.goto('/demo');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  const focus = await page.getByRole('link', { name: 'Skip to main content' }).evaluate((element) => {
    const style = getComputedStyle(element);
    return { outline: style.outlineColor, shadow: style.boxShadow };
  });
  expect(focus.outline).toBe('rgb(255, 249, 233)');
  expect(focus.shadow).toContain('rgb(113, 48, 17)');
  const opener = page.getByRole('button', { name: 'Make answer copy' }).first();
  await opener.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
});

test('regression: static response policy has explicit routes and a CSP-safe 404', async ({ request }) => {
  const config = JSON.parse(await readFile('public/staticwebapp.config.json', 'utf8'));
  expect(config.navigationFallback).toBeUndefined();
  expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html' });
  expect(config.globalHeaders['Content-Security-Policy']).not.toContain("'unsafe-inline'");
  expect(config.globalHeaders['Content-Security-Policy']).not.toContain('api.sociobot.in');
  const document = await readFile('public/404.html', 'utf8');
  expect(document).not.toContain('<style');
  expect(document).toContain('href="/404.css"');
  expect(document).toContain('property="og:title"');
  expect(document).toContain('rel="apple-touch-icon"');
  expect(document).toContain('Built by Param Factory');
  expect((await request.get('/404.css')).status()).toBe(200);
  expect((await request.get('/not-a-route')).status()).toBe(404);
});

test('regression: service worker replaces old caches and has no waiting update', async ({ page }) => {
  await page.goto('/demo');
  await page.evaluate(async () => {
    await caches.open('tqb-shell-v2');
    const registration = await navigator.serviceWorker.ready;
    await registration.unregister();
  });
  await page.reload();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await expect.poll(() => page.evaluate(() => caches.keys())).not.toContain('tqb-shell-v2');
  await expect.poll(() => page.evaluate(async () => Boolean((await navigator.serviceWorker.getRegistration())?.waiting))).toBe(false);
  expect(await page.evaluate(() => caches.keys())).toContain('tqb-shell-v4');
});
