# Independent product verification 13 — PASS

Verified 29 August 2026 against candidate commit
`d08bd751087b0489b933ad40caf1875c692ae9e2` and
<https://telemetry-question-book.sociobot.in>.

## Verdict

**PASS — release candidate accepted.** The deployed static application and
sharing API both identify themselves as the candidate commit. Fresh testing did
not reproduce a deployment-only failure. The smallest useful workflow works
end to end, every declared claim test passes, and no critical, high, medium, or
low product defect was found.

Product code was not changed during verification. Only this report and the
verification handoff were added or updated.

## Required opening gates

### Cold first read — PASS

A fresh live browser context opened `/` at 1440 × 900 and 390 × 844. The first
screen answers the required questions in plain words:

- What it does: **“Track recurring answers from approved readings.”**
- Who it is for: **support teams** that enter a reading or approved CSV without
  giving the app dashboard access.
- What to do first: **“Try it with sample data.”** Adjacent text says it opens a
  filled question book in one click.

The action opened `/demo` in one click. Three named readings appeared with the
persistent **“Demo — sample data, nothing is saved”** banner, **Reset demo**, and
**Start for real**. At 390 × 844, the action, all three plain facts, and the
first reading's question, value, state, and freshness fit the initial viewport.

### Declared claims — PASS

`.factory/claims.json` exists and contains 28 entries. After the clean lockfile
install, every literal `test` command was run individually through the shipped
demo entry point. **28/28 passed**:

`demo-sandbox`, `demo-controls`, `card-fields`, `local-browser`, `free-core`,
`threshold-states`, `offline-reload`, `offline-sharing`, `question-update`,
`csv-import`, `csv-validation`, `csv-schema`, `csv-template`,
`question-book-export`, `answer-copy-security`, `answer-copy-download`,
`expiring-share`, `share-expiry-options`, `share-redaction`,
`share-revocation`, `least-privilege-input`, `sample-sources`,
`snapshot-retention`, `snapshot-storage-minimization`, `api-rate-limit`,
`health-rate-limit`, `deploy-integrity`, and `legacy-migration`.

The landing page, product routes, privacy page, terms, and README were
cross-checked against the registry. No material unlisted promise was found.

## Clean-checkout quality gates

| Check | Fresh result |
| --- | --- |
| Starting tree | Clean `main`, equal to `origin/main`, exact candidate commit |
| `npm ci` | PASS; 105 packages installed, 0 vulnerabilities |
| Every claim command | PASS; 28/28 |
| `npm test` | PASS; 15/15 API tests and 33/33 Playwright tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS; exact production build produced `dist/` |
| Root and API audits | PASS; 0 vulnerabilities |
| `git diff --check` | PASS |

Environment: Node 22.23.2, npm 10.9.8, Playwright 1.58.2, Chromium 1208.

The production build emits 36,457 bytes of initial JavaScript (11.89 kB gzip)
and 17,192 bytes of CSS (4.88 kB gzip). The mobile hero is 42,650 bytes; the
desktop hero is 108,344 bytes. These are below the supplied static-web budgets.

## Independent end-to-end exercise

A fresh live desktop context completed the real support workflow without using
the repository tests:

1. Opened the one-click sample and saw three isolated question cards.
2. Updated Northstar from 1,842 to 1,901 and freshness to 10,080 minutes. The
   book retained three cards rather than creating a duplicate.
3. Opened the answer-copy dialog with the keyboard. Focus entered the dialog,
   wrapped backward, and returned to the opener on Escape.
4. Reviewed the default-redacted copy, created a live opaque `d_` link, and
   opened it as a recipient. The answer appeared; owner, source, and note did
   not.
5. Revoked the link. The next API read returned HTTP 410.

A separate empty real workspace rejected a blank source URL, an HTTP URL, and
freshness values 0, 1.5, and 10,081. It accepted the 1-minute minimum and
10,080-minute maximum, preserved zero as a valid equality reading, and showed a
specific recovery instruction for a CSV missing required columns.

The full suite additionally covers all three comparisons and states, valid and
invalid ISO dates, CSV add/update and round trip, exact export contents,
downloaded answer contents, expiry options, server expiry, reset/start cleanup,
legacy migration, and real/demo storage isolation.

