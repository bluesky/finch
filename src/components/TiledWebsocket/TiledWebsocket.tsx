import { useMemo, useState } from 'react';
import {
    TiledApiProvider,
    createBrowserTokenStorage,
    createMemoryTokenStorage,
    createTiledApiClient,
    useTiledMetadataQuery,
    useTiledServerInfoQuery,
} from '@/api/tiled';
import type { TiledSocketFactory } from '@/api/tiled';
import { useTiledApiUrls } from '@/utils/apiUtils';
import TiledConnectionBar, {
    emptyTiledConnection,
    type TiledConnectionConfig,
} from '../devtools/TiledConnectionBar';
import TiledNodeBrowser from '../devtools/TiledNodeBrowser';
import {
    clearTiledConnection,
    hasStoredTiledConnection,
    loadTiledConnection,
    saveTiledConnection,
} from '../devtools/tiledConnectionStorage';
import { MODE_LABELS, modeForFamily, type SubscriptionMode } from './modes';
import SubscriptionPanel from './SubscriptionPanel';
import WriteHelpers from './WriteHelpers';

const CONNECTION_STORAGE = 'websocket';

export interface TiledWebsocketProps {
    /** Overrides the browser `WebSocket` in every subscription; for tests. */
    socketFactory?: TiledSocketFactory;
}

interface PanelEntry {
    id: number;
    path: string;
    mode: SubscriptionMode;
}

/**
 * Manual test harness for Tiled's streaming websocket: the subscription hooks, the raw
 * `TiledSubscription`, replay, reconnects, and the TanStack invalidation pattern.
 *
 * Like the query playground, it builds its **own client** from the connection bar and injects it
 * through `TiledApiProvider`, so the hooks here resolve their URL, initial path and API key the same
 * way an app's would. The one thing an injected client does not hand the hooks is an access token,
 * so token auth is tested with the raw `TiledSubscription` mode, which reads the bar directly.
 */
export default function TiledWebsocket({ socketFactory }: TiledWebsocketProps) {
    const configured = useTiledApiUrls();

    const [applied, setApplied] = useState<TiledConnectionConfig>(() =>
        loadTiledConnection(CONNECTION_STORAGE, {
            ...emptyTiledConnection(configured.httpBaseUrl),
            apiKey: configured.apiKey ?? '',
        }),
    );

    const client = useMemo(() => {
        const next = createTiledApiClient({
            baseUrl: applied.baseUrl,
            initialPath: applied.initialPath || undefined,
            apiKey: applied.apiKey || null,
            apiKeyScheme: applied.apiKeyScheme,
            apiKeyLocation: applied.apiKeyLocation,
            // Memory by default: the browser token keys are shared with the <Tiled> viewer.
            tokenStorage: applied.useBrowserStorage
                ? createBrowserTokenStorage()
                : createMemoryTokenStorage(),
        });
        if (applied.accessToken || applied.refreshToken) {
            next.setSession({
                accessToken: applied.accessToken,
                refreshToken: applied.refreshToken,
            });
        }
        return next;
    }, [applied]);

    return (
        <TiledApiProvider client={client}>
            <HarnessBody
                applied={applied}
                onApply={(config) => {
                    setApplied(config);
                    saveTiledConnection(CONNECTION_STORAGE, config);
                }}
                socketFactory={socketFactory}
            />
        </TiledApiProvider>
    );
}

