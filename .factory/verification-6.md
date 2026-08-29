# Independent verification 6 — FAIL

Verified on 2026-08-29 against candidate commit
`1a83723b76b50a7aab88f8bf8fd824086e69bbf3` and the live URL
<https://telemetry-question-book.sociobot.in>.

## Verdict

**FAIL — do not release this candidate.** Two release-blocking findings remain.

### High — a caller can bypass the documented API request allowance

The sharing API promises one combined allowance of 100 create/open/revoke
requests per network address per 60 seconds. Live testing showed that the
address is taken from a request header the caller can supply:

1. `GET /api/snapshots/d_qa_rate_probe` with
   `X-Azure-ClientIP: 198.51.100.77` started at
   `X-RateLimit-Remaining: 99`.
2. After 100 additional requests with that exact header, the next request
   returned `429`, `X-RateLimit-Limit: 100`,
   `X-RateLimit-Remaining: 0`, and `Retry-After: 8`.
3. Without changing network client, sending the same request with only
   `X-Azure-ClientIP: 198.51.100.78` immediately returned `404` (the expected
   absent-link response) with `X-RateLimit-Remaining: 99`.

This is a real allowance bypass, not merely a unit-test issue. A client can
rotate that header and avoid the 429 protection for anonymous snapshot
creation, reading, and revocation. The implementation in
`api/lib/rate-limit.js` prefers `x-azure-clientip`; accept only a platform
trusted connection address/header that cannot be supplied by the requester,
then add a live/integration regression test for header spoofing.

### High — live API build identity is not the candidate commit

`GET /api/health` on the tested deployment returned:

```json
{"ok":true,"snapshotStoreConfigured":true,"buildId":"telemetry-question-book-repair-3-29c993d"}
```

The README requires `BUILD_ID` to be set to the deployed commit. It is not
`1a83723b76b50a7aab88f8bf8fd824086e69bbf3`, so the deployed server-side
artifact cannot be accepted as this candidate. The live static JS and hero did
match this checkout byte-for-byte, but that does not establish the required
server build identity.

## Clean-checkout gates

- `npm ci`: passed.
- Every exact command listed in `.factory/claims.json`: **26/26 passed**. This
  included the demo-only browser claims and the four API claims.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed; `dist/` produced. Initial JS was 35.84 kB raw /
  11.68 kB gzip; CSS was 16.91 kB raw / 4.82 kB gzip.
- `npm test`: passed (14 Node API tests and 30 Playwright tests).

The passing local rate-limit claim does not test a caller-supplied
`X-Azure-ClientIP` header against the deployed platform, which is why it did
not detect the live bypass.

## Product and live-browser evidence

### First read

Cold landing text plainly says: “Track recurring answers from approved
readings.” It names “support teams,” says they can enter a reading or approved
CSV without querying dashboards, and provides a visible one-click **Try it
with sample data** action with the result stated beside it. This gate passed.

### End-to-end and recovery checks

- `/demo` opened three realistic cards in separate demo storage and retained
  its “Demo — sample data, nothing is saved” banner.
- Updating Northstar from 1,842 to 1,903 saved one existing card. A reviewed,
  redacted answer copy created an opaque `d_…` link; its recipient page showed
  no owner, source, or note. Revocation made it unavailable immediately.
- Local suite coverage passed for blank/malformed fields, invalid HTTPS,
  invalid freshness boundaries, invalid CSV comparison/date values, CSV
  round-trip, offline sharing recovery, expiry options, and source pages.
- A visited live demo reloaded offline with all three cards and the offline
  notice. Its active service worker was `/sw.js`, controlling the page with
  cache `tqb-shell-v7`; `registration.update()` completed with no waiting
  worker.

### Privacy, accessibility, and deployment checks

- A live full flow requested only
  `https://telemetry-question-book.sociobot.in`; the only dynamic calls were
  same-origin `/api/snapshots` calls initiated by explicit sharing actions. No
  analytics or third-party request appeared.
- Root response supplied CSP with `connect-src 'self'`, HSTS, nosniff,
  referrer policy, and permissions policy. Hashed JS/CSS were served with
  `Cache-Control: public, max-age=31536000, immutable`; service-worker and
  document responses were short-lived/revalidated as appropriate.
- Live landing, answer-copy, and privacy axe scans had **zero serious or
  critical violations**. The landing has one `h1`, `lang`, title, `main`, skip
  link, visible keyboard focus, and a dialog focused its close button and
  closed with Escape. At 390 × 844 with reduced motion, all first demo-card
  information was visible and there was no horizontal overflow. No landing or
  demo console/page errors occurred.
- The live static bundle hash
  `80c5be7ffced73d8b2922b0913697f10ad949be6f9ee8ab8e8310c66f591b5fe`
  and hero hash
  `39e465516a16937c014321bf5f95b97e00035d3a7f6792a7bf80438f48e03f06`
  matched the fresh candidate build. `/privacy`, `/terms`, `/book`, `/demo`,
  sample source routes, and the styled 404 responded as expected.

## Required next steps

1. Fix rate-limit client identity so it is sourced only from trusted platform
   connection metadata; prove a physical client cannot obtain a fresh
   allowance by setting/changing forwarding headers.
2. Deploy all candidate server functions and set `BUILD_ID` to the exact
   candidate commit, then repeat live API identity and rate-limit verification.
3. Re-run the full claim suite and all release gates after the fix.