## Privacy, accessibility, and responsive behavior

- The independent live workflow recorded 31 requests. Every request was to the
  product origin. There were no analytics, external fonts/scripts, telemetry
  queries, account calls, AI calls, or payment-provider calls. The explicit
  share creation and revocation were the only server mutations. There were no
  console or page errors.
- Twelve independent axe scans covered `/`, `/demo`, `/book`, `/privacy`,
  `/terms`, and a real HTTP 404 at desktop and 390 px. All had zero serious or
  critical findings, `lang="en"`, one `h1`, one `main`, no missing alternatives,
  no unlabeled buttons, and no horizontal overflow.
- At 390 × 844, the smallest visible interactive target measured 44 px and the
  smallest visible text measured 16 px. The layout remained unclipped.
- Keyboard-only navigation exposed the skip link first, focused route headings,
  reached card actions, displayed a 3 px light focus outline with a 6 px dark
  halo, contained dialog focus in both directions, and restored focus on Escape.
- With `prefers-reduced-motion: reduce`, the media query matched and no animation
  longer than 1 ms was running.
- The factory URL verifier passed live `/` and `/demo`: HTTP 200, 793/755 ms
  cold navigation, correct title/lang/main/h1, no missing alternatives or
  unlabeled buttons, and no console/page errors.

## PWA, routing, links, and metadata

- From cleared registrations and caches, `/sw.js` installed and activated
  `tqb-shell-v7`. `registration.update()` left no waiting or installing worker.
  The visited demo then reloaded offline with its notice and all three cards,
  and recovered after reconnecting.
- Root, demo, book, privacy, terms, and all three sample-source routes returned
  200. A missing route returned the styled document with HTTP 404. Every crawled
  HTTP link returned 200; the two email links were explicit `mailto:` links.
- Route titles, descriptions, canonicals, Open Graph/Twitter metadata,
  `robots.txt`, and `sitemap.xml` are present. The social image is 1200 × 630 and
  the touch icon is 180 × 180.
- The product-specific instrument-panel palette, typography, spacing, motion,
  single-mode rationale, original image prompt, date, and provenance are
  recorded in `.factory/design.md`.

## Deployment identity, headers, caching, and allowance

`/build-info.json` and `/api/health` both returned
`d08bd751087b0489b933ad40caf1875c692ae9e2`; health also returned `ok: true` and
`snapshotStoreConfigured: true`. Fresh SHA-256 comparisons were identical for
candidate and live `index.html`, hashed JS, hashed CSS, both hero variants,
`sw.js`, `404.html`, and `404.css`.

Static responses include a self-only CSP with `frame-ancestors 'none'`, HSTS,
`nosniff`, strict-origin referrer policy, and camera/microphone/geolocation
denial. HTML and the service worker use a 30-second revalidation policy; hashed
JS/CSS use one-year immutable caching; other art revalidates daily; build and
health identity responses are `no-store`.

The live sharing allowance is **100 combined create/open/revoke requests per
network address per 60 seconds**. Requests 1–100 were admitted. Request 101
returned HTTP **429**, `X-RateLimit-Remaining: 0`, and **`Retry-After: 42`**.
The supplied live verifier also proved rotating caller-supplied forwarding and
Azure-named headers cannot split the allowance. `/api/health` remained HTTP 200
and carried no rate-limit headers after exhaustion. API tests independently
passed the 100-way concurrent admission, atomic accounting, fail-closed storage,
TTL retention, metadata minimization, revocation deletion, and migration cases.

## Performance

Fresh mobile Lighthouse against production:

| Category/metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| First Contentful Paint | 1.003 s |
| Largest Contentful Paint | 1.303 s |
| Total Blocking Time | 0 ms |
| Cumulative Layout Shift | 0 |
| Speed Index | 1.003 s |
| Total transfer | 61,751 bytes |

## Applicability and defects

This release has no sign-in, paid unlock, library/CLI package, or runtime AI
feature. Those conditional checks do not apply. Omitting generated explanations
is required by the researched brief.

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

## Release recommendation

**PASS.** Candidate `d08bd751087b0489b933ad40caf1875c692ae9e2` matches the
live deployment and satisfies the work order, researched brief, and attached
acceptance contract.
