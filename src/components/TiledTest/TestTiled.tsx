import { useMemo, useState } from 'react';
import {
    TILED_ENDPOINTS,
    TILED_ENDPOINT_GROUPS,
    TILED_GROUP_LABELS,
    createTiledApiClient,
    getEndpointsByGroup,
    getReadOnlyEndpoints,
    useTiledServerInfoQuery,
} from '@/api/tiled';
import type { TiledEndpointDescriptor, TiledEndpointGroup } from '@/api/tiled';
import { useTiledApiUrls } from '@/utils/apiUtils';
import TiledEndpointRow from './TiledEndpointRow';
import TiledNodeBrowser from '../devtools/TiledNodeBrowser';
import { useTiledEndpointRunner } from './useTiledEndpointRunner';

/**
 * Manual test harness for the Tiled client — every registry endpoint, runnable against a live
 * server.
 *
 * The counterpart to `QServerTest/TestQserver.tsx`, and the thing that makes the client's coverage
 * something you can *see* rather than only read about in a test report. `TiledRegistry.test.ts`
 * proves every spec operation has an implementation; this proves the implementations work.
 *
 * It builds its **own client** rather than using the app-wide one, so changing the URL or key here
 * cannot leak into the rest of the page. The defaults come from `FinchConfigProvider`.
 */
export default function TestTiled() {
    const configured = useTiledApiUrls();

    const [baseUrl, setBaseUrl] = useState(configured.httpBaseUrl);
    const [apiKey, setApiKey] = useState(configured.apiKey ?? '');
    const [path, setPath] = useState('');
    const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set(['info', 'search']));

    // Rebuilt only when the connection settings change, so run state survives expanding a group.
    const client = useMemo(
        () => createTiledApiClient({ baseUrl, apiKey: apiKey || null }),
        [baseUrl, apiKey],
    );

    const runner = useTiledEndpointRunner(client);
    const info = useTiledServerInfoQuery(undefined, { baseUrl, apiKey: apiKey || null });

    const readOnly = useMemo(() => getReadOnlyEndpoints(), []);
    const coverage = `${runner.exercisedIds.length}/${TILED_ENDPOINTS.length}`;

    const toggleGroup = (group: string) =>
        setOpenGroups((current) => {
            const next = new Set(current);
            if (next.has(group)) next.delete(group);
            else next.add(group);
            return next;
        });

    return (
        <div className="space-y-4">
            <section className="space-y-2 rounded border border-slate-300 p-3 dark:border-slate-700">
                <h2 className="font-semibold">Connection</h2>
                <div className="flex flex-wrap gap-2">
                    <label className="flex-1 text-xs">
                        <span className="text-slate-500">base URL — must include /api/v1</span>
                        <input
                            type="text"
                            value={baseUrl}
                            onChange={(event) => setBaseUrl(event.target.value)}
                            className="w-full rounded border border-slate-300 bg-white px-2 py-1 font-mono text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </label>
                    <label className="flex-1 text-xs">
                        <span className="text-slate-500">API key</span>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(event) => setApiKey(event.target.value)}
                            className="w-full rounded border border-slate-300 bg-white px-2 py-1 font-mono text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </label>
                </div>

                <p className="text-xs text-slate-500">
                    {info.isPending && 'connecting…'}
                    {info.data && (
                        <>
                            Tiled {info.data.library_version} · api v{info.data.api_version} ·{' '}
                            {info.data.authentication?.required
                                ? 'auth required'
                                : 'auth not required'}
                            {!info.data.authentication?.links &&
                                ' · no auth endpoints advertised, so the auth group will fail'}
                        </>
                    )}
                    {/* getServerInfo resolves null rather than throwing — see the client docs. */}
                    {info.data === null && !info.isPending && (
                        <span className="text-red-600 dark:text-red-400">
                            unreachable, or not a Tiled server
                        </span>
                    )}
                </p>

                <div className="flex gap-2">
                    <button
                        type="button"
                        className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                        onClick={() => void runner.runMany(readOnly, { path })}
                    >
                        Run all {readOnly.length} safe reads
                    </button>
                    <button
                        type="button"
                        className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                        onClick={runner.reset}
                    >
                        Reset
                    </button>
                    <span className="self-center text-xs text-slate-500">exercised {coverage}</span>
                </div>
                <p className="text-xs text-slate-400">
                    A sweep points every endpoint at the browsed path, so the ones for other
                    structure families answer a 404 naming the mismatch. That is the server being
                    right, not a failure.
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="font-semibold">Node</h2>
                <TiledNodeBrowser path={path} onPathChange={setPath} />
            </section>

            <section className="space-y-2">
                <h2 className="font-semibold">Endpoints</h2>
                {TILED_ENDPOINT_GROUPS.map((group: TiledEndpointGroup) => {
                    const endpoints = getEndpointsByGroup(group);
                    const isOpen = openGroups.has(group);
                    return (
                        <div
                            key={group}
                            className="rounded border border-slate-300 dark:border-slate-700"
                        >
                            <button
                                type="button"
                                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                                onClick={() => toggleGroup(group)}
                            >
                                <span>{TILED_GROUP_LABELS[group]}</span>
                                <span className="text-xs text-slate-500">
                                    {endpoints.length} · {isOpen ? '−' : '+'}
                                </span>
                            </button>
                            {isOpen && (
                                <div className="border-t border-slate-200 dark:border-slate-700">
                                    {endpoints.map((endpoint: TiledEndpointDescriptor) => (
                                        <TiledEndpointRow
                                            key={endpoint.id}
                                            endpoint={endpoint}
                                            state={runner.states[endpoint.id]}
                                            sharedPath={path}
                                            onRun={(target, input) =>
                                                void runner.run(target, input)
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </section>
        </div>
    );
}
