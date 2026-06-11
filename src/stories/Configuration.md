# Configuration

Finch components that communicate with backend services (Tiled, Ophyd WebSocket, Queue Server) rely on three providers that must wrap your application.

## Required providers

```tsx
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
```

- **`BrowserRouter`** — required by routing-based components such as `HubAppLayout`.
- **`QueryClientProvider`** — required for all react-query data-fetching hooks (queue server, tiled).
- **`FinchConfigProvider`** — distributes backend URLs and API keys to all Finch components and hooks.

## FinchConfig fields

All fields are optional. Components fall back to localhost defaults when a field is omitted.

| Field | Default | Description |
| :--- | :--- | :--- |
| `tiledApiUrl` | `http://localhost:8000/api/v1` | URL of the Tiled data API |
| `tiledApiKey` | `undefined` | API key for authenticated Tiled requests |
| `ophydApiUrl` | `http://localhost:8001/api/v1` | Base URL for the Ophyd WebSocket server |
| `qServerApiUrl` | `http://localhost:60610/api` | URL of the Bluesky Queue Server HTTP API |
| `qServerApiKey` | `test` | API key for Queue Server authentication |
| `finchApiUrl` | `undefined` | URL of an optional Finch backend API |

`FinchConfigProvider` automatically validates and normalises URLs on mount — trailing slashes are stripped, and a protocol (`http://` or `https://`) is added if missing for localhost addresses.

## Using env variables

When running the app from the cloned repo or configuring a deployment, the standard approach is to pass env variables into `FinchConfigProvider`:

```tsx
<FinchConfigProvider config={{
  tiledApiUrl:    import.meta.env.VITE_TILED_API_URL,
  tiledApiKey:    import.meta.env.VITE_TILED_API_KEY,
  ophydApiUrl:    import.meta.env.VITE_OPHYD_API_URL,
  qServerApiUrl:  import.meta.env.VITE_QSERVER_API_URL,
  qServerApiKey:  import.meta.env.VITE_QSERVER_API_KEY,
  finchApiUrl:    import.meta.env.VITE_FINCH_API_URL,
}}>
```

See the **BackendSetup** page for the full list of env variables and their corresponding services.

## Reading config in custom code

```tsx
import { useOptionalFinchConfig } from '@blueskyproject/finch';

function MyWidget() {
  const config = useOptionalFinchConfig();
  // config is null when used outside FinchConfigProvider
  const tiledUrl = config?.tiledApiUrl ?? 'http://localhost:8000/api/v1';
  // ...
}
```

`useOptionalFinchConfig` returns `null` when called outside a `FinchConfigProvider` — useful for components that should gracefully degrade. If your component always requires the provider, throw an error instead (the unexported `useFinchConfig` does this internally).
