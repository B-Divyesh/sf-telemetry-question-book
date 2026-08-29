# Independent verification 7 — FAIL

Verified on 2026-08-29 against candidate commit
`6a2940213c7c0e69fb1f70e004f09decd153f45e` and the live URL
<https://telemetry-question-book.sociobot.in>.

## Verdict

**FAIL — do not release this candidate.** The earlier deployment-only failures
are repaired, but one release-blocking keyboard accessibility defect remains.

### High — the answer-copy dialog loses keyboard focus at both cycle boundaries

The native answer-copy dialog does not keep focus within the modal:

1. On `/demo`, keyboard Tab reached the first **Make answer copy** button and
   Enter opened the dialog.
2. The dialog correctly focused **Close answer copy dialog**.
3. `Shift+Tab` from that first control changed `document.activeElement` to
   `<body>`, outside the dialog. Computed focus styling was `outline: none` and
   `box-shadow: none`.
4. Forward Tab through close, redaction, expiry, cancel, and review likewise
   changed focus to `<body>` after **Review answer copy**. The next Tab returned
   to the close control.
5. Escape correctly closed the dialog and restored focus to its opener.

This creates a blank, invisible keyboard stop in a core sharing workflow. It
violates the acceptance contract's keyboard, visible-focus, and dialog focus
management requirements. Automated axe scans do not detect this behavior.
Keep the Tab and Shift+Tab cycle inside the open dialog, then add forward and
reverse boundary tests that require both `dialog.contains(activeElement)` and
visible focus after every key press.

## Mandatory opening gates

### Claims

`.factory/claims.json` exists. From the clean candidate checkout, every exact
`test` command was run independently through the shipped demo entry point:
**26/26 passed**. The browser claims covered demo isolation, local storage,
CSV validation and round-trip, state calculation, offline recovery, answer
copies, expiry, redaction, revocation, and sample sources. The API claims
covered TTL retention, minimized metadata, the shared request allowance, and
unlimited health checks. Logs were captured under `/tmp/tqb-claim-results/`
during verification.

### Cold first read

The cold live first screen passes. It says **“Track recurring answers from
approved readings,”** names support teams, and says to enter a reading or
approved CSV without querying dashboards. The visible **Try it with sample
data** action says it opens a filled question book in one click. Clicking it
opens `/demo` with three named readings and the persistent demo-only banner.

## Clean-checkout gates

- `npm ci`: passed; 106 packages audited, zero vulnerabilities.
- `npm test`: passed — 15 Node API tests and 30 Playwright tests.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- Exact `npm run build`: passed and produced `dist/`.
- `npm audit --audit-level=high`, production-only root audit, and API audit:
  passed with zero vulnerabilities.
- `git diff --check`: passed. `shellcheck` was unavailable in the verifier
  image, so no shellcheck result is claimed.

The production build contains 35.84 kB raw / 11.68 kB gzip JavaScript and
16.91 kB raw / 4.82 kB gzip CSS. The mobile hero is 42.65 kB and no web fonts
load. Live mobile Lighthouse scored Performance 100, Accessibility 100, Best
Practices 100, and SEO 100; FCP was 0.9 s, LCP 1.2 s, TBT 40 ms, CLS 0, and
initial transfer 60 KiB.

## End-to-end behavior and recovery

- Normal case: changing Northstar from 1,842 to 1,903 updated the existing
  card and kept the card count at three.
- Boundary and recovery: an HTTP source and freshness `0` were rejected;
  correcting them to HTTPS and freshness `1` saved the question. A CSV missing
  required columns showed a specific missing-field recovery message.
- The claim suite separately passed freshness `1` and `10,080`, rejected `0`,
  `1.5`, and `10,081`, covered blank fields, invalid ISO dates/comparisons,
  quoted CSV, duplicate updates, and export/import round-trip.
- A live redacted demo answer failed with a clear reconnect instruction while
  offline, succeeded after reconnecting with HTTP 201, opened from an opaque
  `d_` link without owner/source/note, revoked with HTTP 204, and then returned
  HTTP 410.
- Empty, loading, unavailable-link, offline, confirmation, and recovery states
  are present. The real workspace remains separate from demo storage.

## Accessibility and responsive checks

- At 1440×900 and 390×844, `/`, `/demo`, `/book`, `/privacy`, `/terms`,
  `/snapshot`, all three sample sources, and the designed 404 had one `h1`,
  one `main`, `lang="en"`, complete image alt text, no horizontal overflow,
  and zero axe serious/critical findings.
- App controls met the 44 px target requirement; the two mail links are inline
  text links. The skip link has a visible 3 px cream outline plus dark outer
  ring. Route navigation moves focus to the new heading.
- A 720 CSS-pixel reflow pass, equivalent to 200% zoom on a 1440 px viewport,
  found no horizontal overflow or clipped text/control content.
- Reduced motion matched the media query and reduced ticket animation and
  transitions to `0.00001s`.
- The modal boundary failure described above is the blocking exception.

## Privacy, deployment, API, and PWA evidence

- Cold load and complete normal demo flows contacted only
  `https://telemetry-question-book.sociobot.in`. Static reading changes made
  no account, analytics, ingestion, query, alert, AI, or third-party calls.
  Same-origin snapshot calls occurred only after the explicit share action.
- The root returned CSP restricted to self (plus image data), HSTS, nosniff,
  referrer policy, permissions policy, and `frame-ancestors 'none'`. Hashed JS
  and CSS use one-year immutable caching; documents and `sw.js` revalidate
  after 30 seconds. `/api/health` uses `Cache-Control: no-store`.
- SHA-256 hashes for `index.html`, JS, CSS, hero, service worker, and 404 body
  matched the fresh candidate build byte-for-byte.
- `/api/health` returned only `ok`, `snapshotStoreConfigured`, and `buildId`;
  storage was configured and `buildId` exactly matched the 40-character
  candidate commit.
- The live spoof-resistance probe rotated `X-Azure-ClientIP`,
  `X-Azure-SocketIP`, `Client-IP`, and the caller prefix of `X-Forwarded-For`.
  All create/open/revoke traffic shared the documented allowance of **100
  requests per network address per 60 seconds**; the next request returned
  HTTP 429 with `Retry-After`. A separate trusted final hop retained its own
  allowance. The local concurrency test also admitted exactly 100 concurrent
  calls and rejected the rest atomically.
- Persistence tests passed: payload uses service-enforced TTL, metadata keeps
  only link controls, revocation deletes the answer, and legacy migration
  removes expired data without requiring a recipient read.
- The live service worker controlled `/demo`, used cache `tqb-shell-v7`, had no
  waiting update after `registration.update()`, and reopened offline with all
  three cards and the offline notice.
- Every crawled internal link and the Param Factory external link returned
  200; mail links were exempt. The designed unknown route returned 404.
- Sign-in, paid unlock, library/CLI packaging, and external AI are not present
  and are not applicable to this static/local-first scope.

## Required next step

Fix modal focus containment in both directions and add a keyboard regression
test for the first/last controls. Then rerun all claims and this verification.
No other release-blocking defect was found.
