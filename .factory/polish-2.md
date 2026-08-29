# Perfection loop polish 2

Work order: `telemetry-question-book-polish-2`  
Candidate repaired from: `036e7551e6b4b912d4b929560e796e3adcc50be0`  
Review source: `8eaf7af40c2ea2809a68f0941491b9ac0a00bb5d`

Final independent recheck: `a8c2ac52431198e3642d7d646b6ab37597a43afe` on 2026-08-29 UTC.

## Finding closure

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept current answers before mobile controls so the first sample reading remains in the initial demo viewport. | `@claim:demo-sandbox`; `.factory/qa/local-390-demo.png`. |
| F-1-2 | Retained separate `demo:` question, preview, TTL, and share keys; Reset and Start revoke demo links without touching real sentinels. | `@claim:demo-controls`, `@claim:answer-copy-security`. |
| F-1-3 | Retained opaque server-held shares with expiry, redaction, tamper rejection, and revocation. | `@claim:expiring-share`, `@claim:share-redaction`, `@claim:share-revocation`, `@claim:snapshot-retention`. |
| F-1-4 | Kept the direct headline and manual input/import boundary on the first screen. | `@claim:local-browser`; `.factory/qa/local-1440-landing.png`. |
| F-1-5 | Added the missing post-reload assertions for source name and exact source URL. | `@claim:card-fields`. |
| F-1-6 | Each broad claim now completes its result: both validation paths, four free workflows, a saved HTTPS link, and all three shared route handlers. | `@claim:csv-validation`, `@claim:free-core`, `@claim:least-privilege-input`, `@claim:api-rate-limit`. |
| F-1-7 | Retained distinct source-route titles. | `@claim:sample-sources`; route metadata regression. |
| F-1-8 | Retained `/snapshot` and `/demo/snapshot` in the sitemap. | `public/sitemap.xml`; static route regression. |
| F-1-9 | Retained the full instrument-panel 404 shell, metadata, legal links, icons, and HTTP 404 response. | static response regression; local route/axe matrix in `.factory/qa/browser-qa-results.json`. |
| F-1-10 | “Approved reading” remains the single plain term. | `.factory/copy-audit.md`; landing screenshots. |
| F-1-11 | “Answer copy” remains the output term. | `.factory/copy-audit.md`; landing screenshots. |
| F-1-12 | Preview heading remains “Check the latest approved readings.” | `.factory/copy-audit.md`; landing screenshots. |
| F-1-13 | Sharing copy names dated copies and the exact hidden fields. | `@claim:answer-copy-download`, `@claim:share-redaction`. |
| F-1-14 | “Question book” remains consistent across navigation, UI, and README. | repository copy search; `.factory/copy-audit.md`. |
| F-1-15 | The process label remains “Three steps to keep answers current.” | `.factory/copy-audit.md`. |
| F-1-16 | The boundary label remains “What the question book does not do.” | `@claim:local-browser`; `.factory/copy-audit.md`. |
| F-1-17 | README describes browser storage without “local-first.” | README copy audit/search. |
| F-1-18 | README describes the visible offline result instead of service-worker jargon. | `@claim:offline-reload`. |
| F-1-19 | README explains routing, the styled 404, caching, and browser protections in plain operator language. | README deployment section; static response regression. |
| F-2-1 | Registered `csv-schema`; valid `gte`, `lte`, `eq`, ISO timestamps, unknown comparison, and impossible date now have one tagged test. Strict calendar validation rejects normalized dates such as 30 February. | `@claim:csv-schema`. |
| F-2-2 | Registered and implemented plain offline errors for create/open plus recovery after reconnecting. API responses are excluded from service-worker caches. | `@claim:offline-sharing`; service-worker regression. |
| F-2-3 | Expanded `demo-controls` wording to name `d_` IDs and automatic revocation by both demo exits. | `@claim:demo-controls`; `.factory/claims.json`. |
| F-2-4 | Added an exact metadata-key assertion and immediate queue deletion assertion. Rewrote the README in user terms. | `@claim:snapshot-storage-minimization`. |
| F-2-5 | Registered the read-only health exemption and tagged its 200-request test. | `@claim:health-rate-limit`. |
| F-2-6 | Added **Export question book CSV**. It exports only the active workspace and round-trips all fields into an empty real workspace without duplicates. | `@claim:question-book-export`; `.factory/qa/local-390-demo.png`. |
| F-2-7 | Reduced the headline scale and hero gaps while preserving the console composition. All three facts now end above 900 px. | first-screen viewport regression; `.factory/qa/local-1440-landing.png`. |
| F-2-8 | Moved the revealed skip link below the header, with a lower demo-specific position, so it cannot intercept navigation or banner controls. | focused-skip hybrid-input regression; keyboard record in `.factory/qa/browser-qa-results.json`. |
| F-2-9 | Replaced “opaque answer links” with “answer links with random IDs.” | README search; `.factory/claims.json`. |
| F-2-10 | Replaced “first-party snapshot API” with “this site’s sharing service” in README and UI. | README and `src/main.ts` copy search. |
| F-2-11 | Replaced “opaque token” with “random ID, not the answer.” | README, privacy page, and `expiring-share` claim wording. |
| F-2-12 | Rewrote queue/table/TTL/hash prose as stored answer, expiry time, link details, and one-way revocation code. | README copy search; `@claim:snapshot-storage-minimization`. |
| F-2-13 | Removed candidate-specific repair lore; the README now states the only current upgrade condition for the migration command. | README deployment section. |

