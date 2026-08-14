# Queue Server Query Hooks

Every queue-server endpoint has a TanStack Query hook in `@/api/qServer_new` — **70 in total:**
29 queries and 41 mutations. This page lists all of them with the exact call shape.

These are the hooks over the **new** client (`src/api/qServer_new`). The older, narrower set is
documented on the [Queue Server API Hooks](?path=/docs/documentation-queue-server-api-hooks--docs)
page and still backs the shipped QServer components.

---

## Naming

Every hook starts with **`useQueue`**, so the queue-server family never collides with the
`useTiled...` and `useOphyd...` families for the other two backends. After the prefix comes the
client method's own name, minus the first `Queue` it already contains — the prefix has said it
already:

| client method  | hook                      |
| -------------- | ------------------------- |
| `getStatus`    | `useQueueGetStatusQuery`  |
| `getQueue`     | `useQueueGetQuery`        |
| `addQueueItem` | `useQueueAddItemMutation` |
| `startQueue`   | `useQueueStartMutation`   |
| `pauseRE`      | `useQueuePauseREMutation` |
| `whoami`       | `useQueueWhoamiQuery`     |

The infrastructure hooks are not endpoints and keep their `useQServer...` names:
`useQServerClient`, `useQServerInvalidate`, and the socket hooks `useQServerSocket`,
`useQServerStatusSocket`, `useQServerConsoleSocket`, `useQServerInfoSocket`.

## The call shape

Every hook takes **one optional object** with up to three parts:

```tsx
const status = useQueueGetStatusQuery({
    payload: {}, // the endpoint argument (name varies; see each entry)
    request: { apiKey: null }, // QServerRequestOptions — transport overrides
    query: { refetchInterval: 1000 }, // standard TanStack query options
});

const add = useQueueAddItemMutation({
    request: { baseUrl: 'http://other:60610' },
    mutation: { onSuccess: (data) => console.log(data.item.item_uid) },
});
add.mutate({ item: { name: 'count', item_type: 'plan' } }); // the body goes to mutate()
```

TanStack options go under `query` / `mutation`, never at the top level — the top level is the
endpoint argument, so `useQueueGetQuery({ refetchInterval: 1000 })` is a **compile error** rather
than a silently-wrong request payload.

| part                                    | what goes in it                                                                                                         |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `payload` / `body` / `input` / a scalar | the endpoint argument, forwarded to the client method and included in the query key                                     |
| `request`                               | `baseUrl`, `apiKey`, `headers`, `query`, `signal`, `axiosConfig`; plus `strategy` / `fallback` on payload-GET endpoints |
| `query`                                 | `enabled`, `refetchInterval`, `staleTime`, `select`, `retry`, …                                                         |
| `mutation`                              | `onSuccess`, `onError`, `onMutate`, `retry`, … (`onSuccess` runs _after_ the hook has refreshed its caches)             |

## Setup

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FinchConfigProvider } from '@blueskyproject/finch';

const queryClient = new QueryClient();

<FinchConfigProvider config={{ qServerApiUrl: 'http://localhost:60610', qServerApiKey: 'test' }}>
    <QueryClientProvider client={queryClient}>
        <YourApp />
    </QueryClientProvider>
