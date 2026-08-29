# Telemetry Question Book — repair 5 handoff

## Outcome

**PASS locally; ready for static deployment.** This repair resolves the sole
release blocker from independent verification 7: the answer-copy modal could
leave keyboard focus on `body` at either end of its Tab sequence.

## What changed

- Added an explicit, scoped focus loop for the native answer-copy dialog.
  `Shift+Tab` from the close control moves to **Review answer copy** and `Tab`
  from that final control moves back to **Close answer copy dialog**.
- The dialog now gives every focused control the product's 3 px cream and
  dark-amber focus treatment, including the initial focus when it opens and
  when reduced motion is enabled. Escape and native opener restoration remain
  unchanged.
- Added a Playwright regression that checks each dialog stop, both boundaries,
  containment in the open dialog, and the visible 3 px focus ring.
- Added the same keyboard-cycle audit to the 1440 px / 390 px browser QA
  runner so local and deployed checks record every modal control.

## Local verification

- Clean install: `npm ci` — passed; 106 packages audited, zero
  vulnerabilities.
- Full suite: `npm test` — passed: 15 Node API tests and 31 Playwright tests.
- Every exact command in `.factory/claims.json` was then run serially from the
  demo entry point: 26/26 passed.
- `npm run lint`, `npm run typecheck`, `npm run build`, `npm audit
  --audit-level=high`, `npm --omit=dev audit --audit-level=high`, and
  `npm --prefix api audit --audit-level=high` — passed.
- Production build: JavaScript 36.51 kB raw / 11.91 kB gzip; CSS 17.03 kB raw
  / 4.84 kB gzip. `dist/index.html` is present.
- `QA_LOCAL_ONLY=1 node .factory/qa/run-browser-qa.mjs` — passed at 1440 × 900
  and 390 × 844. Every route had one `h1` and `main`, no horizontal overflow,
  and zero Axe serious/critical violations. The recorded dialog cycle keeps
  all eight checks inside the modal with a solid 3 px outline.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/demo
  .factory/evidence/repair-5-local` — passed: zero console/page errors, title,
  `lang=en`, one `h1`, one main landmark, complete alt text, and labeled
  buttons. Screenshots and `verify.json` are retained there.
- The standalone `@axe-core/cli` could not locate a system Chrome in this
  container. The repository's Playwright Axe integration ran successfully on
  all tested desktop and mobile routes instead. Lighthouse's current CLI also
  crashes its remote Chrome tab after audits in this container; the prior
  independent live run recorded 100/100/100/100. This repair adds 0.67 kB raw
  JavaScript and 0.12 kB raw CSS and does not change the loading path.

## Scope and privacy

The researched brief, local-first storage split, service worker, answer-copy
expiry/redaction/revocation, static deployment class, API behavior, and all
previously passing claims are unchanged. No analytics, third-party scripts,
fonts, or runtime network destinations were added.

## Deployment and final checks

Deploy from a clean committed checkout with `npm run deploy`. It builds `dist`,
sets the API `BUILD_ID` to the committed revision before upload, and verifies
the live identity plus sharing allowance. After the live build activates, rerun
the browser QA runner without `QA_LOCAL_ONLY` and the live verifier script.
