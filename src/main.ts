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

type SharedSnapshot = {
  token: string;
  revokeKey: string;
  expiresAt: string;
};

const REAL_KEY = 'tqb:v1';
const DEMO_KEY = 'demo:tqb:v1';
const SNAPSHOT_KEY = 'tqb:snapshot-preview';
const DEMO_SNAPSHOT_KEY = 'demo:tqb:snapshot-preview';
const DEMO_SHARES_KEY = 'demo:tqb:shares';
const SNAPSHOT_TTL_KEY = 'tqb:snapshot-ttl';
const DEMO_SNAPSHOT_TTL_KEY = 'demo:tqb:snapshot-ttl';
const REAL_SHARES_KEY = 'tqb:shares';
const CSV_HEADERS = ['question', 'owner', 'source', 'sourceUrl', 'value', 'unit', 'threshold', 'comparison', 'observedAt', 'freshMinutes', 'note'] as const;
const app = document.querySelector<HTMLDivElement>('#app')!;
let firstRender = true;
let activeSharedSnapshot: Snapshot | null = null;

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
  return ['/demo', '/demo/snapshot', '/book', '/privacy', '/terms', '/snapshot'].includes(path) || path.startsWith('/sample-sources/') || /^\/s\/[a-z]_[a-f0-9]+$/.test(path) ? path : path === '/' ? '/' : '/404';
}

function isDemo(): boolean {
  return currentPath().startsWith('/demo') || new URLSearchParams(location.search).get('demo') === '1';
}

function snapshotKey(demo = isDemo()): string {
  return demo ? DEMO_SNAPSHOT_KEY : SNAPSHOT_KEY;
}

