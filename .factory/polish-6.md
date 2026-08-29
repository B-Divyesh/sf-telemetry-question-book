# Perfection loop polish 6

Work order: `telemetry-question-book-polish-6`  
Review source: `38450b34e9117416ab64875663481f02d375986e`  
Functional repair: `296c06d`  
Live URL: <https://telemetry-question-book.sociobot.in>

## Result

**PASS.** Review 6 reopened F-1-6 because five tagged tests did not prove
their complete registered promises. Those tests now cover every omitted
branch and field. Every finding from reviews 1–6 and each pre-ID verification
finding was rechecked. No blocking, major, or minor item remains.

## Evidence key

- [clean verification](evidence/polish-6/clean-verification.txt): fresh clone,
  28/28 literal claim commands, 15 API tests, 33 Playwright tests, repository
  gates, bundle sizes, and local Lighthouse results.
- [root phone](evidence/polish-6/live/root/screenshot-mobile.png) and
  [demo phone](evidence/polish-6/live/demo/screenshot-mobile.png): cold live
  first screens at 390 × 844.
- [sharing controls](evidence/polish-6/live/browser/share-controls-mobile.png),
  [shared answer](evidence/polish-6/live/browser/shared-answer-mobile.png), and
  [404](evidence/polish-6/live/browser/404-mobile.png): live product workflows.
- [cold browser check](evidence/polish-6/live/browser/cold-browser-check.json):
  first-screen bounds, isolated demo, expiry choices, revocation, offline
  reload, route titles, 404, request origins, and deployed health.
- [browser matrix](qa/browser-qa-results.json): local and live desktop/mobile
  routes, Axe, overflow, keyboard/focus, reduced motion, touch targets, and
  end-to-end workflows.
- [live Lighthouse](evidence/polish-6/live/lighthouse.json): Performance 100,
  Accessibility 100, Best Practices 100, SEO 100; LCP 1.210 s and CLS 0.

## Finding closure

Every evidence cell names a test, a screenshot path, and the live URL check.

