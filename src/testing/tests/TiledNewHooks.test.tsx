import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { resetDefaultTiledApiClient, setDefaultTiledApiClient } from '@blueskyproject/tiled';
import { FinchConfigProvider } from '../../app/FinchConfigProvider';
import * as tiled from '../../api/tiled_new';
import { TiledApiProvider } from '../../api/tiled_new/runtime/TiledApiProvider';
import {
    TILED_CLIENT_LIKE_METHODS,
    type TiledClientLike,
} from '../../api/tiled_new/runtime/clientLike';
import {
    TILED_INVALIDATION_BUNDLES,
    TILED_MUTATION_INVALIDATIONS,
} from '../../api/tiled_new/hooks/invalidation';
import { tiledQueryRoots } from '../../api/tiled_new/hooks/queryKeys';
import type { TiledRequestOptions, TiledSearchResult } from '../../api/tiled_new/types/common';

const BASE_URL = 'http://tiled.test:8000/api/v1';

/** A search result shaped like the real thing, with a settable item count. */
function searchResult(count = 2): TiledSearchResult {
    return {
        data: [],
        error: null,
        links: { self: 'x', first: 'x', last: 'x', next: null, prev: null },
        meta: { count },
    };
}

interface StubOptions {
    baseUrl?: string;
    initialPath?: string;
    /** Method names to leave off the stub, to exercise the unavailable-endpoint path. */
    omit?: readonly string[];
    /** Replaces `getSearch`, e.g. with a promise that never settles. */
    getSearch?: (
        searchPath: string,
        config?: unknown,
        requestOptions?: TiledRequestOptions,
    ) => Promise<TiledSearchResult>;
}

/**
 * A client stub recording every call.
 *
 * The hooks call client *methods*, never the package's free functions, so a plain object is a complete
 * test double — no axios, no network, no module mocking.
 */
function makeStub(options: StubOptions = {}) {
    const calls: { method: string; args: unknown[] }[] = [];
    const record =
        <T,>(method: string, result: T) =>
        (...args: unknown[]) => {
            calls.push({ method, args });
            return Promise.resolve(result);
        };

    const stub: Record<string, unknown> = {
        getSearch:
            options.getSearch ??
            ((searchPath: string, config?: unknown, requestOptions?: TiledRequestOptions) => {
                calls.push({ method: 'getSearch', args: [searchPath, config, requestOptions] });
                return Promise.resolve(searchResult());
            }),
        getMetadata: record('getMetadata', {
            id: 'scan/detector',
            attributes: { structure: { shape: [10, 10] } },
        }),
        getArrayAs: record('getArrayAs', [[1]]),
        getArrayAsJSON: record('getArrayAsJSON', [[1, 2]]),
        getArrayAsPng: record('getArrayAsPng', new Blob()),
        getArrayAsBuffer: record('getArrayAsBuffer', new ArrayBuffer(8)),
        getArrayAsImagePath: (...args: unknown[]) => {
            calls.push({ method: 'getArrayAsImagePath', args });
            return `${options.baseUrl ?? BASE_URL}/array/full/${String(args[0])}`;
        },
        getTableAs: record('getTableAs', { I0: [1, 2] }),
        getTablePartitionAsJSON: record('getTablePartitionAsJSON', { I0: [1, 2] }),
        getTablePartitionAsJSONSequence: record('getTablePartitionAsJSONSequence', [{ I0: 1 }]),
        getTableFullAsJSON: record('getTableFullAsJSON', { I0: [1, 2, 3] }),
        getTableFullAsJSONSequence: record('getTableFullAsJSONSequence', [{ I0: 1 }, { I0: 2 }]),
        getServerInfo: record('getServerInfo', null),
        loginWithUsernamePassword: record('loginWithUsernamePassword', {
            access_token: 'a',
            refresh_token: 'r',
        }),
        getBaseUrl: () => options.baseUrl ?? BASE_URL,
        getInitialPath: () => options.initialPath ?? '',
        getApiKey: () => null,
    };

    for (const name of options.omit ?? []) delete stub[name];

    return { client: stub as unknown as TiledClientLike, calls };
}

