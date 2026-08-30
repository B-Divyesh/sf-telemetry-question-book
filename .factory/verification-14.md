# Verification 14 — candidate `22cb671252954e59ac26369452f6a29b2e4bb53a`

**Verdict: PASS.**

Verified 2026-08-30 against `https://telemetry-question-book.sociobot.in`.
Both live build identity endpoints report
`22cb671252954e59ac26369452f6a29b2e4bb53a`.

## Cold first read

On a fresh desktop visit the first screen says “Track recurring answers from
approved readings.” It identifies the audience and task: “For support teams:
enter a reading or approved CSV. The app does not query dashboards.” The next
action is the visible **Try it with sample data** control, with “Opens a filled
question book in one click” immediately beside it. It therefore states what it
does, for whom, and what to do first. At 390 px the 48 px full-width control
remains visible and opens `/demo` with three realistic named readings.

## Clean-checkout gates

`npm ci` and `npm --prefix api ci` completed from the candidate checkout
without lockfile changes. A literal pre-install claim-command probe could not
locate `tsc` / `@azure/data-tables`; that is expected before a Node project's
documented installation step and is not product-test evidence. The full claim
list was rerun from the installed clean state.

- `npm test`: **PASS** — 15 Node API tests and 34 Playwright tests. The
  Playwright last-run record is `passed` with no failed tests.
- `npm run lint`, `npm run typecheck`, `npm run build`, and `git diff --check`:
  **PASS**.
- Root and API production dependency audits: **0 vulnerabilities** at high
  severity or above.
- Build output: 36,612-byte JavaScript (11.92 KB gzip) and 17,547-byte CSS
  (4.95 KB gzip), within budget. Local mobile Lighthouse: Performance 100,
  Accessibility 100, LCP 1,357 ms, CLS 0.

A live Lighthouse run could not complete because the bundled Chromium tab
crashed in this container. It does not affect the independent live browser,
axe, header, or functional checks below.

## Declared claims

All 28 literal commands in `.factory/claims.json` passed after installation,
using the shipped demo entry point for browser claims and supplied API fixtures
for server claims.

| Claim | Result | Claim | Result |
| --- | --- | --- | --- |
| `demo-sandbox` | PASS | `demo-controls` | PASS |
| `card-fields` | PASS | `local-browser` | PASS |
| `free-core` | PASS | `threshold-states` | PASS |
| `offline-reload` | PASS | `offline-sharing` | PASS |
| `question-update` | PASS | `csv-import` | PASS |
| `csv-validation` | PASS | `csv-schema` | PASS |
| `csv-template` | PASS | `question-book-export` | PASS |
| `answer-copy-security` | PASS | `answer-copy-download` | PASS |
| `expiring-share` | PASS | `share-expiry-options` | PASS |
| `share-redaction` | PASS | `share-revocation` | PASS |
| `least-privilege-input` | PASS | `sample-sources` | PASS |
| `snapshot-retention` | PASS | `snapshot-storage-minimization` | PASS |
| `api-rate-limit` | PASS | `health-rate-limit` | PASS |
| `deploy-integrity` | PASS | `legacy-migration` | PASS |

These cover normal readings, no-duplicate updates, malformed input recovery,
CSV schema and 1/10,080-minute boundaries, export/download, redacted/revoked/
expired shares, demo isolation, offline reload, retention, and rate limits. I
also manually created a real question at 390 px (`Did Meridian files arrive?`)
through the full mobile form; it saved as one card with no page errors.

## Live deployment, privacy, and server checks

- `npm run verify:live-api -- 22cb671252954e59ac26369452f6a29b2e4bb53a`:
  **PASS**. It matched both IDs and proved spoofed caller headers cannot split
  the limit.
- `/build-info.json` and `/api/health` both returned the candidate ID; health
  returned `ok: true` and `snapshotStoreConfigured: true`.
- Observed allowance: create, open, and revoke share **100 requests per
  network address per 60 seconds**; request 101 returns **429** with
  **`Retry-After`**. Health is outside the limit.
- A fresh live landing → demo flow made only same-origin requests (document,
  self-hosted JS/CSS/WebP): no analytics, account, ingestion, query, alert,
  CDN font, or other third-party request.
- Static headers include CSP with `frame-ancestors 'none'`, HSTS, nosniff,
  strict-origin referrer policy, and restrictive permissions policy. Hashed
  JS/CSS use one-year immutable caching; HTML revalidates after 30 seconds.
- `/`, `/demo`, `/privacy`, and `/terms` return 200 with their own title and
  one H1. Unknown live routes return the styled 404 with HTTP 404. Valid-route
  loads have no console/page errors.

## Accessibility and responsive checks

Local and live Chromium checks covered desktop and 390 × 844 mobile: one H1,
`lang="en"`, title, main landmark, skip link, useful image alt text, no
horizontal overflow, visible solid keyboard focus, and no valid-route errors.
No visible mobile button/link touch target was below 44 px. Reduced motion
removes animations and reduces transitions to 0.01 ms.

`@axe-core/playwright` reported zero serious/critical findings (zero total
violations) on local `/`, local `/demo`, and live `/` at 390 px.

## Defects by severity

- **Release blockers / critical / high:** none.
- **Low observation:** at up to 620 px the demo hides **Add a question** so
  its sample readings occupy the first phone viewport. Import, update,
  answer-copy, reset, and exit remain usable; after **Start for real**, the
  390 px workspace exposes **Add a question** and the full authoring form.
  This does not block the real job, but restoring the demo action would make
  the sandbox more exploratory.
