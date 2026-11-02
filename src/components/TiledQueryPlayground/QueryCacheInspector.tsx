import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface CacheRow {
    hash: string;
    key: string;
    status: string;
    fetchStatus: string;
    observers: number;
    stale: boolean;
    updatedAt: number;
}

/**
 * A live view of the playground's `QueryCache`.
 *
 * This is the panel that makes the playground diagnostic rather than merely convenient. Pin two
 * queries and it answers questions a result panel cannot:
 *
 * - two searches whose filters build the same config share **one** entry;
 * - two table reads differing only in `column` get **two** — the collision that was a real bug;
 * - `useTiledServerInfoQuery` and `useTiledAboutQuery` get **two**, for the same reason;
 * - changing the base URL in the connection bar forks the scope and doubles everything;
 * - unpinning a query leaves its entry behind with `observers: 0`, which is what `gcTime` counts.
 *
 * It subscribes to the cache rather than polling, so a status change shows up on the same frame the
 * hook sees it.
 */
export default function QueryCacheInspector() {
    const queryClient = useQueryClient();
    const [rows, setRows] = useState<CacheRow[]>([]);

    useEffect(() => {
        const cache = queryClient.getQueryCache();

        const read = () =>
            setRows(
                cache.getAll().map((entry) => ({
                    hash: entry.queryHash,
                    key: JSON.stringify(entry.queryKey),
                    status: entry.state.status,
                    fetchStatus: entry.state.fetchStatus,
                    observers: entry.getObserversCount(),
                    stale: entry.isStale(),
                    updatedAt: entry.state.dataUpdatedAt,
                })),
            );

        read();
        return cache.subscribe(read);
    }, [queryClient]);

    return (
        <section className="space-y-2 rounded border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold">
                    Cache{' '}
                    <span className="text-xs font-normal text-slate-500">({rows.length})</span>
                </h2>
                <span className="text-xs text-slate-500">
                    the playground&apos;s own QueryClient — invalidating here cannot touch the app
                </span>
            </div>

            {rows.length === 0 ? (
                <p className="text-xs text-slate-500">No entries yet. Run a query.</p>
            ) : (
                <ul className="space-y-1">
                    {rows.map((row) => (
                        <li
                            key={row.hash}
                            className="rounded border border-slate-200 px-2 py-1 dark:border-slate-700"
                        >
                            <div className="flex flex-wrap items-center gap-2 text-[10px]">
                                <span
                                    className={
                                        row.status === 'error'
                                            ? 'text-red-600 dark:text-red-400'
                                            : row.status === 'success'
                                              ? 'text-emerald-600 dark:text-emerald-400'
                                              : 'text-slate-500'
                                    }
                                >
                                    {row.status}
                                </span>
                                <span className="text-slate-500">{row.fetchStatus}</span>
                                <span className="text-slate-500">
                                    {row.observers} observer{row.observers === 1 ? '' : 's'}
                                </span>
                                {row.stale && (
                                    <span className="text-amber-600 dark:text-amber-400">
                                        stale
                                    </span>
                                )}
                            </div>
                            <pre className="overflow-auto whitespace-pre-wrap break-all font-mono text-[10px] text-slate-600 dark:text-slate-300">
                                {row.key}
                            </pre>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