function snapshotTtlKey(demo = isDemo()): string {
  return demo ? DEMO_SNAPSHOT_TTL_KEY : SNAPSHOT_TTL_KEY;
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
        <a href="/book" data-link>My question book</a>
        <a href="/privacy" data-link>Privacy</a>
      </nav>
    </header>`;
}

function footer(): string {
  return `
    <footer class="site-footer">
      <p>Plain answers from approved telemetry readings.</p>
      <nav aria-label="Footer navigation"><a href="/privacy" data-link>Privacy</a><a href="/terms" data-link>Terms</a><a href="https://sociobot.in" rel="external">Built by Param Factory <span class="sr-only">(external site)</span></a></nav>
      <p>Version 1.3.0 · Generated illustration disclosed in the design notes.</p>
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
          <h1 tabindex="-1">Track recurring answers from approved readings</h1>
          <p class="hero-lede">For support teams: enter a reading or approved CSV. The app does not query dashboards.</p>
          <div class="hero-action"><a class="button primary" href="/demo" data-link>Try it with sample data</a><span>Opens a filled question book in one click.</span></div>
          <ul class="plain-facts" aria-label="Product facts">
            <li><span aria-hidden="true">●</span> Question cards stay in this browser.</li>
            <li><span aria-hidden="true">●</span> Saved questions reopen offline after one online visit.</li>
            <li><span aria-hidden="true">●</span> Free to use. No account needed.</li>
          </ul>
        </div>
        <figure class="hero-art">
          <picture><source media="(max-width: 700px)" srcset="/assets/question-console-960.webp"><img src="/assets/question-console-1536.webp" width="1536" height="1024" alt="An instrument console turns telemetry paper into a blank answer ticket." fetchpriority="high" decoding="async"></picture>
          <figcaption>One approved reading in. One answer copy out.</figcaption>
        </figure>
      </section>

      <section class="live-preview" aria-labelledby="preview-title">
        <div class="section-lead"><p class="eyebrow">Live preview</p><h2 id="preview-title">Check the latest approved readings</h2><p>Each question keeps its owner, freshness limit, threshold, and approved source.</p></div>
        <div class="panel-preview">${previews.map((q) => questionCard(q, true)).join('')}</div>
      </section>

      <section class="how" aria-labelledby="how-title">
        <div class="section-lead"><p class="eyebrow">Three steps to keep answers current</p><h2 id="how-title">How the question book works</h2></div>
        <ol class="steps">
          <li><span>01</span><h3>Name the question</h3><p>Write the customer question and assign its owner.</p></li>
          <li><span>02</span><h3>Add an approved reading</h3><p>Paste a read-only link or import an approved CSV export.</p></li>
          <li><span>03</span><h3>Share the answer</h3><p>Create an expiring link. Choose whether to hide the owner, source, and note.</p></li>
        </ol>
      </section>

      <section class="limits" aria-labelledby="limits-title">
        <div><h2 id="limits-title">What the question book does not do</h2></div>
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
    <main id="main" class="book-page${demo ? ' demo-book' : ''}">
      <section class="book-heading"><div><p class="eyebrow">${demo ? 'Sample workspace' : 'Local workspace'}</p><h1 tabindex="-1">Check the approved questions</h1><p>${demo ? `${questions.length} sample question${questions.length === 1 ? '' : 's'} use a separate demo storage space.` : 'Add a question or import an approved CSV export.'}</p></div><button class="button primary" data-action="show-add">Add a question</button></section>
      <section class="book-controls" aria-label="Question book controls">
        <button class="button secondary" data-action="show-import">Import CSV</button>
        <button class="button secondary" data-action="export-book">Export question book CSV</button>
        <button class="button secondary" data-action="download-template">Download CSV template</button>
        <span>${questions.length} question${questions.length === 1 ? '' : 's'}</span>
      </section>
      <section id="editor" class="editor" hidden></section>
      <section aria-labelledby="current-title"><div class="list-heading"><h2 id="current-title">Current answers</h2><p>Readings use the time and threshold saved on each card.</p></div>
        <div class="question-list">${questions.length ? questions.map((q) => questionCard(q)).join('') : emptyState()}</div>
      </section>
      <dialog id="snapshot-dialog" aria-labelledby="snapshot-title"><form method="dialog" id="snapshot-form"><div class="dialog-head"><div><p class="eyebrow">Share a reading</p><h2 id="snapshot-title">Make answer copy</h2></div><button class="icon-button" value="cancel" aria-label="Close answer copy dialog">×</button></div><input type="hidden" name="id"><label class="check"><input type="checkbox" name="redact" checked> Hide owner, source, and note</label><label>Link expires after<select name="ttl"><option value="3600">1 hour</option><option value="86400" selected>24 hours</option><option value="604800">7 days</option></select></label><p>Creating a link sends this reviewed answer copy to this site’s sharing service. You can revoke it early.</p><div class="dialog-actions"><button class="button secondary" value="cancel">Cancel</button><button class="button primary" value="default" data-action="create-snapshot">Review answer copy</button></div></form></dialog>
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
    <label>Fresh for minutes<input name="freshMinutes" required type="number" min="1" max="10080" step="1" value="${value.freshMinutes}"></label>
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
    snapshot = JSON.parse(sessionStorage.getItem(snapshotKey()) || 'null') as Snapshot | null;
  } catch { snapshot = null; }
  if (!snapshot || snapshot.version !== 2) return shell(`<main id="main" class="snapshot-page"><section class="snapshot-ticket"><p class="eyebrow">Answer copy</p><h1 tabindex="-1">No answer copy is open</h1><p>Open a question and choose Make answer copy. Answer data is never loaded from a URL.</p><a class="button primary" href="${isDemo() ? '/demo' : '/book'}" data-link>Open my question book</a></section></main>`);
  return shell(`<main id="main" class="snapshot-page">${snapshotTicket(snapshot, true)}</main>`);
}

