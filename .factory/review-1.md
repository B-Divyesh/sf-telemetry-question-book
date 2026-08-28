# Adversarial first-read review 1 — Telemetry Question Book

**Verdict: FAIL**

Reviewed 2026-08-28 UTC against <https://telemetry-question-book.sociobot.in> from fresh Chromium contexts at 390 × 844 and 1440 × 900. Product code was not modified. Three blocking findings, four major findings, and twelve minor findings remain. All 14 declared claim commands pass, but the demo contract and parts of the claims contract are not actually covered by those passing tests.

## Cold first read

Before scrolling, my own answers were:

- **What does this do?** It keeps recurring telemetry answers as approved readings with freshness and threshold context.
- **For whom?** Support teams that need answers without broad dashboard access.
- **What should I click first?** **Try it with sample data**.

This gate passes at both sizes. The exact first-screen copy that supplied the answers was “Answer recurring telemetry questions safely,” “For support teams who need current answers without broad dashboard access,” and “Try it with sample data,” followed by “Opens a filled question book in one click.” The 390 px screen also showed all three short privacy/offline/price facts. No landing data existed in local or session storage, and the cold load made only same-origin requests.

The headline still has an honesty problem recorded as F-1-4: “safely” is broader than the tested behavior and “answer” does not say that a person must enter or import the reading.

## Findings

### Blocking

#### F-1-1 — The phone demo does not show sample data on its first screen

- **Exact location:** 390 × 844, after selecting “Try it with sample data.” The visible copy ends at “3 questions.” The first `.question-card` starts at y = 1,059 px, 215 px below the viewport.
- **Why this fails:** The required one-click demo must immediately show the product being used with realistic sample data. A phone visitor instead sees a banner, page heading, three controls, and a count. They must scroll before seeing “Did Northstar orders arrive?”, its value, owner, threshold, or freshness.
- **Concrete fix:** Compress the mobile demo heading and controls or place a compact first sample reading above the controls so one full realistic result is visible without scrolling. Add a 390 × 844 assertion that the first card’s question, reading, state, and freshness text all intersect the initial viewport.

#### F-1-2 — A demo answer copy overwrites real-session state and loses the demo warning

- **Exact location:** `/demo` → “Make answer copy” → “Review answer copy” → `/snapshot`; `src/main.ts` uses the shared key `tqb:snapshot-preview` for both modes.
- **Observed evidence:** I pre-seeded `tqb:snapshot-preview` with “REAL PREVIEW SENTINEL.” Creating a demo answer copy replaced it with “Did Northstar orders arrive?”. On `/snapshot`, the “Demo — sample data, nothing is saved” banner was absent. “Start for real” removed `demo:tqb:v1` but left the demo answer copy in `tqb:snapshot-preview`. The banner also scrolls completely out of view because it is `position: relative`.
- **Why this fails:** Demo mode changes real-session storage and stops identifying itself as demo during a core workflow. This violates the separate-namespace and persistent-banner requirements even though the real question key `tqb:v1` remained unchanged.
- **Concrete fix:** Use a demo-only preview key such as `demo:tqb:snapshot-preview`; retain demo identity on a route such as `/demo/snapshot`; keep the banner visible throughout demo routes; and make Reset demo/Start for real clear every demo local- and session-storage key without touching either real key. Extend `@claim:demo-controls` with pre-seeded real question and real preview sentinels.

#### F-1-3 — The earlier snapshot-expiry finding is only half-fixed