function makeWrapper(
    options: { injected?: TiledClientLike; config?: Record<string, string> } = {},
) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });

    const wrapper = ({ children }: { children: ReactNode }) => {
        const withProvider = options.injected ? (
            <TiledApiProvider client={options.injected}>{children}</TiledApiProvider>
        ) : (
            children
        );
        const withQuery = (
            <QueryClientProvider client={queryClient}>{withProvider}</QueryClientProvider>
        );
        return options.config ? (
            <FinchConfigProvider config={options.config}>{withQuery}</FinchConfigProvider>
        ) : (
            withQuery
        );
    };

    return { queryClient, wrapper };
}

beforeEach(() => {
    resetDefaultTiledApiClient();
});

afterEach(() => {
    resetDefaultTiledApiClient();
    vi.restoreAllMocks();
});

describe('hook coverage', () => {
    const exported = tiled as unknown as Record<string, unknown>;

    it('exports 18 queries, 1 mutation and the image-path helper', () => {
        const names = Object.keys(exported).filter(
            (name) => name.startsWith('useTiled') && typeof exported[name] === 'function',
        );

        expect(names.filter((name) => name.endsWith('Query'))).toHaveLength(18);
        expect(names.filter((name) => name.endsWith('Mutation'))).toHaveLength(1);
        expect(names).toContain('useTiledArrayImagePath');
    });

    it('exports a hook for every data method on TiledClientLike', () => {
        // Every client method should be reachable through some hook. `getArrayAsImagePath` is the
        // synchronous one, and the three config getters exist only for cache scoping.
        const notEndpoints = ['getBaseUrl', 'getInitialPath', 'getApiKey'];
        const covered: Record<string, string> = {
            getSearch: 'useTiledSearchQuery',
            getMetadata: 'useTiledMetadataQuery',
            getArrayAs: 'useTiledArrayAsQuery',
            getArrayAsJSON: 'useTiledArrayAsJSONQuery',
            getArrayAsPng: 'useTiledArrayAsPngQuery',
            getArrayAsBuffer: 'useTiledArrayAsBufferQuery',
            getArrayAsImagePath: 'useTiledArrayImagePath',
            getTableAs: 'useTiledTableAsQuery',
            getTablePartitionAsJSON: 'useTiledTablePartitionAsJSONQuery',
            getTablePartitionAsJSONSequence: 'useTiledTablePartitionAsJSONSequenceQuery',
            getTableFullAsJSON: 'useTiledTableFullAsJSONQuery',
            getTableFullAsJSONSequence: 'useTiledTableFullAsJSONSequenceQuery',
            getServerInfo: 'useTiledServerInfoQuery',
            loginWithUsernamePassword: 'useTiledLoginMutation',
        };

        for (const method of TILED_CLIENT_LIKE_METHODS) {
            if (notEndpoints.includes(method)) continue;
            const hook = covered[method];
            expect(hook, `no hook mapped for ${method}`).toBeDefined();
            expect(typeof exported[hook], hook).toBe('function');
        }
    });
});

