# Perfection loop polish 5

Work order: `telemetry-question-book-polish-5`  
Review source: `c90a04aee478368a5e1ee6eef8a955d38d0fb834`  
Repair commit and deployed build ID: `bba743887ad538ac40c7901b8741b1eba95d6b9c`  
Live URL: <https://telemetry-question-book.sociobot.in>

## Result

**PASS.** The final remaining finding, F-5-1, is fixed. Every finding in all
five reviews and every earlier polish report was rechecked as a regression.
There are no known blocking, major, or minor items left.

## Evidence key

- **Clean clone:** a fresh clone of `bba7438` at `/tmp/tqb-polish-5-clean`
  installed with `npm ci` and `npm --prefix api ci`. Every one of the 28 exact
  commands in `.factory/claims.json` passed independently. Its full suite then
  passed: 15 API tests and 33 Playwright tests; lint, typecheck, build, both
  high-severity dependency audits, and `git diff --check` passed.
- **Browser matrix:** [browser-qa-results.json](qa/browser-qa-results.json)
  covers local and live routes at 390 × 844 and 1440 × 900: title, language,
  landmark counts, alternatives, overflow, console/page errors, Axe,
  keyboard/focus, reduced motion, touch targets, and core workflows.
- **Cold live workflow:** [cold-browser-check.json](evidence/polish-5/live/cold-browser-check.json)
  covers the first screen, direct demo, demo isolation, all three expiry
  choices, revocation, offline reload, routes, 404, same-origin requests, and
  build identity. It also asserts the F-5-1 heading at the live root.
- **Screenshots:** [root phone](evidence/polish-5/live/verify-root/screenshot-mobile.png),
  [demo phone](qa/live-390-demo.png), [sharing controls](evidence/polish-5/live/share-controls-mobile.png),
  [shared answer](evidence/polish-5/live/shared-answer-mobile.png), and
  [404](evidence/polish-5/live/404-mobile.png).
- **Live verifier:** `/opt/fleet/lib/verify-url.sh` passed `/` and `/demo`;
  its root and demo reports record one h1, one main, `lang=en`, titles, image
  alternatives, labeled buttons, and zero normal-load errors.
- **Performance:** [lighthouse-summary.json](evidence/polish-5/live/lighthouse-summary.json)
  records live Performance 100 and Accessibility 100; FCP 906 ms, LCP 1.281 s,
  TBT 1 ms, CLS 0, and 61,284 transferred bytes.

## Finding closure

