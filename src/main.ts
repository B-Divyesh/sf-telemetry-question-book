import './style.css';

type Comparison = 'gte' | 'lte' | 'eq';
type Question = {
  id: string;
  question: string;
  owner: string;
  source: string;
  sourceUrl: string;
  value: number;
  unit: string;
  threshold: number;
  comparison: Comparison;
  observedAt: string;
  freshMinutes: number;
  note: string;
};

type Snapshot = {
  version: 1;
  question: string;
  answer: string;
  status: string;
  observedAt: string;
  createdAt: string;
  expiresAt: string;
  owner?: string;
  source?: string;
  note?: string;
  redacted: boolean;
};

const SLUG = 'telemetry-question-book';
const REAL_KEY = 'tqb:v1';
const DEMO_KEY = 'demo:tqb:v1';
const LICENSE_KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `sb_license_verdict:${SLUG}`;
const app = document.querySelector<HTMLDivElement>('#app')!;
let firstRender = true;

const sampleQuestions = (): Question[] => {
  const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
  return [
    {
      id: 'northstar-feed',
      question: 'Did Northstar orders arrive?',
      owner: 'Data Platform',
      source: 'Approved Grafana view',
      sourceUrl: 'https://example.com/approved/northstar-orders',
      value: 1842,
      unit: 'orders',
      threshold: 1500,
      comparison: 'gte',
      observedAt: ago(12),
      freshMinutes: 60,
      note: 'Morning batch for the EU workspace.'
    },
    {
      id: 'atlas-webhooks',
      question: 'Are Atlas webhooks clearing?',
      owner: 'Reliability',
      source: 'Read-only Kibana link',
      sourceUrl: 'https://example.com/approved/atlas-webhooks',
      value: 7,
      unit: 'queued',
      threshold: 10,
      comparison: 'lte',
      observedAt: ago(26),
      freshMinutes: 45,
      note: 'Queue depth after retry processing.'
    },
    {
      id: 'harbor-export',
      question: 'Did Harbor export finish?',
      owner: 'Customer Operations',
      source: 'Approved CSV export',
      sourceUrl: 'https://example.com/approved/harbor-export',
      value: 0,
      unit: 'files pending',
      threshold: 0,
      comparison: 'eq',
      observedAt: ago(83),
      freshMinutes: 60,
      note: 'Daily customer export. Reading is now stale.'
    }
  ];
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]!);
}

function uid(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function currentPath(): string {
  if (new URLSearchParams(location.search).get('demo') === '1') return '/demo';
  const path = location.pathname.replace(/\/+$/, '') || '/';
  return ['/demo', '/book', '/privacy', '/terms', '/snapshot'].includes(path) ? path : path === '/' ? '/' : '/404';
}

function isDemo(): boolean {
  return currentPath() === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
}

function loadQuestions(demo = isDemo()): Question[] {
  const key = demo ? DEMO_KEY : REAL_KEY;
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved) as Question[];
  } catch {
    showNotice('Saved questions could not be read. Reset this book and try again.', 'error');
  }
  const initial = demo ? sampleQuestions() : [];
  if (demo) localStorage.setItem(key, JSON.stringify(initial));
  return initial;
}

function saveQuestions(questions: Question[], demo = isDemo()): void {
  localStorage.setItem(demo ? DEMO_KEY : REAL_KEY, JSON.stringify(questions));
}

function thresholdPasses(question: Question): boolean {
  if (question.comparison === 'gte') return question.value >= question.threshold;
  if (question.comparison === 'lte') return question.value <= question.threshold;
  return question.value === question.threshold;
}

function ageMinutes(question: Question): number {
  return Math.max(0, Math.floor((Date.now() - new Date(question.observedAt).getTime()) / 60_000));
}

function stateFor(question: Question): { key: 'good' | 'warn' | 'danger'; label: string } {
  if (ageMinutes(question) > question.freshMinutes) return { key: 'warn', label: 'Stale' };
  return thresholdPasses(question)
    ? { key: 'good', label: 'On track' }
    : { key: 'danger', label: 'Needs attention' };
}