describe('query keys', () => {
    it('uses [root, resource, args, scope] with the scope last', async () => {
        const { client } = makeStub();
        const { wrapper, queryClient } = makeWrapper({ injected: client });

        const { result } = renderHook(() => tiled.useTiledSearchQuery('experiments'), { wrapper });
        await waitFor(() => expect(result.current.data).toBeDefined());

        const [entry] = queryClient.getQueryCache().getAll();
        expect(entry.queryKey).toEqual([
            'tiled',
            'search',
            { searchPath: 'experiments', config: null },
            { baseUrl: BASE_URL, initialPath: '' },
        ]);

        // The legacy prefix still matches, so existing invalidation calls keep working.
        expect(queryClient.getQueryCache().findAll({ queryKey: ['tiled', 'search'] })).toHaveLength(
            1,
        );
    });

    it('puts every search variant on the one search root, sharing identical filters', async () => {
        const { client } = makeStub();
        const { wrapper, queryClient } = makeWrapper({ injected: client });

        renderHook(
            () => {
                tiled.useTiledSearchBySpecsQuery('e', { include: ['BlueskyRun'], exclude: [] });
                // Same filters, expressed through the general hook: one shared cache entry.
                tiled.useTiledSearchQuery('e', {
                    searchFilters: { specs: { include: ['BlueskyRun'], exclude: [] } },
                    searchOptions: undefined,
                });
                tiled.useTiledSearchByStructureFamilyQuery('e', { value: 'array' });
            },
            { wrapper },
        );

        await waitFor(() => expect(queryClient.getQueryCache().getAll().length).toBeGreaterThan(1));

        const keys = queryClient
            .getQueryCache()
            .getAll()
            .map((entry) => entry.queryKey);
        expect(keys).toHaveLength(2); // the two identical ones collapsed
        for (const key of keys) expect(key.slice(0, 2)).toEqual(['tiled', 'search']);
    });

    it('separates entries per baseUrl and per initialPath', async () => {
        const { client } = makeStub();
        const { wrapper, queryClient } = makeWrapper({ injected: client });

        renderHook(
            () => {
                tiled.useTiledSearchQuery('e');
                tiled.useTiledSearchQuery('e', undefined, { baseUrl: 'http://other:8000/api/v1' });
                tiled.useTiledSearchQuery('e', undefined, { initialPath: 'beamline' });
                // Same as the first: an absolute request ignores the prefix, so the scope matches.
                tiled.useTiledSearchQuery('e', undefined, {
                    initialPath: 'beamline',
                    pathMode: 'absolute',
                });
            },
            { wrapper },
        );

        await waitFor(() => expect(queryClient.getQueryCache().getAll().length).toBe(3));
        const scopes = queryClient
            .getQueryCache()
            .getAll()
            .map((entry) => entry.queryKey[3]);
        expect(scopes).toContainEqual({ baseUrl: BASE_URL, initialPath: '' });
        expect(scopes).toContainEqual({ baseUrl: 'http://other:8000/api/v1', initialPath: '' });
        expect(scopes).toContainEqual({ baseUrl: BASE_URL, initialPath: 'beamline' });
    });

    it('keeps a data key stable across renders that pass fresh signals and structures', async () => {
        const { client, calls } = makeStub();
        const { wrapper, queryClient } = makeWrapper({ injected: client });

        // Fresh options object, fresh AbortSignal and a fresh structure on every render — none of
        // which changes the request. A raw options object in the key would refetch forever.
        const { rerender } = renderHook(
            () =>
                tiled.useTiledArrayAsJSONQuery('scan/detector', {
                    stack: [0],
                    signal: new AbortController().signal,
                    structure: { shape: [10, 10] } as never,
                }),
            { wrapper },
        );

        await waitFor(() => expect(calls).toHaveLength(1));
        const before = queryClient.getQueryCache().getAll()[0].queryKey;

        rerender();
        rerender();
        rerender();

        expect(queryClient.getQueryCache().getAll()).toHaveLength(1);
        expect(queryClient.getQueryCache().getAll()[0].queryKey).toEqual(before);
        expect(calls).toHaveLength(1);
        // The projection kept only what identifies the request.
        expect(before[2]).toEqual({
            arrayPath: 'scan/detector',
            type: 'JSON',
            options: { stack: [0] },
        });
    });

    it('treats a missing options object and an empty one as the same request', async () => {
        const { client } = makeStub();
        const { wrapper, queryClient } = makeWrapper({ injected: client });

        renderHook(
            () => {
                tiled.useTiledTablePartitionAsJSONQuery('scan/primary');
                tiled.useTiledTablePartitionAsJSONQuery('scan/primary', {});
            },
            { wrapper },
        );

        await waitFor(() => expect(queryClient.getQueryCache().getAll().length).toBe(1));
    });
});