| Finding | Change made or retained | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the first full sample reading above phone controls. | `@claim:demo-sandbox` · [demo phone](evidence/polish-6/live/demo/screenshot-mobile.png) · live `/demo` question/value/state/freshness end by 793 px. |
| F-1-2 | Kept separate demo question, preview, and share storage; both exits clear demo keys only. | `@claim:demo-controls`, `@claim:answer-copy-security` · [sharing controls](evidence/polish-6/live/browser/share-controls-mobile.png) · live `/demo/snapshot` preserved exact real sentinels. |
| F-1-3 | Kept server-held random-ID links with redaction, expiry, and immediate revocation. | `@claim:expiring-share`, `@claim:share-redaction`, `@claim:share-revocation` · [shared answer](evidence/polish-6/live/browser/shared-answer-mobile.png) · live `/s/d_*` returned 200, then 410. |
| F-1-4 | Kept the job-first headline plus manual entry/CSV and no-query boundary on the first screen. | `@claim:local-browser`, first-screen regression · [root phone](evidence/polish-6/live/root/screenshot-mobile.png) · live `/`. |
| F-1-5 | Kept exact owner, freshness, threshold, source name, and source URL checks across reload. | `@claim:card-fields` · [demo phone](evidence/polish-6/live/demo/screenshot-mobile.png) · live `/demo`. |
| F-1-6 | Added Reset-path link creation/revocation and exact storage checks; successful CSV 10,080 import; exact template rows; real-preview sentinel comparison; and exact downloaded answer fields/timestamps. | All 28 literal claim commands, especially `@claim:demo-controls`, `@claim:csv-validation`, `@claim:csv-template`, `@claim:answer-copy-security`, `@claim:answer-copy-download` · [sharing controls](evidence/polish-6/live/browser/share-controls-mobile.png) · live `/demo` and `/demo/snapshot`. |
| F-1-7 | Kept a distinct title for each sample-source route. | `@claim:sample-sources` · [demo phone](evidence/polish-6/live/demo/screenshot-mobile.png) · live `/sample-sources/northstar-orders`, `/atlas-webhooks`, `/harbor-export`. |
| F-1-8 | Kept transient snapshot routes in the sitemap and marked them noindex. | static-response/metadata regressions · [sharing controls](evidence/polish-6/live/browser/share-controls-mobile.png) · live `/sitemap.xml`, `/snapshot`, `/demo/snapshot`. |
| F-1-9 | Kept the complete product shell, metadata, legal links, and instrument-panel treatment on the HTTP 404. | static-response and Axe regressions · [404](evidence/polish-6/live/browser/404-mobile.png) · live unknown route returned 404. |
| F-1-10 | Kept “approved reading,” with no “governed” jargon. | `@claim:local-browser`, copy audit · [root phone](evidence/polish-6/live/root/screenshot-mobile.png) · live `/`. |
| F-1-11 | Kept “answer copy,” with no unsupported “support-ready” wording. | `@claim:answer-copy-download`, copy audit · [root phone](evidence/polish-6/live/root/screenshot-mobile.png) · live `/`. |
| F-1-12 | Kept “Check the latest approved readings” as the preview heading. | `@claim:card-fields`, heading regression · [root phone](evidence/polish-6/live/root/screenshot-mobile.png) · live `/`. |
| F-1-13 | Kept dated-copy wording and named owner, source, and note as hideable fields. | `@claim:answer-copy-download`, `@claim:share-redaction` · [sharing controls](evidence/polish-6/live/browser/share-controls-mobile.png) · live `/demo/snapshot`. |
| F-1-14 | Kept “question book” as the collection term everywhere. | route-title regression, copy audit · [root phone](evidence/polish-6/live/root/screenshot-mobile.png) · live `/book`. |
| F-1-15 | Kept “Three steps to keep answers current.” | first-screen/copy regressions · [root phone](evidence/polish-6/live/root/screenshot-mobile.png) · live `/`. |
| F-1-16 | Kept the concrete h2 “What the question book does not do.” | limits-heading regression · [root phone](evidence/polish-6/live/root/screenshot-mobile.png) · live `/`. |
| F-1-17 | Kept browser-storage wording without “local-first.” | `@claim:local-browser`, copy audit · [root phone](evidence/polish-6/live/root/screenshot-mobile.png) · live `/privacy`. |
| F-1-18 | Kept the visible offline result without service-worker jargon. | `@claim:offline-reload` · [demo phone](evidence/polish-6/live/demo/screenshot-mobile.png) · live `/demo` reopened offline with three cards. |
| F-1-19 | Kept concrete routing, styled 404, cache, and browser-protection documentation. | static-response regression · [404](evidence/polish-6/live/browser/404-mobile.png) · live `/not-a-route`. |
| F-2-1 | Kept registered CSV comparison and strict ISO-date validation. | `@claim:csv-schema` · [demo phone](evidence/polish-6/live/demo/screenshot-mobile.png) · live `/demo`. |
| F-2-2 | Kept plain offline sharing errors and reconnection recovery. | `@claim:offline-sharing` · [sharing controls](evidence/polish-6/live/browser/share-controls-mobile.png) · live `/demo/snapshot`. |
| F-2-3 | Both Reset demo and Start for real now independently prove `d_` link revocation and prefix-wide cleanup. | `@claim:demo-controls` · [sharing controls](evidence/polish-6/live/browser/share-controls-mobile.png) · live demo links returned 410 after exit. |
| F-2-4 | Kept exact metadata minimization and immediate stored-answer deletion. | `@claim:snapshot-storage-minimization` · [shared answer](evidence/polish-6/live/browser/shared-answer-mobile.png) · live create/read/revoke. |
| F-2-5 | Kept the read-only health route outside sharing limits. | `@claim:health-rate-limit` · [root phone](evidence/polish-6/live/root/screenshot-mobile.png) · live `/api/health` returned 200. |
| F-2-6 | Kept active-workspace CSV export and duplicate-free round trip. | `@claim:question-book-export` · [demo phone](evidence/polish-6/live/demo/screenshot-mobile.png) · live `/demo`. |
| F-2-7 | Kept all three facts within phone and desktop first screens. | first-screen viewport regression · [root phone](evidence/polish-6/live/root/screenshot-mobile.png) · live facts ended by 807 px at 390 × 844. |
| F-2-8 | Kept the focused skip link below the header and clear of Demo navigation. | focused-skip regression · [root phone](evidence/polish-6/live/root/screenshot-mobile.png) · live keyboard/pointer `/` → `/demo`. |
| F-2-9 | Kept “random IDs” instead of “opaque links.” | `@claim:expiring-share`, copy audit · [sharing controls](evidence/polish-6/live/browser/share-controls-mobile.png) · live `/s/d_*`. |
| F-2-10 | Kept “this site’s sharing service” instead of API jargon. | `@claim:offline-sharing`, copy audit · [sharing controls](evidence/polish-6/live/browser/share-controls-mobile.png) · live `/demo/snapshot`. |
| F-2-11 | Kept “random ID, not the answer.” | `@claim:expiring-share` · [shared answer](evidence/polish-6/live/browser/shared-answer-mobile.png) · live share URL contained no answer data. |
| F-2-12 | Kept sharing copy in answer/link/expiry terms without queue/table/TTL jargon. | `@claim:snapshot-storage-minimization`, copy audit · [sharing controls](evidence/polish-6/live/browser/share-controls-mobile.png) · live sharing flow. |
| F-2-13 | Kept only the current pre-1.2.0 migration condition. | `@claim:legacy-migration` · [root phone](evidence/polish-6/live/root/screenshot-mobile.png) · live `/api/health`. |
| F-3-1 | Kept all three exact expiry choices registered and measured. | `@claim:share-expiry-options` · [sharing controls](evidence/polish-6/live/browser/share-controls-mobile.png) · live requests used 3,600/86,400/604,800 seconds. |
| F-3-2 | Kept “expiring link” as the single public term. | `@claim:expiring-share`, copy audit · [sharing controls](evidence/polish-6/live/browser/share-controls-mobile.png) · live `/demo/snapshot`. |
| F-3-3 | The security test now pre-seeds and compares the real preview while the demo preview uses its own key. | `@claim:answer-copy-security` · [demo phone](evidence/polish-6/live/demo/screenshot-mobile.png) · live `/demo/snapshot`. |
| F-3-4 | Kept the limit in terms of sharing, network addresses, request 101, 429, and Retry-After. | `@claim:api-rate-limit`, `@claim:health-rate-limit` · [sharing controls](evidence/polish-6/live/browser/share-controls-mobile.png) · live deployment probe. |
| F-3-5 | Kept “server functions” as the deployment artifact name. | `@claim:deploy-integrity`, README audit · [root phone](evidence/polish-6/live/root/screenshot-mobile.png) · live static/API deployment. |
| F-3-6 | Kept service-owned Azure Storage wording without “first-party.” | `@claim:snapshot-retention`, README audit · [shared answer](evidence/polish-6/live/browser/shared-answer-mobile.png) · live `/api/health`. |
| F-3-7 | Kept concrete static/API build-ID comparison after deployment. | `@claim:deploy-integrity` · [root phone](evidence/polish-6/live/root/screenshot-mobile.png) · live `/build-info.json` and `/api/health` matched. |
| F-4-1 | Kept the scoped fact “Question cards stay in this browser.” | `@claim:local-browser` · [root phone](evidence/polish-6/live/root/screenshot-mobile.png) · cold live `/` used only the product origin. |
| F-4-2 | Kept “Saved questions reopen offline after one online visit.” | `@claim:offline-reload`, `@claim:offline-sharing` · [root phone](evidence/polish-6/live/root/screenshot-mobile.png) · live offline `/demo`. |
| F-4-3 | Kept observable deployment wording: build, commit stamp, static/API comparison, and forged-header check. | `@claim:deploy-integrity`, README audit · [root phone](evidence/polish-6/live/root/screenshot-mobile.png) · live deploy verifier. |
| F-4-4 | Kept deployment integrity and legacy migration in the manifest with exact tagged commands. | `@claim:deploy-integrity`, `@claim:legacy-migration` · [root phone](evidence/polish-6/live/root/screenshot-mobile.png) · live `/api/health`. |
| F-5-1 | Kept the limits h2 as the self-contained section name, with no metaphorical replacement. | limits-heading regression · [root phone](evidence/polish-6/live/root/screenshot-mobile.png) · live `/`. |

