# 408-FORMSPREE-HOTFIX — Reliable lead delivery

The final lead submit previously depended entirely on a browser cross-origin `fetch()` to Formspree. Because the submit handler prevents native navigation first, a blocked or failed client-side transport could strand the CTA with no native Formspree fallback.

This hotfix adds:

- same-origin `/api/lead` delivery through the existing Cloudflare Pages Advanced Mode Worker;
- server-side forwarding to the existing Formspree form `mojgnegn`;
- direct Formspree `action` attributes on every non-LIFE lead form as a no-JavaScript/native fallback;
- fail-safe prospect-profile preparation so handoff code cannot prevent the first lead delivery attempt;
- no request-body logging and no lead PII in Worker responses.

The LIFE secure intake remains unchanged and outside Formspree.