describe('client resolution', () => {
    it('carries Finch config on the very first request, with no provider involved', async () => {
        const { wrapper } = makeWrapper({
            config: { tiledApiUrl: BASE_URL, tiledApiKey: 'cfg-key' },
        });
        const seen: TiledRequestOptions[] = [];
        const client = tiled.getDefaultTiledApiClient();
        vi.spyOn(client, 'getSearch').mockImplementation((_path, _config, request) => {
            seen.push(request ?? {});
            return Promise.resolve(searchResult());
        });

        const { result } = renderHook(() => tiled.useTiledSearchQuery(''), { wrapper });
        await waitFor(() => expect(result.current.data).toBeDefined());

        expect(seen[0].baseUrl).toBe(BASE_URL);
        expect(seen[0].apiKey).toBe('cfg-key');
    });

    it('also syncs the default client itself, for the package free functions', async () => {
        const { wrapper } = makeWrapper({
            config: { tiledApiUrl: BASE_URL, tiledApiKey: 'cfg-key' },
        });
        const client = tiled.getDefaultTiledApiClient();
        vi.spyOn(client, 'getSearch').mockResolvedValue(searchResult());

        const { result } = renderHook(() => tiled.useTiledSearchQuery(''), { wrapper });
        await waitFor(() => expect(result.current.data).toBeDefined());

        expect(client.getBaseUrl()).toBe(BASE_URL);
        expect(client.getApiKey()).toBe('cfg-key');
    });

    it('never redirects an injected client, whatever Finch config says', async () => {
        const { client, calls } = makeStub({ baseUrl: 'http://injected:8000/api/v1' });
        const { wrapper } = makeWrapper({
            injected: client,
            config: { tiledApiUrl: 'http://configured:8000/api/v1', tiledApiKey: 'cfg-key' },
        });

        const { result } = renderHook(() => tiled.useTiledSearchQuery(''), { wrapper });
        await waitFor(() => expect(result.current.data).toBeDefined());

        const request = calls[0].args[2] as TiledRequestOptions;
        expect(request.baseUrl).toBeUndefined();
        expect(request.apiKey).toBeUndefined();
    });

    it('passes a per-request apiKey of null straight through', async () => {
        const { client, calls } = makeStub();
        const { wrapper } = makeWrapper({ injected: client });

        const { result } = renderHook(
            () => tiled.useTiledSearchQuery('', undefined, { apiKey: null }),
            { wrapper },
        );
        await waitFor(() => expect(result.current.data).toBeDefined());

        expect((calls[0].args[2] as TiledRequestOptions).apiKey).toBeNull();
    });

    it('rejects with TiledEndpointUnavailableError on a partial injected client', async () => {
        const { client, calls } = makeStub({ omit: ['getServerInfo'] });
        // A real default client must not be reached as a fallback.
        const fallback = tiled.getDefaultTiledApiClient();
        const fallbackSpy = vi.spyOn(fallback, 'getServerInfo');
        setDefaultTiledApiClient(fallback);

        const { wrapper } = makeWrapper({ injected: client });
        const { result } = renderHook(() => tiled.useTiledServerInfoQuery(), { wrapper });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(tiled.isTiledEndpointUnavailableError(result.current.error)).toBe(true);
        expect(fallbackSpy).not.toHaveBeenCalled();
        expect(calls).toHaveLength(0);
    });

    it('scopes an injected client with no base URL under the injected sentinel', async () => {
        const { client } = makeStub({ omit: ['getBaseUrl'] });
        const { wrapper, queryClient } = makeWrapper({ injected: client });

        const { result } = renderHook(() => tiled.useTiledSearchQuery(''), { wrapper });
        await waitFor(() => expect(result.current.data).toBeDefined());

        expect(queryClient.getQueryCache().getAll()[0].queryKey[3]).toEqual({
            baseUrl: 'client:injected',
            initialPath: '',
        });
    });
});

