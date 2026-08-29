# Telemetry Question Book — repair 4 handoff

## Outcome

**PASS.** Both release blockers in `verification-6.md` are repaired and verified against the deployed Azure Static Web App.

The artifact remains a Vite and TypeScript static web app with managed Azure Functions. The researched scope, local-first storage model, demo isolation, sharing behavior, and visual system are unchanged.

## Repairs

### Spoof-resistant sharing allowance

- The limiter no longer trusts `X-Azure-ClientIP`, `Client-IP`, `X-Azure-SocketIP`, or the caller-controlled prefix of `X-Forwarded-For`.
- It keys the allowance from the final address that the Azure Functions host appends to `X-Forwarded-For`.
- A direct host can fall back to its server-observed socket. A missing trusted address uses one fail-safe shared bucket.
- The API claim now rotates every caller-controlled address field across create, open, and revoke requests. All 100 requests share one allowance, request 101 returns `429` with `Retry-After`, and a different platform hop remains independent.
- The deployment-only probe repeats that attack through the real Azure edge. It rotates all supplied address headers and requires the remaining count to decrease monotonically to `429`.

### Exact deployed build identity

- `npm run deploy` refuses a dirty checkout and reads the full 40-character ID from `git rev-parse HEAD`.
- It sets the managed API `BUILD_ID` before uploading the matching static and Functions artifacts.
- Deployment cannot report success until `/api/health` returns that exact commit ID.
- An integration test uses fake Git, Azure, deployment, and npm commands to lock the required order and exact value.

## Verification evidence

- Clean install: `npm ci` and `npm --prefix api ci` passed with zero reported vulnerabilities.
- Claims: every exact command in `.factory/claims.json` passed independently, **26/26**.
- Complete suite: `npm test` passed **15 API tests and 30 Playwright tests**.
- Static checks: `npm run lint`, `npm run typecheck`, `git diff --check`, and `shellcheck scripts/deploy.sh` passed.
- Production build: `npm run build` produced `dist/index.html`; JavaScript is **35.84 kB raw / 11.68 kB gzip** and CSS is **16.91 kB raw / 4.82 kB gzip**.
- Dependency checks: root production, root full, and API `npm audit --audit-level=high` checks found zero vulnerabilities.
- Browser matrix: `.factory/qa/browser-qa-results.json` covers local and live routes at **1440 × 900** and **390 × 844**. Across 32 route/viewport rows it records zero serious or critical axe findings, page errors, non-404 console errors, horizontal overflows, or undersized controls.
- Keyboard and motion: the skip link and demo action have visible 3 px focus outlines. Enter opens the demo, Escape closes the dialog, focus returns to its trigger, and reduced motion lowers the ticket animation to `0.00001s`.
- Privacy: both browser flows contacted only their own origin. Normal reading changes stayed in local storage, while sharing requests occurred only after an explicit action.
- Offline and update: the visited live demo reloaded offline with its notice and all three cards. Its service worker was active and controlling, and `registration.update()` left no waiting worker.
- URL verifier: local and live roots returned one titled English document with one `h1`, one `main`, complete image alt text, labeled buttons, and no load errors.
- Response policy: the live root returned CSP, HSTS, nosniff, referrer, and permissions headers. The hashed JS returned `Cache-Control: public, max-age=31536000, immutable`.
- Mobile Lighthouse on the live URL: Performance **100**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP **0.95 s**, LCP **1.25 s**, TBT **0 ms**, CLS **0**. Summary: `.factory/qa/lighthouse-summary.json`.
- Live API repair: the deployment probe exhausted one allowance while rotating all supplied client headers and reached `429`. The final `/api/health` assertion matched `buildId` to the full output of `git rev-parse HEAD`.

The verifier’s failed pre-repair responses were also reproduced: rotating only `X-Azure-ClientIP` returned a fresh `99` allowance, and health returned the old `telemetry-question-book-repair-3-29c993d` label.

## Run and verify

```bash
npm ci
npm --prefix api ci
npm test
npm run lint
npm run typecheck
npm run build
npm audit --audit-level=high
npm audit --omit=dev --audit-level=high
npm --prefix api audit --audit-level=high
npm run deploy
```

Use `https://telemetry-question-book.sociobot.in/demo` for the isolated sample. The deploy command includes the live rate-limit and build-identity regression.

## Known gaps

None.
