
# finch

  ![finch_icon](https://github.com/user-attachments/assets/bf17cfe1-5df5-4fcd-8c4d-3a99982ce2fe)  
  
A React component library for Bluesky beamlines. 

To view components in your browser and see documentation check out our growing [interactive library.](https://blueskyproject.io/finch)


#  Installation

> **New project?** Scaffold a Vite + React 18 + TypeScript app first:
> ```bash
> npm create vite@5 my-app -- --template react-ts
> cd my-app
> npm install
> ```
> This creates a project pinned to React 18. Then follow the steps below.

Once you have your own React app setup, install finch in the root project directory with:
```
npm install @blueskyproject/finch
```

You will also need the following peer dependencies if not already installed:
```
npm install react@^18 react-dom@^18 react-router^7 @tanstack/react-query
```

Note Finch only supports React V16-18.

## App Setup

Finch components rely on three providers that must wrap your app:

1. **`QueryClientProvider`** — from `@tanstack/react-query`, required for data fetching hooks used by QServer and other components.
2. **`BrowserRouter`** — from `react-router`, required for routing-based components like `HubAppLayout`.
3. **`FinchConfigProvider`** — from `@blueskyproject/finch`, configures backend service URLs and API keys used throughout the library.

```tsx
// main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FinchConfigProvider } from '@blueskyproject/finch';
import '@blueskyproject/finch/style.css'; //<--Import this file once at the top level
import App from './App';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <FinchConfigProvider config={{
          tiledApiUrl: 'http://localhost:8000/api/v1',
          tiledApiKey: 'your-tiled-key',
          ophydApiUrl: 'http://localhost:8001/api/v1',
          qServerApiUrl: 'http://localhost:60610/api',
          qServerApiKey: 'your-api-key',
        }}>
          <App />
        </FinchConfigProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
```
You will only need to import `'@blueskyproject/finch/style.css'` once, in your entry point.

All `FinchConfig` fields are optional — only provide the URLs for the services your app uses:

| Field | Description | Default |
|---|---| -- |
| `qServerApiUrl` | URL of the Bluesky Queue Server HTTP API | http://localhost:60610/api |
| `qServerApiKey` | API key for Queue Server authentication | test |
| `tiledApiUrl` | URL of the Tiled data API | http://localhost:8000/api/v1 |
| `tiledApiKey` | API key for Tiled authentication | `undefined` |
| `ophydApiUrl` | URL of the Ophyd WebSocket server | http://localhost:8001/api/v1 |
| `finchApiUrl` | URL of an optional Finch backend API | |

Prefer to use env variables?

```javascript
        <FinchConfigProvider config={{
          tiledApiUrl: import.meta.env.VITE_TILED_API_URL,
          tiledApiKey: import.meta.env.VITE_TILED_API_KEY,
          ophydApiUrl: import.meta.env.VITE_OPHYD_API_URL,
          qServerApiUrl: import.meta.env.VITE_QSERVER_API_URL,
          qServerApiKey: import.meta.env.VITE_QSERVER_API_KEY,
        }}>
```

Put your env variables in a `.env` file in the project root, or set them in your terminal.
```
VITE_TILED_API_URL=http://localhost:8000/api/v1
VITE_OPHYD_API_URL=http://localhost:8001/api/v1
VITE_QSERVER_API_URL=http://localhost:60610/api

VITE_QSERVER_API_KEY=test
VITE_TILED_API_KEY=a-really-long-key
```

## App.tsx — Using HubAppLayout with Pages

`HubAppLayout` provides a full app shell with a sidebar, header, and routed content area. Define your pages as components and pass them as a `routes` array.

Icons are optional but recommended for the sidebar. [Phosphor Icons](https://phosphoricons.com/) are recommended for consistency with other Finch components.
```
npm install @phosphor-icons/react
```

```tsx
// App.tsx
import { HubAppLayout, RouteItem } from '@blueskyproject/finch';
import { HouseIcon, GaugeIcon, ChartLineIcon } from '@phosphor-icons/react';
import { TiledLookup } from '@blueskyproject/finch';
import { BeamEnergyPV, Hexapod, Histogram, Bento } from '@blueskyproject/finch';

// Example pages, typically imported from src/pages
function HomePage() {
  return <div>Welcome to my beamline app!</div>;
}

function ControlsPage() {
  return (
    <div>
      <h2>Device Controls</h2>
      <Bento>

        <BeamEnergyPV pv="fake mirror" demo={true} />
        <Hexapod prefix="fake hexapod" demo={true} />
        <Histogram arrayPV="fake array" acquirePV="fake acquire" demo={true} />
    </Bento>
    </div>
  );
}

function DataPage() {
  return (
    <div className="flex flex-col w-full h-full">
      <p>Data visualization goes here.</p> 
      <TiledLookup backgroundClassName='text-slate-700'/>
    </div>
  );
}

function App() {
  const routes: RouteItem[] = [
    {
      path: '/',
      label: 'Home',
      element: <HomePage />,
      icon: <HouseIcon size={32} />,
      isBackgroundTransparent: true,
    },
    {
      path: '/controls',
      label: 'Controls',
      element: <ControlsPage />,
      icon: <GaugeIcon size={32} />,
      isBackgroundTransparent: true,
    },
    {
      path: '/data',
      label: 'Data',
      element: <DataPage />,
      icon: <ChartLineIcon size={32} />,
      isBackgroundTransparent: true,
    },
  ];

  return (
    <HubAppLayout
      routes={routes}
      headerTitle="My Beamline App"
    />
  );
}

export default App;
```

Each route entry supports:
- `path` — the URL path (e.g. `"/controls"`)
- `label` — text shown in the sidebar navigation
- `element` — the React component to render for that route
- `icon` — optional React element shown next to the label in the sidebar
- `isBackgroundTransparent` — when `true`, renders the page with a transparent background and white text as a default (good for separate components on the same page)
- `classNameContainer` — additional CSS classes for the page container


## Alternative Installation - Clone This Repo
Instead of installing Finch into your existing React app, you can install this repository directly and get access to preconfigured layouts and pages.
```bash
git clone https://github.com/bluesky/finch.git
cd finch
npm install
npm run dev
```
The app should be running at [http://localhost:5173/](http://localhost:5173/)

# Requirements
Some components in this library require network access to the Bluesky Queue Server, Tiled, and Ophyd-Websocket. The components are designed to work out of the box with the default ports for each service. 

Specific paths/ports can be set at runtime with environment variables, or alternatively passed in as props to components that need them.

For detailed backend setup instructions, see our [Backend Setup documentation](https://blueskyproject.io/finch/?path=/docs/documentation-backendsetup--docs).

## Related Projects
- [Queue Server](https://github.com/bluesky/bluesky-queueserver)
- [Tiled](https://github.com/bluesky/tiled)
- [Ophyd WebSocket](https://github.com/bluesky/ophyd-websocket)

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for development and publishing guidelines.
