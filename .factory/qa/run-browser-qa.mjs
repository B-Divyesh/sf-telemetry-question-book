import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const allBases = [
  ['local', 'http://127.0.0.1:4173'],
  ['live', 'https://telemetry-question-book.sociobot.in'],
];
const bases = process.env.QA_LOCAL_ONLY === '1' ? allBases.slice(0, 1) : allBases;

const results = { generatedAt: new Date().toISOString(), bases: {}, workflows: {} };
const browser = await chromium.launch({ headless: true });

async function routeAudit(label, base, viewport) {
  const context = await browser.newContext({ viewport });
  const rows = [];
  for (const path of ['/', '/demo', '/book', '/privacy', '/terms', '/snapshot#broken', '/sample-sources/northstar-orders', '/not-a-route']) {
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const origins = new Set();
    page.on('console', (message) => message.type() === 'error' && consoleErrors.push(message.text()));
    page.on('pageerror', (error) => pageErrors.push(String(error)));
    page.on('request', (request) => origins.add(new URL(request.url()).origin));
    const response = await page.goto(`${base}${path}`, { waitUntil: 'networkidle', timeout: 30_000 });
    const axe = await new AxeBuilder({ page }).analyze();
    const serious = axe.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''));
    const info = await page.evaluate(() => ({
      title: document.title,
      lang: document.documentElement.lang,
      h1: document.querySelectorAll('h1').length,
      main: document.querySelectorAll('main').length,
      missingAlt: [...document.querySelectorAll('img')].filter((img) => !img.hasAttribute('alt')).length,
      scrollWidth: document.body.scrollWidth,
      innerWidth,
      canonical: document.querySelector('link[rel="canonical"]')?.href || null,
      wordmark: (() => {
        const element = document.querySelector('.wordmark');
        if (!element) return null;
        const bounds = element.getBoundingClientRect();
        return {
          text: element instanceof HTMLElement ? element.innerText.replace(/\s+/g, ' ').trim() : '',
          visible: getComputedStyle(element).display !== 'none' && bounds.width > 0 && bounds.height > 0,
          bounds: bounds.toJSON(),
        };
      })(),
    }));
    if (viewport.width === 390) {
      assert.match(info.wordmark?.text || '', /Telemetry Question Book/i, `${path} keeps a visible product wordmark`);
      assert.equal(info.wordmark?.visible, true, `${path} keeps the product wordmark visible`);
      assert.ok(info.wordmark.bounds.right <= viewport.width, `${path} keeps the product wordmark inside the phone viewport`);
    }
    rows.push({ path, status: response?.status(), ...info, origins: [...origins], consoleErrors, pageErrors, serious });
    if (path === '/') await page.screenshot({ path: `.factory/qa/${label}-${viewport.width}-landing.png`, fullPage: true });
    if (path === '/demo') await page.screenshot({ path: `.factory/qa/${label}-${viewport.width}-demo.png`, fullPage: true });
    await page.close();
  }
  await context.close();
  return rows;
}

