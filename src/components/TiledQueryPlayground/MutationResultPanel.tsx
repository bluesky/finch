import {
    TILED_INVALIDATION_BUNDLES,
    TILED_MUTATION_INVALIDATIONS,
    isTiledApiError,
    type TiledInvalidationBundleName,
    type TiledMutationHookName,
} from '@/api/tiled';
import { useMutationArmed } from './mutationArming';
import ResultRenderer from './ResultRenderer';
import type { QueryResultKind } from './types';

/**
 * The part of a `UseMutationResult` this panel reads.
 *
 * Structural rather than `UseMutationResult<…, TVariables>` so one panel serves all 27 mutations
 * without being generic: the Runner owns `mutate` and the variables, so the panel never touches
 * either, and saying so in the type keeps it that way.
 */
export interface MutationView {
    isIdle: boolean;
    isPending: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
    data: unknown;
    /** Epoch ms of the last `mutate` call; 0 before the first. */
    submittedAt: number;
    reset: () => void;
}

export interface MutationResultPanelProps {
    result: MutationView;
    resultKind: QueryResultKind;
    /** Used to look up what this mutation invalidates. */
    hookName: string;
    /** Rendered inline — the Runner owns its own trigger. */
    onRun: () => void;
    /** Disables Run while a required field is missing. */
    canRun?: boolean;
}

/**
 * What a mutation did, and — the part that matters — what it invalidated.
 *
 * `useTiledMutation` awaits the bundles in `TILED_MUTATION_INVALIDATIONS` before `mutateAsync`
 * resolves, so by the time `success` appears here the affected queries have already refetched. That
 * map is hand-written and is the most error-prone thing in the mutation layer; showing it beside
 * the result turns it from something you have to trust into something you can check against the
 * cache inspector.
 */
export default function MutationResultPanel({
    result,
    resultKind,
    hookName,
    onRun,
    canRun = true,
}: MutationResultPanelProps) {
    // Relabelled when a destructive write is one click from firing, so the button itself says what
    // the next click does rather than leaving that to a banner above it.
    const armed = useMutationArmed();

    const bundles = TILED_MUTATION_INVALIDATIONS[hookName as TiledMutationHookName] as
        | readonly TiledInvalidationBundleName[]
        | undefined;

    // Expanded so you can match them against the keys in the cache inspector, which are keyed by
    // root rather than by bundle.
    const roots = bundles
        ? [...new Set(bundles.flatMap((bundle) => TILED_INVALIDATION_BUNDLES[bundle]))]
        : [];

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                    type="button"
                    className={`rounded border px-3 py-1 font-medium disabled:opacity-50 ${
                        armed
                            ? 'border-amber-500 bg-amber-100 text-amber-900 hover:bg-amber-200 dark:border-amber-600 dark:bg-amber-900 dark:text-amber-100'
                            : 'border-slate-400 bg-slate-100 hover:bg-slate-200 dark:border-slate-500 dark:bg-slate-700 dark:hover:bg-slate-600'
                    }`}
                    onClick={onRun}
                    disabled={result.isPending || !canRun}
                >
                    {result.isPending ? 'running…' : armed ? 'Confirm' : 'Run'}
                </button>

                {result.isSuccess && <Badge tone="ok">success</Badge>}
                {result.isError && <Badge tone="error">error</Badge>}
                {result.isPending && <Badge tone="info">pending</Badge>}
                {result.isIdle && <Badge tone="muted">not run</Badge>}

                {result.submittedAt > 0 && !result.isPending && (
                    <span className="text-slate-500">{ago(result.submittedAt)}</span>
                )}

                {!result.isIdle && (
                    <button
                        type="button"
                        className="text-slate-500 hover:underline"
                        onClick={() => result.reset()}
                    >
                        reset
                    </button>
                )}
            </div>

            {bundles && (
                <p className="text-xs text-slate-500">
                    Invalidates{' '}
                    {bundles.map((bundle) => (
                        <code
                            key={bundle}
                            className="mr-1 rounded bg-slate-100 px-1 font-mono text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                        >
                            {bundle}
                        </code>
                    ))}
                    <span className="text-slate-400">→ {roots.join(', ')}</span>
                    {result.isSuccess && ' — already refetched before this resolved.'}
                </p>
            )}

            {result.isError && result.error && <ErrorDetail error={result.error} />}

            {result.data !== undefined && result.data !== null && (
                <ResultRenderer kind={resultKind} value={result.data} />
            )}
            {result.isSuccess && (result.data === undefined || result.data === null) && (
                <p className="text-xs text-slate-500">
                    The server returned no body, which is normal for these writes.
                </p>
            )}
        </div>
    );
}

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

type Tone = 'ok' | 'error' | 'info' | 'muted';

const TONES: Record<Tone, string> = {
    ok: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    info: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
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
