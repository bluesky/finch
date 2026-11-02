import { useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
    TiledApiProvider,
    createMemoryTokenStorage,
    createTiledApiClient,
    createBrowserTokenStorage,
    useTiledServerInfoQuery,
} from '@/api/tiled';
import { useTiledApiUrls } from '@/utils/apiUtils';
import TiledConnectionBar, {
    emptyTiledConnection,
    type TiledConnectionConfig,
} from '../devtools/TiledConnectionBar';
import {
    clearTiledConnection,
    hasStoredTiledConnection,
    loadTiledConnection,
    saveTiledConnection,
} from '../devtools/tiledConnectionStorage';
import QueryCacheInspector from './QueryCacheInspector';
import QueryCatalogList from './QueryCatalogList';
import QueryDetailPanel from './QueryDetailPanel';
import { TILED_PLAYGROUND_CATALOG, getQueryById } from './catalog';
import { defaultValues, type PlaygroundQueryOptions } from './types';

/**
 * Separate from `TestTiled`'s, so pointing one harness at a scratch container does not move the
 * other. They are different investigations and usually want different servers.
 */
const CONNECTION_STORAGE = 'playground' as const;

/**
 * A manual testbed for the Tiled **query hooks**.
 *
 * Not to be confused with `TestTiled`, which drives the client and the endpoint registry directly
 * and never calls a hook. That one answers "does the request work"; this one answers "does the hook
 * layer behave" — keys, cache sharing, staleness, guards, invalidation. Both of the cache bugs
 * found in review were invisible from a client-level harness.
 *
 * It covers **reads and writes**: 41 query hooks and 27 mutation hooks. The writes are here for one
 * reason, since `TestTiled` already fires every one of them with better binary handling —
 * invalidation. `useTiledMutation` awaits a hand-written bundle map before `mutateAsync` resolves,
 * and pinning a query while running a mutation against the same node is the only way to see whether
 * the right entries actually refetched.
 *
 * ## Two things it deliberately owns
 *
 * **Its own `QueryClient`.** Invalidating and clearing here cannot touch the host app's cache, and
 * the inspector shows only playground entries. `retry: false` because three attempts on a 404 makes
 * the status flicker through states that did not happen, and `refetchOnWindowFocus: false` because
 * alt-tabbing back would refetch and make every timing on screen a lie.
 *
 * **Its own client, through `TiledApiProvider`.** Not per-call `requestOptions` — a per-call
 * `apiKey` marks a request `__tiledCallerCredentials`, which deliberately disables the 401 refresh,
 * so a playground built that way could never exercise refresh at all. The provider also means this
 * exercises the injection seam itself, and an injected client is never redirected by Finch config,
 * so the bar is authoritative.
 */
export default function TiledQueryPlayground() {
    const configured = useTiledApiUrls();

    // Finch config supplies the defaults; a connection saved by a previous Apply overrides them
    // field by field. Read once, in the initializer, so a later render never silently reverts what
    // is on screen to what is on disk.
    const [applied, setApplied] = useState<TiledConnectionConfig>(() =>
        loadTiledConnection(CONNECTION_STORAGE, {
            ...emptyTiledConnection(configured.httpBaseUrl),
            apiKey: configured.apiKey ?? '',
        }),
    );

    // Apply is the commit point for the client, so it is the commit point for storage too.
    const apply = (config: TiledConnectionConfig) => {
        setApplied(config);
        saveTiledConnection(CONNECTION_STORAGE, config);
    };

    // Rebuilt only when Apply commits a change — the bar stages edits precisely so that typing a
    // URL does not remount every mounted query and fire a request per keystroke.
    const client = useMemo(() => {
        const next = createTiledApiClient({
            baseUrl: applied.baseUrl,
            initialPath: applied.initialPath || undefined,
            apiKey: applied.apiKey || null,
            apiKeyScheme: applied.apiKeyScheme,
            apiKeyLocation: applied.apiKeyLocation,
            // Memory by default: the browser keys are shared with the <Tiled> viewer component, so
            // an experimental token typed here would otherwise change its session too.
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

    const queryClient = useMemo(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: false,
                        refetchOnWindowFocus: false,
                        staleTime: 0,
                        // Shorter than the 5-minute default so abandoned entries do not pile up in
                        // the inspector, but long enough to still watch one outlive its observer —
                        // which is the thing `gcTime` is for.
                        gcTime: 60_000,
                    },
                },
            }),
        [],
    );

    return (
        <QueryClientProvider client={queryClient}>
            <TiledApiProvider client={client}>
                <PlaygroundBody applied={applied} onApply={apply} />
            </TiledApiProvider>
        </QueryClientProvider>
    );
}

