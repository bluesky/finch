import { useMemo, useState } from 'react';
import type { QServerEndpointDescriptor, QServerEndpointInvocation } from '@/api/qServer';
import JsonResultViewer from './JsonResultViewer';
import type { EndpointRunState } from './useEndpointRunner';
import { defaultPayloadFor, describeBadges, parsePayload } from './testQserverUtils';

export interface EndpointRowProps {
    endpoint: QServerEndpointDescriptor;
    state: EndpointRunState | undefined;
    onRun: (endpoint: QServerEndpointDescriptor, input: QServerEndpointInvocation) => void;
}

const METHOD_COLORS: Record<string, string> = {
    GET: 'bg-emerald-600',
    POST: 'bg-blue-600',
    DELETE: 'bg-rose-600',
};

const STATUS_COLORS: Record<EndpointRunState['status'], string> = {
    idle: 'bg-slate-300 dark:bg-slate-600',
    pending: 'bg-amber-400',
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
};

/** One endpoint: inputs, a Run button, and the last outcome. Rendered from metadata only. */
export default function EndpointRow({ endpoint, state, onRun }: EndpointRowProps) {
    const [payloadText, setPayloadText] = useState(() => defaultPayloadFor(endpoint));
    const [params, setParams] = useState<Record<string, string>>({});
    const [file, setFile] = useState<File | null>(null);

    const parsed = useMemo(() => parsePayload(payloadText), [payloadText]);
    const badges = describeBadges(endpoint);
    const status = state?.status ?? 'idle';

    const missingParam = endpoint.params?.some(
        (param) => param.required && !params[param.name]?.trim(),
    );
    const canRun = !parsed.error && status !== 'pending' && !missingParam;

    const run = () => {
        if (endpoint.destructive) {
            const confirmed = window.confirm(
                `${endpoint.method} ${endpoint.path} changes server state.\n\n${endpoint.summary}\n\nRun it?`,
            );
            if (!confirmed) return;
        }
        onRun(endpoint, { payload: parsed.value, params, file });
    };

    return (
        <div
            data-testid="qserver-endpoint-row"
            data-endpoint-id={endpoint.id}
            className="border-t border-slate-200 px-3 py-3 dark:border-slate-700"
        >
            <div className="flex flex-wrap items-center gap-2">
                <span className={`${STATUS_COLORS[status]} h-2.5 w-2.5 shrink-0 rounded-full`} />
                <span
                    className={`${METHOD_COLORS[endpoint.method] ?? 'bg-slate-500'} rounded px-1.5 py-0.5 font-mono text-[10px] font-bold text-white`}
                >
                    {endpoint.method}
                </span>
                <code className="font-mono text-xs">{endpoint.path}</code>
                <span className="text-xs text-slate-500 dark:text-slate-400">{endpoint.fn}()</span>
                {badges.map((badge) => (
                    <span
                        key={badge}
                        className={`rounded px-1.5 py-0.5 text-[10px] ${
                            badge === 'not browser-safe' || badge === 'destructive'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        {badge}
                    </span>
                ))}
                <button
                    type="button"
                    onClick={run}
                    disabled={!canRun}
                    className="ml-auto rounded bg-slate-800 px-3 py-1 text-xs font-medium text-white disabled:opacity-40 dark:bg-slate-200 dark:text-slate-900"
                >
                    {status === 'pending' ? 'Running…' : 'Run'}
                </button>
            </div>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{endpoint.summary}</p>

            {!endpoint.browserSafe && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                    This endpoint is a GET that requires a request body, which browsers cannot send,
                    and it has no substitute. Expect a 422.
                </p>
            )}

            {endpoint.params?.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                    {endpoint.params.map((param) => (
                        <label key={param.name} className="text-xs">
                            <span className="mr-1 text-slate-500 dark:text-slate-400">
                                {param.name}
                                {param.required ? '*' : ''} ({param.in})
                            </span>
                            <input
                                value={params[param.name] ?? ''}
                                onChange={(event) =>
                                    setParams((current) => ({
                                        ...current,
                                        [param.name]: event.target.value,
                                    }))
                                }
                                className="rounded border border-slate-300 px-1 py-0.5 font-mono dark:border-slate-600 dark:bg-slate-800"
                            />
                        </label>
                    ))}
                </div>
            ) : null}

            {endpoint.multipart && (
                <div className="mt-2 text-xs">
                    <input
                        type="file"
                        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                        className="text-xs"
                    />
                </div>
            )}

            {(endpoint.sampleBody || endpoint.payloadGet || endpoint.method === 'POST') &&
                !endpoint.multipart && (
                    <div className="mt-2">
                        <textarea
                            value={payloadText}
                            onChange={(event) => setPayloadText(event.target.value)}
                            spellCheck={false}
                            rows={Math.min(10, Math.max(2, payloadText.split('\n').length))}
                            placeholder="Request body as JSON (optional)"
                            className={`w-full rounded border px-2 py-1 font-mono text-xs dark:bg-slate-800 ${
                                parsed.error
                                    ? 'border-rose-500'
                                    : 'border-slate-300 dark:border-slate-600'
                            }`}
                        />
                        {parsed.error && (
                            <p className="text-xs text-rose-600 dark:text-rose-400">
                                {parsed.error}
                            </p>
                        )}
                    </div>
                )}

            {state && state.status !== 'idle' && state.status !== 'pending' && (
                <div className="mt-2 space-y-1">
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span
                            className={
                                state.status === 'success'
                                    ? 'font-medium text-emerald-700 dark:text-emerald-400'
                                    : 'font-medium text-rose-700 dark:text-rose-400'
                            }
                        >
                            {state.status === 'success' ? 'OK' : 'Failed'}
                        </span>
                        {state.httpStatus !== undefined && <span>HTTP {state.httpStatus}</span>}
                        {state.ms !== undefined && <span>{state.ms} ms</span>}
                        {state.usedFallback && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                used browser fallback
                            </span>
                        )}
                    </div>
                    {state.error && (
                        <p className="font-mono text-xs text-rose-600 dark:text-rose-400">
                            {state.error}
                        </p>
                    )}
                    {state.validationDetail && (
                        <p className="font-mono text-xs text-rose-600 dark:text-rose-400">
                            {state.validationDetail}
                        </p>
                    )}
                    {state.result !== undefined && <JsonResultViewer value={state.result} />}
                </div>
            )}
        </div>
    );
}