</FinchConfigProvider>;
```

That is all the configuration needed: the URL and key from `FinchConfigProvider` are applied to the
default client _and_ carried on every request, so the first fetch of the first render already goes
to the right server. To point the hooks at a simulator or a stub instead, wrap the tree in
`QServerApiProvider` — see [QServer Sim](?path=/docs/documentation-qserver-sim--docs).

---

## Status

### Queries

| hook                       | argument                   | returns `data`      | endpoint              |
| -------------------------- | -------------------------- | ------------------- | --------------------- |
| `useQueuePingQuery`        | `payload?: QServerPayload` | `PingResponse`      | `GET /api/ping`       |
| `useQueueGetRootQuery`     | `payload?: QServerPayload` | `PingResponse`      | `GET /api/`           |
| `useQueueGetStatusQuery`   | `payload?: QServerPayload` | `GetStatusResponse` | `GET /api/status`     |
| `useQueueGetConfigQuery` ◆ | `payload?: QServerPayload` | `GetConfigResponse` | `GET /api/config/get` |

## Queue

### Queries

| hook                   | argument                            | returns `data`         | endpoint                  |
| ---------------------- | ----------------------------------- | ---------------------- | ------------------------- |
| `useQueueGetQuery`     | `payload?: Record<string, unknown>` | `GetQueueResponse`     | `GET /api/queue/get`      |
| `useQueueGetItemQuery` | `body?: GetQueueItemBody`           | `GetQueueItemResponse` | `GET /api/queue/item/get` |

### Mutations

| hook                                  | `mutate(…)`                   | resolves to                 | invalidates               | endpoint                             |
| ------------------------------------- | ----------------------------- | --------------------------- | ------------------------- | ------------------------------------ |
| `useQueueAddItemMutation`             | `AddQueueItemBody`            | `PostItemAddResponse`       | `queue`, `status`         | `POST /api/queue/item/add`           |
| `useQueueAddItemBatchMutation`        | `AddQueueItemBatchBody`       | `PostItemBatchResponse`     | `queue`, `status`         | `POST /api/queue/item/add/batch`     |
| `useQueueExecuteItemMutation`         | `ExecuteQueueItemBody`        | `PostItemExecuteResponse`   | `queue`, `status`, `runs` | `POST /api/queue/item/execute`       |
| `useQueueUpdateItemMutation`          | `UpdateQueueItemBody`         | `PostItemUpdateResponse`    | `queue`, `status`         | `POST /api/queue/item/update`        |
| `useQueueRemoveItemMutation`          | `RemoveQueueItemBody \| void` | `PostItemRemoveResponse`    | `queue`, `status`         | `POST /api/queue/item/remove`        |
| `useQueueRemoveItemBatchMutation`     | `RemoveQueueItemBatchBody`    | `PostItemBatchResponse`     | `queue`, `status`         | `POST /api/queue/item/remove/batch`  |
| `useQueueMoveItemMutation`            | `MoveQueueItemBody`           | `PostItemAddResponse`       | `queue`, `status`         | `POST /api/queue/item/move`          |
| `useQueueMoveItemBatchMutation` ◆     | `MoveQueueItemBatchBody`      | `PostItemBatchResponse`     | `queue`, `status`         | `POST /api/queue/item/move/batch`    |
| `useQueueUploadSpreadsheetMutation` ◆ | `UploadSpreadsheetInput`      | `UploadSpreadsheetResponse` | `queue`, `status`         | `POST /api/queue/upload/spreadsheet` |
| `useQueueStartMutation`               | —                             | `QueueStartResponse`        | `queue`, `status`, `runs` | `POST /api/queue/start`              |
| `useQueueStopMutation`                | —                             | `QServerSuccessResponse`    | `status`                  | `POST /api/queue/stop`               |
| `useQueueCancelStopMutation`          | —                             | `QServerSuccessResponse`    | `status`                  | `POST /api/queue/stop/cancel`        |
| `useQueueClearMutation`               | —                             | `QueueClearResponse`        | `queue`, `status`         | `POST /api/queue/clear`              |
| `useQueueSetModeMutation`             | `QueueModeSetBody`            | `QServerSuccessResponse`    | `status`                  | `POST /api/queue/mode/set`           |
| `useQueueSetAutostartMutation`        | `QueueAutostartBody`          | `QServerSuccessResponse`    | `status`                  | `POST /api/queue/autostart`          |

## History

### Queries

| hook                      | argument                   | returns `data`       | endpoint               |
| ------------------------- | -------------------------- | -------------------- | ---------------------- |
| `useQueueGetHistoryQuery` | `payload?: QServerPayload` | `GetHistoryResponse` | `GET /api/history/get` |

### Mutations

| hook                           | `mutate(…)` | resolves to            | invalidates         | endpoint                  |
| ------------------------------ | ----------- | ---------------------- | ------------------- | ------------------------- |
| `useQueueClearHistoryMutation` | —           | `ClearHistoryResponse` | `history`, `status` | `POST /api/history/clear` |

## Environment

### Mutations

| hook                                  | `mutate(…)`                     | resolves to                 | invalidates                           | endpoint                        |
| ------------------------------------- | ------------------------------- | --------------------------- | ------------------------------------- | ------------------------------- |
| `useQueueOpenEnvironmentMutation`     | —                               | `EnvironmentResponse`       | `status`, `catalogs`                  | `POST /api/environment/open`    |
| `useQueueCloseEnvironmentMutation`    | —                               | `EnvironmentResponse`       | `status`, `catalogs`, `runs`          | `POST /api/environment/close`   |
| `useQueueDestroyEnvironmentMutation`  | —                               | `EnvironmentResponse`       | `status`, `catalogs`, `runs`, `queue` | `POST /api/environment/destroy` |
| `useQueueUpdateEnvironmentMutation` ◆ | `EnvironmentUpdateBody \| void` | `EnvironmentUpdateResponse` | `status`, `catalogs`                  | `POST /api/environment/update`  |

## Run Engine

### Queries

| hook                           | argument                   | returns `data`          | endpoint                  |
| ------------------------------ | -------------------------- | ----------------------- | ------------------------- |
| `useQueueGetRunsQuery`         | `body?: GetRunsBody`       | `GetRunsResponse`       | `POST /api/re/runs`       |
| `useQueueGetRunsActiveQuery`   | —                          | `GetRunsResponse`       | `GET /api/re/runs/active` |
| `useQueueGetRunsOpenQuery`     | —                          | `GetRunsResponse`       | `GET /api/re/runs/open`   |
| `useQueueGetRunsClosedQuery`   | —                          | `GetRunsResponse`       | `GET /api/re/runs/closed` |
| `useQueueGetREMetadataQuery` ◆ | `payload?: QServerPayload` | `GetReMetadataResponse` | `GET /api/re/metadata`    |

### Mutations

| hook                       | `mutate(…)`            | resolves to         | invalidates                          | endpoint              |
| -------------------------- | ---------------------- | ------------------- | ------------------------------------ | --------------------- |
| `useQueuePauseREMutation`  | `RePauseBody \| void`  | `ReControlResponse` | `status`, `queue`, `runs`            | `POST /api/re/pause`  |
| `useQueueResumeREMutation` | `ReResumeBody \| void` | `ReControlResponse` | `status`, `runs`                     | `POST /api/re/resume` |
| `useQueueStopREMutation`   | `ReResumeBody \| void` | `ReControlResponse` | `status`, `queue`, `history`, `runs` | `POST /api/re/stop`   |
| `useQueueAbortREMutation`  | `ReResumeBody \| void` | `ReControlResponse` | `status`, `queue`, `history`, `runs` | `POST /api/re/abort`  |
| `useQueueHaltREMutation`   | `ReResumeBody \| void` | `ReControlResponse` | `status`, `queue`, `history`, `runs` | `POST /api/re/halt`   |

## Plans & Devices

### Queries

| hook                              | argument                     | returns `data`               | endpoint                    |
| --------------------------------- | ---------------------------- | ---------------------------- | --------------------------- |
| `useQueueGetPlansAllowedQuery`    | `payload?: PlansDevicesBody` | `GetPlansAllowedResponse`    | `GET /api/plans/allowed`    |
| `useQueueGetDevicesAllowedQuery`  | `payload?: PlansDevicesBody` | `GetDevicesAllowedResponse`  | `GET /api/devices/allowed`  |
| `useQueueGetPlansExistingQuery`   | `payload?: PlansDevicesBody` | `GetPlansExistingResponse`   | `GET /api/plans/existing`   |
| `useQueueGetDevicesExistingQuery` | `payload?: PlansDevicesBody` | `GetDevicesExistingResponse` | `GET /api/devices/existing` |

## Permissions

### Queries

| hook                            | argument | returns `data`           | endpoint                   |
| ------------------------------- | -------- | ------------------------ | -------------------------- |
| `useQueueGetPermissionsQuery` ◆ | —        | `GetPermissionsResponse` | `GET /api/permissions/get` |

### Mutations

| hook                                  | `mutate(…)`                     | resolves to           | invalidates                         | endpoint                       |
| ------------------------------------- | ------------------------------- | --------------------- | ----------------------------------- | ------------------------------ |
| `useQueueSetPermissionsMutation` ◆    | `SetPermissionsBody`            | `PermissionsResponse` | `permissions`, `catalogs`, `status` | `POST /api/permissions/set`    |
| `useQueueReloadPermissionsMutation` ◆ | `ReloadPermissionsBody \| void` | `PermissionsResponse` | `permissions`, `catalogs`, `status` | `POST /api/permissions/reload` |

## Functions & Scripts

### Mutations

| hook                                | `mutate(…)`           | resolves to               | invalidates          | endpoint                     |
| ----------------------------------- | --------------------- | ------------------------- | -------------------- | ---------------------------- |
| `useQueueExecuteFunctionMutation` ◆ | `ExecuteFunctionBody` | `ExecuteFunctionResponse` | `status`             | `POST /api/function/execute` |
| `useQueueUploadScriptMutation` ◆    | `UploadScriptBody`    | `UploadScriptResponse`    | `status`, `catalogs` | `POST /api/script/upload`    |

## Tasks

### Queries

| hook                         | argument          | returns `data`          | endpoint               |
| ---------------------------- | ----------------- | ----------------------- | ---------------------- |
| `useQueueGetTaskStatusQuery` | `body?: TaskBody` | `GetTaskStatusResponse` | `GET /api/task/status` |
| `useQueueGetTaskResultQuery` | `body?: TaskBody` | `GetTaskResultResponse` | `GET /api/task/result` |

## Lock

### Queries

| hook                       | argument                   | returns `data`        | endpoint             |
| -------------------------- | -------------------------- | --------------------- | -------------------- |
| `useQueueGetLockInfoQuery` | `payload?: QServerPayload` | `GetLockInfoResponse` | `GET /api/lock/info` |

### Mutations

| hook                     | `mutate(…)`  | resolves to    | invalidates      | endpoint           |
| ------------------------ | ------------ | -------------- | ---------------- | ------------------ |
| `useQueueLockMutation`   | `LockBody`   | `LockResponse` | `lock`, `status` | `POST /api/lock`   |
| `useQueueUnlockMutation` | `UnlockBody` | `LockResponse` | `lock`, `status` | `POST /api/unlock` |

## Console

### Queries

| hook                                  | argument                            | returns `data`                   | endpoint                         |
| ------------------------------------- | ----------------------------------- | -------------------------------- | -------------------------------- |
| `useQueueGetConsoleOutputQuery`       | `payload?: ConsoleOutputBody`       | `GetConsoleOutputResponse`       | `GET /api/console_output`        |
| `useQueueGetConsoleOutputUIDQuery`    | —                                   | `GetConsoleOutputUidResponse`    | `GET /api/console_output/uid`    |
| `useQueueGetConsoleOutputUpdateQuery` | `payload?: ConsoleOutputUpdateBody` | `GetConsoleOutputUpdateResponse` | `GET /api/console_output_update` |

### Mutations

| hook                                    | `mutate(…)` | resolves to | invalidates | endpoint                         |
| --------------------------------------- | ----------- | ----------- | ----------- | -------------------------------- |
| `useQueueStreamConsoleOutputMutation` ◆ | —           | `string`    | —           | `GET /api/stream_console_output` |

## Admin

### Queries

| hook                             | argument                        | returns `data`  | endpoint                     |
| -------------------------------- | ------------------------------- | --------------- | ---------------------------- |
| `useQueueTestServerSleepQuery` ◆ | `payload?: TestServerSleepBody` | `AdminResponse` | `GET /api/test/server/sleep` |

### Mutations

| hook                                | `mutate(…)`                   | resolves to     | invalidates | endpoint                      |
| ----------------------------------- | ----------------------------- | --------------- | ----------- | ----------------------------- |
| `useQueueInterruptKernelMutation` ◆ | `KernelInterruptBody \| void` | `AdminResponse` | `status`    | `POST /api/kernel/interrupt`  |
| `useQueueStopManagerMutation` ◆     | `ManagerStopBody \| void`     | `AdminResponse` | `status`    | `POST /api/manager/stop`      |
| `useQueueTestKillManagerMutation` ◆ | —                             | `AdminResponse` | `status`    | `POST /api/test/manager/kill` |

## Auth

### Queries

| hook                                  | argument        | returns `data`              | endpoint                         |
| ------------------------------------- | --------------- | --------------------------- | -------------------------------- |
| `useQueueWhoamiQuery` ◆               | —               | `WhoamiResponse`            | `GET /api/auth/whoami`           |
| `useQueueGetScopesQuery` ◆            | —               | `ScopesResponse`            | `GET /api/auth/scopes`           |
| `useQueueListPrincipalsQuery` ◆       | —               | `PrincipalListResponse`     | `GET /api/auth/principal`        |
| `useQueueGetPrincipalQuery` ◆         | `uuid?: string` | `PrincipalResponse`         | `GET /api/auth/principal/{uuid}` |
| `useQueueGetCurrentApiKeyInfoQuery` ◆ | —               | `CurrentApiKeyInfoResponse` | `GET /api/auth/apikey`           |

### Mutations

| hook                                         | `mutate(…)`                              | resolves to              | invalidates | endpoint                                       |
| -------------------------------------------- | ---------------------------------------- | ------------------------ | ----------- | ---------------------------------------------- |
| `useQueueCreateApiKeyMutation` ◆             | `APIKeyRequestParams`                    | `NewApiKeyResponse`      | —           | `POST /api/auth/apikey`                        |
| `useQueueCreateApiKeyForPrincipalMutation` ◆ | `QueueCreateApiKeyForPrincipalVariables` | `NewApiKeyResponse`      | `auth`      | `POST /api/auth/principal/{uuid}/apikey`       |
| `useQueueRevokeApiKeyMutation` ◆             | `QueueRevokeApiKeyVariables`             | `unknown`                | `auth`      | `DELETE /api/auth/apikey`                      |
| `useQueueRefreshSessionMutation` ◆           | `SessionRefreshBody`                     | `AccessAndRefreshTokens` | `auth`      | `POST /api/auth/session/refresh`               |
| `useQueueRevokeSessionMutation` ◆            | `QueueRevokeSessionVariables`            | `unknown`                | `auth`      | `DELETE /api/auth/session/revoke/{session_id}` |
| `useQueueLogoutMutation` ◆                   | —                                        | `LogoutResponse`         | `auth`      | `POST /api/auth/logout`                        |

---

## Worked examples

### Polling the queue and status

```tsx
import { useQueueGetQuery, useQueueGetStatusQuery } from '@blueskyproject/finch';

