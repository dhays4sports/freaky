# 408-HOME-2.7 QR Advanced Mode Worker Hotfix V2

## Production symptom

The first Advanced Mode routing patch internally requested `/home/index.html` from `env.ASSETS.fetch()`. Cloudflare Pages' asset API requires the *pretty path* (`/home/`) rather than the physical `index.html` path. The asset layer therefore redirected `/home/index.html` to `/home/`; the Worker then remapped `/home/` back to `/home/index.html`, creating `ERR_TOO_MANY_REDIRECTS`.

## Fix

- Deep flyer routes now internally fetch `/home/`, never `/home/index.html`.
- Neighbor referral routes internally fetch `/neighbor/`.
- Other wildcard page families use their pretty route equivalents.
- Canonical routes such as `/home/`, `/contact/`, `/buyer/`, `/life/`, and `/score/` pass directly to the Pages asset server.
- The visible QR URL remains unchanged, so campaign parsing and any-ZIP A/B attribution remain intact.

## Regression protection

`qa/test-home-2.7-worker-routing.js` now models Pages' `index.html -> pretty path` redirect behavior and asserts that the Worker never requests `/home/index.html` for campaign QR traffic.