function snapshotTicket(snapshot: Snapshot, editable: boolean, expiresAt?: string): string {
  return `<article class="snapshot-ticket"><p class="eyebrow">${editable ? 'Review before sharing' : 'Shared answer copy'}</p><h1 tabindex="-1">${escapeHtml(snapshot.question)}</h1><div class="snapshot-answer"><span>${escapeHtml(snapshot.status)}</span><strong>${escapeHtml(snapshot.answer)}</strong></div><dl><div><dt>Observed</dt><dd>${new Date(snapshot.observedAt).toLocaleString()}</dd></div><div><dt>Created</dt><dd>${new Date(snapshot.createdAt).toLocaleString()}</dd></div>${expiresAt ? `<div><dt>Link expires</dt><dd>${new Date(expiresAt).toLocaleString()}</dd></div>` : ''}${snapshot.owner ? `<div><dt>Owner</dt><dd>${escapeHtml(snapshot.owner)}</dd></div>` : ''}${snapshot.source ? `<div><dt>Source</dt><dd>${escapeHtml(snapshot.source)}</dd></div>` : ''}</dl>${snapshot.note ? `<p>${escapeHtml(snapshot.note)}</p>` : ''}${snapshot.redacted ? '<p class="redacted">Owner, source, and internal note were hidden.</p>' : ''}${editable ? `<p class="snapshot-warning"><strong>Choose how to share it.</strong> Expiring links can be revoked. Downloaded files do not expire.</p><div id="share-result" class="share-result" role="status" aria-live="polite">${shareEntriesMarkup(snapshot.demo)}</div>` : '<p class="snapshot-warning">This link stops working at the expiry time shown above.</p>'}<div class="snapshot-actions">${editable ? '<button class="button primary" data-action="create-share">Create expiring link</button><button class="button secondary" data-action="download-snapshot">Download JSON</button>' : ''}<button class="button secondary" data-action="copy-snapshot">Copy answer text</button>${editable ? `<a class="button secondary" href="${snapshot.demo ? '/demo' : '/book'}" data-link>Back to questions</a>` : '<a class="button secondary" href="/" data-link>Open Telemetry Question Book</a>'}</div></article>`;
}

function sharedSnapshotPage(): string {
  return shell('<main id="main" class="snapshot-page"><section class="snapshot-ticket" id="shared-ticket"><p class="eyebrow">Shared answer copy</p><h1 tabindex="-1">Loading expiring link</h1><p role="status">Checking its expiry and revocation status.</p></section></main>');
}

async function loadSharedSnapshot(path: string): Promise<void> {
  const token = path.split('/').pop() || '';
  const ticket = document.querySelector<HTMLElement>('#shared-ticket');
  if (!ticket) return;
  try {
    if (!navigator.onLine) throw new Error('offline');
    const response = await fetch(`/api/snapshots/${encodeURIComponent(token)}`, { headers: { Accept: 'application/json' } });
    const result = await response.json() as { snapshot?: Snapshot; expiresAt?: string; error?: string };
    if (!response.ok || !result.snapshot || !result.expiresAt) throw new Error(result.error || 'This expiring link could not be opened.');
    activeSharedSnapshot = result.snapshot;
    ticket.outerHTML = snapshotTicket(result.snapshot, false, result.expiresAt);
    setMetadata(`${result.snapshot.question} — Telemetry Question Book`, 'A time-limited telemetry answer shared from Telemetry Question Book.', path, true);
  } catch (reason) {
    const message = !navigator.onLine
      ? 'You are offline. Reconnect and reload this page to open the expiring link.'
      : reason instanceof Error ? reason.message : 'This expiring link could not be opened.';
    ticket.innerHTML = `<p class="eyebrow">Unavailable expiring link</p><h1 tabindex="-1">This expiring link is no longer available</h1><p>${escapeHtml(message)}</p><a class="button primary" href="/" data-link>Open Telemetry Question Book</a>`;
  }
  document.querySelector<HTMLElement>('h1')?.focus();
}

function privacyPage(): string {
  return shell(`<main id="main" class="legal"><p class="eyebrow">Policy · 29 August 2026</p><h1 tabindex="-1">Control where each answer copy goes</h1><p>Question cards stay in this browser. The app has no account service or analytics.</p><h2>Demo data</h2><p>Demo changes use keys that start with <code>demo:</code>. Resetting or leaving the demo deletes those keys and revokes its links.</p><h2>Expiring links</h2><p>Creating a link sends only the reviewed answer copy to this site.</p><p>Azure Storage deletes that copy automatically at expiry, even if nobody opens the link again.</p><p>Revoking a link deletes its copy immediately. The stored link details keep no answer text.</p><p>The link contains a random ID, not the answer. The default setting hides the owner, source, and internal note.</p><h2>Downloaded files</h2><p>A downloaded answer copy stays under your control. The file does not expire or have access controls.</p><h2>Your controls</h2><p>Clear this site’s browser storage to remove questions. Contact <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a> with policy questions.</p></main>`);
}

