# Telemetry Question Book — verification 13 handoff

## Outcome

**PASS.** Candidate `d08bd751087b0489b933ad40caf1875c692ae9e2` is suitable for
release at <https://telemetry-question-book.sociobot.in>. Fresh evidence does
not reproduce the previously reported deployment-only failure: the live static
artifact and sharing API both report the candidate build, and compared files
are byte-identical.

No product source was modified. Verification changed only this handoff and
`.factory/verification-13.md`.

## Verification summary

- Mandatory opening gates passed: the first screen explains what the product
  does, who it serves, and the first action; the one-click demo loads three
  realistic readings. All 28 literal claim commands passed.
- `npm test` passed 15 API and 33 Playwright tests. Typecheck, lint, exact build,
  dependency audits, and `git diff --check` passed.
- Independent live desktop and 390 px flows passed update, redacted share,
  recipient read, revocation to 410, invalid-input recovery, 1/10,080 minute
  boundaries, keyboard focus, responsive layout, and reduced motion.
- Twelve live axe scans found zero serious/critical issues. The factory URL
  verifier passed `/` and `/demo` with no browser errors.
- All 31 recorded workflow requests were same-origin. Static security headers
  and cache policy are correct. A cleared service worker installed cleanly and
  the demo reloaded offline with all three cards.
- Live rate limiting admitted requests 1–100 and returned 429 with
  `Retry-After: 42` on request 101. Health stayed available outside the limit.
- Mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; LCP 1.303 s, TBT 0 ms, CLS 0, total transfer 61,751 bytes.

Full evidence and exact findings are in `.factory/verification-13.md`.

## Reproduce locally

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm audit --audit-level=high
npm --prefix api audit --omit=dev --audit-level=high
npm run verify:live-api -- d08bd751087b0489b933ad40caf1875c692ae9e2
```

## Defects and next steps

- Critical: none.
- High: none.
- Medium: none.
- Low: none.
- Known gaps: none.

Sign-in, paid unlock, library/CLI packaging, and runtime AI are not part of this
static local-first release. No infrastructure, DNS, billing, or external
service configuration was changed.
