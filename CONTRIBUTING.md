# Contributing to Finch

Thank you for your interest in contributing to Finch! This document provides guidelines for developers working on the project.

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/bluesky/finch.git
cd finch
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. View Storybook locally:
```bash
npm run storybook
```

## Publishing Workflow

### Updating the NPM Package
Future configuration will likely support automatic npm builds through gh actions, but currently manual updates are required.

First commit any changes so your working tree is clean

Then increment the package version as appropriate

``` 
npm version patch 
```

Run the build

``` 
npm run build 
```

Publish (token required the first time)

```
npm publish
```

To verify what you're about to publish, you can check out the /dist folder.

The build can be viewed at [https://www.npmjs.com/package/@blueskyproject/finch](https://www.npmjs.com/package/@blueskyproject/finch).

### Updating Storybook on GH Pages
Please note that storybook on gh pages is hosted with a /finch path, and local development is served at /. The storybook manager and service worker are configured to look at the current path before deciding where to make files available at.

After making changes to Storybook, commit.

Then run the build and publish process

``` 
npm run deploy-storybook 
```

This will run the build process, upload the files to the gh-pages branch, and deploy the static files at [https://blueskyproject.io/finch/](https://blueskyproject.io/finch/).

## Environment Variables

When developing, you can set up environment variables in a `.env` file to configure the various backend services:

| Service  | Environment Variables | Default Value | Description |
| :---- | :---- | :---- | :---- |
| [Tiled](https://github.com/bluesky/tiled) | `VITE_API_TILED_URL` | `http://localhost:8000/api/v1` | Base URL for Tiled API endpoints |
| [Tiled](https://github.com/bluesky/tiled) | `VITE_API_TILED_API_KEY` | None | API key for authenticated Tiled requests |
| [Queue Server API](https://github.com/bluesky/bluesky-httpserver) | `VITE_QSERVER_REST` | `http://localhost:60610` | REST API endpoint for Queue Server |
| [Queue Server](https://github.com/bluesky/bluesky-queueserver) | `VITE_QSERVER_WS` | `ws://localhost:8000/queue_server` | WebSocket endpoint for Queue Server |
| Camera Service | `VITE_CAMERA_WS` | `ws://localhost:8000/pvcamera` | WebSocket endpoint for camera feeds |

## Pull Request Guidelines

- Ensure your code follows the existing style conventions
- Test your changes thoroughly
- Update documentation if necessary
- Keep commits focused and atomic

## Related Projects

- [Bluesky Queue Server](https://github.com/bluesky/bluesky-queueserver)
- [Tiled](https://github.com/bluesky/tiled)
- [Ophyd WebSocket](https://github.com/bluesky/ophyd-websocket)
