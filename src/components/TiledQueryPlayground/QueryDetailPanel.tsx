import { useQueryClient } from '@tanstack/react-query';
import { tiledQueryRoots } from '@/api/tiled';
import QueryFieldEditor from './QueryFieldEditor';
import type { PlaygroundQueryOptions, QueryDescriptor } from './types';
import { isSettling, useDebouncedValue } from './useDebouncedValues';

export interface QueryDetailPanelProps {
    descriptor: QueryDescriptor;
    values: Record<string, unknown>;
    onValuesChange: (values: Record<string, unknown>) => void;
    options: PlaygroundQueryOptions;
    onOptionsChange: (options: PlaygroundQueryOptions) => void;
    /** Shown in the header; lets a pinned query be unpinned from its own panel. */
    pinned?: boolean;
    onTogglePin?: () => void;
}

const buttonClass =
    'rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-100 ' +
    'dark:border-slate-600 dark:hover:bg-slate-700';

/**
 * One query: its inputs, its controls, and the Runner that actually calls the hook.
 *
 * The Runner is mounted as `<descriptor.Runner />` — a component, because a hook cannot be called
 * dynamically. Switching queries unmounts one and mounts another, which is itself informative: the
 * cache inspector shows the entry surviving with `observerCount: 0`, which is what `gcTime` is
 * counting down.
 */
export default function QueryDetailPanel({
    descriptor,
    values,
    onValuesChange,
    options,
    onOptionsChange,
    pinned,
    onTogglePin,
}: QueryDetailPanelProps) {
    const queryClient = useQueryClient();
    const { Runner } = descriptor;

    // The Runner sees settled values, not every keystroke. Field values feed the hook's arguments
    // and therefore its query key, so typing a path unsettled would mint a cache entry per
    // character and fire a request for each.
    const settledValues = useDebouncedValue(values);
    const settling = isSettling(values, settledValues);

    const root = tiledQueryRoots[descriptor.group as keyof typeof tiledQueryRoots] as
        | readonly string[]
        | undefined;

    return (
        <section className="space-y-3 rounded border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
            <header className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <h3 className="font-medium">{descriptor.id}</h3>
                        <code className="font-mono text-xs text-sky-700 dark:text-sky-300">
                            {descriptor.hookName}
                        </code>
                    </div>
                    {onTogglePin && (
                        <button type="button" className={buttonClass} onClick={onTogglePin}>
                            {pinned ? 'unpin' : 'pin'}
                        </button>
                    )}
                </div>
                <p className="text-xs text-slate-500">{descriptor.summary}</p>
            </header>

            {descriptor.fields.length > 0 && (
                <div className="space-y-2">
                    {descriptor.fields.map((field) => (
                        <QueryFieldEditor
                            key={field.name}
                            field={field}
                            value={values[field.name]}
                            onChange={(value) => onValuesChange({ ...values, [field.name]: value })}
                        />
                    ))}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-2 text-xs dark:border-slate-700">
                <label className="flex items-center gap-1">
                    <input
                        type="checkbox"
                        checked={options.enabled !== false}
                        onChange={(event) =>
                            onOptionsChange({ ...options, enabled: event.target.checked })
                        }
                    />
                    enabled
                </label>

                <label className="flex items-center gap-1">
                    staleTime
                    <input
                        type="number"
                        value={options.staleTime ?? 0}
                        onChange={(event) =>
                            onOptionsChange({ ...options, staleTime: Number(event.target.value) })
                        }
                        className="w-20 rounded border border-slate-300 bg-white px-1 py-0.5 font-mono text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    />
                    ms
                </label>

                <label className="flex items-center gap-1">
                    refetchInterval
                    <input
                        type="number"
                        value={
                            options.refetchInterval === false ? '' : (options.refetchInterval ?? '')
                        }
                        placeholder="off"
                        onChange={(event) =>
                            onOptionsChange({
                                ...options,
                                refetchInterval: event.target.value
                                    ? Number(event.target.value)
                                    : false,
                            })
                        }
                        className="w-20 rounded border border-slate-300 bg-white px-1 py-0.5 font-mono text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    />
                    ms
                </label>

                {root && (
                    <button
                        type="button"
                        className={buttonClass}
                        onClick={() => void queryClient.invalidateQueries({ queryKey: [...root] })}
                        title={`invalidateQueries({ queryKey: ${JSON.stringify(root)} })`}
                    >
                        invalidate &lsquo;{descriptor.group}&rsquo;
                    </button>
                )}
                <button
                    type="button"
                    className={buttonClass}
                    onClick={() => void queryClient.invalidateQueries({ queryKey: ['tiled'] })}
                >
                    invalidate all
                </button>
                <button
                    type="button"
                    className={buttonClass}
                    onClick={() => queryClient.clear()}
                    title="Empties the playground's own cache, not the app's"
                >
                    clear cache
                </button>
            </div>

            {settling && <p className="text-xs text-slate-500">typing…</p>}
            <Runner values={settledValues} queryOptions={options} />
        </section>
    );
}
