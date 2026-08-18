import { useCallback, useRef, useState } from 'react';
import type { InterceptorHandle, QServerApiClient } from '@/api/qServer';

export interface InterceptorPlaygroundProps {
    client: QServerApiClient;
}

const MAX_LOG_LINES = 40;

/**
 * Exercises the interceptor utilities.
 *
 * Worth checking by hand: after "Clear all", requests still authenticate — the built-in auth
 * and refresh handlers are tracked separately and survive `clearInterceptors()`.
 */
export default function InterceptorPlayground({ client }: InterceptorPlaygroundProps) {
    const [log, setLog] = useState<string[]>([]);
    const [handles, setHandles] = useState<InterceptorHandle[]>([]);
    const counterRef = useRef(0);

    const append = useCallback((line: string) => {
        setLog((current) =>
            [`${new Date().toLocaleTimeString()} ${line}`, ...current].slice(0, MAX_LOG_LINES),
        );
    }, []);

    const addRequestLogger = () => {
        const id = ++counterRef.current;
        const handle = client.addRequestInterceptor((config) => {
            // Runs before the built-in auth interceptor: axios executes request handlers
            // last-registered-first, so no Authorization header is visible here yet.
            append(
                `req#${id} → ${String(config.method).toUpperCase()} ${config.url} ` +
                    `(auth header present: ${!!config.headers?.Authorization})`,
            );
            return config;
        });
        setHandles((current) => [...current, handle]);
        append(`registered request interceptor #${handle.id}`);
    };

    const addResponseObserver = () => {
        const id = ++counterRef.current;
        const handle = client.addResponseInterceptor(
            (response) => {
                append(`res#${id} ← ${response.status} ${response.config.url}`);
                return response;
            },
            (error) => {
                append(`res#${id} ← error ${(error as Error)?.message ?? 'unknown'}`);
                return Promise.reject(error);
            },
        );
        setHandles((current) => [...current, handle]);
        append(`registered response interceptor #${handle.id}`);
    };

    const eject = (handle: InterceptorHandle) => {
        const removed = client.ejectInterceptor(handle);
        setHandles((current) => current.filter((entry) => entry !== handle));
        append(`ejected ${handle.kind} #${handle.id} (${removed ? 'removed' : 'not found'})`);
    };

    const clearAll = () => {
        client.clearInterceptors();
        setHandles([]);
        append('cleared all caller-registered interceptors (built-ins untouched)');
    };

    return (
        <section className="rounded border border-slate-300 p-3 dark:border-slate-700">
            <h3 className="text-sm font-medium">Interceptors</h3>
            <div className="mt-2 flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={addRequestLogger}
                    className="rounded border border-slate-400 px-3 py-1 text-xs dark:border-slate-600"
                >
                    Add request logger
                </button>
                <button
                    type="button"
                    onClick={addResponseObserver}
                    className="rounded border border-slate-400 px-3 py-1 text-xs dark:border-slate-600"
                >
                    Add response observer
                </button>
                <button
                    type="button"
                    onClick={clearAll}
                    className="rounded border border-slate-400 px-3 py-1 text-xs dark:border-slate-600"
                >
                    Clear all
                </button>
            </div>

            {handles.length > 0 && (
                <ul className="mt-2 space-y-1">
                    {handles.map((handle) => (
                        <li
                            key={`${handle.kind}-${handle.id}`}
                            className="flex items-center gap-2 text-xs"
                        >
                            <code>
                                {handle.kind} #{handle.id}
                            </code>
                            <button
                                type="button"
                                onClick={() => eject(handle)}
                                className="text-rose-600 hover:underline dark:text-rose-400"
                            >
                                eject
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded bg-slate-50 px-2 py-1 font-mono text-xs dark:bg-slate-900">
                {log.join('\n') || '(no interceptor activity yet)'}
            </pre>
        </section>
    );
}