## Pre-ID verification findings

| Earlier finding | Change retained | Evidence |
| --- | --- | --- |
| Snapshot expiry and integrity were client-only | Server-held random-ID links enforce expiry, tamper rejection, redaction, and revocation. | `@claim:expiring-share`, `@claim:snapshot-retention` · [shared answer](evidence/polish-6/live/browser/shared-answer-mobile.png) · live `/s/d_*`. |
| Recurring readings could not update | Updating changes one card and survives reload. | `@claim:question-update` · [demo phone](evidence/polish-6/live/demo/screenshot-mobile.png) · live `/demo`. |
| An unavailable paid checkout was advertised | The product remains free with no purchase flow. | `@claim:free-core` · [root phone](evidence/polish-6/live/root/screenshot-mobile.png) · live `/`. |
| Claim inventory was incomplete | All 28 manifest IDs have exactly one result-level tagged test. | 28/28 clean commands · [root phone](evidence/polish-6/live/root/screenshot-mobile.png) · live claim workflows. |
| Demo sources were dead | All three local source routes return 200 with distinct titles. | `@claim:sample-sources` · [demo phone](evidence/polish-6/live/demo/screenshot-mobile.png) · live `/sample-sources/*`. |
| CSV could bypass form validation | Shared validation rejects malformed fields, URLs, numbers, comparisons, and dates; both valid endpoints pass. | `@claim:csv-validation`, `@claim:csv-schema` · [demo phone](evidence/polish-6/live/demo/screenshot-mobile.png) · live `/demo`. |
| Touch targets were too small | Visible phone controls remain at least 44 px. | mobile-target regression · [demo phone](evidence/polish-6/live/demo/screenshot-mobile.png) · live 390 px routes. |
| Focus contrast was too low | Designed 3 px light/dark focus ring remains visible. | keyboard/focus regressions · [root phone](evidence/polish-6/live/root/screenshot-mobile.png) · live keyboard `/`. |
| 404 inline styles violated CSP | The 404 uses external CSS and the response CSP has no inline exception. | static-response regression · [404](evidence/polish-6/live/browser/404-mobile.png) · live unknown route. |
| Vite had a high-severity advisory | Vite remains 7.3.6; root and API audits report zero vulnerabilities. | clean audit gates · [root phone](evidence/polish-6/live/root/screenshot-mobile.png) · live `/`. |
| Unknown routes returned 200 | Unknown routes return the styled document with HTTP 404. | static-response regression · [404](evidence/polish-6/live/browser/404-mobile.png) · live `/not-a-route`. |
| Non-hashed art was immutable | Hashed assets are immutable; named art revalidates daily. | static-response/cache regression · [root phone](evidence/polish-6/live/root/screenshot-mobile.png) · live asset headers. |
| Comparison text repeated “at” | Cards say “Passes when at least/at most/exactly.” | `@claim:card-fields` · [demo phone](evidence/polish-6/live/demo/screenshot-mobile.png) · live `/demo`. |
| Demo count was hard-coded | The count follows the active demo array. | `@claim:demo-sandbox`, `@claim:demo-controls` · [demo phone](evidence/polish-6/live/demo/screenshot-mobile.png) · live reset `/demo`. |
| Caller headers could split rate limits | Only the platform-appended forwarding hop identifies the network address. | `@claim:api-rate-limit`, `@claim:deploy-integrity` · [sharing controls](evidence/polish-6/live/browser/share-controls-mobile.png) · live 101-request probe. |
| Static and API identities could diverge | Deployment stamps and checks both artifacts against one full commit. | `@claim:deploy-integrity` · [root phone](evidence/polish-6/live/root/screenshot-mobile.png) · live `/build-info.json` and `/api/health`. |
| Dialog focus could escape | Forward and reverse Tab wrap inside the dialog and Escape restores the opener. | dialog-focus regressions · [sharing controls](evidence/polish-6/live/browser/share-controls-mobile.png) · live `/demo`. |
| Paper texture reduced button contrast | Black switch text remains above AA and live Axe finds no serious/critical issue. | desktop/mobile Axe regression · [sharing controls](evidence/polish-6/live/browser/share-controls-mobile.png) · live `/demo/snapshot`. |

## Verification summary

- Clean clone at `296c06d`: 28/28 literal claim commands passed.
- Full clean suite: 15 API and 33 Playwright tests passed.
- Lint, typecheck, build, full/production/API audits, and `git diff --check` passed.
- Live route matrix: 16 local and 16 production route/viewport scans passed;
  expected 404 network diagnostics are the only console entries.
- Live cold flow: direct `?demo=1`, Reset, Start for real, three expiry choices,
  revocation, offline reload, all titles, legal routes, and styled 404 passed.
- No AI feature was added: the brief prohibits generated explanations, and the
  existing import/export/share workflow covers the implied job.