- **Earlier finding:** `.factory/verification.md`, “High — snapshot expiry and answer integrity are client-side illusions.” That report had no finding ID, so this round assigns F-1-3.
- **Exact current text:** README: “Downloaded files do not expire or provide access control”; answer-copy screen: “Downloaded copies do not expire and are not access controlled.”
- **Why this fails:** Removing unsigned answer data from URLs fixed the forgery/leak mechanism and the warning is honest, but the brief still requires a **shareable answer snapshot** with expiry and redaction. A downloaded JSON file is manual export, not an expiring recipient link. This is both an unfixed prior high-severity requirement and the obvious missing share step implied by the brief.
- **Concrete fix:** Add an approved first-party snapshot service that stores the reviewed, redacted payload behind an opaque token with a server-enforced TTL and deletion/revocation. Expose `/s/<token>`, keep payloads out of URLs, and give demo mode an isolated canned/ephemeral implementation. Add claim tests for expiry, tamper resistance, redaction, revocation, and demo isolation. If a trusted service is out of scope, revise the brief rather than calling the static download the requested snapshot.

### Major

#### F-1-4 — “Safely” is a broad, unlisted claim and the headline hides the manual step

- **Exact quote/location:** Landing `h1` and title: “Answer recurring telemetry questions safely.”
- **Why this fails:** `.factory/claims.json` has narrower tests for storage, links, and redaction but no testable definition of “safely.” The verb “Answer” can also imply that the app reads telemetry itself; the non-ingestion boundary appears only after scrolling.
- **Concrete rewrite:** “Track recurring telemetry answers from approved readings.” Add “Enter a reading or import an approved CSV; the app does not query dashboards” to the first screen.

#### F-1-5 — The card-content promise is not listed as a claim

- **Exact quote/location:** Landing live-preview copy: “Each question carries its owner, freshness limit, threshold, and approved source.” README: “The free book stores named questions with owners, freshness limits, thresholds, and HTTPS source links.”
- **Why this fails:** No claim entry asserts that saved/reloaded cards retain and display all four fields. `demo-sandbox` only counts three `.question-card` elements; `threshold-states` and `least-privilege-input` cover different subsets.
- **Concrete fix:** Add a `card-fields` claim and one tagged demo test that verifies the exact owner, freshness limit, threshold, and approved source before and after reload, or remove the promise.

#### F-1-6 — Several registered claims are broader than their tagged assertions

- **Exact locations:** `.factory/claims.json` and `tests/claims.spec.ts`.
- **Why this fails:** `demo-sandbox` calls the questions “realistic” but asserts only card count. `csv-validation` claims the form and CSV share the 1–10,080 whole-minute range but tests only blanks, malformed HTTPS, and 10,081; it does not exercise 0, a fraction, 1, or form parity. `answer-copy-download` claims the UI warns that files do not expire but never asserts the warning. `local-browser` names several absent capabilities while its test records only requests and two storage keys.
- **Concrete fix:** Keep each claim scoped to exactly what its one tagged test proves, or extend those tests with content assertions, all boundary values and both input paths, the visible non-expiry warning, and explicit UI/network/storage checks for each negative claim.

#### F-1-7 — Three deep-link routes share a generic title

- **Exact location:** `/sample-sources/northstar-orders`, `/sample-sources/atlas-webhooks`, and `/sample-sources/harbor-export` all set “Sample source — Telemetry Question Book.”
- **Why this fails:** The title does not identify which deep link is open, so browser history and assistive technology cannot distinguish the three pages. The route-title contract requires a title for each route.
- **Concrete fix:** Set “Northstar order feed — Telemetry Question Book,” “Atlas webhook queue — Telemetry Question Book,” and “Harbor daily export — Telemetry Question Book.”

### Minor

#### F-1-8 — The sitemap omits a real route

- **Exact location:** `public/sitemap.xml` omits `/snapshot`, although that route is declared and returns 200.
- **Why this fails:** The site-structure contract requires the sitemap to list every route.
- **Concrete fix:** Add `/snapshot`, or make it an explicitly non-indexable transient route and document the intentional exception in the structure contract.

#### F-1-9 — The HTTP 404 uses a reduced shell and incomplete metadata

- **Exact location:** an unknown URL returns `public/404.html` with only a home link in the header and only Privacy/Terms in the footer; it has no Open Graph, Twitter card, theme color, or Apple touch icon.
- **Why this fails:** It is visually on-theme and correctly returns HTTP 404, but it is not the consistent header/footer and metadata skeleton used by every other route. The footer omits the product one-liner, Param Factory link, and version/build ID.
- **Concrete fix:** Give `404.html` the same navigation, footer content, icons, theme color, and social metadata as the application shell while keeping its designed disconnected-console treatment and HTTP 404 status.

