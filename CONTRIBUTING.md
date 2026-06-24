# Contributing to Finch

Thank you for your interest in contributing to Finch! This document provides guidelines for developers working on the project.

## Development Setup

1. Fork the repository:
To contribute changes, first create your own fork of this repository.

- Open the repository on GitHub.
- Click **Fork** in the upper-right corner.
- Choose your GitHub account or organization as the destination.
- Clone your fork locally:

```bash
   git clone https://github.com/YOUR_USERNAME/finch.git
   cd finch
   git remote add upstream https://github.com/blueskyproject/finch.git

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

## Tests
New components should have tests added for them under `src/testing/tests` using vitest. Modifications to existing components (like adding new props) should result in a new test being added.

For new components, manually add the new test file to `/github/workflows/test.yml` to ensure coverage via github actions.

## Pull Request Guidelines

- Ensure that you have ran `npm run test`, `npm run lint:fix`, `npm run format:fix`, and `npm run build` prior to opening a PR
- New components should have comprehensive tests added in the `src/testing` folder.
- New components should have a story added onto storybook, with at least a few variants depending on the extent of props.
- Make PR's into the `Staging` branch on Finch.

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