describe('enabled guards', () => {
    it('stays idle on an empty path and fetches once given one', async () => {
        const { client, calls } = makeStub();
        const { wrapper } = makeWrapper({ injected: client });

        const { result } = renderHook(
            () => ({
                idle: tiled.useTiledMetadataQuery(''),
                fetching: tiled.useTiledMetadataQuery('scan/detector'),
            }),
            { wrapper },
        );

        await waitFor(() => expect(result.current.fetching.data).toBeDefined());
        expect(result.current.idle.fetchStatus).toBe('idle');
        expect(calls.filter((call) => call.method === 'getMetadata')).toHaveLength(1);
    });

    it('guards the data hooks on their path too', async () => {
        const { client, calls } = makeStub();
        const { wrapper } = makeWrapper({ injected: client });

        renderHook(
            () => {
                tiled.useTiledArrayAsJSONQuery('');
                tiled.useTiledArrayAsPngQuery('');
                tiled.useTiledArrayAsBufferQuery('');
                tiled.useTiledTablePartitionAsJSONQuery('');
                tiled.useTiledTableFullAsJSONSequenceQuery('');
            },
            { wrapper },
        );

        await new Promise((resolve) => setTimeout(resolve, 20));
        expect(calls).toHaveLength(0);
    });

    it('holds a full-text search until there is text', async () => {
        const { client, calls } = makeStub();
        const { wrapper } = makeWrapper({ injected: client });

        const { result, rerender } = renderHook(
            ({ text }: { text: string }) => tiled.useTiledSearchByFullTextQuery('e', { text }),
            { wrapper, initialProps: { text: '' } },
        );

        await new Promise((resolve) => setTimeout(resolve, 20));
        expect(result.current.fetchStatus).toBe('idle');
        expect(calls).toHaveLength(0);

        rerender({ text: 'myrun' });
        await waitFor(() => expect(calls).toHaveLength(1));
    });

    /** The bug the legacy hooks have: `enabled: undefined` used to clobber the guard. */
    it('does not fetch when the caller passes enabled: undefined', async () => {
        const { client, calls } = makeStub();
        const { wrapper } = makeWrapper({ injected: client });

        renderHook(() => tiled.useTiledMetadataQuery('', {}, { enabled: undefined }), { wrapper });

        await new Promise((resolve) => setTimeout(resolve, 20));
        expect(calls).toHaveLength(0);
    });

    it('honours an explicit enabled: false even with a valid path', async () => {
        const { client, calls } = makeStub();
        const { wrapper } = makeWrapper({ injected: client });

        renderHook(() => tiled.useTiledMetadataQuery('scan/detector', {}, { enabled: false }), {
            wrapper,
        });

        await new Promise((resolve) => setTimeout(resolve, 20));
        expect(calls).toHaveLength(0);
    });
});

describe('cancellation', () => {
    it('aborts the signal the client received when the query unmounts', async () => {
        let captured: AbortSignal | undefined;
        const { client } = makeStub({
            getSearch: (_path, _config, request) => {
                captured = request?.signal;
                return new Promise(() => {}); // never settles
            },
        });
        const { wrapper } = makeWrapper({ injected: client });

        const { unmount } = renderHook(() => tiled.useTiledSearchQuery(''), { wrapper });

        await waitFor(() => expect(captured).toBeDefined());
        expect(captured?.aborted).toBe(false);

        unmount();
        await waitFor(() => expect(captured?.aborted).toBe(true));
    });

    it('also aborts when a caller-supplied signal fires', async () => {
        let captured: AbortSignal | undefined;
        const { client } = makeStub({
            getSearch: (_path, _config, request) => {
                captured = request?.signal;
                return new Promise(() => {});
            },
        });
        const controller = new AbortController();
        const { wrapper } = makeWrapper({ injected: client });

        renderHook(() => tiled.useTiledSearchQuery('', undefined, { signal: controller.signal }), {
            wrapper,
        });

        await waitFor(() => expect(captured).toBeDefined());
        controller.abort();
        await waitFor(() => expect(captured?.aborted).toBe(true));
    });
});

