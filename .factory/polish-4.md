# Perfection loop polish 4

Work order: `telemetry-question-book-polish-4`  
Review source: `2a5498513985a83c3dcd427f516a2694ef803038`  
Functional repair: `400f4bdd3e4be39c56dbbb3ae2e4490f2497a6f8`  
First verified deployment: `4af90fe609af03c9b55b5ea1d3caad498e552148`  
Live URL: <https://telemetry-question-book.sociobot.in>

## Evidence key

- **Clean claims:** [clean-claims.txt](evidence/polish-4/clean-claims.txt) records 28/28 exact manifest commands passing from a fresh clone.
- **Clean suite:** [clean-full-suite.txt](evidence/polish-4/clean-full-suite.txt) records 15 API tests and 31 Playwright tests passing.
- **Repository gates:** [clean-repository-gates.txt](evidence/polish-4/clean-repository-gates.txt) records lint, typecheck, build, audits, and `git diff --check`.
- **Live cold check:** [cold-browser-check.json](evidence/polish-4/live/cold-browser-check.json) records facts, phone bounds, demo isolation, all expiry choices, revocation, offline reload, routes, 404, requests, and live build identity.
- **Route and Axe matrix:** [browser-qa-results.json](qa/browser-qa-results.json) covers local and live routes at 390 × 844 and 1440 × 900.
- **Screenshots:** [root mobile](evidence/polish-4/live/root/screenshot-mobile.png), [demo mobile](evidence/polish-4/live/demo/screenshot-mobile.png), [share controls](evidence/polish-4/live/share-controls-mobile.png), [shared answer](evidence/polish-4/live/shared-answer-mobile.png), and [404](evidence/polish-4/live/404-mobile.png).

## Cumulative finding closure

Every finding below was rechecked in current code, tests, and the deployed product. Earlier closures were treated as regressions to prove, not as prior proof.

