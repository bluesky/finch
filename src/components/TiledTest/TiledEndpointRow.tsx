import { useState } from 'react';
import type { TiledEndpointDescriptor, TiledEndpointInvocation } from '@/api/tiled';
import JsonResultViewer from '../devtools/JsonResultViewer';
import type { TiledRunState } from './useTiledEndpointRunner';

export interface TiledEndpointRowProps {
    endpoint: TiledEndpointDescriptor;
    state: TiledRunState | undefined;
    /** The path picked in the node browser, used unless this row overrides it. */
    sharedPath: string;
    onRun: (endpoint: TiledEndpointDescriptor, input: TiledEndpointInvocation) => void;
}

const METHOD_COLORS: Record<string, string> = {
    GET: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
    POST: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    PUT: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    PATCH: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

/**
 * One endpoint: its parameters, its body, a run button and the result.
 *
 * Two things the row has to get right, both of which a generic "call this endpoint" UI usually gets
 * wrong:
 *
 * - **A destructive endpoint asks first.** `destructive` comes from the registry, so the list cannot
 *   drift from what actually writes. A `readOnly` POST is not treated as destructive.
 * - **A binary endpoint takes a file, not JSON.** There is no useful way to type array bytes into a
 *   textarea, so those rows show a file picker and say what the bytes have to be.
 */
export default function TiledEndpointRow({
    endpoint,
    state,
    sharedPath,
    onRun,
}: TiledEndpointRowProps) {
    const [open, setOpen] = useState(false);
    const [pathOverride, setPathOverride] = useState<string | null>(null);
    const [params, setParams] = useState<Record<string, string>>({});
    const [file, setFile] = useState<File | null>(null);
    const [bodyText, setBodyText] = useState(() =>
        endpoint.sampleBody ? JSON.stringify(endpoint.sampleBody, null, 2) : '',
    );
    const [bodyError, setBodyError] = useState<string | null>(null);

    const path = pathOverride ?? sharedPath;
    const queryParams = endpoint.params?.filter((param) => param.in === 'query') ?? [];
    const scalarPathParams =
        endpoint.params?.filter((param) => param.in === 'path' && param.name !== 'path') ?? [];

    const handleRun = () => {
        let payload: TiledEndpointInvocation['payload'];
        if (bodyText.trim()) {
            try {
                payload = JSON.parse(bodyText) as TiledEndpointInvocation['payload'];
                setBodyError(null);
            } catch (error) {
                setBodyError(error instanceof Error ? error.message : 'Invalid JSON');
                return;
            }
        }

        if (endpoint.destructive) {
            const target = endpoint.pathParam ? ` on "${path || '(root)'}"` : '';
            // A manual test harness for destructive writes is exactly the place a native confirm
            // belongs; a bespoke modal for a page only developers open would be ceremony.
            if (
                !window.confirm(
                    `${endpoint.method} ${endpoint.path}${target}\n\nThis changes server state. Continue?`,
                )
            ) {
                return;
            }
        }

        onRun(endpoint, {
            path: endpoint.pathParam ? path : undefined,
            payload,
            params,
            file,
        });
    };

    const statusColor =
        state?.status === 'success'
            ? 'text-emerald-600 dark:text-emerald-400'
            : state?.status === 'error'
              ? 'text-red-600 dark:text-red-400'
              : 'text-slate-500';

    return (
        <div className="border-b border-slate-200 last:border-b-0 dark:border-slate-700">
            <div className="flex items-center gap-2 px-2 py-1.5">
                <span
                    className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${
                        METHOD_COLORS[endpoint.method] ?? ''
                    }`}
                >
                    {endpoint.method}
                </span>
                <button
                    type="button"
                    className="flex-1 text-left text-sm hover:underline"
                    onClick={() => setOpen((value) => !value)}
                >
                    <span className="font-medium">{endpoint.id}</span>
                    <span className="ml-2 text-xs text-slate-500">{endpoint.summary}</span>
                </button>

                {endpoint.destructive && (
                    <span
                        className="rounded bg-red-100 px-1 text-[10px] text-red-700 dark:bg-red-900 dark:text-red-200"
                        title="Changes server state"
                    >
                        write
                    </span>
                )}
                {state?.ms !== undefined && (
                    <span className={`font-mono text-xs ${statusColor}`}>
                        {state.httpStatus ? `${state.httpStatus} · ` : ''}
                        {state.ms}ms
                    </span>
                )}
                <button
                    type="button"
                    className="rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700"
                    onClick={handleRun}
                    disabled={state?.status === 'pending'}
                >
                    {state?.status === 'pending' ? '…' : 'Run'}
                </button>
            </div>

            {open && (
                <div className="space-y-2 bg-slate-50 px-3 py-2 text-xs dark:bg-slate-900/50">
                    <p className="font-mono text-slate-500">
                        {endpoint.method} {endpoint.path}
                        {endpoint.operationId === null && ' — not in openapi.json (auth route)'}
                    </p>

                    {endpoint.pathParam && (
                        <label className="block">
                            <span className="text-slate-500">path</span>
                            <input
                                type="text"
                                value={path}
                                onChange={(event) => setPathOverride(event.target.value)}
                                className="w-full rounded border border-slate-300 bg-white px-2 py-1 font-mono text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                                placeholder="(root)"
                            />
                            {pathOverride !== null && (
                                <button
                                    type="button"
                                    className="mt-0.5 text-[10px] text-slate-500 hover:underline"
                                    onClick={() => setPathOverride(null)}
                                >
                                    use the browsed path
                                </button>
                            )}
                        </label>
                    )}

                    {[...scalarPathParams, ...queryParams].map((param) => (
                        <label key={param.name} className="block">
                            <span className="text-slate-500">
                                {param.name}
                                {param.required && <span className="text-red-500"> *</span>}
                                {param.description && (
                                    <span className="ml-1 text-slate-400">
                                        — {param.description}
                                    </span>
                                )}
                            </span>
                            <input
                                type="text"
                                value={params[param.name] ?? ''}
                                onChange={(event) =>
                                    setParams((current) => ({
                                        ...current,
                                        [param.name]: event.target.value,
                                    }))
                                }
                                className="w-full rounded border border-slate-300 bg-white px-2 py-1 font-mono text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                            />
                        </label>
                    ))}

                    {endpoint.binary && (
                        <label className="block">
                            <span className="text-slate-500">
                                body — raw bytes, in the target&apos;s own dtype and C order
                            </span>
                            <input
                                type="file"
                                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                                className="block w-full py-1"
                            />
                        </label>
                    )}

                    {!endpoint.binary && (endpoint.sampleBody !== undefined || bodyText) && (
                        <label className="block">
                            <span className="text-slate-500">body (JSON)</span>
                            <textarea
                                value={bodyText}
                                onChange={(event) => setBodyText(event.target.value)}
                                rows={Math.min(14, bodyText.split('\n').length + 1)}
                                className="w-full rounded border border-slate-300 bg-white px-2 py-1 font-mono text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                            />
                            {bodyError && (
                                <span className="text-red-600 dark:text-red-400">{bodyError}</span>
                            )}
                        </label>
                    )}

                    {state?.error && (
                        <p className="text-red-600 dark:text-red-400">
                            {state.error}
                            {state.validationDetail && ` — ${state.validationDetail}`}
                        </p>
                    )}

                    {state?.result !== undefined && <JsonResultViewer value={state.result} />}
                </div>
            )}
        </div>
    );
}