function formatAge(question: Question): string {
  const minutes = ageMinutes(question);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hr${hours === 1 ? '' : 's'} ago`;
}

function comparisonLabel(question: Question): string {
  const operator = question.comparison === 'gte' ? 'at least' : question.comparison === 'lte' ? 'at most' : 'exactly';
  return `${operator} ${question.threshold.toLocaleString()} ${question.unit}`;
}

function header(): string {
  return `
    <a class="skip-link" href="#main">Skip to main content</a>
    <header class="site-header">
      <a class="wordmark" href="/" data-link aria-label="Telemetry Question Book home"><span class="wordmark-dial" aria-hidden="true"></span><span>Telemetry<br>Question Book</span></a>
      <nav aria-label="Main navigation">
        <a href="/demo" data-link>Demo</a>
        <a href="/book" data-link>My book</a>
        <a href="/privacy" data-link>Privacy</a>
      </nav>
    </header>`;
}

function footer(): string {
  return `
    <footer class="site-footer">
      <p>Plain answers from approved telemetry readings.</p>
      <nav aria-label="Footer navigation"><a href="/privacy" data-link>Privacy</a><a href="/terms" data-link>Terms</a><a href="https://sociobot.in" rel="external">Built by Param Factory <span class="sr-only">(external site)</span></a></nav>
      <p>Version 1.0.0 · Generated illustration disclosed in the design notes.</p>
    </footer>`;
}

function demoBanner(): string {
  if (!isDemo()) return '';
  return `<aside class="demo-banner" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved</strong><span>Changes stay in a separate demo space.</span><div><button class="text-button" data-action="reset-demo">Reset demo</button><button class="text-button" data-action="start-real">Start for real</button></div></aside>`;
}

function shell(content: string): string {
  return `${header()}${demoBanner()}<div id="offline-note" class="offline-note" role="status" hidden>You are offline. Saved questions are still available.</div>${content}${footer()}<div id="route-status" class="sr-only" aria-live="polite"></div><div id="notice" class="notice" role="status" aria-live="polite" hidden></div>`;
}

function landingPage(): string {
  const previews = sampleQuestions().slice(0, 2);
  return shell(`
    <main id="main">
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Approved readings · plain answers</p>
          <h1 tabindex="-1">Answer recurring telemetry questions safely</h1>
          <p class="hero-lede">For support teams who need current answers without broad dashboard access.</p>
          <div class="hero-action"><a class="button primary" href="/demo" data-link>Try it with sample data</a><span>Opens a filled question book in one click.</span></div>
          <ul class="plain-facts" aria-label="Product facts">
            <li><span aria-hidden="true">●</span> Data stays in this browser.</li>
            <li><span aria-hidden="true">●</span> Works after the first visit, even offline.</li>
            <li><span aria-hidden="true">●</span> Free book. Support Pack: $49 once.</li>
          </ul>
        </div>
        <figure class="hero-art">
          <picture><source media="(max-width: 700px)" srcset="/assets/question-console-960.webp"><img src="/assets/question-console-1536.webp" width="1536" height="1024" alt="An instrument console turns telemetry paper into a blank answer ticket." fetchpriority="high" decoding="async"></picture>
          <figcaption>One governed reading in. One support-ready answer out.</figcaption>
        </figure>
      </section>

      <section class="live-preview" aria-labelledby="preview-title">
        <div class="section-lead"><p class="eyebrow">Live preview</p><h2 id="preview-title">Read the answer before the dashboard</h2><p>Each question carries its owner, freshness limit, threshold, and approved source.</p></div>
        <div class="panel-preview">${previews.map((q) => questionCard(q, true)).join('')}</div>
      </section>

      <section class="how" aria-labelledby="how-title">
        <div class="section-lead"><p class="eyebrow">A small operating loop</p><h2 id="how-title">How the question book works</h2></div>
        <ol class="steps">
          <li><span>01</span><h3>Name the question</h3><p>Write the customer question and assign its owner.</p></li>
          <li><span>02</span><h3>Add an approved reading</h3><p>Paste a read-only link or import an approved CSV export.</p></li>
          <li><span>03</span><h3>Share the answer</h3><p>Create an expiring snapshot with optional owner and source redaction.</p></li>
        </ol>
      </section>

      <section class="limits" aria-labelledby="limits-title">
        <div><p class="eyebrow">Firm boundaries</p><h2 id="limits-title">It translates readings. It does not replace telemetry.</h2></div>
        <ul><li>It does not ingest logs or metrics.</li><li>It does not write query language.</li><li>It does not alert or monitor systems.</li><li>It never asks for dashboard credentials.</li></ul>
      </section>

      ${paidSection()}
    </main>`);
}

function paidSection(): string {
  const unlocked = hasPaidAccess();
  return `<section class="paid" aria-labelledby="paid-title">
    <div><p class="eyebrow">Optional team kit</p><h2 id="paid-title">Support Pack · $49 once</h2><p>Get maintained Grafana, Kibana, and CSV connector recipes plus starter question templates.</p><p>The free question book, CSV import, snapshots, and safety controls remain available.</p></div>
    <div class="paid-actions">
      ${unlocked ? '<button class="button primary" data-action="download-pack">Download Support Pack</button><p class="license-state">License active on this browser.</p>' : `<a class="button primary" href="https://api.sociobot.in/api/v1/products/${SLUG}/checkout">Buy Support Pack</a><form id="license-form" class="license-form"><label for="license">Have a license?</label><div><input id="license" name="license" autocomplete="off" required><button class="button secondary" type="submit">Verify license</button></div></form>`}
      <p class="fine-print">One-time purchase. Sociobot is the merchant of record.</p>
    </div>
  </section>`;
}

function questionCard(question: Question, preview = false): string {
  const state = stateFor(question);
  return `<article class="question-card" data-question-id="${escapeHtml(question.id)}">
    <div class="status-lamp ${state.key}" aria-hidden="true"></div>
    <div class="question-main"><p class="card-kicker">${escapeHtml(question.source)}</p><h3>${escapeHtml(question.question)}</h3><p class="reading"><strong>${question.value.toLocaleString()}</strong> ${escapeHtml(question.unit)}</p></div>
    <div class="question-state"><span class="state ${state.key}">${state.label}</span><span>${formatAge(question)}</span><span>Fresh for ${question.freshMinutes} min</span></div>
    <div class="question-meta"><span>Owner <strong>${escapeHtml(question.owner)}</strong></span><span>Passes at <strong>${escapeHtml(comparisonLabel(question))}</strong></span></div>
    ${preview ? '' : `<div class="card-actions"><a href="${escapeHtml(question.sourceUrl)}" target="_blank" rel="noopener noreferrer">Open approved source <span class="sr-only">(opens in a new tab)</span></a><button class="text-button" data-action="snapshot" data-id="${escapeHtml(question.id)}">Make answer snapshot</button><button class="text-button danger-link" data-action="delete-question" data-id="${escapeHtml(question.id)}">Delete</button></div>`}
  </article>`;
}

function bookPage(): string {
  const demo = isDemo();
  const questions = loadQuestions(demo);
  return shell(`
    <main id="main" class="book-page">
      <section class="book-heading"><div><p class="eyebrow">${demo ? 'Sample workspace' : 'Local workspace'}</p><h1 tabindex="-1">Check the approved questions</h1><p>${demo ? 'These three examples use a separate demo storage space.' : 'Add a question or import an approved CSV export.'}</p></div><button class="button primary" data-action="show-add">Add a question</button></section>
      <section class="book-controls" aria-label="Question book controls">
        <button class="button secondary" data-action="show-import">Import CSV</button>
        <button class="button secondary" data-action="download-template">Download CSV template</button>
        <span>${questions.length} question${questions.length === 1 ? '' : 's'}</span>
      </section>
      <section id="editor" class="editor" hidden></section>
      <section aria-labelledby="current-title"><div class="list-heading"><h2 id="current-title">Current answers</h2><p>Readings use the time and threshold saved on each card.</p></div>
        <div class="question-list">${questions.length ? questions.map((q) => questionCard(q)).join('') : emptyState()}</div>
      </section>
      ${paidSection()}
      <dialog id="snapshot-dialog" aria-labelledby="snapshot-title"><form method="dialog" id="snapshot-form"><div class="dialog-head"><div><p class="eyebrow">Share a reading</p><h2 id="snapshot-title">Make answer snapshot</h2></div><button class="icon-button" value="cancel" aria-label="Close snapshot dialog">×</button></div><input type="hidden" name="id"><label for="expiry">Expire after</label><select id="expiry" name="expiry"><option value="24">24 hours</option><option value="72">3 days</option><option value="168">7 days</option></select><label class="check"><input type="checkbox" name="redact" checked> Hide owner, source, and note</label><p>Anyone with the link can read its unhidden contents until expiry.</p><div class="dialog-actions"><button class="button secondary" value="cancel">Cancel</button><button class="button primary" value="default" data-action="create-snapshot">Create snapshot</button></div></form></dialog>
    </main>`);
}

function emptyState(): string {
  return `<div class="empty-state"><div class="empty-socket" aria-hidden="true"></div><h3>No questions yet</h3><p>Your approved question cards will appear here.</p><button class="button primary" data-action="show-add">Add the first question</button></div>`;
}

function addForm(): string {
  const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
  return `<div class="editor-inner"><div><p class="eyebrow">New card</p><h2>Add an approved question</h2><p>Enter a saved reading. Do not paste dashboard credentials.</p></div><form id="question-form" class="grid-form">
    <label>Question<span>Use the words support asks.</span><input name="question" required maxlength="100" placeholder="Did the daily feed arrive?"></label>
    <label>Owner<input name="owner" required maxlength="60" placeholder="Data Platform"></label>
    <label>Approved source name<input name="source" required maxlength="60" placeholder="Read-only Grafana view"></label>
    <label>Approved source URL<input name="sourceUrl" required type="url" pattern="https://.*" placeholder="https://…"></label>
    <label>Current value<input name="value" required type="number" step="any" value="0"></label>
    <label>Unit<input name="unit" required maxlength="30" placeholder="events"></label>
    <label>Passes when<select name="comparison"><option value="gte">Value is at least</option><option value="lte">Value is at most</option><option value="eq">Value equals</option></select></label>
    <label>Threshold<input name="threshold" required type="number" step="any" value="0"></label>
    <label>Observed at<input name="observedAt" required type="datetime-local" value="${now}"></label>
    <label>Fresh for minutes<input name="freshMinutes" required type="number" min="1" max="10080" value="60"></label>
    <label class="full">Internal note<textarea name="note" maxlength="240" rows="3"></textarea></label>
    <div class="form-error full" role="alert" hidden></div><div class="form-actions full"><button type="button" class="button secondary" data-action="close-editor">Cancel</button><button class="button primary" type="submit">Save question</button></div>
  </form></div>`;
}

function importForm(): string {
  return `<div class="editor-inner"><div><p class="eyebrow">Approved export</p><h2>Import question CSV</h2><p>Use the template headers. Imported rows are added to this book.</p></div><form id="import-form"><label for="csv-file">CSV file</label><input id="csv-file" name="file" type="file" accept=".csv,text/csv" required><p class="field-help">Required: question, owner, source, sourceUrl, value, unit, threshold, comparison, observedAt, freshMinutes.</p><div class="form-error" role="alert" hidden></div><div class="form-actions"><button type="button" class="button secondary" data-action="close-editor">Cancel</button><button class="button primary" type="submit">Import questions</button></div></form></div>`;
}

function snapshotPage(): string {
  let snapshot: Snapshot | null = null;
  try {
    const encoded = location.hash.slice(1);
    if (encoded) snapshot = JSON.parse(decodeURIComponent(escape(atob(encoded)))) as Snapshot;
  } catch { snapshot = null; }
  const expired = snapshot ? new Date(snapshot.expiresAt).getTime() <= Date.now() : false;
  if (!snapshot) return shell(`<main id="main" class="snapshot-page"><section class="snapshot-ticket"><p class="eyebrow">Answer snapshot</p><h1 tabindex="-1">This snapshot cannot be read</h1><p>The link is incomplete. Ask its sender for a new snapshot.</p><a class="button primary" href="/" data-link>Open the question book</a></section></main>`);
  if (expired) return shell(`<main id="main" class="snapshot-page"><section class="snapshot-ticket expired"><p class="eyebrow">Expired answer snapshot</p><h1 tabindex="-1">This answer snapshot expired</h1><p>Ask the owner for a current reading.</p><a class="button primary" href="/" data-link>Open the question book</a></section></main>`);
  return shell(`<main id="main" class="snapshot-page"><article class="snapshot-ticket"><p class="eyebrow">Answer snapshot</p><h1 tabindex="-1">${escapeHtml(snapshot.question)}</h1><div class="snapshot-answer"><span>${escapeHtml(snapshot.status)}</span><strong>${escapeHtml(snapshot.answer)}</strong></div><dl><div><dt>Observed</dt><dd>${new Date(snapshot.observedAt).toLocaleString()}</dd></div><div><dt>Expires</dt><dd>${new Date(snapshot.expiresAt).toLocaleString()}</dd></div>${snapshot.owner ? `<div><dt>Owner</dt><dd>${escapeHtml(snapshot.owner)}</dd></div>` : ''}${snapshot.source ? `<div><dt>Source</dt><dd>${escapeHtml(snapshot.source)}</dd></div>` : ''}</dl>${snapshot.note ? `<p>${escapeHtml(snapshot.note)}</p>` : ''}${snapshot.redacted ? '<p class="redacted">Owner, source, and internal note were hidden by the sender.</p>' : ''}<div class="snapshot-actions"><button class="button primary" data-action="copy-snapshot">Copy snapshot link</button><button class="button secondary" data-action="download-snapshot">Download JSON</button></div></article></main>`);
}

function privacyPage(): string {
  return shell(`<main id="main" class="legal"><p class="eyebrow">Policy · 28 August 2026</p><h1 tabindex="-1">Your question book stays local</h1><p>Question cards are stored in this browser. The app has no account service or analytics.</p><h2>Demo data</h2><p>Demo changes use a separate browser storage key. Resetting or leaving the demo deletes that key.</p><h2>Shared snapshots</h2><p>A snapshot stores its visible contents inside the link. Anyone with that link can read it until its stated expiry.</p><h2>Licenses</h2><p>When you verify a Support Pack license, the token is sent to Sociobot. The token and daily verdict are then stored in this browser.</p><h2>Your controls</h2><p>Clear this site’s browser storage to remove questions and licenses. Contact <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a> with policy questions.</p></main>`);
}

function termsPage(): string {
  return shell(`<main id="main" class="legal"><p class="eyebrow">Terms · 28 August 2026</p><h1 tabindex="-1">Use approved, read-only telemetry sources</h1><p>You are responsible for the questions, source links, readings, and snapshots you create.</p><h2>Safe use</h2><p>Do not enter passwords, access tokens, or customer secrets. Check each source link before sharing a book or snapshot.</p><h2>Service</h2><p>The free app is provided as-is under the MIT License. It does not monitor systems or guarantee that a reading is correct.</p><h2>Support Pack purchases</h2><p>The Support Pack costs $49 as a one-time purchase. Sociobot is the merchant of record. Refunds are handled by Sociobot and revoke the license.</p><h2>Contact</h2><p>Email <a href="mailto:support@sociobot.in">support@sociobot.in</a> for purchase help.</p></main>`);
}

function notFoundPage(): string {
  return shell(`<main id="main" class="missing"><div class="empty-socket" aria-hidden="true"></div><p class="eyebrow">Disconnected · 404</p><h1 tabindex="-1">This reading is not in the book</h1><p>The address does not match a saved page.</p><a class="button primary" href="/" data-link>Return to the question book</a></main>`);
}

const titles: Record<string, string> = {
  '/': 'Telemetry Question Book — answer telemetry safely',
  '/demo': 'Demo — Telemetry Question Book',
  '/book': 'My book — Telemetry Question Book',
  '/privacy': 'Privacy — Telemetry Question Book',
  '/terms': 'Terms — Telemetry Question Book',
  '/snapshot': 'Answer snapshot — Telemetry Question Book',
  '/404': 'Not found — Telemetry Question Book'
};

function render(): void {
  const path = currentPath();
  document.title = titles[path];
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', `https://telemetry-question-book.sociobot.in${path === '/404' ? '/404' : path}`);
  app.innerHTML = path === '/' ? landingPage() : path === '/demo' || path === '/book' ? bookPage() : path === '/privacy' ? privacyPage() : path === '/terms' ? termsPage() : path === '/snapshot' ? snapshotPage() : notFoundPage();
  updateOnlineState();
  if (!firstRender) {
    const heading = document.querySelector<HTMLElement>('h1');
    heading?.focus();
    const live = document.querySelector('#route-status');
    if (live && heading) live.textContent = heading.textContent;
    scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  firstRender = false;
}

function navigate(path: string): void {
  history.pushState({}, '', path);
  render();
}

function showNotice(message: string, kind: 'ok' | 'error' = 'ok'): void {
  const notice = document.querySelector<HTMLElement>('#notice');
  if (!notice) return;
  notice.textContent = message;
  notice.className = `notice ${kind}`;
  notice.hidden = false;
  setTimeout(() => { notice.hidden = true; }, 4000);
}

function showEditor(markup: string): void {
  const editor = document.querySelector<HTMLElement>('#editor');
  if (!editor) return;
  editor.innerHTML = markup;
  editor.hidden = false;
  editor.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  editor.querySelector<HTMLElement>('input, button')?.focus();
}

function formQuestion(form: HTMLFormElement): Question {
  const data = new FormData(form);
  return {
    id: uid(),
    question: String(data.get('question') || '').trim(),
    owner: String(data.get('owner') || '').trim(),
    source: String(data.get('source') || '').trim(),
    sourceUrl: String(data.get('sourceUrl') || '').trim(),
    value: Number(data.get('value')),
    unit: String(data.get('unit') || '').trim(),
    threshold: Number(data.get('threshold')),
    comparison: String(data.get('comparison')) as Comparison,
    observedAt: new Date(String(data.get('observedAt'))).toISOString(),
    freshMinutes: Number(data.get('freshMinutes')),
    note: String(data.get('note') || '').trim()
  };
}

function parseCsv(text: string): Question[] {
  const rows: string[][] = [];
  let row: string[] = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"' && quoted && text[i + 1] === '"') { cell += '"'; i++; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(cell.trim()); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = []; cell = '';
    } else cell += char;
  }
  row.push(cell.trim()); if (row.some(Boolean)) rows.push(row);
  if (quoted) throw new Error('The CSV has an unclosed quote. Fix that row and import again.');
  if (rows.length < 2) throw new Error('The CSV has no question rows. Add a row and import again.');
  const headers = rows[0];
  const required = ['question', 'owner', 'source', 'sourceUrl', 'value', 'unit', 'threshold', 'comparison', 'observedAt', 'freshMinutes'];
  const missing = required.filter((key) => !headers.includes(key));
  if (missing.length) throw new Error(`The CSV is missing ${missing.join(', ')}. Use the template and import again.`);
  return rows.slice(1).map((values, index) => {
    const record = Object.fromEntries(headers.map((key, i) => [key, values[i] ?? '']));
    if (!['gte', 'lte', 'eq'].includes(record.comparison)) throw new Error(`Row ${index + 2} has an invalid comparison. Use gte, lte, or eq.`);
    if (!record.sourceUrl.startsWith('https://')) throw new Error(`Row ${index + 2} needs an HTTPS source URL.`);
    const date = new Date(record.observedAt);
    if (Number.isNaN(date.getTime())) throw new Error(`Row ${index + 2} has an invalid observedAt date.`);
    const value = Number(record.value), threshold = Number(record.threshold), freshMinutes = Number(record.freshMinutes);
    if (![value, threshold, freshMinutes].every(Number.isFinite) || freshMinutes < 1) throw new Error(`Row ${index + 2} has an invalid number.`);
    return { id: uid(), question: record.question, owner: record.owner, source: record.source, sourceUrl: record.sourceUrl, value, unit: record.unit, threshold, comparison: record.comparison as Comparison, observedAt: date.toISOString(), freshMinutes, note: record.note || '' };
  });
}