async function keyboardAndMotion(base) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  await page.waitForTimeout(100);
  const firstFocus = await page.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), rect: document.activeElement?.getBoundingClientRect().toJSON(), outline: getComputedStyle(document.activeElement).outline }));
  assert.match(firstFocus.text || '', /Skip to main content/i);
  assert.ok(firstFocus.rect.top >= -1, `skip link is visible when focused: ${JSON.stringify(firstFocus.rect)}`);

  let reachedDemo = false;
  let demoFocus = null;
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(50);
    const active = await page.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), outline: getComputedStyle(document.activeElement).outline }));
    if (/Try it with sample data/i.test(active.text || '')) { reachedDemo = true; demoFocus = active; break; }
  }
  assert.ok(reachedDemo, 'sample demo action is keyboard reachable');
  await page.keyboard.press('Enter');
  await page.waitForURL('**/demo');
  assert.equal(await page.locator('.question-card').count(), 3);
  await page.getByRole('button', { name: 'Make answer copy' }).first().focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('dialog[open]').count(), 1);
  const dialogFocus = [];
  const recordDialogFocus = async (step) => {
    await page.waitForTimeout(20);
    const active = await page.evaluate(() => {
      const dialog = document.querySelector('dialog[open]');
      const element = document.activeElement;
      const style = element ? getComputedStyle(element) : null;
      return {
        label: element?.getAttribute('aria-label') || element?.closest('label')?.textContent?.trim() || element?.textContent?.trim(),
        inDialog: Boolean(dialog?.contains(element)),
        outlineStyle: style?.outlineStyle,
        outlineWidth: Number.parseFloat(style?.outlineWidth || '0'),
      };
    });
    assert.equal(active.inDialog, true, `${step} stays inside the answer-copy dialog`);
    assert.equal(active.outlineStyle, 'solid', `${step} uses the designed focus outline`);
    assert.ok(active.outlineWidth >= 3, `${step} focus outline is at least 3 px`);
    dialogFocus.push({ step, ...active });
  };
  await recordDialogFocus('initial close control');
  await page.keyboard.press('Shift+Tab');
  await recordDialogFocus('reverse wrap to review control');
  assert.match(dialogFocus.at(-1).label || '', /Review answer copy/i);
  for (const [step, label] of [
    ['forward wrap to close control', /Close answer copy dialog/i],
    ['redaction control', /Hide owner, source, and note/i],
    ['expiry control', /1 hour24 hours7 days/i],
    ['cancel control', /^Cancel$/i],
    ['review control', /Review answer copy/i],
    ['forward wrap to close control again', /Close answer copy dialog/i],
  ]) {
    await page.keyboard.press('Tab');
    await recordDialogFocus(step);
    assert.match(dialogFocus.at(-1).label || '', label);
  }
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('dialog[open]').count(), 0);
  const restoredFocus = await page.evaluate(() => document.activeElement?.textContent?.trim());
  await page.getByRole('button', { name: 'Make answer copy' }).first().click();
  await page.getByRole('button', { name: 'Review answer copy' }).click();
  const animationDuration = await page.locator('.snapshot-ticket').evaluate((el) => getComputedStyle(el).animationDuration);

  const targets = await page.goto(`${base}/demo`, { waitUntil: 'networkidle' }).then(async () => page.locator('a,button,input,select,textarea').evaluateAll((els) => els.filter((el) => {
    const target = el instanceof HTMLInputElement && el.type === 'checkbox' ? el.closest('label') || el : el;
    const rect = target.getBoundingClientRect();
    const style = getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden';
  }).map((el) => {
    const target = el instanceof HTMLInputElement && el.type === 'checkbox' ? el.closest('label') || el : el;
    const rect = target.getBoundingClientRect();
    return { text: (el.getAttribute('aria-label') || el.textContent || el.getAttribute('name') || '').trim(), width: Math.round(rect.width * 10) / 10, height: Math.round(rect.height * 10) / 10 };
  })));
  await context.close();
  return { firstFocus, demoFocus, dialogFocus, restoredFocus, animationDuration, undersizedTargets: targets.filter((target) => target.width < 44 || target.height < 44) };
}

