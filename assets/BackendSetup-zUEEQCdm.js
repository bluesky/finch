import{j as e}from"./jsx-runtime-Cf8x2fCZ.js";import{useMDXComponents as i}from"./index-DI2gBlDf.js";import"./blocks--vfVlVOs.js";import{ap as r,aq as o}from"./index-BzC3Bucw.js";import"./index-yBjzXJbu.js";import"./index-BlmOqGMO.js";import"./iframe-BqabXyU_.js";import"../sb-preview/runtime.js";import"./index-DHavueZW.js";import"./index-fNjTmf9T.js";import"./index-CXQShRbs.js";import"./index-DrFu-skq.js";const a=`# Backend Setup
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

1\\. Ophyd API is under active development, it primarily includes websockets for live device updates but is subject to ongoing changes and potential integration with 'Ophyd as a Service.'

2\\. The Queue Server API is formally named 'bluesky http server.'

# Specifying URLS/PORTS with environment variables
Whether using Finch directly cloned down from Github or by installing it via NPM, environment variables can be used to conveniently alter the ports and addresses used for connections between Finch and the backend services.

A list of environment variables and their corresponding services are provided below.

| Service  | Environment Variables | Default Value | Description |
| :---- | :---- | :---- | :---- |
| [Tiled](https://github.com/bluesky/tiled) | \`VITE_API_TILED_URL\` | \`http://localhost:8000/api/v1\` | Base URL for Tiled API endpoints |
| [Tiled](https://github.com/bluesky/tiled) | \`VITE_API_TILED_API_KEY\` | None | API key for authenticated Tiled requests |
| [Queue Server API](https://github.com/bluesky/bluesky-httpserver) | \`VITE_QSERVER_REST\` | \`http://localhost:60610\` | REST API endpoint for Queue Server |
| [Queue Server](https://github.com/bluesky/bluesky-queueserver) | \`VITE_QSERVER_WS\` | \`ws://localhost:8000/queue_server\` | WebSocket endpoint for Queue Server |
| Camera Service | \`VITE_CAMERA_WS\` | \`ws://localhost:8000/pvcamera\` | WebSocket endpoint for camera feeds |`;function s(t){return e.jsxs(e.Fragment,{children:[e.jsx(r,{title:"Documentation/BackendSetup"}),`
`,e.jsx(o,{children:a})]})}function g(t={}){const{wrapper:n}={...i(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(s,{...t})}):s()}export{g as default};