function download(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvTemplate(): string {
  return 'question,owner,source,sourceUrl,value,unit,threshold,comparison,observedAt,freshMinutes,note\n"Did the daily feed arrive?",Data Platform,Approved Grafana view,https://example.com/approved/feed,1820,events,1500,gte,2026-08-28T09:30:00Z,60,"Morning batch"\n';
}

function makeSnapshot(question: Question, hours: number, redacted: boolean): string {
  const state = stateFor(question);
  const snapshot: Snapshot = {
    version: 1,
    question: question.question,
    answer: `${question.value.toLocaleString()} ${question.unit}`,
    status: state.label,
    observedAt: question.observedAt,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + hours * 3_600_000).toISOString(),
    ...(redacted ? {} : { owner: question.owner, source: question.source, note: question.note }),
    redacted
  };
  return btoa(unescape(encodeURIComponent(JSON.stringify(snapshot))));
}

function snapshotFromPage(): Snapshot | null {
  try { return JSON.parse(decodeURIComponent(escape(atob(location.hash.slice(1))))) as Snapshot; } catch { return null; }
}

function hasPaidAccess(): boolean {
  try {
    const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) || 'null') as { valid?: boolean } | null;
    return Boolean(localStorage.getItem(LICENSE_KEY) && cached?.valid);
  } catch { return false; }
}

