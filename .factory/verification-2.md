# Independent product verification 2 — PASS

## Decision

**PASS — candidate `4e8e5855133db880aa3a37489e29f12d3dfcf01a` is acceptable for release.**

- Repository/branch: `B-Divyesh/sf-telemetry-question-book`, `main`
- Candidate checked out before testing: `4e8e5855133db880aa3a37489e29f12d3dfcf01a`
- Production URL: <https://telemetry-question-book.sociobot.in>
- Verified: 2026-08-28 UTC
- Environment: Node 22.23.2, npm 10.9.8, Playwright 1.58.2 / Chromium 1208, Lighthouse 12.8.2
- Product source was not changed. This report and the handoff update are the only committed changes.

The deployed public artifact matches the candidate build byte-for-byte, all required claim tests pass from the demo entry point, and fresh live browser evidence meets the brief's static, local-first, governed-question workflow.

## Mandatory first-read and demo gate

**PASS.** A cold desktop browser reported the first screen as:

- Does: “Answer recurring telemetry questions safely.”
- For whom: “For support teams who need current answers without broad dashboard access.”
- First action: “Try it with sample data” followed by “Opens a filled question book in one click.”

That link opened `/demo`, showed the persistent “Demo — sample data, nothing is saved” banner, and rendered three realistic question cards. The same headline, audience sentence, and one-click demo action are in the initial 390 × 844 viewport.

## Required claims gate

`.factory/claims.json` exists with 14 entries. From a clean `npm ci` install, I ran every exact declared command (`npm test -- --grep @claim:<id>`) independently. All passed. A fresh unfiltered `npm test` then passed all 19 Playwright tests; its 14 claim cases were:

| Claim ID | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `demo-controls` | PASS |
| `local-browser` | PASS |
| `free-core` | PASS |
| `threshold-states` | PASS |
| `offline-reload` | PASS |
| `question-update` | PASS |
| `csv-import` | PASS |
| `csv-validation` | PASS |
| `csv-template` | PASS |
| `answer-copy-security` | PASS |
| `answer-copy-download` | PASS |
| `least-privilege-input` | PASS |
| `sample-sources` | PASS |

The claim tests use fresh browser contexts and the `/demo` entry point. They assert observable outcomes, including three isolated sample cards, separate real/demo keys, threshold states, offline reload, duplicate-free update/import, validation recovery, CSV/JSON downloads, URL-free redacted answer-copy previews, and working local sample-source pages.

## Build and code-quality evidence

- `npm ci`: PASS (105 packages installed; lockfile unchanged).
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm test`: PASS, 19/19.
- `npm run build`: PASS; `dist/index.html` produced.
- `npm audit --audit-level=high`: PASS, 0 vulnerabilities.
- `npm audit --omit=dev --audit-level=high`: PASS, 0 vulnerabilities.

Build budget evidence: initial JS is 27,264 bytes / 9,201 bytes gzip; CSS is 15,807 bytes / 4,572 bytes gzip; no web fonts are shipped. The mobile hero is 42,650 bytes and the largest hero asset is 108,344 bytes. These are within the static-web budgets.

## Fresh live product evidence

On the live deployment, in a new browser context:

- `/demo` began with three cards. Updating a reading to `1,900` retained exactly three cards.
- A default answer copy went to `/snapshot`, hid owner/source/note, kept data out of the URL, and downloaded as `telemetry-answer-copy.json`.
- Invalid CSV with blank required fields and `freshMinutes=10081` showed `Row 2 needs question.` and did not change the cards. A corrected upload succeeds in the automated claim flow.
- A real-book form accepted zero value, zero threshold, `Value equals`, and a one-minute freshness limit as an “On track” reading. An HTTP source URL was rejected by native constraint validation without adding a card; correcting it to HTTPS saved the card.
- `Tab` first focused the visible skip link. Mobile measured home, Demo, Privacy, and Terms controls at least 44 px in both dimensions. No horizontal overflow occurred at 390 px.
- Reduced-motion browser styles yielded `0.00001s` transition durations for the answer-copy dialog and action control.
- The service worker activated `tqb-shell-v3`, had no waiting update after `registration.update()`, and a visited demo reloaded offline with three cards and the offline notice.

Accessibility scans with axe had zero serious or critical violations on `/`, `/demo`, `/book`, `/privacy`, `/terms`, `/snapshot`, and `/not-a-route`, at 1440 × 900 and 390 × 844. `/opt/fleet/lib/verify-url.sh` also passed against the live root: HTTP 200; title; `lang=en`; one `h1`; `main`; alt coverage; labeled buttons; and no console/page errors in normal load.

A live mobile Lighthouse run scored Performance **100**, Accessibility **100**, Best Practices **100**, and SEO **100**. FCP was 0.9 s, LCP 1.2 s, CLS 0, and TBT 0 ms.

## Privacy, security, routes, and deployment parity

- Normal landing, demo, edit, answer-copy, and form flows made requests only to `https://telemetry-question-book.sociobot.in`. No analytics, third-party fonts, scripts, account service, or telemetry ingestion was observed.
- Real questions use `tqb:v1`, demo questions `demo:tqb:v1`, and answer-copy preview `tqb:snapshot-preview` in session storage. The demo controls reset/delete demo storage without changing real storage.
- The product is wholly static and exposes no server/API or product-unlock endpoint, so rate-limit and Entra sign-in checks are not applicable.
- All internal links on all application routes returned 200; external `https://sociobot.in/` returned 200; mail links are explicit. The three demo source pages are same-origin and return 200.
- `/`, `/demo`, `/book`, `/privacy`, `/terms`, `/snapshot`, and all sample-source routes return 200. Unknown route and missing asset requests return the designed HTTP 404. A browser naturally logs a failed-resource message when intentionally navigating to a 404; normal routes have no errors.
- Live headers include HSTS, `nosniff`, strict-origin referrer policy, camera/microphone/geolocation denial, and a same-origin CSP without `unsafe-inline`. HTML and service worker revalidate after 30 seconds; hashed JS/CSS are immutable for one year; non-hashed art revalidates daily.
- SHA-256 values match between local `dist` and live production for all 14 served artifacts: HTML, JS/CSS, 404 HTML/CSS, service worker, manifest, robots, sitemap, favicon, Apple touch icon, and three WebP assets. `staticwebapp.config.json` is deployment configuration and is correctly not served as a public artifact.

## Brief-fit assessment

The live product delivers the researched job: support/engineering pairs can save governed recurring questions with owner, freshness, threshold, and an approved HTTPS read-only source; update them without duplication; import approved CSV exports; and export a redacted, point-in-time answer copy. It expressly does not ingest telemetry, generate queries, expose credentials, or alert.

An enforceably expiring recipient-access link is impossible in a fully static local-first app without a trusted service. Rather than make a false expiry claim, this candidate defaults to redaction, retains previews only in session storage, removes answer data from URLs, and warns that downloaded JSON has no expiry or access control. This is the documented closest honest static implementation and does not make an untested privacy promise.

## Defects by severity

No release-blocking, high, medium, or low defects found in this independent verification.

## Release recommendation

Release candidate `4e8e5855133db880aa3a37489e29f12d3dfcf01a`.
