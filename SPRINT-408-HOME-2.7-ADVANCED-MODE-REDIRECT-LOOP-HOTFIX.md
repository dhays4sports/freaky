# 408-HOME-2.7 — Advanced Mode Redirect Loop Hotfix

## Production symptom
After moving QR/campaign routing into `_worker.js`, every non-root pretty-path page could enter `ERR_TOO_MANY_REDIRECTS` while the root `/` remained available.

## Root cause
`env.ASSETS.fetch()` applies Pages redirect rules. The existing `_redirects` file rewrote directory routes such as `/home/` to `/home/index.html`. Pages pretty-path handling then canonicalized the `index.html` request back to `/home/`, creating a cycle. The same pattern affected `/contact/`, `/buyer/`, `/life/`, `/score/`, and other directory pages.

## Fix
- Application rewrites were removed from `_redirects`.
- `_worker.js` remains the single owner of application routing in Advanced Mode.
- Deep campaign/referral routes internally fetch their canonical pretty directory route.
- No-trailing-slash canonical entry points receive one explicit 308 redirect to the trailing-slash route.
- Static asset requests pass directly to `env.ASSETS.fetch()`.

## Certified behavior
- `/home/` -> asset `/home/`, no loop
- `/contact/` -> asset `/contact/`, no loop
- `/buyer/` -> asset `/buyer/`, no loop
- `/life/` -> asset `/life/`, no loop
- `/score/` -> asset `/score/`, no loop
- `/home/qr/<ZIP>/rate/` -> internally serves `/home/`
- `/home/qr/<ZIP>/fit/` -> internally serves `/home/`
- `/neighbor/r/<token>` -> internally serves `/neighbor/`

## Regression guard
`qa/test-advanced-mode-redirect-loop-hotfix.js` forbids application `index.html` rewrites from returning to `_redirects` and simulates canonical/deep route handling through the Worker.