#### F-1-10 — “Governed” is unexplained landing-page jargon

- **Exact quote/location:** Hero caption: “One governed reading in.”
- **Why this fails:** A first-time visitor cannot tell what governance means here.
- **Concrete rewrite:** “One approved reading in.”

#### F-1-11 — “Support-ready” is an unsupported marketing adjective

- **Exact quote/location:** Hero caption: “One support-ready answer out.”
- **Why this fails:** It does not name what makes the answer ready.
- **Concrete rewrite:** “One answer copy out.”

#### F-1-12 — The preview heading is unclear out of context

- **Exact quote/location:** “Read the answer before the dashboard.”
- **Why this fails:** The app does not read a dashboard, and the heading does not say what appears in this section.
- **Concrete rewrite:** “Check the latest approved readings.”

#### F-1-13 — “Point-in-time” and “redaction” add avoidable jargon

- **Exact quote/location:** “Download a point-in-time answer copy with optional redaction.” The README repeats “point-in-time” and “optional redaction.”
- **Why this fails:** These terms make a simple export sound specialized.
- **Concrete rewrite:** “Download a dated answer copy. Choose whether to hide the owner, source, and note.”

#### F-1-14 — “My book” breaks the product’s own terminology

- **Exact location:** Header link “My book”; README phrases “The free book,” “the real book,” and “in the book.” Elsewhere the collection is consistently “question book.”
- **Why this fails:** “Book” alone can mean documentation or a purchased item.
- **Concrete rewrite:** Use “My question book,” “free question book,” and “real question book” throughout.

#### F-1-15 — “A small operating loop” is a contextless heading

- **Exact quote/location:** Landing eyebrow above “How the question book works.”
- **Why this fails:** It adds no information and “operating loop” is process jargon.
- **Concrete rewrite:** “Three steps to keep answers current.”

#### F-1-16 — “Firm boundaries” is a contextless heading

- **Exact quote/location:** Landing eyebrow above the non-capabilities section.
- **Why this fails:** A heading list does not reveal that this section explains exclusions.
- **Concrete rewrite:** “What the question book does not do.”

#### F-1-17 — “Local-first” is unexplained README jargon

- **Exact quote/location:** “This local-first web app is for engineering and support pairs…”
- **Why this fails:** The later storage section explains the idea more clearly, so the label is unnecessary.
- **Concrete rewrite:** “This browser-based app stores its data on the device. It is for engineering and support pairs who cannot share dashboard access.”

#### F-1-18 — The offline implementation sentence uses internal jargon

- **Exact quote/location:** README: “The production service worker caches the visited shell.”
- **Why this fails:** “Service worker,” “production,” and “shell” describe implementation rather than the user-visible result.
- **Concrete rewrite:** “After one online visit, the app caches the files it needs to reopen offline.”

#### F-1-19 — The deployment sentence stacks unexplained platform jargon

- **Exact quote/location:** README: “`public/staticwebapp.config.json` provides the SPA fallback, 404 behavior, cache rules, and security headers for Azure Static Web Apps.”
- **Why this fails:** “SPA fallback” and “security headers” are not explained, even though this is operator-facing documentation.
- **Concrete rewrite:** “`public/staticwebapp.config.json` routes app pages, serves the styled 404, sets cache rules, and adds browser security protections. Azure Static Web Apps reads it during deployment.”

## Copy audit

Counting rule: whitespace-delimited words; hyphenated terms, URLs, paths, and version numbers count as one word. Headings, navigation labels, actions, alt text, status labels, and code commands are included. No string exceeds 22 words. No banned word from the supplied list appears. The landing page’s primary action, “Try it with sample data,” is a result-naming verb phrase.

### Landing page

