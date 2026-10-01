import type { UseQueryResult } from '@tanstack/react-query';
import { isTiledApiError } from '@/api/tiled';
import ResultRenderer from './ResultRenderer';
import type { QueryResultKind } from './types';

export interface QueryResultPanelProps {
    result: UseQueryResult<unknown, Error>;
    resultKind: QueryResultKind;
    /** Field names the hook idles on, so an idle query can say *why*. */
    guardedBy?: readonly string[];
    /** Whether those fields are currently filled. */
    guardSatisfied?: boolean;
}

/**
 * Everything the hook is doing, not just what it returned.
 *
 * This is the panel that justifies a hook-level testbed existing alongside the client-level one.
 * `TestTiled` can show you a response; only this can show you that a query is idle rather than
 * loading, that its data is stale, that a refetch is in flight over data already rendered, or that
 * two hooks are sharing one cache entry.
 */
export default function QueryResultPanel({
    result,
    resultKind,
    guardedBy,
    guardSatisfied = true,
}: QueryResultPanelProps) {
    // `status: 'pending'` with `fetchStatus: 'idle'` is not loading — it is a query waiting for an
    // argument or switched off. Conflating the two is exactly why an idled hook looks broken.
    const idle = result.status === 'pending' && result.fetchStatus === 'idle';
    const guarded = idle && !guardSatisfied && !!guardedBy?.length;

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
                <StatusBadge result={result} idle={idle} guarded={guarded} />
                {result.isFetching && <Badge tone="info">fetching</Badge>}
                {result.isRefetching && <Badge tone="info">refetching</Badge>}
                {result.isStale && result.data !== undefined && <Badge tone="warn">stale</Badge>}
                {result.isPlaceholderData && <Badge tone="warn">placeholder</Badge>}
                {result.failureCount > 0 && (
                    <Badge tone="warn">{result.failureCount} failed attempts</Badge>
                )}
                <span className="text-slate-500">
                    {result.dataUpdatedAt > 0 && `data ${ago(result.dataUpdatedAt)}`}
                    {result.errorUpdatedAt > 0 && ` · error ${ago(result.errorUpdatedAt)}`}
                </span>
            </div>

            {guarded && (
                <p className="text-xs text-slate-500">
                    Idle: this hook waits for{' '}
                    <code className="font-mono">{guardedBy?.join(', ')}</code>. Forcing{' '}
                    <code className="font-mono">enabled</code> past the guard raises{' '}
                    <code className="font-mono">FinchMissingArgumentError</code> for the hooks whose
                    argument cannot be defaulted — which is worth seeing at least once.
                </p>
            )}

            {result.isError && <ErrorDetail error={result.error} />}

            {result.data !== undefined && <ResultRenderer kind={resultKind} value={result.data} />}
        </div>
    );
}

function StatusBadge({
    result,
    idle,
    guarded,
}: {
    result: UseQueryResult<unknown, Error>;
    idle: boolean;
    guarded: boolean;
}) {
    if (guarded) return <Badge tone="muted">idle — guarded</Badge>;
    if (idle) return <Badge tone="muted">idle — disabled</Badge>;
    if (result.isPending) return <Badge tone="info">loading</Badge>;
    if (result.isError) return <Badge tone="error">error</Badge>;
    return <Badge tone="ok">success</Badge>;
}

/**
 * A `TiledApiError`'s own fields, broken out.
 *
 * The message already carries the server's detail — `GET /metadata/x failed with 404: No such
 * entry` — but a 422's `validationErrors` are what actually tell you which field of a body the
 * server rejected, and they are buried in the error object otherwise.
 */
function ErrorDetail({ error }: { error: Error }) {
    const api = isTiledApiError(error) ? error : null;

    return (
        <div className="space-y-1 rounded border border-red-300 bg-red-50 p-2 text-xs text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            <p className="font-medium">{error.message}</p>
            {api && (
                <p className="font-mono text-[10px]">
                    {api.name}
                    {api.status !== undefined && ` · HTTP ${api.status}`}
                    {` · ${api.method} ${api.path}`}
                </p>
            )}
            {api?.validationErrors?.length ? (
                <ul className="list-inside list-disc font-mono text-[10px]">
                    {api.validationErrors.map((entry, index) => (
                        <li key={index}>
                            {entry.loc.join('.')}: {entry.msg}
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    );
}

type Tone = 'ok' | 'error' | 'info' | 'warn' | 'muted';

const TONES: Record<Tone, string> = {
    ok: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    info: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
    warn: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    muted: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
};

function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
    return <span className={`rounded px-1.5 py-0.5 text-[10px] ${TONES[tone]}`}>{children}</span>;
}

function ago(timestamp: number): string {
    const seconds = Math.round((Date.now() - timestamp) / 1000);
    if (seconds < 1) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.round(seconds / 60)}m ago`;
}