/**
 * Everything below the providers.
 *
 * Split out so the connection status can be read with `useTiledServerInfoQuery` — which has to be
 * inside both providers it depends on.
 */
function PlaygroundBody({
    applied,
    onApply,
}: {
    applied: TiledConnectionConfig;
    onApply: (config: TiledConnectionConfig) => void;
}) {
    // Only tracked so *Forget* can disappear once there is nothing left to forget; the stored
    // config itself was read in the parent's initializer and is not re-read here.
    const [stored, setStored] = useState(() => hasStoredTiledConnection(CONNECTION_STORAGE));

    const [selectedId, setSelectedId] = useState(TILED_PLAYGROUND_CATALOG[0].id);
    const [pinnedIds, setPinnedIds] = useState<string[]>([]);

    // Field values and per-query options live here rather than in the panel, so switching away and
    // back does not lose what you typed.
    const [valuesById, setValuesById] = useState<Record<string, Record<string, unknown>>>({});
    const [optionsById, setOptionsById] = useState<Record<string, PlaygroundQueryOptions>>({});

    const info = useTiledServerInfoQuery({ staleTime: 30_000 });

    const selected = getQueryById(selectedId);
    const shown = [
        ...pinnedIds.filter((id) => id !== selectedId),
        ...(selected ? [selectedId] : []),
    ];

    const valuesFor = (id: string) => {
        const descriptor = getQueryById(id);
        return valuesById[id] ?? (descriptor ? defaultValues(descriptor) : {});
    };

    const togglePin = (id: string) =>
        setPinnedIds((current) =>
            current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
        );

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
                        {info.data && (
                            <>
                                Tiled {info.data.library_version} · api v{info.data.api_version} ·{' '}
                                {info.data.authentication?.required
                                    ? 'auth required'
                                    : 'auth not required'}
                                {!info.data.authentication?.links &&
                                    ' · no auth endpoints advertised, so whoami will fail'}
                            </>
                        )}
                        {/* getServerInfo resolves null rather than throwing — see the client docs. */}
                        {info.data === null && !info.isPending && (
                            <span className="text-red-600 dark:text-red-400">
                                unreachable, or not a Tiled server
                            </span>
                        )}
                    </>
                }
            />

            <div className="flex gap-4">
                <aside className="w-56 shrink-0 overflow-auto">
                    <QueryCatalogList
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                        pinnedIds={pinnedIds}
                        onTogglePin={togglePin}
                    />
                </aside>

                <div className="min-w-0 flex-1 space-y-4">
                    {shown.map((id) => {
                        const descriptor = getQueryById(id);
                        if (!descriptor) return null;
                        return (
                            <QueryDetailPanel
                                // Keyed by id so switching queries remounts the Runner rather than
                                // reusing one component instance for a different hook — which would
                                // change the hook call order and crash React.
                                key={id}
                                descriptor={descriptor}
                                values={valuesFor(id)}
                                onValuesChange={(values) =>
                                    setValuesById((current) => ({ ...current, [id]: values }))
                                }
                                options={optionsById[id] ?? {}}
                                onOptionsChange={(options) =>
                                    setOptionsById((current) => ({ ...current, [id]: options }))
                                }
                                pinned={pinnedIds.includes(id)}
                                onTogglePin={() => togglePin(id)}
                            />
                        );
                    })}

                    <QueryCacheInspector />
                </div>
            </div>
        </div>
    );
}