| Finding | Change made or retained | Evidence: test, screenshot, live URL check |
| --- | --- | --- |
| F-1-1 | Kept the first complete sample reading before phone controls. | `@claim:demo-sandbox`; [demo mobile](evidence/polish-4/live/demo/screenshot-mobile.png); live `/?demo=1` ends question/value/state/freshness at 630/670/719/763 px. |
| F-1-2 | Kept separate demo question, preview, and share keys; the sticky banner survives the answer-copy route; both exits clear only demo keys. | `@claim:demo-controls`, `@claim:answer-copy-security`; [share controls](evidence/polish-4/live/share-controls-mobile.png); live `/demo` → `/demo/snapshot` preserved all real sentinels. |
| F-1-3 | Kept server-held expiring links, hidden answer data in URLs, service-enforced expiry, and creator revocation. | `@claim:expiring-share`, `@claim:share-redaction`, `@claim:share-revocation`, `@claim:snapshot-retention`; [shared answer](evidence/polish-4/live/shared-answer-mobile.png); live `/s/d_*` returned 200, then 410 after revocation. |
| F-1-4 | Kept the job-first headline and manual entry/import boundary on the first screen. | `@claim:local-browser`; [root mobile](evidence/polish-4/live/root/screenshot-mobile.png); cold live `/` showed the exact headline and lede. |
| F-1-5 | Kept exact owner, freshness, threshold, source name, and source URL assertions across reload. | `@claim:card-fields`; [demo mobile](evidence/polish-4/live/demo/screenshot-mobile.png); live `/demo` showed every field. |
| F-1-6 | Kept result-level coverage for realistic samples, both validation paths, free workflows, download warning, negative capabilities, and integrated sharing handlers. | `@claim:demo-sandbox`, `@claim:csv-validation`, `@claim:free-core`, `@claim:answer-copy-download`, `@claim:api-rate-limit`; [demo mobile](evidence/polish-4/live/demo/screenshot-mobile.png); clean claims 28/28. |
| F-1-7 | Kept a distinct title for each sample-source deep link. | `@claim:sample-sources`; [demo mobile](evidence/polish-4/live/demo/screenshot-mobile.png); all three live `/sample-sources/*` titles passed. |
| F-1-8 | Kept `/snapshot` and `/demo/snapshot` in the sitemap and `noindex` on transient pages. | `regression: static response policy has explicit routes and a CSP-safe 404`; [share controls](evidence/polish-4/live/share-controls-mobile.png); live `/sitemap.xml`, `/snapshot`, and `/demo/snapshot` returned 200. |
| F-1-9 | Kept the full product header/footer, legal links, icons, social metadata, and disconnected-console treatment on the HTTP 404. | `regression: static response policy has explicit routes and a CSP-safe 404`; [404](evidence/polish-4/live/404-mobile.png); live `/definitely-missing-polish-4` returned 404 with one h1/main. |
| F-1-10 | Kept “approved reading” instead of “governed.” | `@claim:local-browser`; [root mobile](evidence/polish-4/live/root/screenshot-mobile.png); cold live `/` checked. |
| F-1-11 | Kept “answer copy” instead of the unsupported adjective. | `@claim:answer-copy-download`; [root mobile](evidence/polish-4/live/root/screenshot-mobile.png); cold live `/` checked. |
| F-1-12 | Kept “Check the latest approved readings” as the preview heading. | `@claim:card-fields`; [root mobile](evidence/polish-4/live/root/screenshot-mobile.png); cold live `/` checked. |
| F-1-13 | Kept dated-copy wording and named the owner, source, and note controls. | `@claim:answer-copy-download`, `@claim:share-redaction`; [share controls](evidence/polish-4/live/share-controls-mobile.png); live `/demo/snapshot` passed. |
| F-1-14 | Kept “question book” as the collection term throughout. | `regression: every route has a distinct title, metadata, and navigation focus`; [root mobile](evidence/polish-4/live/root/screenshot-mobile.png); live `/book` title passed. |
| F-1-15 | Kept “Three steps to keep answers current.” | `regression: the complete first-screen facts fit phone and desktop viewports`; [root mobile](evidence/polish-4/live/root/screenshot-mobile.png); cold live `/` checked. |
| F-1-16 | Kept “What the question book does not do.” | `@claim:local-browser`; [root mobile](evidence/polish-4/live/root/screenshot-mobile.png); cold live `/` checked. |
| F-1-17 | Kept the README explanation in browser-storage terms without “local-first.” | `@claim:local-browser`; [root mobile](evidence/polish-4/live/root/screenshot-mobile.png); live privacy behavior remained same-origin. |
| F-1-18 | Kept result-focused offline language and narrowed the first-screen promise further in F-4-2. | `@claim:offline-reload`; [demo mobile](evidence/polish-4/live/demo/screenshot-mobile.png); live `/demo` reopened offline with three cards. |
| F-1-19 | Kept the plain explanation of route handling, 404, cache rules, and protections. | `regression: static response policy has explicit routes and a CSP-safe 404`; [404](evidence/polish-4/live/404-mobile.png); live 404 and security-header checks passed. |
| F-2-1 | Kept registered comparison and strict ISO-date CSV coverage. | `@claim:csv-schema`; [demo mobile](evidence/polish-4/live/demo/screenshot-mobile.png); live `/demo` remained importable. |
| F-2-2 | Kept plain offline create/open errors and successful recovery after reconnection. | `@claim:offline-sharing`; [share controls](evidence/polish-4/live/share-controls-mobile.png); live offline demo reload and online share creation passed. |
| F-2-3 | Kept `d_` demo IDs and automatic revocation by Reset demo and Start for real. | `@claim:demo-controls`; [share controls](evidence/polish-4/live/share-controls-mobile.png); live demo tokens returned 410 after exit/revocation. |
| F-2-4 | Kept exact metadata minimization and immediate stored-answer deletion. | `@claim:snapshot-storage-minimization`; [shared answer](evidence/polish-4/live/shared-answer-mobile.png); live create/read/revoke passed. |
| F-2-5 | Kept the read-only health route outside sharing limits. | `@claim:health-rate-limit`; [root mobile](evidence/polish-4/live/root/screenshot-mobile.png); live `/api/health` returned 200 after limit probes. |
| F-2-6 | Kept active-workspace CSV export and duplicate-free round trip. | `@claim:question-book-export`; [demo mobile](evidence/polish-4/live/demo/screenshot-mobile.png); live `/demo` showed the export action below isolated cards. |
| F-2-7 | Kept all three facts inside the first desktop viewport; round 4 also proves the phone viewport. | `regression: the complete first-screen facts fit phone and desktop viewports`; [root mobile](evidence/polish-4/live/root/screenshot-mobile.png); live facts ended at 659/710/740 px on phone. |
| F-2-8 | Kept the revealed skip link below the header and clear of Demo navigation. | `regression: a focused mobile skip link does not block Demo navigation`; [root mobile](evidence/polish-4/live/root/screenshot-mobile.png); live keyboard/pointer path reached `/demo`. |
| F-2-9 | Kept “random IDs” instead of “opaque answer links.” | `@claim:expiring-share`; [share controls](evidence/polish-4/live/share-controls-mobile.png); live `/s/d_*` contained no answer data. |
| F-2-10 | Kept “this site’s sharing service” instead of API jargon. | `@claim:offline-sharing`; [share controls](evidence/polish-4/live/share-controls-mobile.png); live `/demo/snapshot` checked. |
| F-2-11 | Kept “random ID, not the answer” instead of “opaque token.” | `@claim:expiring-share`; [shared answer](evidence/polish-4/live/shared-answer-mobile.png); live share URL contained only a `d_` ID. |
| F-2-12 | Kept answer/expiry/link wording instead of queue/table/TTL jargon. | `@claim:snapshot-storage-minimization`; [share controls](evidence/polish-4/live/share-controls-mobile.png); live sharing flow passed. |
| F-2-13 | Kept only the current pre-1.2.0 migration condition, without candidate history. | `@claim:legacy-migration`; [root mobile](evidence/polish-4/live/root/screenshot-mobile.png); live `/api/health` confirmed configured storage. |
| F-3-1 | Kept all three exact expiry choices registered and measured. | `@claim:share-expiry-options`; [share controls](evidence/polish-4/live/share-controls-mobile.png); live requests sent 3600/86400/604800 and returned matching deadlines. |
| F-3-2 | Kept “expiring link” as the one public term. | `@claim:expiring-share`; [share controls](evidence/polish-4/live/share-controls-mobile.png); live `/demo/snapshot` checked. |
| F-3-3 | Kept preview separation in user terms without session-storage jargon. | `@claim:answer-copy-security`; [share controls](evidence/polish-4/live/share-controls-mobile.png); live demo preserved the real preview sentinel. |
| F-3-4 | Kept the limit explanation in terms of sharing, network addresses, and request 101. | `@claim:api-rate-limit`, `@claim:health-rate-limit`; [share controls](evidence/polish-4/live/share-controls-mobile.png); the deployment’s 101 live probes passed. |
| F-3-5 | Kept “server functions” as the deployment artifact name. | `@claim:deploy-integrity`; [root mobile](evidence/polish-4/live/root/screenshot-mobile.png); deployment uploaded `dist/` and `api/`. |
| F-3-6 | Kept service-owned Azure Storage wording without “first-party.” | `@claim:snapshot-retention`; [shared answer](evidence/polish-4/live/shared-answer-mobile.png); live storage health and share lifecycle passed. |
| F-3-7 | Replaced the remaining abstract release language through the concrete F-4-3 rewrite. | `@claim:deploy-integrity`; [root mobile](evidence/polish-4/live/root/screenshot-mobile.png); live `/api/health` reported the deployed commit. |
| F-4-1 | Replaced “Data stays in this browser” with “Question cards stay in this browser.” | `@claim:local-browser`; [root mobile](evidence/polish-4/live/root/screenshot-mobile.png); cold live `/` showed the exact sentence and the request log stayed same-origin. |
| F-4-2 | Replaced the broad offline statement on `/` and in README with “Saved questions reopen offline after one online visit.” | `@claim:offline-reload`, `@claim:offline-sharing`; [root mobile](evidence/polish-4/live/root/screenshot-mobile.png); live `/demo` reopened offline while link actions retained their connection warning. |
| F-4-3 | Rewrote deployment as four concrete outcomes: build site/functions, set the commit, compare `/api/health`, and reject forged address-header bypasses. | `@claim:deploy-integrity`; [root mobile](evidence/polish-4/live/root/screenshot-mobile.png); `npm run deploy` verified the live build ID and 100-request limit. |
| F-4-4 | Added `deploy-integrity` and `legacy-migration` to `.factory/claims.json` and tagged their result-level tests. | `@claim:deploy-integrity`, `@claim:legacy-migration`; [root mobile](evidence/polish-4/live/root/screenshot-mobile.png); live `/api/health` reported the deployed commit and configured storage. |

## Final result

No blocking, major, or minor finding remains. A final clean-clone replay found one texture-sensitive 3.96:1 primary-button label on mobile `/snapshot`; `--switch-ink: #000000` now keeps that control above 4.5:1, and the full Axe matrix passes. The mid-century instrument-panel identity, static deployment class, legal routes, real 404, direct demo URL, isolated storage, expiring links, mobile layout, and accessibility behavior remain intact.