| # | Words | Exact copy | Result |
| ---: | ---: | --- | --- |
| 1 | 4 | Skip to main content | Pass |
| 2 | 3 | Telemetry Question Book | Pass |
| 3 | 1 | Demo | Pass; link label |
| 4 | 2 | My book | F-1-14 |
| 5 | 1 | Privacy | Pass; link label |
| 6 | 5 | Approved readings · plain answers | Pass |
| 7 | 5 | Answer recurring telemetry questions safely | F-1-4 |
| 8 | 11 | For support teams who need current answers without broad dashboard access. | Pass |
| 9 | 5 | Try it with sample data | Pass |
| 10 | 8 | Opens a filled question book in one click. | Pass |
| 11 | 5 | Data stays in this browser. | Pass; `local-browser` |
| 12 | 7 | Works after the first visit, even offline. | Pass; `offline-reload` |
| 13 | 3 | Free to use. | Pass; `free-core` |
| 14 | 3 | No account needed. | Pass; `free-core` |
| 15 | 11 | An instrument console turns telemetry paper into a blank answer ticket. | Pass; image alt |
| 16 | 4 | One governed reading in. | F-1-10 |
| 17 | 4 | One support-ready answer out. | F-1-11 |
| 18 | 2 | Live preview | Pass |
| 19 | 6 | Read the answer before the dashboard | F-1-12 |
| 20 | 11 | Each question carries its owner, freshness limit, threshold, and approved source. | F-1-5 |
| 21 | 3 | Approved Grafana view | Pass |
| 22 | 4 | Did Northstar orders arrive? | Pass |
| 23 | 2 | 1,842 orders | Pass |
| 24 | 2 | On track | Pass |
| 25 | 3 | 12 min ago | Pass |
| 26 | 4 | Fresh for 60 min | Pass |
| 27 | 3 | Owner Data Platform | Pass |
| 28 | 6 | Passes when at least 1,500 orders | Pass |
| 29 | 3 | Read-only Kibana link | Pass |
| 30 | 4 | Are Atlas webhooks clearing? | Pass |
| 31 | 2 | 7 queued | Pass |
| 32 | 2 | On track | Pass |
| 33 | 3 | 26 min ago | Pass |
| 34 | 4 | Fresh for 45 min | Pass |
| 35 | 2 | Owner Reliability | Pass |
| 36 | 6 | Passes when at most 10 queued | Pass |
| 37 | 4 | A small operating loop | F-1-15 |
| 38 | 5 | How the question book works | Pass |
| 39 | 3 | Name the question | Pass |
| 40 | 8 | Write the customer question and assign its owner. | Pass |
| 41 | 4 | Add an approved reading | Pass |
| 42 | 10 | Paste a read-only link or import an approved CSV export. | Pass |
| 43 | 3 | Export the answer | Pass |
| 44 | 8 | Download a point-in-time answer copy with optional redaction. | F-1-13 |
| 45 | 2 | Firm boundaries | F-1-16 |
| 46 | 3 | It translates readings. | Pass |
| 47 | 5 | It does not replace telemetry. | Pass; `local-browser` |
| 48 | 7 | It does not ingest logs or metrics. | Pass; `local-browser` |
| 49 | 6 | It does not write query language. | Pass; `local-browser` |
| 50 | 7 | It does not alert or monitor systems. | Pass; `local-browser` |
| 51 | 6 | It never asks for dashboard credentials. | Pass; `least-privilege-input` |
| 52 | 6 | Plain answers from approved telemetry readings. | Pass |
| 53 | 1 | Privacy | Pass; link label |
| 54 | 1 | Terms | Pass; link label |
| 55 | 6 | Built by Param Factory (external site) | Pass; link label |
| 56 | 10 | Version 1.1.0 · Generated illustration disclosed in the design notes. | Pass |

### README

