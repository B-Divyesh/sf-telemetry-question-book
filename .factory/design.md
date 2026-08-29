# Telemetry Question Book — visual thesis

## Direction

**Mid-century instrument panel.** The interface borrows the calm, legible order of a 1950s lab console: painted metal, inset paper labels, rotary control marks, indicator lamps, and one purposeful amber needle. This fits a product that translates volatile telemetry into a small set of governed, dependable readings. It should feel maintained and accountable, not futuristic or like another monitoring dashboard.

The landing page places the live question book beside a cutaway instrument illustration. Product screens use the same console grammar: questions are paper strips mounted to a dark faceplate, states are both words and lamps, and freshness is shown on a small calibrated scale. Decoration always explains trust, ownership, or freshness.

## Palette

Single light mode, painted explicitly. A dark mode would weaken the physical cream-paper thesis; the dark console itself supplies local contrast.

| Token | Value | Use |
| --- | --- | --- |
| `--paper` | `#F2E9D8` | page background, label stock |
| `--paper-deep` | `#DED1B9` | ruled sections, recessed wells |
| `--ink` | `#182823` | primary text |
| `--muted` | `#46554E` | secondary text |
| `--panel` | `#173B36` | instrument face |
| `--panel-raised` | `#214B44` | raised controls |
| `--cream` | `#FFF9E9` | text on dark panel |
| `--amber` | `#D96F32` | primary action, active needle |
| `--amber-dark` | `#8B3818` | action hover and outer focus contrast |
| `--switch-ink` | `#000000` | primary switch labels; stays above 4.5:1 through the paper-grain overlay |
| `--good` | `#2E6B51` | healthy state, paired with “On track” |
| `--warn` | `#8A4D0E` | stale or watch state, paired with text |
| `--danger` | `#92302C` | missed or error state, paired with text |
| `--line` | `#A99C83` | borders and calibrated rules |

All text combinations meet WCAG AA. State is never expressed by color alone.

## Type

- Display and labels: `Arial Narrow`, `Roboto Condensed`, `Franklin Gothic Medium`, system sans-serif. Narrow uppercase labels evoke engraved panel legends without a font download.
- Body and data: `IBM Plex Mono`, `Menlo`, `Consolas`, monospace. The mono rhythm makes freshness, values, and owners scan like readings. System fonts keep the font budget at zero and avoid third-party requests.
- Scale: 14 / 16 / 19 / 24 / 40 / 64 px. Body never falls below 16 px.

## Spacing and shape

- 8 px base grid; main section spacing 80–112 px desktop and 56–72 px mobile.
- Content measure caps at 68 characters.
- Corners are clipped or lightly rounded (2–8 px), like stamped sheet metal rather than soft SaaS pills.
- Borders are 1–2 px. Shadows are short and hard: an object is either mounted, inset, or flush.
- Controls are at least 44 × 44 px with 8 px separation.

## Interaction grammar

- Primary buttons resemble amber physical switches: rectangular, uppercase label, 2 px dark edge, and a 2 px downward press.
- Links are underlined. Status selectors act like labeled instrument positions.
- Answer-copy previews appear as fresh paper tickets sliding from a narrow output slot.
- Route changes focus the new `h1` and announce it.
- Destructive actions ask for confirmation. Edits stay local until the user downloads an answer copy.

## Motion

The signature motion is one needle settling into a status band over 240 ms, paired with a brief lamp fade. Paper answer copies rise 8 px into place over 180 ms. No element loops. With `prefers-reduced-motion: reduce`, transforms are removed and all state changes are instant.

## Asset plan and prompt sheet

One original raster hero illustration shows a compact tabletop question console. It clarifies the product: approved input enters on one side; a plain answer ticket exits on the other. UI screenshots remain real HTML.

**Prompt**

> Use case: stylized-concept. Asset type: landing-page hero illustration and source for social preview. Primary request: a compact 1950s laboratory instrument console that translates a stack of telemetry printouts into one clean answer ticket. Scene: isolated tabletop cutaway, no people. Subject: cream and deep forest-green painted metal console, three amber indicator lamps, one analog freshness dial, paper feed entering at left and a blank ivory answer card exiting at right. Style: hand-painted editorial gouache with crisp screen-print edges, subtle paper grain, realistic functional controls, warm archival technical-manual mood. Composition: landscape 3:2, console centered toward the right, generous uncluttered cream negative space on the left, slightly elevated three-quarter view. Lighting: soft north-window studio light, grounded shadow. Palette: parchment cream, deep green, burnt orange, muted brass, charcoal. Avoid: readable text, letters, numbers, logos, brands, people, hands, dashboards, neon gradients, glossy 3D, steampunk clutter, watermark.

Generated with the factory image deployment on 2026-08-28. The selected image is original to this product. Source PNG and prompt sidecar live under `assets/src/`; optimized WebP variants live under `public/assets/`.

## 404 treatment

The 404 page is a disconnected instrument bay: an outlined empty socket marked in plain text, with one amber switch back to the question book. It uses CSS, not a second decorative image.
