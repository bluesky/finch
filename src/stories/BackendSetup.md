# Backend Setup
By itself Finch is simply a component library that runs in the browser. It is 'frontend' only.

Unlike other common component libraries, Finch requires specific backend services to be running and accessible to make use of its features. These backend services are primarily Bluesky related, but also include analaysis tools.

## Installing Finch related backends
All of the necessary backend services are conveniently located within [Bluesky Web](https://github.com/als-computing/Bluesky-Web). The Bluesky Web repository includes a docker compose setup for running everything off a single command in containers. Alternatively, each service can be started individually by following the documentation.

Instructions for setting those services are left to Bluesky Web, but a list of the general services and the supported components are provided below for reference. 

| Service  | PIP installable? | Default Port |
| :---- | :-: | -: |
| [Tiled](https://github.com/bluesky/tiled) | Yes | 8000 |
| [Ophyd API<sup>1</sup>](https://github.com/bluesky/ophyd-websocket) | No  | 8001 |
| [Frontend API](https://github.com/als-computing/bluesky-web/tree/main/frontend-api) | No | 8002 |
| [Queue Server](https://github.com/bluesky/bluesky-queueserver)   | Yes  | 60625 |
| [Queue Server API<sup>2</sup>](https://github.com/bluesky/bluesky-httpserver) | Yes | 60610 |

1\. Ophyd API is under active development, it primarily includes websockets for live device updates but is subject to ongoing changes and potential integration with 'Ophyd as a Service.'

2\. The Queue Server API is formally named 'bluesky http server.'

# Specifying backend URLs and keys with environment variables
Whether using Finch directly cloned down from Github or by installing it via NPM, environment variables can be used to conveniently alter the addresses and API keys used for connections between Finch and the backend services.

These variables are passed into `FinchConfigProvider` via `import.meta.env` in `App.tsx`. See the **Configuration** page for the full provider setup.

| Service | Environment Variable | `FinchConfig` field | Default |
| :---- | :---- | :---- | :---- |
| Tiled | `VITE_TILED_API_URL` | `tiledApiUrl` | `http://localhost:8000/api/v1` |
| Tiled | `VITE_TILED_API_KEY` | `tiledApiKey` | none |
| Ophyd API | `VITE_OPHYD_API_URL` | `ophydApiUrl` | `http://localhost:8001/api/v1` |
| Queue Server API | `VITE_QSERVER_API_URL` | `qServerApiUrl` | `http://localhost:60610/api` |
| Queue Server API | `VITE_QSERVER_API_KEY` | `qServerApiKey` | `test` |
| Finch API | `VITE_FINCH_API_URL` | `finchApiUrl` | `http://localhost:8002` |