describe('server info', () => {
    it('surfaces a null answer as data, not as an error', async () => {
        const { client } = makeStub();
        const { wrapper } = makeWrapper({ injected: client });

        const { result } = renderHook(() => tiled.useTiledServerInfoQuery(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toBeNull();
        expect(result.current.isError).toBe(false);
    });
});

describe('the image-path helper', () => {
    it('builds a URL without making a request, and returns empty for an empty path', () => {
        const { client, calls } = makeStub();
        const { wrapper } = makeWrapper({ injected: client });

        const { result } = renderHook(
            () => ({
                path: tiled.useTiledArrayImagePath('scan/detector', { stack: [2] }),
                empty: tiled.useTiledArrayImagePath(''),
            }),
            { wrapper },
        );

        expect(result.current.path).toBe(`${BASE_URL}/array/full/scan/detector`);
        expect(result.current.empty).toBe('');
        expect(calls.filter((call) => call.method === 'getArrayAsImagePath')).toHaveLength(1);
    });

    it('does not recompute when only the options identity changes', () => {
        const { client, calls } = makeStub();
        const { wrapper } = makeWrapper({ injected: client });

        const { rerender } = renderHook(
            () =>
                tiled.useTiledArrayImagePath('scan/detector', {
                    stack: [2],
                    signal: new AbortController().signal,
                }),
            { wrapper },
        );

        rerender();
        rerender();

        expect(calls.filter((call) => call.method === 'getArrayAsImagePath')).toHaveLength(1);
    });
});

describe('login', () => {
    it('invalidates every Tiled root on success', async () => {
        const { client } = makeStub();
        const { wrapper, queryClient } = makeWrapper({ injected: client });

        const { result } = renderHook(
            () => ({
                search: tiled.useTiledSearchQuery(''),
                login: tiled.useTiledLoginMutation(),
            }),
            { wrapper },
        );

        await waitFor(() => expect(result.current.search.data).toBeDefined());
        const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

        const tokens = await result.current.login.mutateAsync({
            username: 'alice',
            password: 'secret',
        });

        expect(tokens).toEqual({ access_token: 'a', refresh_token: 'r' });
        const invalidated = invalidate.mock.calls.map((call) => call[0]?.queryKey);
        for (const root of Object.values(tiledQueryRoots)) {
            expect(invalidated).toContainEqual(root);
        }
    });
});

describe('invalidation map', () => {
    const exported = tiled as unknown as Record<string, unknown>;

    it('names an exported mutation hook for every entry', () => {
        for (const name of Object.keys(TILED_MUTATION_INVALIDATIONS)) {
            expect(typeof exported[name], name).toBe('function');
        }
    });

    it('references only real bundles, and bundles only real roots', () => {
        for (const [hook, bundles] of Object.entries(TILED_MUTATION_INVALIDATIONS)) {
            for (const bundle of bundles) {
                expect(TILED_INVALIDATION_BUNDLES[bundle], `${hook} -> ${bundle}`).toBeDefined();
            }
        }
        for (const roots of Object.values(TILED_INVALIDATION_BUNDLES)) {
            for (const root of roots) {
                expect(tiledQueryRoots[root], root).toBeDefined();
            }
        }
    });

    it('has an `all` bundle covering every declared root', () => {
        expect([...TILED_INVALIDATION_BUNDLES.all].sort()).toEqual(
            Object.keys(tiledQueryRoots).sort(),
        );
    });
});