function HarnessBody({
    applied,
    onApply,
    socketFactory,
}: {
    applied: TiledConnectionConfig;
    onApply: (config: TiledConnectionConfig) => void;
    socketFactory?: TiledSocketFactory;
}) {
    const [stored, setStored] = useState(() => hasStoredTiledConnection(CONNECTION_STORAGE));
    const [path, setPath] = useState('');
    const [panels, setPanels] = useState<PanelEntry[]>([]);
    const [nextId, setNextId] = useState(1);

    const info = useTiledServerInfoQuery({ staleTime: 30_000 });
    const node = useTiledMetadataQuery(path, { staleTime: 10_000 });
    const family = node.data?.attributes.structure_family;
    const suggested = modeForFamily(path === '' ? 'container' : family);

    const addPanel = (panelPath: string, mode: SubscriptionMode) => {
        setPanels((current) => [{ id: nextId, path: panelPath, mode }, ...current]);
        setNextId((value) => value + 1);
    };

    return (
        <div className="space-y-4">
            <TiledConnectionBar
                applied={applied}
                onApply={(config) => {
                    onApply(config);
                    setStored(true);
                }}
                onForget={
                    stored
                        ? () => {
                              clearTiledConnection(CONNECTION_STORAGE);
                              setStored(false);
                          }
                        : undefined
                }
                status={
                    <>
                        {info.isPending && 'connecting…'}
                        {info.data &&
                            `Tiled ${info.data.library_version} · ${
                                info.data.authentication?.required
                                    ? 'auth required: the hooks send the API key as a first frame'
                                    : 'anonymous reads allowed'
                            }`}
                        {info.data === null && !info.isPending && (
                            <span className="text-rose-600">
                                unreachable, or not a Tiled server
                            </span>
                        )}
                        {' · '}
                        The key scheme and location only affect HTTP; sockets always send
                        credentials as a first frame. The server must have a streaming_cache, or
                        every subscription fails with a 500 (seen here as close 1006).
                    </>
                }
            />

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(22rem,30rem)_1fr]">
                <div className="space-y-4">
                    <section className="space-y-2">
                        <h2 className="font-semibold">Node</h2>
                        <TiledNodeBrowser path={path} onPathChange={setPath} />
                        <div className="flex flex-wrap items-center gap-2 rounded border border-slate-300 bg-white p-2 text-xs">
                            <span className="text-slate-500">
                                {path || '/'} is{' '}
                                {path === '' ? 'the root container' : (family ?? 'unknown')}
                            </span>
                            <button
                                type="button"
                                className="rounded bg-slate-800 px-3 py-1 font-medium text-white"
                                onClick={() => addPanel(path, suggested)}
                            >
                                Add subscription ({MODE_LABELS[suggested]})
                            </button>
                        </div>
                    </section>

                    <WriteHelpers parentPath={path} onSubscribe={addPanel} />

                    <section className="space-y-1 rounded border border-slate-300 bg-white p-3 text-xs text-slate-600">
                        <h2 className="text-sm font-semibold text-slate-800">Things to try</h2>
                        <ul className="list-disc space-y-1 pl-4">
                            <li>
                                Subscribe to a container, then <b>Create child container</b> and{' '}
                                <b>Add metadata.stop</b>. Both events arrive, and the node browser
                                refreshes through cache invalidation.
                            </li>
                            <li>
                                Create an array, subscribe to it, then <b>Write frame</b> or{' '}
                                <b>Append row</b>. Note the offset on appended rows.
                            </li>
                            <li>
                                Press <b>disconnect()</b>, make a few writes, then{' '}
                                <b>reconnect()</b>. The missed events replay once, from{' '}
                                <code>start = last + 1</code>.
                            </li>
                            <li>
                                Subscribe with <b>start = 0</b> to replay everything the streaming
                                cache still holds.
                            </li>
                            <li>
                                Restart Tiled while subscribed. The panel goes reconnecting, backs
                                off, then reconnects. With a memory cache, sequences restart at 1
                                and the subscription starts a new epoch.
                            </li>
                            <li>
                                Use the raw <b>TiledSubscription</b> mode with a wrong API key on a
                                server that requires auth to see close 4003.
                            </li>
                        </ul>
                    </section>
                </div>

                <section className="space-y-3">
                    <h2 className="font-semibold">
                        Subscriptions{panels.length > 0 && ` (${panels.length})`}
                    </h2>
                    {panels.length === 0 && (
                        <p className="rounded border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                            Pick a node and press <b>Add subscription</b>. Each panel holds its own
                            socket.
                        </p>
                    )}
                    {panels.map((panel) => (
                        <SubscriptionPanel
                            key={panel.id}
                            initialPath={panel.path}
                            initialMode={panel.mode}
                            connection={applied}
                            socketFactory={socketFactory}
                            onSubscribeChild={addPanel}
                            onRemove={() =>
                                setPanels((current) =>
                                    current.filter((entry) => entry.id !== panel.id),
                                )
                            }
                        />
                    ))}
                </section>
            </div>
        </div>
    );
}
