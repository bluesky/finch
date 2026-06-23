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

## Pre Commit Hooks
Husky is used to run pre-commit hooks. To skip these and commit directly add the `-n` flag like:`git commit -m "..." -n`

## Pull Request Guidelines

- Ensure that you have ran `npm run test`, `npm run lint:fix`, `npm run format:fix`, and `npm run build` prior to opening a PR
- New components should have comprehensive tests added in the `src/testing` folder.
- Make PR's into the `Staging` branch on Finch

## Publishing Workflow

### Updating the NPM Package
NPM packages are created whenever a new release is made via github actions. To support this, the staging branch should have incremented the NPM version prior to merging into main.

Outside of github actions, the general procedure is outlined below.

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
Storybook is updated automatically via github actions on merges into main. Manual update methods are shown below.

Please note that storybook on gh pages is hosted with a /finch path, and local development is served at /. The storybook manager and service worker are configured to look at the current path before deciding where to make files available at.

After making changes to Storybook, commit.

Then run the build and publish process

``` 
npm run deploy-storybook 
```

This will run the build process, upload the files to the gh-pages branch, and deploy the static files at [https://blueskyproject.io/finch/](https://blueskyproject.io/finch/).

## Related Projects

- [Bluesky Queue Server](https://github.com/bluesky/bluesky-queueserver)
- [Tiled](https://github.com/bluesky/tiled)
- [Ophyd WebSocket](https://github.com/bluesky/ophyd-websocket)
