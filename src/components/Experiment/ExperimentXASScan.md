# ExperimentXASScan

`ExperimentXASScan` is the UI for submitting and live-monitoring XAS (X-ray Absorption Spectroscopy) scans. It ties together the **Bluesky Queue Server** (plan submission and status) and the **Tiled** data server (data storage and retrieval) so that a scan's live data appears in a plot automatically as soon as it starts writing.

---

## Component Overview

The component has two panels:

- **Left panel** — scan parameters form (energies, ROI, user/sample metadata) and an optional "History" tab showing past runs.
- **Right panel** — a live `TiledWriterScatterPlot` that updates in real time while the scan runs.

Form values are persisted in `localStorage` so they survive page reloads.

---

## End-to-End Data Flow

```
User submits form
        │
        ▼
useExecuteQueueItemMutation()          POST /api/qserver/queue/item/add
        │ returns item_uid (queue item ID)
        ▼
useGetBlueskyRunList(item_uid)         polls queue server
        │ returns bluesky_run_uid (Bluesky run UUID)
        ▼
useTiledWriterScatterPlot(run_uid)     polls Tiled REST API
        │ returns tiledPath (e.g. "abc123/primary/internal")
        ▼
TiledScatterPlot(tiledPath)            polls Tiled for table data
        │ returns columnar JSON data
        ▼
PlotlyScatter                          live plot rendered in browser
```

---

## Step 1 — Plan Submission to the Queue Server

When the user clicks **Execute**, `ExperimentExecutePlanButtonGeneric` calls `useExecuteQueueItemMutation`, which POSTs to the queue server:

```json
{
  "name": "xas_scan",
  "kwargs": {
    "roi_low": 1800,
    "roi_high": 2750,
    "start_eV": 9000,
    "stop_eV": 10000,
    "num": 10,
    "md": { "exact_plan_name": "xas_scan", "user": "...", "sample": "..." }
  },
  "item_type": "plan"
}
```

The queue server responds with a `PostItemAddResponse` containing `item.item_uid` — a UUID that identifies this specific queue item. The component stores this in state as `executedItemUid`.

The `md.exact_plan_name` metadata field is important: it is searchable via Tiled later and is how the "latest XAS scan" polling (Step 4) identifies relevant runs.

---

## Step 2 — Resolving a Bluesky Run UID from the Queue Item

A queue item UID is not the same as a Bluesky run UID. The bridge is `useGetBlueskyRunList` (in `src/components/QServer/utils/qServerApiUtils.ts`), which is polled by a TanStack Query every second until at least one run UID is found.

The resolution logic inside `getBlueskyRunList(itemId)`:

1. **Check if the item is currently running** — calls `GET /api/qserver/status`. If the `running_item_uid` matches `itemId`, the plan is active.
2. **Fetch active Bluesky runs** — calls `GET /api/qserver/runs/active`. If runs exist, returns their UIDs immediately.
3. **Fall back to queue history** — calls `GET /api/qserver/queue/history`. Scans the last two history entries for a matching `item_uid` and extracts `result.run_uids[]` from it.
4. **Retry once with a 500 ms delay** if the item was still running but no runs were found yet (handles the brief gap between plan start and first run document).

Once one or more Bluesky run UIDs are returned, the component stores the first one as `blueskyRunId` in state.

---

## Step 3 — Locating the Tiled Path from the Bluesky Run UID

Bluesky writes run data to Tiled using the run UID as the top-level node. `useTiledWriterScatterPlot` (in `src/components/Tiled/hooks/useTiledWriterScatterPlot.ts`) translates a Bluesky run UID into the specific Tiled path where tabular detector data lives.

It does this in two sequential lookups, each retrying every 2 seconds until successful:

1. **Verify the run node exists** — `useSearchByIdQuery({ path: blueskyRunId })`. Returns `null` on 404 (Tiled hasn't received any documents yet); retries until the node appears.
2. **Find the primary stream** — `useSearchByIdQuery({ path: '{blueskyRunId}/primary' })`. The primary stream is the main detector stream in a Bluesky run. Once found, the final path is computed as:

   ```
   {blueskyRunId}/primary/internal
   ```

   `/internal` is the Tiled sub-node that exposes the stream's data as a table.

The hook also starts a **completion monitor**: once the path is resolved it checks whether the run already has a stop document. If the run is still ongoing it polls every `pollingIntervalMs` (default 5 s) until a stop document appears, then sets `enablePolling = false` to halt data fetching.

---

## Step 4 — Live Plot Data Fetching

`TiledScatterPlot` receives the resolved `tiledPath` and polls:

```ts
useQuery({
  queryKey: ['tiled', 'table', tiledPath],
  queryFn: () => getTableDataAsJson(tiledPath, partition, tiledBaseUrl),
  refetchInterval: enablePolling ? pollingIntervalMs : false,
})
```

`getTableDataAsJson` fetches the table from Tiled and returns it as a plain JS object keyed by column name. The `tiledTrace` prop maps column names to plot axes:

```ts
tiledTrace={{ x: "mono_energy_energy_eV", y: "amptek_fluo_roi_sum" }}
// falls back to env vars VITE_XAS_SCATTER_X / VITE_XAS_SCATTER_Y
```

The x/y arrays are extracted as `data[tiledTrace.x]` and `data[tiledTrace.y]` and passed directly to `PlotlyScatter` for rendering.

While the run is active, the plot refetches at 1 s intervals and Plotly re-renders with the growing arrays — producing the live update effect. Once `enablePolling` becomes `false` (stop document detected), refetching halts and the plot shows the final dataset.

---

## Automatic Live Plan Detection (External Starts)

In addition to tracking plans the user explicitly submits, `ExperimentXASScan` also polls Tiled independently every 5 seconds for the most recent `xas_scan` run:

```ts
useSearchResultsQuery({
  filters: {
    specs: { include: ['BlueskyRun'] },
    contains: { key: 'start.exact_plan_name', value: 'xas_scan' },
  },
  options: { pageLimit: 1, sort: '-' },  // most recent first
})
```

If the returned Tiled run ID differs from the currently displayed `blueskyRunId` (and the user is not in History mode), it updates `blueskyRunId` to point at the new run. This means:

- If someone starts an XAS scan from **outside this UI** (e.g., from a Jupyter notebook or another client), the plot will automatically switch to showing that scan's live data.
- The check `tiledRunId === blueskyRunId` prevents unnecessary re-renders when nothing has changed.

---

## Auto Mode

When **Auto** execution mode is enabled, the component fires a new `xas_scan` plan automatically 3 seconds after the queue becomes idle. A `useRef` flag (`autoSubmittedRef`) prevents double-firing within the same idle window. This enables continuous repeated scanning without user interaction.

---

## History Mode

Clicking the **History** tab renders `ExperimentHistory`, which searches Tiled for past `xas_scan` BlueskyRun nodes filtered by the current user name. Clicking a row sets `blueskyRunId` to that run's Tiled ID, loading its (completed) data into the plot on the right. Switching back to the **Run** tab clears `blueskyRunId` to reset the plot.

---

## Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `VITE_XAS_SCATTER_X` | `mono_energy_energy_eV` | Tiled column name for the x-axis |
| `VITE_XAS_SCATTER_Y` | `amptek_fluo_roi_sum` | Tiled column name for the y-axis |

---

## Key Design Patterns

- **Progressive resolution** — each step waits for upstream data (`enabled` flags on queries) before proceeding. No step hard-codes assumptions about timing.
- **Retry until found** — all Tiled lookups return `null` on 404 and retry on an interval. This handles the inherent latency between a plan starting and its data appearing in Tiled.
- **Dual polling** — completion polling (5 s) detects when a run finishes; data polling (1 s) keeps the plot current while it runs. They are independent and can be stopped separately.
- **External run detection** — the secondary Tiled search query means the UI stays in sync even when scans are started from outside this component.