function QueueSummary() {
    const status = useQueueGetStatusQuery({ query: { refetchInterval: 1000 } });
    const queue = useQueueGetQuery({ query: { refetchInterval: 1000 } });

    if (queue.isPending) return <p>loading…</p>;
    if (queue.isError) return <p>{queue.error.message}</p>;

    return (
        <p>
            {queue.data.items.length} queued · manager {status.data?.manager_state}
        </p>
    );
}
```

`data` is typed as the endpoint's response — `GetQueueResponse` here — with no annotation needed.

### Narrowing with `select`

```tsx
// `data` is now `QueueItem[]`, and the component only re-renders when the items change.
const items = useQueueGetQuery({ query: { select: (queue) => queue.items } });
```

### Adding an item and starting the queue

```tsx
import { useQueueAddItemMutation, useQueueStartMutation } from '@blueskyproject/finch';

function RunCount() {
    const add = useQueueAddItemMutation();
    const start = useQueueStartMutation();

    const run = async () => {
        const added = await add.mutateAsync({
            item: { name: 'count', kwargs: { num: 5 }, item_type: 'plan' },
        });
        if (!added.success) return; // the server rejects invalid plans in the envelope
        await start.mutateAsync();
    };

    return (
        <button onClick={run} disabled={add.isPending || start.isPending}>
            Run count
        </button>
    );
}
```

No `invalidateQueries` call is needed: each mutation refreshes its own caches, and `mutateAsync`
resolves only once those refetches have finished — so the queue query is already up to date on the
next line.

### Fetching one item, only when addressed

```tsx
// Idle until a uid exists; no request is made with `undefined`.
const item = useQueueGetItemQuery({ body: selectedUid ? { uid: selectedUid } : undefined });
```

Four queries guard themselves this way: `useQueueGetItemQuery` (needs `uid` or `pos`),
`useQueueGetTaskStatusQuery` and `useQueueGetTaskResultQuery` (need `task_uid`), and `useQueueGetPrincipalQuery`
(needs `uuid`). Pass `query.enabled` to override.

### Talking to a second server, or without credentials

```tsx
const other = useQueueGetStatusQuery({ request: { baseUrl: 'http://other-host:60610' } });
const anon = useQueueGetStatusQuery({ request: { apiKey: null } }); // send no credentials at all
```

Per-request options never change client state — the next hook call uses the configured server again.

### Cancelling

Queries are cancelled automatically on unmount and by `queryClient.cancelQueries`. To cancel from
your own code as well, pass a signal; the two compose, so either one aborts the request:

```tsx
const controller = new AbortController();
const status = useQueueGetStatusQuery({ request: { signal: controller.signal } });
```

### Refreshing caches by hand

```tsx
import { useQServerInvalidate } from '@blueskyproject/finch';

