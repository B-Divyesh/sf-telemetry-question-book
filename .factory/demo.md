# Demo sandbox

- URL: `https://telemetry-question-book.sociobot.in/demo` or `/?demo=1`
- Local URL: `http://localhost:5173/demo`
- Sample: three question cards for an order feed, webhook queue, and daily export. Each card links to a working local sample source page.
- Storage namespace: `demo:tqb:v1`. Real questions use `tqb:v1` and are never read while the demo banner is visible.
- Reset: choose **Reset demo** in the persistent banner.
- Leave: choose **Start for real**. This deletes the demo key and opens the empty real book.
- Answer copy: choose **Make answer copy**. Its preview uses session storage key `tqb:snapshot-preview`; no answer data enters the URL.
- Offline check: load `/demo` once in a production build, wait for the service worker, then disable the network and reload.
