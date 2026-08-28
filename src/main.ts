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
  version: 2;
  question: string;
  answer: string;
  status: string;
  observedAt: string;
  createdAt: string;
  owner?: string;
  source?: string;
  note?: string;
  redacted: boolean;
  demo: boolean;
};

const REAL_KEY = 'tqb:v1';
const DEMO_KEY = 'demo:tqb:v1';
const SNAPSHOT_KEY = 'tqb:snapshot-preview';
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
      sourceUrl: 'https://telemetry-question-book.sociobot.in/sample-sources/northstar-orders',
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
      sourceUrl: 'https://telemetry-question-book.sociobot.in/sample-sources/atlas-webhooks',
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
      sourceUrl: 'https://telemetry-question-book.sociobot.in/sample-sources/harbor-export',
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
  return ['/demo', '/book', '/privacy', '/terms', '/snapshot'].includes(path) || path.startsWith('/sample-sources/') ? path : path === '/' ? '/' : '/404';
}

function isDemo(): boolean {
  return currentPath() === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
}

function loadQuestions(demo = isDemo()): Question[] {
  const key = demo ? DEMO_KEY : REAL_KEY;
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const questions = JSON.parse(saved) as Question[];
      if (demo) {
        const sampleUrls = new Map(sampleQuestions().map((item) => [item.id, item.sourceUrl]));
        let changed = false;
        questions.forEach((item) => {
          const sourceUrl = sampleUrls.get(item.id);
          if (sourceUrl && item.sourceUrl !== sourceUrl) { item.sourceUrl = sourceUrl; changed = true; }
        });
        if (changed) localStorage.setItem(key, JSON.stringify(questions));
      }
      return questions;
    }
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
      <p>Version 1.1.0 · Generated illustration disclosed in the design notes.</p>
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
            <li><span aria-hidden="true">●</span> Free to use. No account needed.</li>
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
          <li><span>03</span><h3>Export the answer</h3><p>Download a point-in-time answer copy with optional redaction.</p></li>
        </ol>
      </section>

      <section class="limits" aria-labelledby="limits-title">
        <div><p class="eyebrow">Firm boundaries</p><h2 id="limits-title">It translates readings. It does not replace telemetry.</h2></div>
        <ul><li>It does not ingest logs or metrics.</li><li>It does not write query language.</li><li>It does not alert or monitor systems.</li><li>It never asks for dashboard credentials.</li></ul>
      </section>

    </main>`);
}

function questionCard(question: Question, preview = false): string {
  const state = stateFor(question);
  return `<article class="question-card" data-question-id="${escapeHtml(question.id)}">
    <div class="status-lamp ${state.key}" aria-hidden="true"></div>
    <div class="question-main"><p class="card-kicker">${escapeHtml(question.source)}</p><h3>${escapeHtml(question.question)}</h3><p class="reading"><strong>${question.value.toLocaleString()}</strong> ${escapeHtml(question.unit)}</p></div>
    <div class="question-state"><span class="state ${state.key}">${state.label}</span><span>${formatAge(question)}</span><span>Fresh for ${question.freshMinutes} min</span></div>
    <div class="question-meta"><span>Owner <strong>${escapeHtml(question.owner)}</strong></span><span>Passes when <strong>${escapeHtml(comparisonLabel(question))}</strong></span></div>
    ${preview ? '' : `<div class="card-actions"><a href="${escapeHtml(question.sourceUrl)}" target="_blank" rel="noopener noreferrer">Open approved source <span class="sr-only">(opens in a new tab)</span></a><button class="text-button" data-action="edit-question" data-id="${escapeHtml(question.id)}">Update reading</button><button class="text-button" data-action="snapshot" data-id="${escapeHtml(question.id)}">Make answer copy</button><button class="text-button danger-link" data-action="delete-question" data-id="${escapeHtml(question.id)}">Delete</button></div>`}
  </article>`;
}

function bookPage(): string {
  const demo = isDemo();
  const questions = loadQuestions(demo);
  return shell(`
    <main id="main" class="book-page">
      <section class="book-heading"><div><p class="eyebrow">${demo ? 'Sample workspace' : 'Local workspace'}</p><h1 tabindex="-1">Check the approved questions</h1><p>${demo ? `${questions.length} sample question${questions.length === 1 ? '' : 's'} use a separate demo storage space.` : 'Add a question or import an approved CSV export.'}</p></div><button class="button primary" data-action="show-add">Add a question</button></section>
      <section class="book-controls" aria-label="Question book controls">
        <button class="button secondary" data-action="show-import">Import CSV</button>
        <button class="button secondary" data-action="download-template">Download CSV template</button>
        <span>${questions.length} question${questions.length === 1 ? '' : 's'}</span>
      </section>
      <section id="editor" class="editor" hidden></section>
      <section aria-labelledby="current-title"><div class="list-heading"><h2 id="current-title">Current answers</h2><p>Readings use the time and threshold saved on each card.</p></div>
        <div class="question-list">${questions.length ? questions.map((q) => questionCard(q)).join('') : emptyState()}</div>
      </section>
      <dialog id="snapshot-dialog" aria-labelledby="snapshot-title"><form method="dialog" id="snapshot-form"><div class="dialog-head"><div><p class="eyebrow">Export a reading</p><h2 id="snapshot-title">Make answer copy</h2></div><button class="icon-button" value="cancel" aria-label="Close answer copy dialog">×</button></div><input type="hidden" name="id"><label class="check"><input type="checkbox" name="redact" checked> Hide owner, source, and note</label><p>The preview stays in this browser session. Downloaded copies do not expire, so do not include secrets.</p><div class="dialog-actions"><button class="button secondary" value="cancel">Cancel</button><button class="button primary" value="default" data-action="create-snapshot">Review answer copy</button></div></form></dialog>
    </main>`);
}

function emptyState(): string {
  return `<div class="empty-state"><div class="empty-socket" aria-hidden="true"></div><h3>No questions yet</h3><p>Your approved question cards will appear here.</p><button class="button primary" data-action="show-add">Add the first question</button></div>`;
}

function localDateTime(value: string): string {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function questionForm(existing?: Question): string {
  const value = existing ?? { id: '', question: '', owner: '', source: '', sourceUrl: '', value: 0, unit: '', threshold: 0, comparison: 'gte' as Comparison, observedAt: new Date().toISOString(), freshMinutes: 60, note: '' };
  const editing = Boolean(existing);
  const option = (key: Comparison, label: string) => `<option value="${key}"${value.comparison === key ? ' selected' : ''}>${label}</option>`;
  return `<div class="editor-inner"><div><p class="eyebrow">${editing ? 'Current card' : 'New card'}</p><h2>${editing ? 'Update this reading' : 'Add an approved question'}</h2><p>Enter a saved reading. Do not paste dashboard credentials.</p></div><form id="question-form" class="grid-form"><input type="hidden" name="questionId" value="${escapeHtml(value.id)}">
    <label>Question<span>Use the words support asks.</span><input name="question" required maxlength="100" placeholder="Did the daily feed arrive?" value="${escapeHtml(value.question)}"></label>
    <label>Owner<input name="owner" required maxlength="60" placeholder="Data Platform" value="${escapeHtml(value.owner)}"></label>
    <label>Approved source name<input name="source" required maxlength="60" placeholder="Read-only Grafana view" value="${escapeHtml(value.source)}"></label>
    <label>Approved source URL<input name="sourceUrl" required type="url" pattern="https://.*" placeholder="https://…" value="${escapeHtml(value.sourceUrl)}"></label>
    <label>Current value<input name="value" required type="number" step="any" value="${value.value}"></label>
    <label>Unit<input name="unit" required maxlength="30" placeholder="events" value="${escapeHtml(value.unit)}"></label>
    <label>Passes when<select name="comparison">${option('gte', 'Value is at least')}${option('lte', 'Value is at most')}${option('eq', 'Value equals')}</select></label>
    <label>Threshold<input name="threshold" required type="number" step="any" value="${value.threshold}"></label>
    <label>Observed at<input name="observedAt" required type="datetime-local" value="${localDateTime(value.observedAt)}"></label>
    <label>Fresh for minutes<input name="freshMinutes" required type="number" min="1" max="10080" value="${value.freshMinutes}"></label>
    <label class="full">Internal note<textarea name="note" maxlength="240" rows="3">${escapeHtml(value.note)}</textarea></label>
    <div class="form-error full" role="alert" hidden></div><div class="form-actions full"><button type="button" class="button secondary" data-action="close-editor">Cancel</button><button class="button primary" type="submit">${editing ? 'Save updated reading' : 'Save question'}</button></div>
  </form></div>`;
}

function importForm(): string {
  return `<div class="editor-inner"><div><p class="eyebrow">Approved export</p><h2>Import question CSV</h2><p>Use the template headers. A matching question updates its existing card.</p></div><form id="import-form"><label for="csv-file">CSV file</label><input id="csv-file" name="file" type="file" accept=".csv,text/csv" required><p class="field-help">Required: question, owner, source, sourceUrl, value, unit, threshold, comparison, observedAt, freshMinutes.</p><div class="form-error" role="alert" hidden></div><div class="form-actions"><button type="button" class="button secondary" data-action="close-editor">Cancel</button><button class="button primary" type="submit">Import questions</button></div></form></div>`;
}

function snapshotPage(): string {
  let snapshot: Snapshot | null;
  try {
    snapshot = JSON.parse(sessionStorage.getItem(SNAPSHOT_KEY) || 'null') as Snapshot | null;
  } catch { snapshot = null; }
  if (!snapshot || snapshot.version !== 2) return shell(`<main id="main" class="snapshot-page"><section class="snapshot-ticket"><p class="eyebrow">Local answer copy</p><h1 tabindex="-1">No answer copy is open</h1><p>Open a question and choose Make answer copy. Answer data is never loaded from a URL.</p><a class="button primary" href="/book" data-link>Open my question book</a></section></main>`);
  return shell(`<main id="main" class="snapshot-page"><article class="snapshot-ticket"><p class="eyebrow">Local answer copy</p><h1 tabindex="-1">${escapeHtml(snapshot.question)}</h1><div class="snapshot-answer"><span>${escapeHtml(snapshot.status)}</span><strong>${escapeHtml(snapshot.answer)}</strong></div><dl><div><dt>Observed</dt><dd>${new Date(snapshot.observedAt).toLocaleString()}</dd></div><div><dt>Created</dt><dd>${new Date(snapshot.createdAt).toLocaleString()}</dd></div>${snapshot.owner ? `<div><dt>Owner</dt><dd>${escapeHtml(snapshot.owner)}</dd></div>` : ''}${snapshot.source ? `<div><dt>Source</dt><dd>${escapeHtml(snapshot.source)}</dd></div>` : ''}</dl>${snapshot.note ? `<p>${escapeHtml(snapshot.note)}</p>` : ''}${snapshot.redacted ? '<p class="redacted">Owner, source, and internal note were hidden.</p>' : ''}<p class="snapshot-warning"><strong>Handle this file yourself.</strong> Downloaded copies do not expire and are not access controlled.</p><div class="snapshot-actions"><button class="button primary" data-action="copy-snapshot">Copy answer text</button><button class="button secondary" data-action="download-snapshot">Download JSON</button><a class="button secondary" href="${snapshot.demo ? '/demo' : '/book'}" data-link>Back to questions</a></div></article></main>`);
}

function privacyPage(): string {
  return shell(`<main id="main" class="legal"><p class="eyebrow">Policy · 28 August 2026</p><h1 tabindex="-1">Your question book stays local</h1><p>Question cards are stored in this browser. The app has no account service or analytics.</p><h2>Demo data</h2><p>Demo changes use a separate browser storage key. Resetting or leaving the demo deletes that key.</p><h2>Answer copies</h2><p>A preview stays in session storage and never enters the URL. A downloaded copy does not expire or have access controls.</p><h2>Your controls</h2><p>Clear this site’s browser storage to remove questions. Contact <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a> with policy questions.</p></main>`);
}

function termsPage(): string {
  return shell(`<main id="main" class="legal"><p class="eyebrow">Terms · 28 August 2026</p><h1 tabindex="-1">Use approved, read-only telemetry sources</h1><p>You are responsible for the questions, source links, readings, and answer copies you create.</p><h2>Safe use</h2><p>Do not enter passwords, access tokens, or customer secrets. Check each source link before sharing an answer copy.</p><h2>Service</h2><p>The free app is provided as-is under the MIT License. It does not monitor systems or guarantee that a reading is correct.</p><h2>Contact</h2><p>Email <a href="mailto:support@sociobot.in">support@sociobot.in</a> for help.</p></main>`);
}

const sampleSources: Record<string, { title: string; source: string; reading: string; observed: string }> = {
  '/sample-sources/northstar-orders': { title: 'Northstar order feed', source: 'Approved Grafana view', reading: '1,842 orders received', observed: 'Sample reading · 12 minutes ago' },
  '/sample-sources/atlas-webhooks': { title: 'Atlas webhook queue', source: 'Read-only Kibana link', reading: '7 webhooks queued', observed: 'Sample reading · 26 minutes ago' },
  '/sample-sources/harbor-export': { title: 'Harbor daily export', source: 'Approved CSV export', reading: '0 files pending', observed: 'Sample reading · 83 minutes ago' }
};

function sampleSourcePage(path: string): string {
  const source = sampleSources[path];
  if (!source) return notFoundPage();
  return shell(`<main id="main" class="legal sample-source"><p class="eyebrow">Demo source · not live telemetry</p><h1 tabindex="-1">${escapeHtml(source.title)}</h1><p>${escapeHtml(source.source)}</p><div class="source-reading"><strong>${escapeHtml(source.reading)}</strong><span>${escapeHtml(source.observed)}</span></div><p>This local sample exists only to demonstrate the approved-source workflow.</p><a class="button primary" href="/demo" data-link>Return to the demo</a></main>`);
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
  '/snapshot': 'Answer copy — Telemetry Question Book',
  '/404': 'Not found — Telemetry Question Book'
};

function render(): void {
  const path = currentPath();
  document.title = titles[path] ?? (sampleSources[path] ? `Sample source — Telemetry Question Book` : titles['/404']);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', `https://telemetry-question-book.sociobot.in${path === '/404' ? '/404' : path}`);
  app.innerHTML = path === '/' ? landingPage() : path === '/demo' || path === '/book' ? bookPage() : path === '/privacy' ? privacyPage() : path === '/terms' ? termsPage() : path === '/snapshot' ? snapshotPage() : sampleSources[path] ? sampleSourcePage(path) : notFoundPage();
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
  const question: Question = {
    id: String(data.get('questionId') || '') || uid(),
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
  validateQuestion(question);
  return question;
}