function termsPage(): string {
  return shell(`<main id="main" class="legal"><p class="eyebrow">Terms · 29 August 2026</p><h1 tabindex="-1">Use approved, read-only telemetry sources</h1><p>You are responsible for the questions, source links, readings, and answer copies you create.</p><h2>Safe use</h2><p>Do not enter passwords, access tokens, or customer secrets. Check each answer before creating a link.</p><h2>Expiring links</h2><p>A link works until its stated expiry unless its creator revokes it first. Do not rely on a link as a permanent record.</p><h2>Service</h2><p>The free app is provided as-is under the MIT License. It does not monitor systems or guarantee that a reading is correct.</p><h2>Contact</h2><p>Email <a href="mailto:support@sociobot.in">support@sociobot.in</a> for help.</p></main>`);
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
  '/': 'Telemetry Question Book — track approved readings',
  '/demo': 'Demo — Telemetry Question Book',
  '/demo/snapshot': 'Demo answer copy — Telemetry Question Book',
  '/book': 'My question book — Telemetry Question Book',
  '/privacy': 'Privacy — Telemetry Question Book',
  '/terms': 'Terms — Telemetry Question Book',
  '/snapshot': 'Answer copy — Telemetry Question Book',
  '/404': 'Not found — Telemetry Question Book'
};

const descriptions: Record<string, string> = {
  '/': 'Track recurring telemetry answers from readings you enter or import. Built for support teams without broad dashboard access.',
  '/demo': 'Try Telemetry Question Book with three isolated sample readings.',
  '/demo/snapshot': 'Review a demo answer copy before creating a time-limited link.',
  '/book': 'Save, update, import, and share approved telemetry readings from this browser.',
  '/privacy': 'Learn what Telemetry Question Book stores locally and what an expiring link sends.',
  '/terms': 'Terms for using approved telemetry readings and expiring links.',
  '/snapshot': 'Review an answer copy before downloading it or creating an expiring link.',
  '/404': 'This address does not match a Telemetry Question Book page.'
};

function setMetadata(title: string, description: string, path: string, noindex = false): void {
  document.title = title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', description);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', title);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute('content', description);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', `https://telemetry-question-book.sociobot.in${path}`);
  let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (noindex && !robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.append(robots); }
  if (robots) robots.content = noindex ? 'noindex, nofollow' : 'index, follow';
}