async function workflow(base) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (message) => message.type() === 'error' && consoleErrors.push(message.text()));
  page.on('pageerror', (error) => pageErrors.push(String(error)));

  await page.goto(`${base}/book`, { waitUntil: 'networkidle' });
  assert.equal(await page.getByRole('heading', { name: 'No questions yet' }).count(), 1);
  await page.getByRole('button', { name: 'Add a question' }).click();
  await page.locator('input[name="question"]').fill('Is customer-visible latency within limit?');
  await page.getByLabel('Owner', { exact: true }).fill('Reliability');
  await page.getByLabel('Approved source name').fill('Read-only latency view');
  await page.getByLabel('Approved source URL').fill('http://unsafe.example/view');
  await page.getByLabel('Current value').fill('0');
  await page.getByLabel('Unit').fill('ms');
  await page.getByLabel('Passes when').selectOption('lte');
  await page.getByLabel('Threshold').fill('0');
  await page.getByLabel('Fresh for minutes').fill('1');
  assert.equal(await page.locator('#question-form').evaluate((form) => form.checkValidity()), false);
  await page.getByRole('button', { name: 'Save question' }).click();
  assert.equal(await page.locator('#question-form').count(), 1, 'invalid HTTP URL is not saved');
  await page.getByLabel('Approved source URL').fill('https://telemetry.example.test/latency');
  await page.getByRole('button', { name: 'Save question' }).click();
  assert.equal(await page.locator('.question-card').count(), 1);
  assert.equal(await page.getByText('On track', { exact: true }).count(), 1);
  await page.reload();
  assert.equal(await page.locator('.question-card').count(), 1, 'question persists after reload');
  await page.getByRole('button', { name: 'Update reading' }).click();
  await page.getByLabel('Current value').fill('12');
  await page.getByRole('button', { name: 'Save updated reading' }).click();
  assert.equal(await page.locator('.question-card').count(), 1, 'update keeps one recurring card');
  assert.equal(await page.getByText('12', { exact: true }).count(), 1);

  await page.getByRole('button', { name: 'Import CSV' }).click();
  await page.locator('input[type="file"]').setInputFiles({ name: 'bad.csv', mimeType: 'text/csv', buffer: Buffer.from('question,owner\nOnly a question,Ops\n') });
  await page.getByRole('button', { name: 'Import questions' }).click();
  await page.locator('.form-error').waitFor({ state: 'visible' });
  const csvError = await page.locator('.form-error').innerText();
  assert.match(csvError, /missing source/i);
  const validCsv = 'question,owner,source,sourceUrl,value,unit,threshold,comparison,observedAt,freshMinutes,note\n"Did the comma, feed arrive?",Data Platform,Approved export,https://telemetry.example.test/comma,4,events,5,gte,2026-08-28T09:30:00Z,10080,"Quoted, note"\n';
  await page.locator('input[type="file"]').setInputFiles({ name: 'good.csv', mimeType: 'text/csv', buffer: Buffer.from(validCsv) });
  await page.getByRole('button', { name: 'Import questions' }).click();
  await page.locator('.question-card').nth(1).waitFor();
  assert.equal(await page.locator('.question-card').count(), 2);
  assert.equal(await page.getByText('Did the comma, feed arrive?').count(), 1);

  const templateDownloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download CSV template' }).click();
  const templateDownload = await templateDownloadPromise;

  await page.getByRole('button', { name: 'Make answer copy' }).first().click();
  const dialogFocus = await page.evaluate(() => ({ inDialog: Boolean(document.activeElement?.closest('dialog')), label: document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent?.trim() }));
  await page.getByRole('button', { name: 'Review answer copy' }).click();
  assert.equal(await page.getByText('Owner, source, and internal note were hidden.').count(), 1);
  assert.equal(await page.getByText('Reliability', { exact: true }).count(), 0);
  const redactedUrl = page.url();
  assert.equal(new URL(redactedUrl).hash, '');
  await page.goBack();
  await page.getByRole('button', { name: 'Make answer copy' }).first().click();
  await page.getByLabel('Hide owner, source, and note').uncheck();
  await page.getByRole('button', { name: 'Review answer copy' }).click();
  assert.equal(await page.getByText('Reliability', { exact: true }).count(), 1);
  const unredactedUrl = page.url();
  assert.equal(new URL(unredactedUrl).hash, '');

  await page.evaluate(() => sessionStorage.clear());
  await page.goto(`${base}/snapshot#not-valid`);
  assert.equal(await page.getByRole('heading', { name: 'No answer copy is open' }).count(), 1);
  assert.equal(new URL(page.url()).hash, '');

  await page.goto(`${base}/demo`);
  assert.equal(await page.locator('.question-card').count(), 3);
  const storageBefore = await page.evaluate(() => ({ real: localStorage.getItem('tqb:v1'), demo: localStorage.getItem('demo:tqb:v1') }));
  assert.ok(storageBefore.real && storageBefore.demo);
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Delete' }).first().click();
  assert.equal(await page.locator('.question-card').count(), 3, 'cancel keeps question');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete' }).first().click();
  assert.equal(await page.locator('.question-card').count(), 2);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  assert.equal(await page.locator('.question-card').count(), 3);
  await page.getByRole('button', { name: 'Start for real' }).click();
  assert.equal(await page.locator('.question-card').count(), 2, 'real book remains separate');
  const storageAfter = await page.evaluate(() => ({ real: Boolean(localStorage.getItem('tqb:v1')), demo: localStorage.getItem('demo:tqb:v1') }));
  assert.deepEqual(storageAfter, { real: true, demo: null });

  await page.goto(`${base}/`);
  await page.getByRole('link', { name: 'Demo', exact: true }).click();
  await page.goBack();
  await page.waitForURL(`${base}/`);
  const backFocus = await page.evaluate(() => ({ tag: document.activeElement?.tagName, text: document.activeElement?.textContent?.trim() }));

  await context.close();
  return { csvError, templateDownloadObserved: Boolean(templateDownload), redactedUrlLength: redactedUrl.length, unredactedUrlLength: unredactedUrl.length, dialogFocus, storageBefore: { real: Boolean(storageBefore.real), demo: Boolean(storageBefore.demo) }, storageAfter, backFocus, consoleErrors, pageErrors };
}

for (const [label, base] of bases) {
  results.bases[label] = {
    desktop: await routeAudit(label, base, { width: 1440, height: 900 }),
    mobile: await routeAudit(label, base, { width: 390, height: 844 }),
    keyboardAndMotion: await keyboardAndMotion(base),
  };
  results.workflows[label] = await workflow(base);
}

await browser.close();
await writeFile('.factory/qa/browser-qa-results.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
