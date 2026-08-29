# Independent product verification 3 — FAIL

## Decision

**FAIL — candidate `fa32cba7f09cff6edcf881779dd47c7b040bfd76` is not acceptable for release.**

- Repository/branch: `B-Divyesh/sf-telemetry-question-book`, `main`
- Candidate checked out before testing: `fa32cba7f09cff6edcf881779dd47c7b040bfd76`
- Production URL: <https://telemetry-question-book.sociobot.in>
- Verified: 29 August 2026 UTC
- Environment: Node 22.23.2, npm 10.9.8, Playwright 1.58.2, Chromium 145.0.7632.6, Lighthouse 12.8.2
- Product source was not changed. Only this verification report and the handoff were changed for delivery.

The static artifact, core workflows, all registered claims, accessibility, offline behavior, privacy request boundary, and performance pass. Release is blocked by the anonymous snapshot API: it has no enforced request allowance or `429`/`Retry-After`, expired customer-data payloads are not removed unless the expired link is requested, and malformed typed payloads are accepted. The health endpoint also provides no build identity, so exact parity of the deployed function code cannot be established.

## Release-blocking findings

### High — anonymous snapshot API has no rate limit

The acceptance contract requires every server endpoint to enforce a documented per-client allowance and return `429` with `Retry-After` after it is exceeded.

Fresh live probes from one client produced:

| Probe | Requests | Responses | `429` | `Retry-After` |
| --- | ---: | --- | ---: | --- |
| `GET /api/health` | 200 | 200 × `200` | 0 | absent |
| invalid `POST /api/snapshots` | 120 | 120 × `400` | 0 | absent |

No allowance is documented in the README or API files. There is no rate-limit branch or middleware in `api/`. This exposes the anonymous, storage-writing snapshot endpoint to cost and abuse. Observed allowance: **none within 200 health requests and 120 create attempts; no enforced limit was found**.

Required repair: document a per-client allowance, enforce it before validation/storage on all anonymous API routes, return `429`, and include a valid `Retry-After` header. Add a deterministic claim/integration test.

### High — expiry does not automatically remove stored snapshot payloads

The privacy page states: “The service stores it until expiry or revocation.” The researched brief says snapshots may contain customer data and need expiry.

The implementation stores `payload` in Azure Table Storage. It removes that payload on revocation, but on expiry it calls `removePayload()` only inside `GET /api/snapshots/{token}` after detecting an expired record. There is no scheduled cleanup, TTL-backed store, or other expiry worker. If nobody requests a link after its deadline, its answer payload can remain stored indefinitely.

This is also an unlisted/unproved privacy claim: `.factory/claims.json` proves that recipient access returns `410` after expiry, but it does not prove automatic deletion at the stated expiry.

Required repair: enforce deletion independently of future reads (for example, TTL-capable storage or a scheduled cleanup), document the retention boundary precisely, and add a test that inspects storage after expiry without first reading the expired token.

## Other findings

### Medium — snapshot API accepts invalid field types

`POST /api/snapshots` checks required-key presence and total serialized size, but not field types or date validity. A fresh live request with `question: null`, an object-valued answer, a numeric status, and invalid dates returned `201` and created a link. Opening it showed:

```text
This answer link is no longer available
Cannot read properties of null (reading 'replace')
```

The probe was revoked (`204`) after inspection. Required repair: schema-validate types, lengths, dates, enum values, and the redaction invariant at the API boundary; reject malformed data with `400` and a plain error.

### Medium — deployed function build identity cannot be confirmed

All 14 public static artifacts match the local candidate build byte-for-byte. The live health response is only:

```json
{"ok":true,"snapshotStoreConfigured":true}
```

It has no commit, build, or deployment identifier. Live API behavior matches the expected lifecycle, but exact deployed function parity with the candidate cannot be proven. Add a non-secret build identifier to `/api/health` and inject it during deployment.

## Mandatory first-read and demo gate

**PASS.** On a cold 390 × 844 load, the first screen plainly answers:

- What it does: turns approved readings into recurring answers and answer copies.
- Who it is for: support teams that should not receive broad dashboard access.
- What to click first: **Try it with sample data**, followed by “Opens a filled question book in one click.”

The click opened `/demo`. The first demo screen showed the persistent “Demo — sample data, nothing is saved” banner, **Reset demo**, **Start for real**, three realistic named questions, and the first complete reading card. The same result works at `?demo=1`.

## Required claims gate

`.factory/claims.json` exists and contains 18 claims. A literal pre-install invocation could not start TypeScript because a clean clone has no `node_modules`; after the required `npm ci` lockfile install, every exact command was rerun independently. **18/18 passed; no claim assertion failed.**

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `demo-controls` | PASS |
| `card-fields` | PASS |
| `local-browser` | PASS |
| `free-core` | PASS |
| `threshold-states` | PASS |
| `offline-reload` | PASS |
| `question-update` | PASS |
| `csv-import` | PASS |
| `csv-validation` | PASS |
| `csv-template` | PASS |
| `answer-copy-security` | PASS |
| `answer-copy-download` | PASS |
| `expiring-share` | PASS |
| `share-redaction` | PASS |
| `share-revocation` | PASS |
| `least-privilege-input` | PASS |
| `sample-sources` | PASS |

The separate privacy-retention sentence noted above is not covered by a claim that proves deletion at expiry.

## Install, tests, build, and dependency checks