Every row above was also cold-checked at <https://telemetry-question-book.sociobot.in> after the final build. The live route and workflow evidence is `.factory/qa/browser-qa-results.json`; the cold landing and demo checks are `.factory/evidence/polish-2/recheck-live/verify.json` and `.factory/evidence/polish-2/recheck-demo/verify.json`. The corresponding screenshots are `.factory/qa/live-1440-landing.png`, `.factory/qa/live-390-landing.png`, `.factory/qa/live-1440-demo.png`, and `.factory/qa/live-390-demo.png`.

## Local evidence

- Clean clone `/tmp/tqb-rc-zFdFlz/repo` at `a8c2ac5`: `npm test` passed, running all 25 tagged claims, 14 API tests, and 29 Playwright tests.
- `npm run lint`, `npm run typecheck`, and `npm run build`: passed.
- Local route/axe matrix: 16 route/viewport scans, zero serious or critical violations, no valid-route console errors, and no overflow.
- URL verifier: `.factory/evidence/polish-2/local/verify.json`.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.2 s, LCP 1.5 s, TBT 10 ms, CLS 0.
- Built assets: JavaScript 35,859 bytes raw / 11.68 kB gzip; CSS 16,819 bytes raw / 4.80 kB gzip; mobile hero 42,650 bytes.
- A final full-suite rerun found the paper texture reduced one amber button to 4.07:1. Darker button text raised it above AA; the 18-route/viewport axe regression then passed.

## Live evidence

The verified deployed artifact was cold-checked at <https://telemetry-question-book.sociobot.in>.

- F-1-1, F-1-2, F-1-3, F-1-5, F-1-6, F-2-2, F-2-3, and F-2-6: `/?demo=1`, `/demo`, `/demo/snapshot`, and `/s/<demo-token>` passed. The four required first-card details ended at 630, 670, 719, and 763 px on a 390 × 844 screen. Export contained four CSV lines and no real sentinel. Start for real preserved the real sentinel, cleared all `demo:` keys, and changed the demo share response to HTTP 410.
- F-1-4, F-1-10 through F-1-16, F-2-7, and F-2-8: `/` passed. The three desktop facts ended at 650, 679, and 709 px at 1440 × 900. The focused skip link no longer intercepted Demo. Screenshots: `.factory/qa/live-1440-landing.png` and `.factory/qa/live-390-landing.png`.
- F-1-7, F-1-8, F-1-9: every fixed route had its expected title/metadata; the three source pages returned 200; `/definitely-missing-polish-2` returned the styled HTTP 404. Screenshots: `.factory/qa/live-1440-demo.png` and `.factory/qa/live-390-demo.png`.
- F-1-17 through F-1-19 and F-2-1, F-2-4, F-2-5, F-2-9 through F-2-13: deployed README/source and exact clean-clone claim tests were cross-checked against the live behavior and `/api/health` response.
- Live URL verifier: `.factory/evidence/polish-2/live/verify.json`; direct demo verifier: `.factory/evidence/polish-2/live-demo/verify.json`. Both report no console errors and valid title, language, landmark, alt text, and button labels.
- Live axe/browser matrix: `.factory/qa/browser-qa-results.json`; 16 live route/viewport scans, zero serious or critical findings, no overflow, and no valid-route console/page errors.
- Live Lighthouse: `.factory/evidence/polish-2/lighthouse-live.json`; Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.2 s, TBT 0 ms, CLS 0.
- Local and deployed hashed JS/CSS files matched byte-for-byte by SHA-256.
- Final independent recheck: local/live JS SHA-256 `d06232b52e049ba50353d4f81d535b8f14fb6b7543ceffa16e9a08ef3035504e`; CSS SHA-256 `119ab55bcf019e512ccd77b63e1dfcbfbb41f332fc052bcd57350df2a4cb3408`; HTML SHA-256 `0e5ecc579e4ddd172dd48053d54ec196460ad02af2a08b369b00f5c32f075965`.
- Final live Lighthouse: `.factory/evidence/polish-2/lighthouse-live-recheck.json`; Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.1 s, LCP 0.2 s, TBT 0 ms, CLS 0.
