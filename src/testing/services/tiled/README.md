# Tiled server configs

Local Tiled servers for developing and testing Finch. Install Tiled once:

```sh
pip install "tiled[all]>=0.2.19"
```

Start a server from a scratch directory, not the repo root, because some configs create files in the current directory:

```sh
tiled serve config path/to/finch/src/testing/services/tiled/<config>.yml
```

It serves `http://localhost:8000/api/v1`. CORS allows the Vite dev server (`5173`, `5174`). `tiled_dev.yml` also allows Storybook (`6006`).

| Config | Use it for | Needs |
|---|---|---|
| `tiled_dev.yml` | **Start here.** Covers every feature: writes, deep search, the GraphQL graph and WebSocket streams | Redis on `localhost:6379` and a `tiled_data/` folder (see below) |
| `tiled_demo.yml` | Read-only browsing of generated example data, no login | — |
| `tiled_api_key.yml` | Single-user API key auth over the example data | `TILED_SINGLE_USER_API_KEY` |
| `tiled_username_password.yml` | Login with username and password (alice, bob, cara) | `ALICE_PASSWORD`, `BOB_PASSWORD`, `CARA_PASSWORD` |
| `tiled_oidc.yml` | ORCID login | `ORCID_CLIENT_ID`, `ORCID_CLIENT_SECRET`, and `tiled.localhost` resolving to `127.0.0.1` |

Only `tiled_dev.yml` serves a catalog. The other configs serve read-only example data, so they don't support writes, deep search, the graph or streaming.

## `tiled_dev.yml`

- **Reads** are anonymous.
- **Writes** need the API key `secret`.

```sh
redis-server --daemonize yes      # or: docker run -d -p 6379:6379 redis
mkdir -p tiled_data               # SQLite won't create the folder itself
tiled serve config path/to/tiled_dev.yml
```

In Finch, set `VITE_TILED_API_URL=http://localhost:8000/api/v1` and `VITE_TILED_API_KEY=secret`. To reset all data, delete `tiled_data/`.

### Live tests

The WebSocket test writes under `finch-playground`, so create that container once on a fresh server:

```sh
curl -X POST http://localhost:8000/api/v1/metadata/ \
  -H 'Authorization: Apikey secret' -H 'Content-Type: application/json' \
  -d '{"id":"finch-playground","structure_family":"container","metadata":{},"specs":[],"data_sources":[]}'
```

Then run both live test files:

```sh
TILED_LIVE_URL=http://localhost:8000/api/v1 TILED_LIVE_API_KEY=secret \
  npx vitest run TiledApi.live TiledWebSocket.live
```
