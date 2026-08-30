# Perfection loop polish 7

Work order: `telemetry-question-book-polish-7`  
Review source: `a039cb62895a2810fe0492de17b95fe923c71cf4`  
Functional repair: `91e44ba21a75dbda1d8a329cec870fbdb3a042b4`  
First verified deployment: `178f1351b27609a5ac6d1403ba5c03e023b2550b`  
Live URL: <https://telemetry-question-book.sociobot.in>

## Result

**PASS.** Review 7's last minor finding is fixed. The product name remains
visible in the 390 px app header, while a 320 px fallback stacks the header to
prevent overlap. Every finding from reviews 1–7 and every pre-ID finding was
rechecked. No blocking, major, or minor item remains.

## Evidence key

- [Clean verification](evidence/polish-7/clean-verification.txt): fresh clone,
  28/28 literal claim commands, 15 API tests, 34 Playwright tests, lint,
  typecheck, build, audits, and bundle measurements.
- [Live cold check](evidence/polish-7/live/browser/cold-browser-check.json):
  first screen, visible wordmark, direct demo, storage isolation, all expiry
  choices, revocation, offline reload, route titles, 404, request origins, and
  deployed health.
- [Browser/Axe matrix](qa/browser-qa-results.json): 16 local and 16 live
  route/viewport scans, keyboard and focus checks, reduced motion, target sizes,
  workflows, wordmark bounds, overflow, and serious/critical Axe results.
- Screenshots: [root phone](evidence/polish-7/live/root/screenshot-mobile.png),
  [demo phone](evidence/polish-7/live/demo/screenshot-mobile.png),
  [sharing controls](evidence/polish-7/live/browser/share-controls-mobile.png),
  [shared answer](evidence/polish-7/live/browser/shared-answer-mobile.png), and
  [404](evidence/polish-7/live/browser/404-mobile.png).
- [Live Lighthouse](evidence/polish-7/live/lighthouse-summary.json):
  Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.211 s,
  TBT 0 ms, and CLS 0.

## Cumulative finding closure

Every evidence cell names the test, screenshot, and live URL check used for the
finding.

