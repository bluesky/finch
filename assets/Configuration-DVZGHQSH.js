import{j as n}from"./jsx-runtime-Cf8x2fCZ.js";import{useMDXComponents as i}from"./index-DI2gBlDf.js";import"./blocks-B19T8d9-.js";import{W as t,a5 as a}from"./index-D0tn-N0q.js";import"./index-yBjzXJbu.js";import"./index-BlmOqGMO.js";import"./iframe-U_WlO_lp.js";import"../sb-preview/runtime.js";import"./index-czWnIymw.js";import"./index-fNjTmf9T.js";import"./index-cS34vJOP.js";import"./index-DrFu-skq.js";const s=`# Configuration

Finch components that communicate with backend services (Tiled, Ophyd WebSocket, Queue Server) rely on three providers that must wrap your application.

## Required providers

- **\`QueryClientProvider\`** — required for all react-query data-fetching hooks (queue server, tiled).
- **\`BrowserRouter\`** — required by the routing-based component \`HubAppLayout\` (not required if you don't use that component).

## Optional providers
- **\`FinchConfigProvider\`** — distributes backend URLs and API keys to all Finch components and hooks (reduces prop drilling).

## Provider Example

\`\`\`tsx
// main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FinchConfigProvider } from '@blueskyproject/finch';
import '@blueskyproject/finch/style.css';
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
\`\`\`


# FinchConfigProvider fields

FinchConfigProvider accepts a config object with fields for making API calls to various Bluesky services. All fields are optional. Components fall back to localhost defaults when a field is omitted.

\`\`\`tsx
  <FinchConfigProvider config={{
    tiledApiUrl: 'http://localhost:8000/api/v1',
    tiledApiKey: 'your-tiled-key',
    ophydApiUrl: 'http://localhost:8001/api/v1',
    qServerApiUrl: 'http://localhost:60610/api',
    qServerApiKey: 'your-api-key',
  }}>
    <App />
  </FinchConfigProvider>
\`\`\`

| Field | Default | Description |
| :--- | :--- | :--- |
| \`tiledApiUrl\` | \`http://localhost:8000/api/v1\` | URL of the Tiled data API |
| \`tiledApiKey\` | \`undefined\` | API key for authenticated Tiled requests |
| \`ophydApiUrl\` | \`http://localhost:8001/api/v1\` | Base URL for the Ophyd WebSocket server |
| \`qServerApiUrl\` | \`http://localhost:60610/api\` | URL of the Bluesky Queue Server HTTP API |
| \`qServerApiKey\` | \`test\` | API key for Queue Server authentication |
| \`finchApiUrl\` | \`undefined\` | URL of an optional Finch backend API |

\`FinchConfigProvider\` automatically validates and normalises URLs on mount — trailing slashes are stripped, and a protocol (\`http://\` or \`https://\`) is added if missing for localhost addresses.

## Using env variables for finch config

When running the app from the cloned repo or configuring a deployment, the standard approach is to pass env variables into \`FinchConfigProvider\`:

\`\`\`tsx
<FinchConfigProvider config={{
  tiledApiUrl:    import.meta.env.VITE_TILED_API_URL,
  tiledApiKey:    import.meta.env.VITE_TILED_API_KEY,
  ophydApiUrl:    import.meta.env.VITE_OPHYD_API_URL,
  qServerApiUrl:  import.meta.env.VITE_QSERVER_API_URL,
  qServerApiKey:  import.meta.env.VITE_QSERVER_API_KEY,
  finchApiUrl:    import.meta.env.VITE_FINCH_API_URL,
}}>
\`\`\`

## Using JSON file for finch config
It is also possible to load in a config based on a JSON file at runtime, which can be useful for containerized deployments or other setups where env vars are less convenient.

\`\`\`js
// public/finch.config.json
{
  "tiledApiUrl": "http://localhost:8000/api/v1",
  "tiledApiKey": "your-tiled-api-key",
  "ophydApiUrl": "http://localhost:8001/api/v1",
  "qServerApiUrl": "http://localhost:60610/api",
  "qServerApiKey": "your-qserver-api-key",
  "finchApiUrl": "http://localhost:8002"
}
\`\`\`

Then in your app, load the json with an async function  (shown in the same file for convience)

\`\`\`js
// main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FinchConfigProvider } from '@blueskyproject/finch';
import type { FinchConfig } from '@blueskyproject/finch';
import '@blueskyproject/finch/style.css';
import App from './App';

const queryClient = new QueryClient();

async function loadFinchConfig(): Promise<Partial<FinchConfig>> {
  try {
    const response = await fetch('/finch.config.json');

    if (!response.ok) {
      console.warn(
        \`Could not load finch.config.json: \${response.status} \${response.statusText}\`
      );
      return {};
    }

    return await response.json();
  } catch (error) {
    console.warn('Could not load finch.config.json:', error);
    return {};
  }
}

function renderApp(config: Partial<FinchConfig>) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <FinchConfigProvider config={config}>
            <App />
          </FinchConfigProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </StrictMode>
  );
}

loadFinchConfig().then(renderApp);
\`\`\`

See the **BackendSetup** page for the full list of env variables and their corresponding services.

## Reading config in custom code

\`\`\`tsx
import { useOptionalFinchConfig } from '@blueskyproject/finch';

function MyWidget() {
  const config = useOptionalFinchConfig();
  // config is null when used outside FinchConfigProvider
  const tiledUrl = config?.tiledApiUrl ?? 'http://localhost:8000/api/v1';
  // ...
}
\`\`\`

\`useOptionalFinchConfig\` returns \`null\` when called outside a \`FinchConfigProvider\` — useful for components that should gracefully degrade. If your component always requires the provider, throw an error instead (the unexported \`useFinchConfig\` does this internally).
`;function r(e){return n.jsxs(n.Fragment,{children:[n.jsx(t,{title:"Documentation/Configuration"}),`
`,n.jsx(a,{children:s})]})}function C(e={}){const{wrapper:o}={...i(),...e.components};return o?n.jsx(o,{...e,children:n.jsx(r,{...e})}):r()}export{C as default};
