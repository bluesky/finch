import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QServerApiProvider } from '@/api/qServerRuntime';
import {
    useQueueAddItemMutation,
    useQueueGetHistoryQuery,
    useQueueGetQuery,
    useQueueGetStatusQuery,
    useQueueStartMutation,
} from '@/api/qServer_new';
import { QServerSimProvider, createQServerSimClient, defaultQServer } from '@/lib/qserver-sim';

/**
 * Live demo embedded in the "QServer Query Hooks" documentation page.
 *
 * The hooks below are the real ones; only the client behind the provider is simulated, so this is an
 * honest demonstration of what a component using them looks like. Note that nothing here calls
 * `invalidateQueries` — the mutations refresh the queue and status caches themselves.
 */
const demoSim = defaultQServer({ runDurationMs: 4000 });
const demoClient = createQServerSimClient(demoSim);
// This page supplies its own QueryClient: Storybook has no global one.
const demoQueryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
});

function HooksDemoBody() {
    const status = useQueueGetStatusQuery({}, { refetchInterval: 1000 });
    const queue = useQueueGetQuery({}, { refetchInterval: 1000 });
    const history = useQueueGetHistoryQuery({}, { refetchInterval: 1000 });
    const add = useQueueAddItemMutation();
    const start = useQueueStartMutation();

    const busy = add.isPending || start.isPending;

    return (
        <div className="w-full space-y-3 rounded-lg border border-slate-300 bg-slate-50 p-4 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            <p className="font-mono text-xs text-slate-600 dark:text-slate-300">
                {status.isPending
                    ? 'useQueueGetStatusQuery(): loading…'
                    : `manager ${status.data?.manager_state} · RE ${status.data?.re_state ?? '—'} · ` +
                      `queued ${status.data?.items_in_queue} · history ${status.data?.items_in_history}`}
            </p>

            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                        add.mutate({
                            item: { name: 'count', kwargs: { num: 5 }, item_type: 'plan' },
                        })
                    }
                    className="rounded border border-slate-400 px-3 py-1 text-sm disabled:opacity-40 dark:border-slate-600"
                >
                    add.mutate(count)
                </button>
                <button
                    type="button"
                    disabled={busy}
                    onClick={() => start.mutate()}
                    className="rounded bg-slate-800 px-3 py-1 text-sm font-medium text-white disabled:opacity-40 dark:bg-slate-200 dark:text-slate-900"
                >
                    start.mutate()
                </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <div>
                    <h4 className="text-xs font-medium">
                        useQueueGetQuery ({queue.data?.items.length ?? 0})
                    </h4>
                    <ul className="h-28 overflow-y-auto rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs dark:border-slate-700 dark:bg-slate-950">
                        {queue.data?.items.map((item) => (
                            <li key={item.item_uid}>{item.name}</li>
                        ))}
                        {queue.data?.items.length === 0 && (
                            <li className="text-slate-500">empty</li>
                        )}
                    </ul>
                </div>
                <div>
                    <h4 className="text-xs font-medium">
                        useQueueGetHistoryQuery ({history.data?.items.length ?? 0})
                    </h4>
                    <ul className="h-28 overflow-y-auto rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs dark:border-slate-700 dark:bg-slate-950">
                        {history.data?.items.map((item, index) => (
                            <li key={`${item.item_uid}-${index}`}>
                                {item.name} — {item.result?.exit_status}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default function QServerHooksDemo() {
    return (
        // QServerSimProvider owns the simulator's tick loop, so a started plan actually progresses
        // and lands in history while the page is open.
        <QServerSimProvider sim={demoSim}>
            <QueryClientProvider client={demoQueryClient}>
                <QServerApiProvider client={demoClient}>
                    <HooksDemoBody />
                </QServerApiProvider>
            </QueryClientProvider>
        </QServerSimProvider>
    );
}
