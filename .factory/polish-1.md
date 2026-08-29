# Perfection loop polish 1

Work order: `telemetry-question-book-polish-1`  
Live product: <https://telemetry-question-book.sociobot.in>  
Checked: 29 August 2026 UTC

## Finding closure

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Reordered the demo on phones so current answers precede controls and tightened the heading. The first card’s question, value, state, and freshness now end at 763 px on a 390 × 844 viewport. | `@claim:demo-sandbox`; [live-demo-mobile.png](evidence/polish-1/live-demo-mobile.png); cold live `/?demo=1` bounds: 588–763 px. |
| F-1-2 | Added `demo:tqb:snapshot-preview`, `/demo/snapshot`, a sticky banner, prefix-wide demo cleanup, real-key sentinels, and demo-link revocation. | `@claim:demo-controls`, `@claim:answer-copy-security`; live `/demo/snapshot` retained the banner and preserved real question/preview sentinels. |
| F-1-3 | Added first-party opaque snapshot tokens, server-enforced TTL, creator revocation, payload removal, and `/s/<token>`. Expired and revoked payloads are replaced by non-sensitive tombstones. | `@claim:expiring-share`, `@claim:share-redaction`, `@claim:share-revocation`; live create/read/expire: `201/200/410`; live create/read/revoke/read: `201/200/204/410`; direct storage checks reported `payload_retained=false` for both paths; [live-share-mobile.png](evidence/polish-1/live-share-mobile.png). |
| F-1-4 | Replaced the broad safety wording with “Track recurring answers from approved readings.” Added the manual entry/import boundary to the first screen. | `@claim:local-browser`; [landing-mobile.png](evidence/polish-1/landing-mobile.png); live title `Telemetry Question Book — track approved readings`. |
| F-1-5 | Registered `card-fields` and verify all four promised fields before and after reload. | `@claim:card-fields`. |
| F-1-6 | Tightened claims and expanded tests for realistic samples, phone visibility, CSV values 0/1/1.5/10,080/10,081, form parity, download warnings, negative capabilities, network requests, and storage. | `@claim:demo-sandbox`, `@claim:csv-validation`, `@claim:answer-copy-download`, `@claim:local-browser`; all exact commands pass independently. |
| F-1-7 | Each sample route now uses its source name in the title. | `@claim:sample-sources`; live titles: Northstar order feed, Atlas webhook queue, and Harbor daily export — each followed by the product name. |
| F-1-8 | Added `/snapshot` and `/demo/snapshot` to the sitemap. Dynamic opaque-token URLs are intentionally `noindex`. | `public/sitemap.xml`; route metadata regression test; live `/s/<token>` sets `noindex, nofollow`. |
| F-1-9 | Expanded the HTTP 404 to the standard nav/footer and added OG, Twitter, theme, favicon, and Apple metadata without changing the disconnected-console design. | Static response regression; live `/not-a-route` HTTP 404; axe serious/critical: 0 at 390 and 1440 px. |
| F-1-10 | Rewrote “One governed reading in” to “One approved reading in.” | `.factory/copy-audit.md`; live landing screenshot. |
| F-1-11 | Rewrote “support-ready” to “One answer copy out.” | `.factory/copy-audit.md`; live landing screenshot. |
| F-1-12 | Replaced the preview heading with “Check the latest approved readings.” | `.factory/copy-audit.md`; live `/`. |
| F-1-13 | Replaced “point-in-time” and “redaction” with dated-copy and explicit hide-field wording. | `@claim:answer-copy-download`, `@claim:share-redaction`; copy audit has no banned words. |
| F-1-14 | Uses “question book” consistently in nav, UI, README, titles, and demo documentation. | Route-title regression; repository search finds no “My book,” “free book,” or “real book.” |
| F-1-15 | Replaced the process jargon with “Three steps to keep answers current.” | `.factory/copy-audit.md`; live `/`. |
| F-1-16 | Replaced the contextless eyebrow with “What the question book does not do.” | `@claim:local-browser`; live `/`. |
| F-1-17 | README now explains that the browser stores the data on the device without using “local-first.” | README copy search; `.factory/copy-audit.md`. |
| F-1-18 | README now says the app caches the files needed to reopen offline. | `@claim:offline-reload`; live offline reload retained all three sample cards. |
| F-1-19 | README now explains page routing, styled 404 behavior, cache rules, browser protections, and Azure’s role in plain words. | README deployment section; static-response regression. |

## Earlier verification carry-forward

The prior verification defects remain closed: recurring updates do not duplicate cards; demo sources are local and return 200; CSV and form validation match; touch targets are at least 44 px; focus uses the high-contrast double ring; unknown paths return the styled HTTP 404; Vite is 7.3.6 with zero audit findings; non-hashed art revalidates daily; comparison copy has no duplicated “at”; and counts use the current array length. The unavailable paid offer remains removed.

## Evidence index

- First viewports: `evidence/polish-1/landing-mobile.png`, `demo-mobile.png`, `landing-desktop.png`, `demo-desktop.png`.
- Cold live viewports: `evidence/polish-1/live-demo-mobile.png`, `live-share-mobile.png`.
- URL verifier: `evidence/polish-1/live-verify/verify.json` — no console/page errors, one h1, lang, main, alt, and labels pass.
- Browser/axe matrix: `qa/browser-qa-results.json` — 16 local and 16 live route/viewport checks, zero serious/critical issues, zero overflow, zero undersized targets.
- Lighthouse: `evidence/polish-1/lighthouse-live.json` — Performance 100, Accessibility 100, Best Practices 100, SEO 100.