| # | Words | Exact copy | Result |
| ---: | ---: | --- | --- |
| 1 | 3 | Telemetry Question Book | Pass |
| 2 | 7 | Answer recurring telemetry questions from approved readings. | Pass |
| 3 | 19 | This local-first web app is for engineering and support pairs who cannot share raw Grafana, Kibana, or log access. | F-1-17 |
| 4 | 15 | The free book stores named questions with owners, freshness limits, thresholds, and HTTPS source links. | F-1-5, F-1-14 |
| 5 | 15 | It updates recurring readings, imports approved CSV rows, and exports answer copies with optional redaction. | F-1-13 |
| 6 | 8 | It works after the first visit, even offline. | Pass; `offline-reload` |
| 7 | 8 | Try the isolated sample at `/demo` or `https://telemetry-question-book.sociobot.in/demo`. | Pass |
| 8 | 13 | Demo changes use a separate storage key and never touch the real book. | F-1-2, F-1-14 |
| 9 | 3 | What it does | Pass |
| 10 | 7 | Saves approved question cards in the browser. | Pass; `local-browser` |
| 11 | 9 | Updates a recurring reading without making a duplicate card. | Pass; `question-update` |
| 12 | 9 | Imports new CSV rows and updates matching question names. | Pass; `csv-import` |
| 13 | 9 | Marks readings as on track, needs attention, or stale. | Pass; `threshold-states` |
| 14 | 6 | Downloads point-in-time answer copies as JSON. | F-1-13 |
| 15 | 8 | Hides the owner, source, and note by default. | Pass; `answer-copy-security` |
| 16 | 10 | Accepts approved HTTPS links and never asks for dashboard credentials. | Pass; `least-privilege-input` |
| 17 | 11 | It does not ingest telemetry, create queries, or alert on systems. | Pass; `local-browser` |
| 18 | 2 | Run locally | Pass |
| 19 | 7 | Requirements: Node.js 20 or newer and npm. | Pass |
| 20 | 2 | Open `http://localhost:5173`. | Pass |
| 21 | 6 | The direct demo URL is `http://localhost:5173/demo`. | Pass |
| 22 | 3 | Test and build | Pass |
| 23 | 2 | `npm test` | Pass; command |
| 24 | 3 | `npm run lint` | Pass; command |
| 25 | 3 | `npm run typecheck` | Pass; command |
| 26 | 3 | `npm run build` | Pass; command |
| 27 | 14 | `npm test` builds the production app and runs the Playwright claim and accessibility suite. | Pass |
| 28 | 8 | The exact deploy command is `npm run build`. | Pass |
| 29 | 10 | Static output lands in `dist/`, with `dist/index.html` at its root. | Pass |
| 30 | 8 | The production service worker caches the visited shell. | F-1-18 |
| 31 | 12 | The test suite proves the demo reloads after the browser goes offline. | Pass; `offline-reload` |
| 32 | 2 | CSV format | Pass |
| 33 | 9 | Use the Download CSV template action in the book. | F-1-14 |
| 34 | 3 | Required columns are: | Pass |
| 35 | 1 | `question,owner,source,sourceUrl,value,unit,threshold,comparison,observedAt,freshMinutes,note` | Pass; schema line |
| 36 | 6 | `comparison` accepts `gte`, `lte`, or `eq`. | Pass |
| 37 | 5 | `observedAt` accepts an ISO date. | Pass |
| 38 | 5 | Source URLs must use HTTPS. | Pass |
| 39 | 10 | `freshMinutes` must be a whole number from 1 through 10,080. | F-1-6 |
| 40 | 3 | Data and sharing | Pass |
| 41 | 7 | Real questions use the browser key `tqb:v1`. | Pass; `local-browser` |
| 42 | 4 | Demo questions use `demo:tqb:v1`. | Pass; `demo-sandbox` |
| 43 | 10 | Answer-copy previews use session storage and never enter the URL. | F-1-2; `answer-copy-security` otherwise passes |
| 44 | 16 | Downloaded files do not expire or provide access control, so do not put secrets in them. | F-1-3 |
| 45 | 8 | The app has no account service or analytics. | Pass; `local-browser` |
| 46 | 7 | See the in-app `/privacy` and `/terms` pages. | Pass |
| 47 | 1 | Pricing | Pass |
| 48 | 9 | This release is free and has no purchase flow. | Pass; `free-core` |
| 49 | 14 | The researched brief proposed a one-time Support Pack, but its checkout was not registered. | Pass; factual project note |
| 50 | 8 | The product does not advertise unavailable paid features. | Pass; `free-core` |
| 51 | 1 | Deployment | Pass |
| 52 | 6 | Deploy `dist/` as a static site. | Pass |
| 53 | 17 | `public/staticwebapp.config.json` provides the SPA fallback, 404 behavior, cache rules, and security headers for Azure Static Web Apps. | F-1-19 |
| 54 | 2 | Project notes | Pass |
| 55 | 2 | Visual system | Pass; link label |
| 56 | 2 | Verified claims | Pass; link label |
| 57 | 2 | Demo contract | Pass; link label |
| 58 | 2 | Build handoff | Pass; link label |
| 59 | 2 | MIT licensed. | Pass |
| 60 | 2 | See `LICENSE`. | Pass |