| Command | Result |
| --- | --- |
| `npm ci` | PASS; 105 packages, 0 audit findings during install |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS; 24/24 Playwright tests |
| `npm run build` | PASS; `dist/index.html` produced |
| `npm audit --audit-level=high` | PASS; 0 vulnerabilities |
| `npm audit --omit=dev --audit-level=high` | PASS; 0 vulnerabilities |
| `npm --prefix api audit --audit-level=high` | PASS; 0 vulnerabilities |

Exact production build sizes:

- JS: 34,511 bytes raw / 11.21 kB gzip.
- CSS: 16,808 bytes raw / 4.79 kB gzip.
- Mobile hero: 42,650 bytes.
- Largest image: 108,344 bytes.
- Fonts: none downloaded.

These are inside the 200 kB JS, 50 kB CSS, 120 kB font, and 300 kB mobile-hero budgets.

## End-to-end and boundary behavior

Fresh local and live browser runs covered the smallest useful workflow:

- Empty real book → add a question → reject an HTTP source URL → correct it to HTTPS → save → reload persistence: PASS.
- Zero current value and zero threshold with “equals,” plus a one-minute freshness limit: PASS.
- Update the existing reading without creating a duplicate: PASS.
- Import malformed CSV and receive a specific missing-column error: PASS.
- Recover with quoted CSV containing a comma and `freshMinutes=10080`: PASS.
- Download and observe the CSV template: PASS.
- Create a redacted answer copy with no data in the URL: PASS.
- Create an expiring same-origin link, open it in another page, revoke it, and observe unavailable state: PASS.
- Cancel deletion, confirm deletion, reset demo, and leave demo without changing real data: PASS.
- Exact local claim boundaries also covered freshness `0`, `1`, `1.5`, `10080`, and `10081`: PASS.

The live API accepted valid TTLs, rejected TTL `0` with `400`, rejected an incomplete snapshot with `400`, rejected a payload over 8,192 serialized characters with `413`, rejected a wrong revoke key with `403`, and returned `410` after a correct revoke. Twenty concurrent live creates produced 20 unique tokens; all 20 reads returned `200`, all 20 revocations returned `204`, and all 20 subsequent reads returned `410`.

## Privacy and security evidence

The complete live demo/edit/share/open/revoke flow generated 27 browser requests. Every request used the sole origin `https://telemetry-question-book.sociobot.in`. The only dynamic requests were first-party snapshot `POST`, `GET`, and `DELETE` calls initiated by the explicit share workflow. No analytics, external font/script, account, telemetry query, alerting, billing, Azure OpenAI, or other third-party request occurred.

The deliberate post-revocation reload produced the expected browser failed-resource console entry for HTTP `410`; normal routes and workflows had no console or page errors.

Static HTML responses include HSTS, `nosniff`, strict-origin referrer policy, camera/microphone/geolocation denial, and a same-origin CSP with no `unsafe-inline`. HTML and the service worker revalidate after 30 seconds. Hashed JS/CSS use a one-year immutable cache. The API sends HSTS and `Cache-Control: no-store`.

There is no sign-in and no paid unlock in this free release, so Entra-authority and billing-unlock checks are not applicable. No AI feature is present, which fits the brief's explicit no-LLM constraint.

## Accessibility, keyboard, mobile, and routes

- `/opt/fleet/lib/verify-url.sh`: PASS; HTTP 200, title, `lang=en`, one `h1`, `main`, all image alt attributes, labeled buttons, and no normal-load console errors.
- Fresh axe matrix: local and live, eight routes, desktop 1440 × 900 and mobile 390 × 844; **32 scans, zero serious/critical findings**.
- No horizontal overflow and no visible interactive target below 44 × 44 CSS pixels in the tested mobile UI.
- Keyboard first focus is the visible skip link. The demo action operates with Enter. Dialog Escape closes it and restores focus to **Make answer copy**.
- Visible focus: 3 px outline plus outer ring.
- Reduced motion: answer-ticket animation measured `0.00001s`; no waiting service-worker update.
- One `h1`, one `main`, route-specific title/canonical metadata, and image alt coverage passed on every tested route.
- Internal link crawl across all public routes returned 200; `https://sociobot.in/` returned 200; mail links are explicit.
- Unknown application route returns the designed HTTP 404.

The project intentionally uses one light treatment, documented in `.factory/design.md`.

## PWA and offline behavior

The live service worker activated cache `tqb-shell-v4`; `registration.update()` left no worker waiting or installing. After an online `/demo` visit, an offline reload returned the cached page, displayed the offline notice, and retained all three sample cards without console errors.

## Performance

Fresh mobile Lighthouse rerun:

| Category/metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| FCP | 0.9 s |
| LCP | 1.2 s |
| TBT | 0 ms |
| CLS | 0 |

The measured initial transfer was about 60.9 kB over five requests, with no font or third-party request.

## Deployment parity

The following 14 local `dist/` artifacts matched production byte-for-byte by SHA-256: `index.html`, hashed JS, hashed CSS, `404.html`, `404.css`, `sw.js`, manifest, robots, sitemap, favicon, Apple touch icon, both responsive hero images, and the social preview.

This proves static deployment parity with the candidate. Exact API code parity remains unprovable because `/api/health` has no build identity, as recorded above.

## Applicability notes

- Library/CLI pack-install: not applicable; this is a web product.
- Sign-in/Entra: not applicable; there is no sign-in.
- Paid unlock: not applicable; the live release is free and has no checkout.
- Backend checks: snapshot concurrency and persistence across requests pass; rate limiting, expiry retention, malformed types, and build identity fail as detailed above.

## Release recommendation

Do not release candidate `fa32cba7f09cff6edcf881779dd47c7b040bfd76`. Repair and test the four findings, then run a new independent verification against a new candidate commit and deployed API build identity.
