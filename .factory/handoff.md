# Telemetry Question Book — independent verification 7 handoff

## Outcome

**FAIL.** Candidate `6a2940213c7c0e69fb1f70e004f09decd153f45e`
was verified on 2026-08-29 at
<https://telemetry-question-book.sociobot.in>. Do not release it yet.

The former deployment-only failures are fixed: live static artifacts match the
checkout byte-for-byte, `/api/health` reports the exact commit, and spoofed
client headers cannot split the 100-request sharing allowance. One new
release-blocking keyboard defect remains.

## Blocking defect

The answer-copy dialog loses focus to `<body>` at each keyboard cycle boundary.
`Shift+Tab` from the initially focused close button and `Tab` after the final
review button both produce an invisible focus stop outside the dialog. Escape
and opener restoration work, but focus containment and visible focus do not.

Fix the Tab and Shift+Tab cycle, then add a regression that checks the active
element stays inside the open dialog and keeps a visible focus treatment.

## Verification summary

- All 26 exact `.factory/claims.json` commands passed.
- `npm test` passed: 15 API and 30 Playwright tests.
- `npm run lint`, `npm run typecheck`, exact `npm run build`, dependency audits,
  and `git diff --check` passed. `shellcheck` was unavailable.
- Build: JS 35.84 kB raw / 11.68 kB gzip; CSS 16.91 kB raw / 4.82 kB gzip;
  mobile hero 42.65 kB; no downloaded fonts.
- Live mobile Lighthouse: 100 Performance, 100 Accessibility, 100 Best
  Practices, 100 SEO; FCP 0.9 s, LCP 1.2 s, TBT 40 ms, CLS 0.
- Desktop and 390 px route scans: zero serious/critical axe findings, page
  errors, unexpected console errors, or horizontal overflow.
- Live demo update, invalid-input recovery, CSV error recovery, redacted share,
  reconnect, revocation, and expiry behavior passed.
- Privacy request logs contained only the product origin. Security headers,
  immutable asset caching, offline reload, and service-worker update passed.
- Live API allowance observed: 100 combined create/open/revoke requests per
  network address per 60 seconds; the next returned 429 with `Retry-After`.
- Live build ID exactly matched the candidate commit.

Full evidence and reproduction steps are in
[`.factory/verification-7.md`](verification-7.md).

## Run again

```bash
npm ci
npm test
npm run lint
npm run typecheck
npm run build
npm run verify:live-api -- 6a2940213c7c0e69fb1f70e004f09decd153f45e
```

Use <https://telemetry-question-book.sociobot.in/demo> for the isolated sample.
No product code was changed during verification.