| Finding | Change made or retained | Evidence: test · screenshot · live check |
| --- | --- | --- |
| F-1-1 | Kept the first complete sample reading before demo controls on a phone. | `@claim:demo-sandbox` · [demo phone](qa/live-390-demo.png) · `/demo` question/value/state/freshness all fit 390 × 844. |
| F-1-2 | Kept separate demo question, preview, and share namespaces; banner remains on demo answer-copy route; exits clear only demo keys. | `@claim:demo-controls`, `@claim:answer-copy-security` · [sharing controls](evidence/polish-5/live/share-controls-mobile.png) · `/demo` → `/demo/snapshot` preserved real sentinels. |
| F-1-3 | Kept server-held, redacted, expiring, revocable links with no payload in the URL. | `@claim:expiring-share`, `@claim:share-redaction`, `@claim:share-revocation`, `@claim:snapshot-retention` · [shared answer](evidence/polish-5/live/shared-answer-mobile.png) · live `d_` link returned 410 after revocation. |
| F-1-4 | Kept the job-first headline and first-screen manual-entry/CSV boundary. | `@claim:local-browser` · [root phone](evidence/polish-5/live/verify-root/screenshot-mobile.png) · live `/` cold check. |
| F-1-5 | Kept exact owner, freshness, threshold, source name, and source URL across reload. | `@claim:card-fields` · [demo phone](qa/live-390-demo.png) · live `/demo`. |
| F-1-6 | Kept observable, result-level tests for every registered promise. | All 28 exact manifest commands · [demo phone](qa/live-390-demo.png) · clean-clone replay passed. |
| F-1-7 | Kept distinct titles for all three sample-source routes. | `@claim:sample-sources` · [demo phone](qa/live-390-demo.png) · live `/sample-sources/northstar-orders`, `/atlas-webhooks`, `/harbor-export`. |
| F-1-8 | Kept transient snapshot routes in the sitemap and marked them noindex. | `regression: static response policy has explicit routes and a CSP-safe 404` · [sharing controls](evidence/polish-5/live/share-controls-mobile.png) · live `/sitemap.xml`, `/snapshot`, `/demo/snapshot`. |
| F-1-9 | Kept full metadata/header/footer and the styled HTTP 404 shell. | static-response and Axe regressions · [404](evidence/polish-5/live/404-mobile.png) · live unknown route returns 404. |
| F-1-10 | Kept “approved reading” in place of “governed.” | `@claim:local-browser` · [root phone](evidence/polish-5/live/verify-root/screenshot-mobile.png) · live `/`. |
| F-1-11 | Kept “answer copy” in place of “support-ready.” | `@claim:answer-copy-download` · [root phone](evidence/polish-5/live/verify-root/screenshot-mobile.png) · live `/`. |
| F-1-12 | Kept “Check the latest approved readings” as the preview heading. | `@claim:card-fields` · [root phone](evidence/polish-5/live/verify-root/screenshot-mobile.png) · live `/`. |
| F-1-13 | Kept dated-copy wording and named the hideable owner, source, and note fields. | `@claim:answer-copy-download`, `@claim:share-redaction` · [sharing controls](evidence/polish-5/live/share-controls-mobile.png) · live `/demo/snapshot`. |
| F-1-14 | Kept “question book” as the collection term throughout. | route-title regression and copy audit · [root phone](evidence/polish-5/live/verify-root/screenshot-mobile.png) · live `/book`. |
| F-1-15 | Kept “Three steps to keep answers current.” | first-screen regression and copy audit · [root phone](evidence/polish-5/live/verify-root/screenshot-mobile.png) · live `/`. |
| F-1-16 | Replaced the metaphorical limits heading with the self-contained “What the question book does not do.” | `regression: the limits section names its boundary in the heading list` · [root phone](evidence/polish-5/live/verify-root/screenshot-mobile.png) · live `/` heading assertion. |
| F-1-17 | Kept browser-storage wording without “local-first.” | `@claim:local-browser` and copy audit · [root phone](evidence/polish-5/live/verify-root/screenshot-mobile.png) · live `/privacy`. |
| F-1-18 | Kept the specific offline result rather than service-worker jargon. | `@claim:offline-reload` · [demo phone](qa/live-390-demo.png) · live `/demo` reloads offline with three cards. |
| F-1-19 | Kept concrete routing, 404, cache, and browser-protection documentation. | static-response regression · [404](evidence/polish-5/live/404-mobile.png) · live 404/security route checks. |
| F-2-1 | Kept registered CSV comparison and ISO-date validation. | `@claim:csv-schema` · [demo phone](qa/live-390-demo.png) · live `/demo` import workflow. |
| F-2-2 | Kept plain offline sharing errors and reconnection recovery. | `@claim:offline-sharing` · [sharing controls](evidence/polish-5/live/share-controls-mobile.png) · live offline/reconnect workflow. |
| F-2-3 | Kept demo `d_` IDs and reset/leave automatic revocation. | `@claim:demo-controls` · [sharing controls](evidence/polish-5/live/share-controls-mobile.png) · live `d_` links become 410. |
| F-2-4 | Kept minimal sharing metadata and immediate answer deletion on revocation. | `@claim:snapshot-storage-minimization` · [shared answer](evidence/polish-5/live/shared-answer-mobile.png) · live create/read/revoke. |
| F-2-5 | Kept the health route outside the sharing limit. | `@claim:health-rate-limit` · [root phone](evidence/polish-5/live/verify-root/screenshot-mobile.png) · live `/api/health` after limit probe. |
| F-2-6 | Kept active-workspace CSV export and duplicate-free round trip. | `@claim:question-book-export` · [demo phone](qa/live-390-demo.png) · live `/demo` export action. |
| F-2-7 | Kept all three first-screen facts inside desktop and phone viewports. | `regression: the complete first-screen facts fit phone and desktop viewports` · [root phone](evidence/polish-5/live/verify-root/screenshot-mobile.png) · live 390/1440 bounds. |
| F-2-8 | Kept a focused skip link clear of demo navigation. | `regression: a focused mobile skip link does not block Demo navigation` · [root phone](evidence/polish-5/live/verify-root/screenshot-mobile.png) · live keyboard path reaches `/demo`. |
| F-2-9 | Kept “random ID” instead of opaque-link jargon. | `@claim:expiring-share` and copy audit · [sharing controls](evidence/polish-5/live/share-controls-mobile.png) · live `d_` URL has no answer data. |
| F-2-10 | Kept “this site’s sharing service” instead of API jargon. | `@claim:offline-sharing` and copy audit · [sharing controls](evidence/polish-5/live/share-controls-mobile.png) · live `/demo/snapshot`. |
| F-2-11 | Kept “random ID, not the answer.” | `@claim:expiring-share` · [shared answer](evidence/polish-5/live/shared-answer-mobile.png) · live share URL. |
| F-2-12 | Kept user-facing storage/expiry wording without queue/table/TTL jargon. | `@claim:snapshot-storage-minimization` and copy audit · [sharing controls](evidence/polish-5/live/share-controls-mobile.png) · live sharing workflow. |
| F-2-13 | Kept only current migration guidance, without candidate-history instructions. | `@claim:legacy-migration` and README audit · [root phone](evidence/polish-5/live/verify-root/screenshot-mobile.png) · live API storage health. |
| F-3-1 | Kept all three exact, tested expiry choices. | `@claim:share-expiry-options` · [sharing controls](evidence/polish-5/live/share-controls-mobile.png) · live 3600/86400/604800-second requests and matching deadlines. |
| F-3-2 | Standardized public output on “expiring link.” | `@claim:expiring-share` and copy audit · [sharing controls](evidence/polish-5/live/share-controls-mobile.png) · live share UI. |
| F-3-3 | Kept browser-separation language without session-storage jargon. | `@claim:answer-copy-security` and README audit · [demo phone](qa/live-390-demo.png) · live demo isolation. |
| F-3-4 | Kept concrete sharing-limit wording. | `@claim:api-rate-limit`, `@claim:health-rate-limit` · [sharing controls](evidence/polish-5/live/share-controls-mobile.png) · deployment verifies the live 100-request boundary. |
| F-3-5 | Kept “server functions” for the API deployment artifact. | `@claim:deploy-integrity` and README audit · [root phone](evidence/polish-5/live/verify-root/screenshot-mobile.png) · deployed `dist/` and `api/`. |
| F-3-6 | Kept service-owned Azure Storage wording. | `@claim:snapshot-retention` and README audit · [shared answer](evidence/polish-5/live/shared-answer-mobile.png) · live persisted share lifecycle. |
| F-3-7 | Kept concrete post-deploy build-ID verification. | `@claim:deploy-integrity` · [root phone](evidence/polish-5/live/verify-root/screenshot-mobile.png) · `/api/health` reports `bba7438…`. |
| F-4-1 | Kept “Question cards stay in this browser,” which matches the normal local workflow. | `@claim:local-browser` · [root phone](evidence/polish-5/live/verify-root/screenshot-mobile.png) · cold live requests stay same-origin. |
| F-4-2 | Kept “Saved questions reopen offline after one online visit.” | `@claim:offline-reload`, `@claim:offline-sharing` · [demo phone](qa/live-390-demo.png) · live offline reload and connection warning. |
| F-4-3 | Kept observable deployment instructions. | `@claim:deploy-integrity` and README audit · [root phone](evidence/polish-5/live/verify-root/screenshot-mobile.png) · deployed build ID/limit verification. |
| F-4-4 | Kept deployment-integrity and legacy-migration claims in the manifest with tagged tests. | `@claim:deploy-integrity`, `@claim:legacy-migration` · [root phone](evidence/polish-5/live/verify-root/screenshot-mobile.png) · clean-clone claim replay. |
| F-5-1 | Removed the decorative eyebrow and made the limits `h2` a concrete section name. | `regression: the limits section names its boundary in the heading list` · [root phone](evidence/polish-5/live/verify-root/screenshot-mobile.png) · fresh live root assertion passed. |

## Final live recheck

After deploying, a fresh production context opened the root and `/demo` cold.
The root had no storage, no normal-load error, only same-origin requests, and
the corrected heading. `/demo` opened directly and through `?demo=1`, retained
the persistent demo banner, showed the first realistic reading before the fold,
preserved real sentinels, cleared demo keys on exit, and reopened offline.
Every audited route had the expected title, one h1/main, and zero serious or
critical Axe violations. The designed unknown-route response remained HTTP 404.
