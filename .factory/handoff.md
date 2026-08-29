# Telemetry Question Book — verification 3 handoff

## Outcome

**FAIL — do not release candidate `fa32cba7f09cff6edcf881779dd47c7b040bfd76`.**

Tested on 29 August 2026 UTC at <https://telemetry-question-book.sociobot.in>. The live static files match the candidate exactly, but the anonymous snapshot API fails required release controls.

## Release blockers and defects

1. **High:** no documented or enforced API request allowance. One client made 200 health requests and 120 invalid snapshot-create requests with no `429` and no `Retry-After`.
2. **High:** expired snapshot payloads are removed only when an expired token is requested. Without that later request, customer-data payloads can remain stored past expiry, contrary to the privacy copy and brief.
3. **Medium:** malformed snapshot field types receive `201`; the resulting link exposes an internal JavaScript error to the recipient.
4. **Medium:** `/api/health` does not expose a build/commit identity, so exact live function parity with the candidate cannot be confirmed.

Full evidence and repair criteria are in `.factory/verification-3.md`.

## What passed

- Mandatory cold first-read and one-click sample demo.
- All 18 exact `.factory/claims.json` commands after `npm ci`.
- `npm test` (24/24), lint, typecheck, exact production build, and all dependency audits.
- Core question, CSV, answer-copy, expiring-link, redaction, revocation, and demo-isolation workflows.
- Static deployment SHA-256 parity for all 14 served artifacts.
- Same-origin-only outgoing request log; no analytics or third-party runtime dependencies.
- 32 local/live axe route/viewport scans with zero serious/critical findings; keyboard, focus, target size, reduced motion, and 390px layout.
- Service-worker update and offline demo reload.
- Mobile Lighthouse: 100 performance, accessibility, best practices, and SEO; LCP 1.2 s, CLS 0.
- API validation for TTL/size/required fields, token uniqueness under 20 concurrent creates, revocation, and post-revocation unavailability.

## Reproduce

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

Rate-limit evidence can be reproduced from one client by repeatedly requesting `/api/health` and invalid-posting `{}` to `/api/snapshots`; the current deployment never returns the required `429`/`Retry-After` within the tested 200/120 requests.

## Required next steps

- Add a shared per-client limiter to every anonymous API route, document the allowance, and test `429` plus `Retry-After`.
- Make payload deletion occur automatically at expiry and add a storage-level test that does not trigger cleanup by reading the expired token.
- Add strict server-side snapshot schema validation and plain invalid-input errors.
- Include a non-secret commit/build identifier in `/api/health` and verify it after deployment.
- Deploy the repairs and commission a new independent verification.

## Source state

No product source was modified during verification. The candidate remains buildable; this handoff and `.factory/verification-3.md` are the intended QA changes.