## Claims audit

Every exact command in `.factory/claims.json` was run independently after `npm ci` in a fresh local clone. Each selected one tagged test and passed.

| Claim ID | Exact command | Result |
| --- | --- | --- |
| `demo-sandbox` | `npm test -- --grep @claim:demo-sandbox` | PASS |
| `demo-controls` | `npm test -- --grep @claim:demo-controls` | PASS |
| `local-browser` | `npm test -- --grep @claim:local-browser` | PASS |
| `free-core` | `npm test -- --grep @claim:free-core` | PASS |
| `threshold-states` | `npm test -- --grep @claim:threshold-states` | PASS |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS |
| `question-update` | `npm test -- --grep @claim:question-update` | PASS |
| `csv-import` | `npm test -- --grep @claim:csv-import` | PASS |
| `csv-validation` | `npm test -- --grep @claim:csv-validation` | PASS; incomplete assertion, F-1-6 |
| `csv-template` | `npm test -- --grep @claim:csv-template` | PASS |
| `answer-copy-security` | `npm test -- --grep @claim:answer-copy-security` | PASS; cross-mode namespace not covered, F-1-2 |
| `answer-copy-download` | `npm test -- --grep @claim:answer-copy-download` | PASS; warning not asserted, F-1-6 |
| `least-privilege-input` | `npm test -- --grep @claim:least-privilege-input` | PASS |
| `sample-sources` | `npm test -- --grep @claim:sample-sources` | PASS |

The unlisted headline and card-content claims are F-1-4 and F-1-5. Passing commands do not cure the untested portions recorded in F-1-2 and F-1-6.

## Demo, privacy, and offline evidence

- One click from `/` opens `/demo`, seeds three named questions, and shows the demo banner.
- Reset restored the edited Northstar value from 1,900 to 1,842 while a seeded real `tqb:v1` record remained byte-for-byte unchanged.
- Start for real deleted `demo:tqb:v1` and displayed the seeded real card, but left the demo snapshot in the shared session key (F-1-2).
- The landing, demo edit/reset, answer-copy flow, and offline reload requested only `https://telemetry-question-book.sociobot.in`; no third-party scripts, fonts, analytics, or model endpoints appeared.
- After first load and service-worker activation, `/demo` reloaded offline with three cards and the offline notice.
- No AI/provider key or model request exists in source. This is correct: the brief says not to generate explanations with an LLM, and the deterministic threshold job does not need decorative AI.

## Structure, routing, and accessibility

