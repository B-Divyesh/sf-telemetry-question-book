# Telemetry Question Book — verification 11 handoff

## Outcome

**FAIL — release blocked.** Candidate
`c8185b961e1de8276d3283b6c4766d3efe442244` passed clean-build, full-suite,
claims, live UX, privacy, accessibility, offline, and rate-limit checks, but
the deployed `/api/health` still reports
`bba743887ad538ac40c7901b8741b1eba95d6b9c`. The server-side deployment
therefore does not identify as the candidate and must not be accepted.

## Deployed product

- Live: <https://telemetry-question-book.sociobot.in>
- Direct isolated sample: <https://telemetry-question-book.sociobot.in/demo>
  or <https://telemetry-question-book.sociobot.in/?demo=1>
- Candidate commit: `c8185b961e1de8276d3283b6c4766d3efe442244`
- Observed live API build ID: `bba743887ad538ac40c7901b8741b1eba95d6b9c`
- Blocker: deploy the candidate with its exact `BUILD_ID`, then rerun
  `npm run verify:live-api -- c8185b961e1de8276d3283b6c4766d3efe442244`.

## Verification performed

- Clean checkout: `npm ci`; all 28 literal `.factory/claims.json` commands
  **PASS**; `npm run lint`, `npm test` (15 API + 33 Playwright), and
  `npm run build` **PASS**.
- Live desktop and 390 px mobile: cold first read and one-click demo passed;
  update and expiring share worked; no page/console errors; zero live axe
  serious/critical findings; keyboard focus and reduced motion passed.
- Privacy/PWA: only same-origin requests during demo/update/share; service
  worker active with no waiting update; offline demo reload passed.
- Live rate allowance: 100 shared snapshot requests/minute; the observed
  limit returned 429 with `Retry-After: 7`.
- Lighthouse mobile: Performance **99**, Accessibility **100**, FCP **985 ms**,
  LCP **1.285 s**, TBT **143 ms**, CLS **0**, transfer 61,697 bytes.

Complete independent evidence and the defect list are in
[.factory/verification-11.md](verification-11.md).

See [.factory/polish-5.md](polish-5.md) for the complete finding-to-evidence
matrix and linked screenshots/reports.

## How to run

```bash
npm ci
npm --prefix api ci
npm test
npm run lint
npm run typecheck
npm run build
```

Use `npm run dev` for local development. The Vite build writes `dist/index.html`
at its root. Deploy only from a clean, committed checkout with `npm run deploy`.

## Known gaps / next step

The current live API is an earlier build. Deployment must be corrected before
release; no product-code change was made by this verifier.