function validateQuestion(question: Question, row?: number): void {
  const prefix = row ? `Row ${row} ` : '';
  const required: Array<[keyof Question, number]> = [['question', 100], ['owner', 60], ['source', 60], ['unit', 30]];
  for (const [key, max] of required) {
    const value = String(question[key]).trim();
    if (!value) throw new Error(`${prefix}needs ${key}.`);
    if (value.length > max) throw new Error(`${prefix}${key} must be ${max} characters or fewer.`);
  }
  if (question.note.length > 240) throw new Error(`${prefix}note must be 240 characters or fewer.`);
  let sourceUrl: URL;
  try { sourceUrl = new URL(question.sourceUrl); } catch { throw new Error(`${prefix}needs a valid HTTPS source URL.`); }
  if (sourceUrl.protocol !== 'https:' || !sourceUrl.hostname) throw new Error(`${prefix}needs a valid HTTPS source URL.`);
  if (!['gte', 'lte', 'eq'].includes(question.comparison)) throw new Error(`${prefix}has an invalid comparison. Use gte, lte, or eq.`);
  if (![question.value, question.threshold, question.freshMinutes].every(Number.isFinite)) throw new Error(`${prefix}has an invalid number.`);
  if (!Number.isInteger(question.freshMinutes) || question.freshMinutes < 1 || question.freshMinutes > 10_080) throw new Error(`${prefix}freshMinutes must be a whole number from 1 to 10080.`);
  if (Number.isNaN(new Date(question.observedAt).getTime())) throw new Error(`${prefix}has an invalid observedAt date.`);
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
    const rawDate = new Date(record.observedAt);
    const question: Question = { id: uid(), question: record.question.trim(), owner: record.owner.trim(), source: record.source.trim(), sourceUrl: record.sourceUrl.trim(), value: record.value === '' ? Number.NaN : Number(record.value), unit: record.unit.trim(), threshold: record.threshold === '' ? Number.NaN : Number(record.threshold), comparison: record.comparison as Comparison, observedAt: Number.isNaN(rawDate.getTime()) ? record.observedAt : rawDate.toISOString(), freshMinutes: record.freshMinutes === '' ? Number.NaN : Number(record.freshMinutes), note: (record.note || '').trim() };
    validateQuestion(question, index + 2);
    return question;
  });
}