async function verifyLicense(token: string, announce = true): Promise<void> {
  try {
    const response = await fetch(`https://api.sociobot.in/api/v1/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    const verdict = await response.json() as { valid: boolean; reason: string; expires_at?: string };
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ ...verdict, checkedAt: Date.now() }));
    if (!verdict.valid) localStorage.removeItem(LICENSE_KEY);
    render();
    if (announce) showNotice(verdict.valid ? 'License verified. The Support Pack is ready.' : 'This license is not active. Check the token or buy a new license.', verdict.valid ? 'ok' : 'error');
  } catch {
    if (announce) showNotice('The license could not be checked. Check your connection and try again.', 'error');
  }
}

function captureLicense(): void {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return;
  localStorage.setItem(LICENSE_KEY, token);
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  void verifyLicense(token);
}

function refreshLicenseIfNeeded(): void {
  const token = localStorage.getItem(LICENSE_KEY);
  if (!token) return;
  try {
    const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) || 'null') as { checkedAt?: number } | null;
    if (cached?.checkedAt && Date.now() - cached.checkedAt < 86_400_000) return;
  } catch { /* check below */ }
  void verifyLicense(token, false);
}

function downloadPack(): void {
  const content = `# Telemetry Question Book — Support Pack\n\nLicensed connector recipes\n\n## Grafana\n1. Create a viewer-only service account.\n2. Save a dashboard link with the time range locked.\n3. Record the panel owner and freshness limit in the question book.\n\n## Kibana\n1. Create a role with read and view_index_metadata only.\n2. Save a Discover view with a fixed data view and filters.\n3. Use the share link as the approved source.\n\n## CSV\nExport these exact columns: question, owner, source, sourceUrl, value, unit, threshold, comparison, observedAt, freshMinutes, note.\n\nStarter questions: Did the feed arrive? Are retries clearing? Did the export finish? Is customer-visible latency within its agreed limit?\n`;
  download('telemetry-question-book-support-pack.md', content, 'text/markdown');
}

function updateOnlineState(): void {
  const note = document.querySelector<HTMLElement>('#offline-note');
  if (note) note.hidden = navigator.onLine;
}

document.addEventListener('click', (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-link], [data-action]');
  if (!target) return;
  if (target.matches('[data-link]')) {
    event.preventDefault();
    navigate((target as HTMLAnchorElement).getAttribute('href') || '/');
    return;
  }
  const action = target.dataset.action;
  if (action === 'reset-demo') { localStorage.removeItem(DEMO_KEY); render(); showNotice('Demo reset to its original sample data.'); }
  if (action === 'start-real') { localStorage.removeItem(DEMO_KEY); navigate('/book'); }
  if (action === 'show-add') showEditor(addForm());
  if (action === 'show-import') showEditor(importForm());
  if (action === 'close-editor') { const editor = document.querySelector<HTMLElement>('#editor'); if (editor) { editor.hidden = true; editor.innerHTML = ''; } }
  if (action === 'download-template') { download('question-book-template.csv', csvTemplate(), 'text/csv'); showNotice('CSV template downloaded.'); }
  if (action === 'delete-question') {
    const question = loadQuestions().find((item) => item.id === target.dataset.id);
    if (question && confirm(`Delete “${question.question}”? This cannot be undone.`)) { saveQuestions(loadQuestions().filter((item) => item.id !== question.id)); render(); showNotice('Question deleted.'); }
  }
  if (action === 'snapshot') {
    const dialog = document.querySelector<HTMLDialogElement>('#snapshot-dialog');
    const id = dialog?.querySelector<HTMLInputElement>('input[name="id"]');
    if (dialog && id) { id.value = target.dataset.id || ''; dialog.showModal(); }
  }
  if (action === 'create-snapshot') {
    event.preventDefault();
    const form = target.closest<HTMLFormElement>('form')!;
    const data = new FormData(form);
    const question = loadQuestions().find((item) => item.id === data.get('id'));
    if (question) navigate(`/snapshot#${makeSnapshot(question, Number(data.get('expiry')), data.get('redact') === 'on')}`);
  }
  if (action === 'copy-snapshot') {
    navigator.clipboard.writeText(location.href).then(() => showNotice('Snapshot link copied.')).catch(() => showNotice('The link could not be copied. Copy it from the address bar.', 'error'));
  }
  if (action === 'download-snapshot') {
    const snapshot = snapshotFromPage();
    if (snapshot) download('telemetry-answer-snapshot.json', JSON.stringify(snapshot, null, 2), 'application/json');
  }
  if (action === 'download-pack') downloadPack();
});

document.addEventListener('submit', async (event) => {
  const form = event.target as HTMLFormElement;
  if (form.id === 'question-form') {
    event.preventDefault();
    const error = form.querySelector<HTMLElement>('.form-error')!;
    try {
      const question = formQuestion(form);
      saveQuestions([...loadQuestions(), question]); render(); showNotice('Question saved.');
    } catch { error.textContent = 'The question could not be saved. Check each field and try again.'; error.hidden = false; }
  }
  if (form.id === 'import-form') {
    event.preventDefault();
    const error = form.querySelector<HTMLElement>('.form-error')!;
    try {
      const file = (form.elements.namedItem('file') as HTMLInputElement).files?.[0];
      if (!file) throw new Error('Choose a CSV file, then import again.');
      const imported = parseCsv(await file.text());
      saveQuestions([...loadQuestions(), ...imported]); render(); showNotice(`${imported.length} question${imported.length === 1 ? '' : 's'} imported.`);
    } catch (reason) { error.textContent = reason instanceof Error ? reason.message : 'The CSV could not be read. Check the file and try again.'; error.hidden = false; }
  }
  if (form.id === 'license-form') {
    event.preventDefault();
    const token = String(new FormData(form).get('license') || '').trim();
    if (!token) return;
    localStorage.setItem(LICENSE_KEY, token);
    await verifyLicense(token);
  }
});

window.addEventListener('popstate', render);
window.addEventListener('online', updateOnlineState);
window.addEventListener('offline', updateOnlineState);

captureLicense();
render();
refreshLicenseIfNeeded();
if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
