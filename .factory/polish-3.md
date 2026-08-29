# Perfection loop polish 3

Work order: `telemetry-question-book-polish-3`
Review source: `fb2093d53c6980145afd125976632889b9d4096b`
Repair commits: `916715a`, `b9866c3`
Live URL: <https://telemetry-question-book.sociobot.in>

## Evidence key

- **Clean claims**: final clean clone at `b9866c3`, 26/26 exact manifest commands passed.
- **Live browser**: [browser-qa.json](evidence/polish-3/live/browser-qa.json), including cold storage, demo isolation, expiry requests, revoked demo links, routes, titles, landmarks, request origins, and 16 axe scans.
- **Root / demo shots**: [root mobile](evidence/polish-3/live/screenshot-mobile.png), [demo mobile](evidence/polish-3/live-demo/screenshot-mobile.png). The URL verifier reports are [root](evidence/polish-3/live/verify.json) and [direct demo](evidence/polish-3/live-demo/verify.json).

## Finding closure

| Finding | Change made | Evidence: test, screenshot, and live check |
| --- | --- | --- |
| F-1-1 | Kept the first demo card ahead of phone controls. | `@claim:demo-sandbox`; [demo mobile](evidence/polish-3/live-demo/screenshot-mobile.png); `/?demo=1` shows question/value/state/freshness at y=588/642/693/744. |
| F-1-2 | Preserved separate demo question, preview, and share namespaces plus the persistent banner. | `@claim:demo-controls`; [demo mobile](evidence/polish-3/live-demo/screenshot-mobile.png); live `/demo` and `/demo/snapshot` retain the banner and leave real keys untouched. |
| F-1-3 | Retained server-held, revocable, expiring links rather than client-only exports. | `@claim:expiring-share`, `@claim:share-revocation`; [expiry selector](evidence/polish-3/live/expiry-options-mobile.png); live created `d_` links return 410 after Start for real in [browser QA](evidence/polish-3/live/browser-qa.json). |
| F-1-4 | Kept the job-first headline and manual entry/import boundary in the first screen. | `@claim:local-browser`; [root mobile](evidence/polish-3/live/screenshot-mobile.png); live `/` cold-check records the exact headline and lede. |
| F-1-5 | Kept reload checks for owner, freshness, threshold, source name, and source URL. | `@claim:card-fields`; [demo mobile](evidence/polish-3/live-demo/screenshot-mobile.png); live `/demo` shows the first-card fields. |
| F-1-6 | Retained complete observable coverage for validation, free workflows, HTTPS save, and sharing routes. | `@claim:csv-validation`, `@claim:free-core`, `@claim:least-privilege-input`, `@claim:api-rate-limit`; [demo mobile](evidence/polish-3/live-demo/screenshot-mobile.png); clean claims 26/26. |
| F-1-7 | Retained distinct titles for all three sample-source deep links. | `@claim:sample-sources`; [root mobile](evidence/polish-3/live/screenshot-mobile.png); live `/sample-sources/northstar-orders` title verified in browser QA. |
| F-1-8 | Retained `/snapshot` and `/demo/snapshot` sitemap entries and noindex transient routes. | Static-response regression; [expiry selector](evidence/polish-3/live/expiry-options-mobile.png); live `/snapshot` returns 200 with its title/canonical. |
| F-1-9 | Retained the full styled 404 shell, metadata, legal links, and HTTP 404 response. | Static-response and axe regressions; [404 mobile](evidence/polish-3/live/404-mobile.png); live `/not-a-route` returns 404 with one h1/main. |
| F-1-10 | Kept “approved reading” in place of “governed.” | Copy audit; [root mobile](evidence/polish-3/live/screenshot-mobile.png); live `/` checked cold. |
| F-1-11 | Kept “answer copy” in place of “support-ready.” | Copy audit; [root mobile](evidence/polish-3/live/screenshot-mobile.png); live `/` checked cold. |
| F-1-12 | Kept the explicit preview heading. | Copy audit; [root mobile](evidence/polish-3/live/screenshot-mobile.png); live `/` checked cold. |
| F-1-13 | Kept dated-copy and explicit hidden-field wording. | `@claim:answer-copy-download`, `@claim:share-redaction`; [expiry selector](evidence/polish-3/live/expiry-options-mobile.png); live demo sharing flow passed. |
| F-1-14 | Kept “question book” as the collection term everywhere. | Copy audit/search; [root mobile](evidence/polish-3/live/screenshot-mobile.png); live `/book` title verified. |
| F-1-15 | Kept “Three steps to keep answers current.” | Copy audit; [root mobile](evidence/polish-3/live/screenshot-mobile.png); live `/` checked cold. |
| F-1-16 | Kept “What the question book does not do.” | `@claim:local-browser`; [root mobile](evidence/polish-3/live/screenshot-mobile.png); live `/` checked cold. |
| F-1-17 | Kept browser-storage wording without “local-first.” | README audit; [root mobile](evidence/polish-3/live/screenshot-mobile.png); live local-storage boundary passed. |
| F-1-18 | Kept the user-visible offline result, not implementation jargon. | `@claim:offline-reload`; [demo mobile](evidence/polish-3/live-demo/screenshot-mobile.png); direct live demo opens and local offline regression passed. |
| F-1-19 | Kept the plain operator explanation of routing, 404, cache rules, and protections. | Static-response regression; [404 mobile](evidence/polish-3/live/404-mobile.png); live unknown route returns styled 404. |
| F-2-1 | Retained registered CSV schema coverage for comparisons and ISO dates. | `@claim:csv-schema`; [demo mobile](evidence/polish-3/live-demo/screenshot-mobile.png); clean claims 26/26. |
| F-2-2 | Retained plain offline sharing errors and reconnection recovery. | `@claim:offline-sharing`; [expiry selector](evidence/polish-3/live/expiry-options-mobile.png); live sharing route created successfully. |
| F-2-3 | Retained named `d_` IDs and reset/leave revocation. | `@claim:demo-controls`; [demo mobile](evidence/polish-3/live-demo/screenshot-mobile.png); three live `d_` IDs became 410 after leaving demo. |
| F-2-4 | Retained metadata minimization and immediate payload removal. | `@claim:snapshot-storage-minimization`; [expiry selector](evidence/polish-3/live/expiry-options-mobile.png); live expiring-link creation passed. |
| F-2-5 | Retained the separately tested health-route limit behavior. | `@claim:health-rate-limit`; [root mobile](evidence/polish-3/live/screenshot-mobile.png); live `/api/health` remains outside sharing limits. |
| F-2-6 | Retained active-workspace CSV export and duplicate-free round trip. | `@claim:question-book-export`; [demo mobile](evidence/polish-3/live-demo/screenshot-mobile.png); clean claims 26/26. |
| F-2-7 | Kept all desktop first-screen facts before the fold. | First-screen regression; [root desktop](evidence/polish-3/live/screenshot-desktop.png); live `/` cold-check passed. |
| F-2-8 | Kept the focused skip link clear of Demo navigation. | Focused-skip regression; [root mobile](evidence/polish-3/live/screenshot-mobile.png); live `/` keyboard route is intact. |
| F-2-9 | Retained “random IDs,” not “opaque answer links.” | Copy audit/search; [expiry selector](evidence/polish-3/live/expiry-options-mobile.png); live created link contains only a random `d_` ID. |
| F-2-10 | Retained “this site’s sharing service,” not API jargon. | Copy audit/search; [expiry selector](evidence/polish-3/live/expiry-options-mobile.png); live dialog shows the plain explanation. |
| F-2-11 | Retained “random ID,” not “opaque token.” | `@claim:expiring-share`; [expiry selector](evidence/polish-3/live/expiry-options-mobile.png); live URL contains no answer data. |
| F-2-12 | Retained plain storage and expiry wording. | `@claim:snapshot-storage-minimization`; [expiry selector](evidence/polish-3/live/expiry-options-mobile.png); live sharing flow passed. |
| F-2-13 | Retained current-only migration guidance without candidate lore. | README audit; [root mobile](evidence/polish-3/live/screenshot-mobile.png); deployment at `b9866c3` completed. |
| F-3-1 | Added `share-expiry-options` and tested all advertised durations. | `@claim:share-expiry-options`; [expiry selector](evidence/polish-3/live/expiry-options-mobile.png); live sends 3600/86400/604800 and returns matching deadlines. |
| F-3-2 | Standardized all public output on “expiring link.” | `@claim:expiring-share` plus copy audit/search; [expiry selector](evidence/polish-3/live/expiry-options-mobile.png); live dialog and link label use the term. |
| F-3-3 | Rewrote browser separation without session-storage jargon. | README audit; [demo mobile](evidence/polish-3/live-demo/screenshot-mobile.png); live demo leaves real storage untouched in browser QA. |
| F-3-4 | Rewrote the limit in terms of sharing, network addresses, and the 101st request. | `@claim:api-rate-limit`, `@claim:health-rate-limit`; [root mobile](evidence/polish-3/live/screenshot-mobile.png); deployed API passed live sharing checks. |
| F-3-5 | Replaced “managed functions” with “server functions.” | README audit; [root mobile](evidence/polish-3/live/screenshot-mobile.png); deployment uploaded `dist/` with `api/`. |
| F-3-6 | Replaced “first-party” with the service-owned approved Azure Storage account. | README audit; [root mobile](evidence/polish-3/live/screenshot-mobile.png); live create/read/revoke flow passed. |
| F-3-7 | Replaced “parity checks” with the exact build-identity result. | API health test; [root mobile](evidence/polish-3/live/screenshot-mobile.png); live deployment completed from `b9866c3`. |

## Final result

There are no unresolved blocking, major, or minor findings. The direct demo URL, legal routes, deep links, static 404, metadata, focus behavior, mobile layout, privacy boundary, offline behavior, and product-specific instrument-panel identity remain intact on the live deployment.