function download(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvTemplate(): string {
  return 'question,owner,source,sourceUrl,value,unit,threshold,comparison,observedAt,freshMinutes,note\n"Did the daily feed arrive?",Data Platform,Approved Grafana view,https://telemetry-question-book.sociobot.in/sample-sources/northstar-orders,1820,events,1500,gte,2026-08-28T09:30:00Z,60,"Morning batch"\n';
}

function makeSnapshot(question: Question, redacted: boolean): Snapshot {
  const state = stateFor(question);
  return {
    version: 2,
    question: question.question,
    answer: `${question.value.toLocaleString()} ${question.unit}`,
    status: state.label,
    observedAt: question.observedAt,
    createdAt: new Date().toISOString(),
    ...(redacted ? {} : { owner: question.owner, source: question.source, note: question.note }),
    redacted,
    demo: isDemo()
  };
}

function snapshotFromPage(): Snapshot | null {
  try { return JSON.parse(sessionStorage.getItem(SNAPSHOT_KEY) || 'null') as Snapshot | null; } catch { return null; }
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
  if (action === 'show-add') showEditor(questionForm());
  if (action === 'edit-question') {
    const question = loadQuestions().find((item) => item.id === target.dataset.id);
    if (question) showEditor(questionForm(question));
  }
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
    if (question) {
      sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(makeSnapshot(question, data.get('redact') === 'on')));
      navigate('/snapshot');
    }
  }
  if (action === 'copy-snapshot') {
    const snapshot = snapshotFromPage();
    const text = snapshot ? `${snapshot.question}\n${snapshot.status}: ${snapshot.answer}\nObserved: ${snapshot.observedAt}` : '';
    navigator.clipboard.writeText(text).then(() => showNotice('Answer text copied.')).catch(() => showNotice('The answer could not be copied. Download the JSON file instead.', 'error'));
  }
  if (action === 'download-snapshot') {
    const snapshot = snapshotFromPage();
    if (snapshot) download('telemetry-answer-copy.json', JSON.stringify(snapshot, null, 2), 'application/json');
  }
});