function render(): void {
  const path = currentPath();
  const source = sampleSources[path];
  const title = titles[path] ?? (source ? `${source.title} — Telemetry Question Book` : path.startsWith('/s/') ? 'Shared answer — Telemetry Question Book' : titles['/404']);
  const description = descriptions[path] ?? (source ? `${source.source}: ${source.reading}. This is sample data.` : path.startsWith('/s/') ? 'A time-limited telemetry answer shared from Telemetry Question Book.' : descriptions['/404']);
  setMetadata(title, description, path === '/404' ? '/404' : path, path === '/snapshot' || path === '/demo/snapshot' || path.startsWith('/s/') || path === '/404');
  app.innerHTML = path === '/' ? landingPage() : path === '/demo' || path === '/book' ? bookPage() : path === '/privacy' ? privacyPage() : path === '/terms' ? termsPage() : path === '/snapshot' || path === '/demo/snapshot' ? snapshotPage() : path.startsWith('/s/') ? sharedSnapshotPage() : source ? sampleSourcePage(path) : notFoundPage();
  updateOnlineState();
  if (path.startsWith('/s/')) void loadSharedSnapshot(path);
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

function isIsoDate(value: string): boolean {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/);
  if (!match || !Number.isFinite(Date.parse(value))) return false;
  const [, year, month, day, hour, minute, second = '0'] = match;
  const calendar = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return calendar.getUTCFullYear() === Number(year)
    && calendar.getUTCMonth() === Number(month) - 1
    && calendar.getUTCDate() === Number(day)
    && Number(hour) <= 23 && Number(minute) <= 59 && Number(second) <= 59;
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
  if (!isIsoDate(question.observedAt)) throw new Error(`${prefix}has an invalid observedAt date. Use an ISO date with a timezone.`);
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
    const question: Question = { id: uid(), question: record.question.trim(), owner: record.owner.trim(), source: record.source.trim(), sourceUrl: record.sourceUrl.trim(), value: record.value === '' ? Number.NaN : Number(record.value), unit: record.unit.trim(), threshold: record.threshold === '' ? Number.NaN : Number(record.threshold), comparison: record.comparison as Comparison, observedAt: record.observedAt, freshMinutes: record.freshMinutes === '' ? Number.NaN : Number(record.freshMinutes), note: (record.note || '').trim() };
    validateQuestion(question, index + 2);
    question.observedAt = new Date(question.observedAt).toISOString();
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

function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function questionBookCsv(questions: Question[]): string {
  const rows = questions.map((question) => CSV_HEADERS.map((key) => csvCell(question[key])).join(','));
  return `${CSV_HEADERS.join(',')}\n${rows.join('\n')}${rows.length ? '\n' : ''}`;
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
  try { return JSON.parse(sessionStorage.getItem(snapshotKey()) || 'null') as Snapshot | null; } catch { return null; }
}

function storedShares(demo = isDemo()): SharedSnapshot[] {
  try { return JSON.parse(sessionStorage.getItem(demo ? DEMO_SHARES_KEY : REAL_SHARES_KEY) || '[]') as SharedSnapshot[]; } catch { return []; }
}

function saveShare(share: SharedSnapshot, demo = isDemo()): void {
  sessionStorage.setItem(demo ? DEMO_SHARES_KEY : REAL_SHARES_KEY, JSON.stringify([...storedShares(demo), share]));
}

function shareEntriesMarkup(demo: boolean): string {
  const shares = storedShares(demo);
  if (!shares.length) return '';
  return `<strong>Active expiring links</strong>${shares.map((share, index) => {
    const url = `${location.origin}/s/${share.token}`;
    return `<div class="share-entry"><label for="share-url-${index}">Expiring link</label><div class="share-link"><input id="share-url-${index}" readonly value="${escapeHtml(url)}"><button class="button secondary" data-action="copy-share" data-url="${escapeHtml(url)}">Copy link</button></div><p>Expires ${new Date(share.expiresAt).toLocaleString()}.</p><button class="text-button danger-link" data-action="revoke-share" data-token="${escapeHtml(share.token)}" data-revoke-key="${escapeHtml(share.revokeKey)}">Revoke link now</button></div>`;
  }).join('')}`;
}

function forgetShare(token: string, demo: boolean): void {
  sessionStorage.setItem(demo ? DEMO_SHARES_KEY : REAL_SHARES_KEY, JSON.stringify(storedShares(demo).filter((share) => share.token !== token)));
}

async function revokeShare(share: SharedSnapshot): Promise<boolean> {
  try {
    const response = await fetch(`/api/snapshots/${encodeURIComponent(share.token)}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ revokeKey: share.revokeKey }) });
    return response.ok;
  } catch { return false; }
}

async function clearDemoData(): Promise<boolean> {
  const results = await Promise.all(storedShares(true).map(revokeShare));
  if (results.some((result) => !result)) return false;
  for (const storage of [localStorage, sessionStorage]) {
    Object.keys(storage).filter((key) => key.startsWith('demo:')).forEach((key) => storage.removeItem(key));
  }
  return true;
}

function updateOnlineState(): void {
  const note = document.querySelector<HTMLElement>('#offline-note');
  if (note) note.hidden = navigator.onLine;
}

function dialogFocusables(dialog: HTMLDialogElement): HTMLElement[] {
  return [...dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter((element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true' && getComputedStyle(element).visibility !== 'hidden');
}

function keepDialogFocus(event: KeyboardEvent): void {
  if (event.key !== 'Tab') return;
  const dialog = document.querySelector<HTMLDialogElement>('#snapshot-dialog[open]');
  if (!dialog) return;

  const focusable = dialogFocusables(dialog);
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;
  const wrapsBackward = event.shiftKey && (active === first || !dialog.contains(active));
  const wrapsForward = !event.shiftKey && (active === last || !dialog.contains(active));

  if (wrapsBackward || wrapsForward) {
    event.preventDefault();
    (wrapsBackward ? last : first).focus();
  }
}

document.addEventListener('keydown', keepDialogFocus);

document.addEventListener('click', async (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-link], [data-action]');
  if (!target) return;
  if (target.matches('[data-link]')) {
    event.preventDefault();
    navigate((target as HTMLAnchorElement).getAttribute('href') || '/');
    return;
  }
  const action = target.dataset.action;
  if (action === 'reset-demo') { if (await clearDemoData()) { if (currentPath() === '/demo') { render(); showNotice('Demo reset to its original sample data.'); } else navigate('/demo'); } else showNotice('Reconnect to revoke demo links, then reset again.', 'error'); }
  if (action === 'start-real') { if (await clearDemoData()) navigate('/book'); else showNotice('Reconnect to revoke demo links, then start for real again.', 'error'); }
  if (action === 'show-add') showEditor(questionForm());
  if (action === 'edit-question') {
    const question = loadQuestions().find((item) => item.id === target.dataset.id);
    if (question) showEditor(questionForm(question));
  }
  if (action === 'show-import') showEditor(importForm());
  if (action === 'close-editor') { const editor = document.querySelector<HTMLElement>('#editor'); if (editor) { editor.hidden = true; editor.innerHTML = ''; } }
  if (action === 'download-template') { download('question-book-template.csv', csvTemplate(), 'text/csv'); showNotice('CSV template downloaded.'); }
  if (action === 'export-book') { download('telemetry-question-book.csv', questionBookCsv(loadQuestions()), 'text/csv'); showNotice('Question book CSV exported.'); }
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
      sessionStorage.setItem(snapshotKey(), JSON.stringify(makeSnapshot(question, data.get('redact') === 'on')));
      sessionStorage.setItem(snapshotTtlKey(), String(data.get('ttl') || '86400'));
      navigate(isDemo() ? '/demo/snapshot' : '/snapshot');
    }
  }
  if (action === 'create-share') {
    const snapshot = snapshotFromPage();
    const result = document.querySelector<HTMLElement>('#share-result');
    if (!snapshot || !result) return;
    target.setAttribute('disabled', '');
    result.textContent = 'Creating the expiring link…';
    try {
      if (!navigator.onLine) throw new Error('offline');
      const ttlSeconds = Number(sessionStorage.getItem(snapshotTtlKey()) || '86400');
      const response = await fetch('/api/snapshots', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ snapshot, ttlSeconds, demo: snapshot.demo }) });
      const share = await response.json() as SharedSnapshot & { error?: string };
      if (!response.ok || !share.token || !share.revokeKey) throw new Error(share.error || 'The link could not be created.');
      saveShare(share, snapshot.demo);
      result.innerHTML = shareEntriesMarkup(snapshot.demo);
    } catch (reason) {
      result.textContent = !navigator.onLine
        ? 'You are offline. Reconnect, then create the expiring link again.'
        : `${reason instanceof Error ? reason.message : 'The link could not be created.'} Check your connection and try again.`;
      target.removeAttribute('disabled');
    }
  }
  if (action === 'copy-share') {
    navigator.clipboard.writeText(target.dataset.url || '').then(() => showNotice('Expiring link copied.')).catch(() => showNotice('The link could not be copied. Select it and copy it instead.', 'error'));
  }
  if (action === 'revoke-share') {
    const share = { token: target.dataset.token || '', revokeKey: target.dataset.revokeKey || '', expiresAt: '' };
    target.setAttribute('disabled', '');
    if (await revokeShare(share)) {
      const demo = share.token.startsWith('d_');
      forgetShare(share.token, demo);
      target.closest<HTMLElement>('#share-result')!.innerHTML = shareEntriesMarkup(demo);
      showNotice('Link revoked. It no longer opens the answer copy.');
    } else {
      target.removeAttribute('disabled');
      showNotice('The link could not be revoked. Check your connection and try again.', 'error');
    }
  }
  if (action === 'copy-snapshot') {
    const snapshot = snapshotFromPage() ?? activeSharedSnapshot;
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