const invalidate = useQServerInvalidate();
await invalidate.roots('queue', 'status'); // individual resources
await invalidate.bundles('runs'); // a named bundle
await invalidate.all(); // everything — do this after changing the API key
```

---

## Query keys

Keys are `['qserver', <resource>, <argument | null>, { baseUrl }]` — the server scope goes **last**,
so prefix matching still works:

```ts
queryClient.invalidateQueries({ queryKey: ['qserver', 'queue'] }); // matches every queue entry
```

The API key is deliberately not part of any key: it would put a secret into the Devtools cache
inspector, and because auth is applied at request time a key change invalidates everything rather
than one entry. Use `invalidateAllQServerQueries(queryClient)` after rotating it.

Build keys with the exported factory rather than by hand — `qServerQueryKeys.queue(scope)`,
`qServerQueryRoots.status`, and so on.

## Invalidation bundles

Each mutation refreshes a set of named bundles (listed per hook in the tables above):

| bundle        | resources refreshed                                          |
| ------------- | ------------------------------------------------------------ |
| `status`      | status, ping, root                                           |
| `queue`       | queue, queueItem                                             |
| `history`     | history                                                      |
| `runs`        | runs, runsActive, runsOpen, runsClosed                       |
| `catalogs`    | plansAllowed, devicesAllowed, plansExisting, devicesExisting |
| `permissions` | permissions                                                  |
| `lock`        | lockInfo                                                     |
| `auth`        | whoami, scopes, principals, principal, apiKeyInfo            |

Console and task caches are in no bundle on purpose: console output is append-only, and task entries
are keyed by `task_uid`, so a mutation that _creates_ a task has nothing cached to refresh.

## Caveats worth knowing

**◆ marks the 26 hooks outside `QServerClientLike`** — auth, permissions, admin,
`useQueueExecuteFunctionMutation`, `useQueueUploadScriptMutation`, `useQueueUploadSpreadsheetMutation`,
`useQueueStreamConsoleOutputMutation`, `useQueueGetConfigQuery`, `useQueueUpdateEnvironmentMutation`,
`useQueueGetREMetadataQuery` and `useQueueMoveItemBatchMutation`. They work normally against a real
client, but reject with `QServerEndpointUnavailableError` when a partial client (such as the
simulator's) is injected through `QServerApiProvider`, rather than silently falling through to the
network.

**Two hooks cannot work in a browser at all.** `useQueueGetTaskStatusQuery` and `useQueueGetTaskResultQuery`
call `GET` endpoints that require a request body, which browsers cannot send, and unlike the other
body-required endpoints they have no fallback. Their results are reachable only from Node/SSR — from
a browser, watch a task through status or the console socket instead.

**Three hooks are degraded in a browser**, using a fallback the client substitutes:
`useQueueGetItemQuery` (scans `getQueue()`), `useQueueGetLockInfoQuery` (reads the `lock` field of
`/api/status`, so no owner/time/note) and `useQueueGetConsoleOutputUpdateQuery` (cannot deliver
incrementally).

**`useQueueStreamConsoleOutputMutation` is a mutation, not a query**, because the response only ends when
the server closes the stream — as a query it would sit pending forever. Bound it with
`request.axiosConfig.timeout`, or prefer `useQServerConsoleSocket` for live output.

**`useQueueGetRunsQuery` is a query** even though the endpoint is a `POST`; it reads state, so it belongs
in the cache.

**`useQueueGetREMetadataQuery` answers 400** on RE Manager v0.0.19, which does not implement it. It
defaults to `retry: false` for that reason.

## Errors

Everything rejects with an `Error` subclass, surfaced through `error`:

| type                              | when                                                                                                            |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `QServerApiError`                 | the server answered 4xx/5xx — carries `status`, `path`, `responseBody`, and parsed `validationErrors` for a 422 |
| `QServerEndpointUnavailableError` | the injected client does not implement this endpoint (the ◆ hooks)                                              |
| `QServerGetBodyUnsupportedError`  | a browser payload-GET that has no fallback                                                                      |

```tsx
import { isQServerApiError } from '@blueskyproject/finch';

const queue = useQueueGetQuery();
if (queue.isError && isQServerApiError(queue.error) && queue.error.status === 401) {
    // …
}
```