- Normal routes have `lang=en`, one `h1`, one `main`, a route-specific canonical URL, meta description, favicon, 1200 × 630 Open Graph image, and no horizontal overflow at either viewport.
- Landing title is 49 characters: “Telemetry Question Book — answer telemetry safely.” Privacy, Terms, Demo, Book, Snapshot, and 404 use the required route/product pattern. Sample-source titles fail uniqueness at F-1-7.
- Direct loads of `/`, `/demo`, `/book`, `/privacy`, `/terms`, `/snapshot`, and all three sample sources returned 200. An unknown path returned the designed document with HTTP 404.
- Browser navigation from landing → Demo focused the new `h1`; Back restored `/`, scroll 0, and focus on the landing `h1`.
- Every crawled internal link returned 200 except the intentionally tested missing URL, which returned 404. `https://sociobot.in/` returned 200; mail links were recognized as mail links.
- Live axe scans found zero serious or critical violations on core routes, a sample source, and the HTTP 404 at both 390 × 844 and 1440 × 900. Every tested route had one `h1`, one `main`, no missing image alt, and no horizontal overflow.
- The mid-century instrument-panel art, paper/forest/amber palette, hard-edged controls, and console-card treatment are product-specific rather than a generic SaaS template.
- Remaining structure defects are F-1-8 and F-1-9.

## History audit

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files. I read the earlier handoff and both verification reports because the handoff refers to the first verification’s findings.

| Earlier finding | Live and code check | Status |
| --- | --- | --- |
| Snapshot expiry/integrity illusion | URL payload and forgery path are removed; session preview and warning work. Enforceable expiry/share link is still absent. | **Half-fixed; BLOCKING F-1-3** |
| Recurring readings cannot update | Live update kept three cards and persisted 1,900; tagged test passes. | Fixed |
| Advertised paid checkout unavailable | No Support Pack, checkout, password, or purchase control exists live or in source. | Fixed by removing the unavailable offer |
| Claim manifest incomplete | Expanded to 14 entries, all commands pass; assertion and sandbox gaps remain. | Partly fixed; F-1-2, F-1-5, F-1-6 |
| Demo source links dead | All three same-origin source pages render and return 200. | Fixed |
| CSV validation bypass | Shared code validates required values, HTTPS, numbers, comparisons, dates, and freshness; invalid live/local cases are rejected. Tagged boundary coverage remains incomplete. | Functional fix confirmed; test gap F-1-6 |
| Touch targets below 44 px | Header/footer targets and action controls use 44 px minimums; regression test passes. | Fixed |
| Focus ring below 3:1 | The cream inner/dark-brown outer ring is visible; keyboard and dialog restoration pass. | Fixed |
| 404 inline style violated CSP | Styles are external, the live 404 is designed, and no CSP violation occurs. | Fixed; shell/metadata consistency remains F-1-9 |
| Vite high-severity advisory | Vite is 7.3.6; both high-level audits report zero vulnerabilities. | Fixed |
| Unknown routes returned 200 | Unknown pages and missing assets return HTTP 404. | Fixed |
| Non-hashed art cached immutable | Art now revalidates daily. | Fixed |
| “Passes at at least/most” | Live cards say “Passes when at least/at most.” | Fixed |
| Demo count stayed at three | Count is computed from current card length. | Fixed |

## Verification summary

- `npm test`: PASS, 19/19 in the fresh clone.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm run build`: PASS; `dist/index.html` produced; JS 27.26 kB raw / 9.21 kB gzip and CSS 15.81 kB raw / 4.57 kB gzip.
- `npm audit --audit-level=high`: PASS, zero vulnerabilities.
- `npm audit --omit=dev --audit-level=high`: PASS, zero vulnerabilities.
- All 14 public build artifacts matched the live deployment by SHA-256. `staticwebapp.config.json` correctly returned 404 because it is deployment configuration, not a public artifact.

## What would make this perfect

Make a realistic sample result visible in the first phone viewport; fully isolate and label the demo through answer-copy workflows; implement the brief’s expiring, tamper-resistant share link; tighten every claim to its tagged assertions; use unique route titles and complete route metadata/sitemap coverage; and replace the flagged jargon, heading, and terminology strings with the proposed plain wording. Then rerun this entire review from fresh browser/storage contexts. There is no additional AI feature to add.
