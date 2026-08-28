import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('@claim:demo-sandbox opens a filled and isolated demo', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('.question-card')).toHaveCount(3);
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys).toContain('demo:tqb:v1');
  expect(keys).not.toContain('tqb:v1');
});

test('@claim:threshold-states turns freshness and thresholds into plain states', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('On track', { exact: true })).toHaveCount(2);
  await expect(page.getByText('Stale', { exact: true })).toHaveCount(1);
  await expect(page.getByText('Fresh for 60 min').first()).toBeVisible();
});

test('@claim:local-browser keeps the demo flow on this origin', async ({ page }) => {
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Make answer snapshot' }).first().click();
  await page.getByRole('button', { name: 'Create snapshot' }).click();
  await expect(page.getByText('Owner, source, and internal note were hidden by the sender.')).toBeVisible();
  expect([...origins]).toEqual(['http://127.0.0.1:4173']);
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

test('@claim:csv-import imports an approved CSV row', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Import CSV' }).click();
  const csv = 'question,owner,source,sourceUrl,value,unit,threshold,comparison,observedAt,freshMinutes,note\n"Is Beacon latency within limit?",Reliability,Approved CSV,https://example.com/approved/beacon,180,ms,250,lte,2026-08-28T09:30:00Z,10080,"Pilot account"\n';
  await page.locator('input[type="file"]').setInputFiles({ name: 'questions.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  await page.getByRole('button', { name: 'Import questions' }).click();
  await expect(page.locator('.question-card')).toHaveCount(4);
  await expect(page.getByRole('heading', { name: 'Is Beacon latency within limit?' })).toBeVisible();
  await expect(page.getByText('180', { exact: true })).toBeVisible();
});

test('@claim:snapshot-controls redacts fields and rejects an expired snapshot', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Make answer snapshot' }).first().click();
  await page.getByRole('button', { name: 'Create snapshot' }).click();
  await expect(page.getByText('Owner, source, and internal note were hidden by the sender.')).toBeVisible();
  await expect(page.getByText('Data Platform')).toHaveCount(0);

  const expired = {
    version: 1,
    question: 'Did the feed arrive?',
    answer: '1200 events',
    status: 'On track',
    observedAt: '2026-08-27T08:00:00.000Z',
    createdAt: '2026-08-27T08:00:00.000Z',
    expiresAt: '2026-08-27T09:00:00.000Z',
    redacted: true
  };
  const encoded = Buffer.from(JSON.stringify(expired), 'utf8').toString('base64');
  await page.goto(`/snapshot#${encoded}`);
  await expect(page.getByRole('heading', { name: 'This answer snapshot expired' })).toBeVisible();
  await expect(page.getByText('1200 events')).toHaveCount(0);
});

test('@claim:least-privilege-input accepts links and never asks for credentials', async ({ page }) => {
  await page.goto('/book');
  await page.getByRole('button', { name: 'Add a question' }).click();
  await expect(page.getByLabel('Approved source URL')).toHaveAttribute('type', 'url');
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
  await expect(page.getByText('Do not paste dashboard credentials.')).toBeVisible();
});

test('@claim:paid-support-pack verifies a license and downloads the pack', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/telemetry-question-book/verify?license=test-license', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }) }));
  await page.goto('/');
  await page.getByLabel('Have a license?').fill('test-license');
  await page.getByRole('button', { name: 'Verify license' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download Support Pack' }).click();
  const artifact = await downloadPromise;
  expect(artifact.suggestedFilename()).toBe('telemetry-question-book-support-pack.md');
});

test('landing and mobile demo have no serious accessibility issues', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveCount(1);
  const landingResults = await new AxeBuilder({ page }).analyze();
  expect(landingResults.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  const demoResults = await new AxeBuilder({ page }).analyze();
  expect(demoResults.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
});
