# ORCID OIDC setup

How to run `tiled_oidc.yml` locally so the TiledFinder's **OIDC Flow** test case (Test → TiledFinder) can log in with ORCID. This is for local testing only.

You need an ORCID account. You'll create an app on ORCID's site, which gives you a client ID and secret for your local Tiled server.

## 1. Point `tiled.localhost` at your machine

Add one line to `/etc/hosts`:

```
127.0.0.1 tiled.localhost
```

The server and the viewer both use `tiled.localhost` as the hostname.

## 2. Create the ORCID app

Go to https://orcid.org/developer-tools and create a client ID and secret.

For **Application URL**, enter `http://tiled.localhost:8000`.

![ORCID application details](images/orcid_app_screenshot.png 'ORCID app details')

For **Redirect URIs**, enter both of these:

```
http://tiled.localhost:8000/api/v1/auth/provider/orcid/authorize
http://tiled.localhost:8000/api/v1/auth/provider/orcid/code
```

![ORCID redirect URIs](images/orcid_redirect_screenshot.png 'ORCID redirect URIs')

## 3. Start the server

Export the two values from the ORCID page in the terminal that will run Tiled, then start it from the finch root:

```sh
export ORCID_CLIENT_ID=paste-from-orcid
export ORCID_CLIENT_SECRET=paste-from-orcid
tiled serve config src/testing/services/tiled/tiled_oidc.yml
```

It serves `http://tiled.localhost:8000/api/v1` and creates `tiled_sessions_oidc.db` in the current folder (ignored by git).

## How the viewer is set up for it

The test case renders:

```tsx
<TiledFinder tiledBaseUrl="http://tiled.localhost:8000/api/v1" oidcRedirectUrl="http://localhost:5173" />
```

The `TiledFinder` sends `oidcRedirectUrl` to Tiled as the `state` parameter when it starts the login, and that state is carried through every URL in the OIDC flow. At the end, Tiled redirects the popup to a small utility page (`redirect_on_success` in `tiled_oidc.yml`), which reads the state and redirects again to your localhost.

The extra hop is there because the app window can't read what's inside the popup. The browser only lets it notice when the popup is back on the app's own host, so landing on localhost is the viewer's signal that the login is done and the popup can close.

## Troubleshooting

The viewer keeps login tokens in localStorage, and the Tiled server sets cookies. When you switch between auth configs, old tokens, cookies or cached responses can get in the way. The TiledFinder test page clears the tokens and the `tiled_csrf` cookie when you change cases; if logins still misbehave, clear the site data by hand.

In Chrome, right-click → Inspect, open **Application**, and clear the site's storage:

![Clearing site data in Chrome](images/reset_browser_screenshot.png 'Clear site data')
