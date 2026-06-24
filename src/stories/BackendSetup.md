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
| [Queue Server](https://github.com/bluesky/bluesky-queueserver)   | Yes  | 60625 |
| [Queue Server API<sup>2</sup>](https://github.com/bluesky/bluesky-httpserver) | Yes | 60610 |

1\. Ophyd API is under active development, it primarily includes websockets for live device updates but is subject to ongoing changes and potential integration with 'Ophyd as a Service.'

2\. The Queue Server API is formally named 'bluesky http server.'