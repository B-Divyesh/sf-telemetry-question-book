# Telemetry Question Book — polish 5 handoff

## Outcome

**PASS.** Deployed build `bba743887ad538ac40c7901b8741b1eba95d6b9c` fixes the
last review finding: the limits section now uses the self-contained h2 “What
the question book does not do.” The small change retains the distinct
mid-century instrument-panel identity while making the heading usable in a
screen-reader heading list. The catalog description is now this 57-character,
verb-first sentence: “Track recurring telemetry answers from approved
readings.”

## Deployed product

- Live: <https://telemetry-question-book.sociobot.in>
- Direct isolated sample: <https://telemetry-question-book.sociobot.in/demo>
  or <https://telemetry-question-book.sociobot.in/?demo=1>
- Repair commit/build ID: `bba743887ad538ac40c7901b8741b1eba95d6b9c`
- Deployment: `npm run deploy` completed; `/api/health` reports the exact build
  ID, configured snapshot storage, and the live forged-header rate-limit check
  passed.

## Verification performed

- Fresh clean clone `/tmp/tqb-polish-5-clean`: `npm ci`, `npm --prefix api ci`,
  then every one of the 28 exact `.factory/claims.json` commands independently:
  **28/28 PASS**.
- Fresh clean clone full quality gate: `npm test` **PASS** (15 API + 33
  Playwright), `npm run lint`, `npm run typecheck`, `npm run build`, both
  high-severity dependency audits, and `git diff --check`: **PASS**.
- Local and live browser matrix: all audited pages at 390 × 844 and 1440 × 900
  have route-specific metadata, one h1/main, no horizontal overflow, zero
  serious/critical Axe findings, designed keyboard focus, reduced-motion
  support, and no undersized visible targets.
- Live cold root/demo: only same-origin product requests; no normal-load
  console/page error; direct demo, persistent banner, reset/leave isolation,
  all expiring-share choices, redaction, revocation, offline reload, legal
  routes, titles, focus, and the styled 404 passed.
- `/opt/fleet/lib/verify-url.sh` passed root and demo. Live Lighthouse recorded
  Performance **100**, Accessibility **100**, FCP **906 ms**, LCP **1.281 s**,
  TBT **1 ms**, CLS **0**, and 61,284 transferred bytes.

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

## Known gaps

None. No AI feature was added because the brief expressly forbids generated
explanations and the existing CSV, JSON, local storage, and revocable expiring
link flows cover the product’s actual job.