document.addEventListener('submit', async (event) => {
  const form = event.target as HTMLFormElement;
  if (form.id === 'question-form') {
    event.preventDefault();
    const error = form.querySelector<HTMLElement>('.form-error')!;
    try {
      const question = formQuestion(form);
      const questions = loadQuestions();
      const existing = questions.findIndex((item) => item.id === question.id);
      if (existing >= 0) questions[existing] = question;
      else questions.push(question);
      saveQuestions(questions); render(); showNotice(existing >= 0 ? 'Reading updated.' : 'Question saved.');
    } catch (reason) { error.textContent = reason instanceof Error ? `${reason.message} Check that field and try again.` : 'The question could not be saved. Check each field and try again.'; error.hidden = false; }
  }
  if (form.id === 'import-form') {
    event.preventDefault();
    const error = form.querySelector<HTMLElement>('.form-error')!;
    try {
      const file = (form.elements.namedItem('file') as HTMLInputElement).files?.[0];
      if (!file) throw new Error('Choose a CSV file, then import again.');
      const imported = parseCsv(await file.text());
      const questions = loadQuestions();
      let updated = 0;
      imported.forEach((question) => {
        const existing = questions.findIndex((item) => item.question.trim().toLocaleLowerCase() === question.question.trim().toLocaleLowerCase());
        if (existing >= 0) { question.id = questions[existing].id; questions[existing] = question; updated++; }
        else questions.push(question);
      });
      saveQuestions(questions); render(); showNotice(`${imported.length - updated} added, ${updated} updated.`);
    } catch (reason) { error.textContent = reason instanceof Error ? reason.message : 'The CSV could not be read. Check the file and try again.'; error.hidden = false; }
  }
});

window.addEventListener('popstate', render);
window.addEventListener('hashchange', () => {
  if (location.pathname === '/snapshot' && location.hash) {
    history.replaceState({}, '', `${location.pathname}${location.search}`);
    render();
  }
});
window.addEventListener('online', updateOnlineState);
window.addEventListener('offline', updateOnlineState);

if (location.pathname === '/snapshot' && location.hash) history.replaceState({}, '', `${location.pathname}${location.search}`);
render();
if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