| Finding | Change made or retained | Evidence |
| --- | --- | --- |
| F-1-1 | Kept a complete sample reading above the phone controls. | `@claim:demo-sandbox` · [demo phone](evidence/polish-7/live/demo/screenshot-mobile.png) · live `/?demo=1` shows question/value/state/freshness by y=793. |
| F-1-2 | Kept separate demo question, preview, and share storage; both exits clear only demo keys. | `@claim:demo-controls`, `@claim:answer-copy-security` · [sharing controls](evidence/polish-7/live/browser/share-controls-mobile.png) · live `/demo/snapshot` preserved all real sentinels. |
| F-1-3 | Kept server-held, redacted, expiring, revocable links with answer data absent from the URL. | `@claim:expiring-share`, `@claim:share-redaction`, `@claim:share-revocation`, `@claim:snapshot-retention` · [shared answer](evidence/polish-7/live/browser/shared-answer-mobile.png) · live `/s/d_*` returned 200, then 410. |
| F-1-4 | Kept the job-first headline and manual reading/CSV boundary on the first screen. | `@claim:local-browser` and first-screen regression · [root phone](evidence/polish-7/live/root/screenshot-mobile.png) · cold live `/`. |
| F-1-5 | Kept exact owner, freshness, threshold, source name, and source URL checks across reload. | `@claim:card-fields` · [demo phone](evidence/polish-7/live/demo/screenshot-mobile.png) · live `/demo`. |
| F-1-6 | Kept result-level coverage for every registered promise, including both demo exits and exact CSV/download fields. | All 28 literal claim commands, especially `@claim:demo-controls`, `@claim:csv-validation`, `@claim:csv-template`, `@claim:answer-copy-security`, and `@claim:answer-copy-download` · [sharing controls](evidence/polish-7/live/browser/share-controls-mobile.png) · live `/demo` and `/demo/snapshot`. |
| F-1-7 | Kept a distinct title for each sample-source route. | `@claim:sample-sources` · [demo phone](evidence/polish-7/live/demo/screenshot-mobile.png) · live `/sample-sources/northstar-orders`, `/atlas-webhooks`, and `/harbor-export`. |
| F-1-8 | Kept `/snapshot` and `/demo/snapshot` in the sitemap and marked transient pages noindex. | `regression: static response policy has explicit routes and a CSP-safe 404` · [sharing controls](evidence/polish-7/live/browser/share-controls-mobile.png) · live `/sitemap.xml`, `/snapshot`, and `/demo/snapshot`. |
| F-1-9 | Kept the complete product shell, metadata, legal links, and instrument-panel treatment on the HTTP 404. | `regression: static response policy has explicit routes and a CSP-safe 404` and Axe route regression · [404](evidence/polish-7/live/browser/404-mobile.png) · live `/definitely-missing-polish-4` returned 404. |
| F-1-10 | Kept “approved reading” and removed “governed.” | Copy audit and `@claim:local-browser` · [root phone](evidence/polish-7/live/root/screenshot-mobile.png) · live `/`. |
| F-1-11 | Kept “answer copy” and removed “support-ready.” | Copy audit and `@claim:answer-copy-download` · [root phone](evidence/polish-7/live/root/screenshot-mobile.png) · live `/`. |
| F-1-12 | Kept “Check the latest approved readings” as the preview heading. | Heading regression and `@claim:card-fields` · [root phone](evidence/polish-7/live/root/screenshot-mobile.png) · live `/`. |
| F-1-13 | Kept dated-copy wording and named owner, source, and note as hideable fields. | `@claim:answer-copy-download`, `@claim:share-redaction` · [sharing controls](evidence/polish-7/live/browser/share-controls-mobile.png) · live `/demo/snapshot`. |
| F-1-14 | Kept “question book” as the collection term; the compact mobile destination is “Questions.” | `regression: every route has a distinct title, metadata, and navigation focus` · [root phone](evidence/polish-7/live/root/screenshot-mobile.png) · live `/book`. |
| F-1-15 | Kept “Three steps to keep answers current.” | `regression: the complete first-screen facts fit phone and desktop viewports` · [root phone](evidence/polish-7/live/root/screenshot-mobile.png) · live `/`. |
| F-1-16 | Kept the concrete h2 “What the question book does not do.” | `regression: the limits section names its boundary in the heading list` · [root phone](evidence/polish-7/live/root/screenshot-mobile.png) · live `/`. |
| F-1-17 | Kept browser-storage wording without “local-first.” | `@claim:local-browser` and copy audit · [root phone](evidence/polish-7/live/root/screenshot-mobile.png) · live `/privacy`. |
| F-1-18 | Kept the visible offline result without service-worker jargon. | `@claim:offline-reload` · [demo phone](evidence/polish-7/live/demo/screenshot-mobile.png) · live `/demo` reopened offline with three cards. |
| F-1-19 | Kept concrete routing, styled-404, cache, and browser-protection documentation. | `regression: static response policy has explicit routes and a CSP-safe 404` · [404](evidence/polish-7/live/browser/404-mobile.png) · live unknown route and response headers. |
| F-2-1 | Kept registered comparison and strict ISO-date CSV validation. | `@claim:csv-schema` · [demo phone](evidence/polish-7/live/demo/screenshot-mobile.png) · live `/demo`. |
| F-2-2 | Kept plain offline sharing errors and reconnection recovery. | `@claim:offline-sharing` · [sharing controls](evidence/polish-7/live/browser/share-controls-mobile.png) · live `/demo/snapshot`. |
| F-2-3 | Kept `d_` demo IDs and independent Reset/Start revocation and cleanup. | `@claim:demo-controls` · [sharing controls](evidence/polish-7/live/browser/share-controls-mobile.png) · live demo IDs became 410 and demo keys cleared. |
| F-2-4 | Kept exact sharing-metadata minimization and immediate stored-answer deletion. | `@claim:snapshot-storage-minimization` · [shared answer](evidence/polish-7/live/browser/shared-answer-mobile.png) · live create/read/revoke lifecycle. |
| F-2-5 | Kept the read-only health route outside sharing limits. | `@claim:health-rate-limit` · [root phone](evidence/polish-7/live/root/screenshot-mobile.png) · live `/api/health` returned 200. |
| F-2-6 | Kept active-workspace CSV export and duplicate-free round trip. | `@claim:question-book-export` · [demo phone](evidence/polish-7/live/demo/screenshot-mobile.png) · live `/demo`. |
| F-2-7 | Kept all three facts in the phone and desktop first screens. | `regression: the complete first-screen facts fit phone and desktop viewports` · [root phone](evidence/polish-7/live/root/screenshot-mobile.png) · live 390 px facts end at y=807. |
| F-2-8 | Kept the focused skip link below the header and clear of navigation. | `regression: a focused mobile skip link does not block Demo navigation` · [root phone](evidence/polish-7/live/root/screenshot-mobile.png) · live keyboard/pointer `/` to `/demo`. |
| F-2-9 | Kept “random IDs” instead of opaque-link jargon. | `@claim:expiring-share` and copy audit · [sharing controls](evidence/polish-7/live/browser/share-controls-mobile.png) · live `/s/d_*`. |
| F-2-10 | Kept “this site’s sharing service” instead of API jargon. | `@claim:offline-sharing` and copy audit · [sharing controls](evidence/polish-7/live/browser/share-controls-mobile.png) · live `/demo/snapshot`. |
| F-2-11 | Kept “random ID, not the answer.” | `@claim:expiring-share` · [shared answer](evidence/polish-7/live/browser/shared-answer-mobile.png) · live link contained no answer data. |
| F-2-12 | Kept answer/link/expiry wording without queue, table, or TTL jargon. | `@claim:snapshot-storage-minimization` and copy audit · [sharing controls](evidence/polish-7/live/browser/share-controls-mobile.png) · live sharing flow. |
| F-2-13 | Kept only the current pre-1.2.0 migration condition. | `@claim:legacy-migration` · [root phone](evidence/polish-7/live/root/screenshot-mobile.png) · live `/api/health`. |
| F-3-1 | Kept all three exact expiry choices registered and measured. | `@claim:share-expiry-options` · [sharing controls](evidence/polish-7/live/browser/share-controls-mobile.png) · live requests used 3,600, 86,400, and 604,800 seconds. |
| F-3-2 | Kept “expiring link” as the single public term. | `@claim:expiring-share` and copy audit · [sharing controls](evidence/polish-7/live/browser/share-controls-mobile.png) · live `/demo/snapshot`. |
| F-3-3 | Kept browser-separation language without session-storage jargon. | `@claim:answer-copy-security` · [demo phone](evidence/polish-7/live/demo/screenshot-mobile.png) · live `/demo/snapshot` preserved the real preview. |
| F-3-4 | Kept the limit in terms of sharing, network addresses, request 101, 429, and Retry-After. | `@claim:api-rate-limit`, `@claim:health-rate-limit` · [sharing controls](evidence/polish-7/live/browser/share-controls-mobile.png) · live deployment verifier. |
| F-3-5 | Kept “server functions” as the deployment artifact name. | `@claim:deploy-integrity` · [root phone](evidence/polish-7/live/root/screenshot-mobile.png) · live static/API deployment. |
| F-3-6 | Kept service-owned Azure Storage wording without “first-party.” | `@claim:snapshot-retention` · [shared answer](evidence/polish-7/live/browser/shared-answer-mobile.png) · live storage-backed share lifecycle. |
| F-3-7 | Kept concrete static/API build-ID verification. | `@claim:deploy-integrity` · [root phone](evidence/polish-7/live/root/screenshot-mobile.png) · live `/build-info.json` and `/api/health` both reported `178f135…`. |
| F-4-1 | Kept the scoped fact “Question cards stay in this browser.” | `@claim:local-browser` · [root phone](evidence/polish-7/live/root/screenshot-mobile.png) · cold live `/` used only the product origin. |
| F-4-2 | Kept “Saved questions reopen offline after one online visit.” | `@claim:offline-reload`, `@claim:offline-sharing` · [demo phone](evidence/polish-7/live/demo/screenshot-mobile.png) · live offline `/demo`. |
| F-4-3 | Kept observable deployment wording: build, commit stamp, static/API comparison, and forged-header check. | `@claim:deploy-integrity` · [root phone](evidence/polish-7/live/root/screenshot-mobile.png) · live deployment verifier. |
| F-4-4 | Kept deployment integrity and legacy migration in the manifest with exact tagged commands. | `@claim:deploy-integrity`, `@claim:legacy-migration` · [root phone](evidence/polish-7/live/root/screenshot-mobile.png) · 28/28 clean commands and live `/api/health`. |
| F-5-1 | Kept the limits h2 as a self-contained section name. | `regression: the limits section names its boundary in the heading list` · [root phone](evidence/polish-7/live/root/screenshot-mobile.png) · live `/`. |
| F-7-1 | Kept the full product name visible beside the dial at 390 px; shortened only the mobile book destination to “Questions”; stacked both rows below 350 px. | `regression: the mobile header keeps the product wordmark visible` · [root phone](evidence/polish-7/live/root/screenshot-mobile.png) and [320 px local check](evidence/polish-7/local/browser/root-320.png) · live `/`, `/demo`, `/book`, `/privacy`, `/terms`, and `/snapshot` show “Telemetry Question Book”; live bounds x=12–153.3. |

## Pre-ID verification findings

The earlier unnumbered findings also remain closed: server-enforced snapshot
expiry/integrity, recurring-card updates, removal of the unavailable paid
offer, complete claim inventory, working sample sources, shared form/CSV
validation, 44 px targets, visible focus, CSP-safe 404, current Vite, real HTTP
404s, correct art caching, clean comparison copy, dynamic demo counts,
spoof-resistant rate limiting, matching static/API identity, trapped dialog
focus, and AA button contrast. Their result tests are in the clean log; their
live route, workflow, Axe, focus, and target evidence is in the browser matrix.

## Final live recheck

The deployed product was opened cold at 390 × 844 and 1440 × 900. Root storage
was empty and every request stayed on the product origin. The visible product
wordmark, first-screen wording, action, facts, direct `?demo=1` path, demo
banner, isolated real-data sentinels, Reset/Start cleanup, three expiry choices,
revocation, offline reopening, route titles, focus behavior, legal routes, and
HTTP 404 all passed. No valid route logged an application error, overflowed,
or produced a serious/critical Axe result.
