# Demo sandbox

- URL: `https://telemetry-question-book.sociobot.in/?demo=1` or `/demo`.
- Local URL: `http://localhost:5173/?demo=1`.
- Sample: three named readings for Northstar orders, Atlas webhooks, and the Harbor export. Each card links to its local sample source page.
- Question storage: `demo:tqb:v1`. Real questions use `tqb:v1` and are never read in demo mode.
- Preview storage: `demo:tqb:snapshot-preview`. Real previews use `tqb:snapshot-preview`.
- Share storage: demo metadata uses `demo:tqb:shares`; demo API tokens start with `d_` and expire within the selected limit.
- Reset: choose **Reset demo**. It revokes created demo links, clears every `demo:` key, and restores the three samples.
- Leave: choose **Start for real**. It performs the same demo cleanup and opens the real question book without reading or changing real keys.
- Banner: **Demo — sample data, nothing is saved** remains visible on `/demo` and `/demo/snapshot`.
- Offline check: load `/demo` once, wait for the service worker, disable the network, and reload.
