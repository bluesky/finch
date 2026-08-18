import axios, { type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import { FinchConfigProvider } from '../../app/FinchConfigProvider';
import { QServerApiProvider } from '../../api/qServerRuntime/QServerApiProvider';
import { QSERVER_CLIENT_LIKE_METHODS } from '../../api/qServerRuntime/clientLike';
import { QServerApiClient } from '../../api/qServer/client/QServerApiClient';
import {
    resetDefaultQServerClient,
    setDefaultQServerClient,
} from '../../api/qServer/client/defaultClient';
import { QSERVER_ENDPOINTS } from '../../api/qServer/endpointRegistry';
import * as hooks from '../../api/qServer/hooks';
import {
    QSERVER_INVALIDATION_BUNDLES,
    QSERVER_MUTATION_INVALIDATIONS,
} from '../../api/qServer/hooks/invalidation';
import { qServerQueryRoots } from '../../api/qServer/hooks/queryKeys';
import { QSERVER_NON_CORE_METHODS } from '../../api/qServer/hooks/useQServerClient';
import { createQServerSimClient } from '../../lib/qserver-sim/client/QServerSimClient';
import { defaultQServer } from '../../lib/qserver-sim/scenarios/defaultQServer';

const BASE_URL = 'http://qserver.test:60610';

interface Recorded {
    configs: InternalAxiosRequestConfig[];
}

/** A default client whose transport records requests instead of making them. */
function recordingDefaultClient(status = 200, data: unknown = { success: true, msg: '' }) {
    const recorded: Recorded = { configs: [] };
    const adapter: AxiosAdapter = async (config) => {
        recorded.configs.push(config);
        const response = {
            data,
            status,
            statusText: 'OK',
            headers: {},
            config,
        };
        if (status >= 400) {
            throw Object.assign(new Error(`Request failed with status ${status}`), {
                isAxiosError: true,
                config,
                response,
                toJSON: () => ({}),
            });
        }
        return response;
    };

    const client = new QServerApiClient({
        baseUrl: BASE_URL,
        apiKey: 'default-key',
        client: axios.create({ adapter }),
        silenceGetBodyWarnings: true,
    });
    setDefaultQServerClient(client);
    return { client, recorded };
}

function makeWrapper(
    options: {
        injected?: Parameters<typeof QServerApiProvider>[0]['client'];
        config?: Record<string, string>;
    } = {},
) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });

    const wrapper = ({ children }: { children: ReactNode }) => {
        const withProviders = options.injected ? (
            <QServerApiProvider client={options.injected}>{children}</QServerApiProvider>
        ) : (
            children
        );
        const withQuery = (
            <QueryClientProvider client={queryClient}>{withProviders}</QueryClientProvider>
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
    resetDefaultQServerClient();
});

afterEach(() => {
    resetDefaultQServerClient();
});

describe('hook coverage', () => {
    /**
     * Derive the hook name from a registry descriptor the same way the naming rule does.
     *
     * Every queue-server hook is prefixed `useQueue` so it cannot collide with the eventual
     * `useTiled…` / `useOphyd…` families. Because the prefix already says "Queue", a method name
     * that carries its own `Queue` drops the first occurrence rather than stuttering:
     * `getQueue` → `useQueueGetQuery`, `addQueueItem` → `useQueueAddItemMutation`.
     */
    function hookNameFor(fn: string, kind: 'Query' | 'Mutation'): string {
        const core = fn.includes('Queue') ? fn.replace('Queue', '') : fn;
        return `useQueue${core.charAt(0).toUpperCase()}${core.slice(1)}${kind}`;
    }

    const exported = hooks as unknown as Record<string, unknown>;

    it('exports a hook for every endpoint in the registry', () => {
        const missing: string[] = [];
        for (const endpoint of QSERVER_ENDPOINTS) {
            const query = hookNameFor(endpoint.fn, 'Query');
            const mutation = hookNameFor(endpoint.fn, 'Mutation');
            if (typeof exported[query] !== 'function' && typeof exported[mutation] !== 'function') {
                missing.push(`${endpoint.id} (${query} / ${mutation})`);
            }
        }
        expect(missing).toEqual([]);
    });

    it('exports exactly 70 hooks — 29 queries and 41 mutations', () => {
        const names = Object.keys(exported).filter(
            (name) => name.startsWith('use') && typeof exported[name] === 'function',
        );
        // `useQServerClient` and `useQServerInvalidate` are helpers, not endpoint hooks.
        const endpointHooks = names.filter(
            (name) => name.endsWith('Query') || name.endsWith('Mutation'),
        );

        expect(endpointHooks.filter((name) => name.endsWith('Query'))).toHaveLength(29);
        expect(endpointHooks.filter((name) => name.endsWith('Mutation'))).toHaveLength(41);
        expect(endpointHooks).toHaveLength(70);
    });

    it('keeps QSERVER_NON_CORE_METHODS exactly the set difference from QServerClientLike', () => {
        const core = new Set<string>(QSERVER_CLIENT_LIKE_METHODS);
        const allMethods = QSERVER_ENDPOINTS.map((endpoint) => endpoint.fn);
        const expectedNonCore = allMethods.filter((name) => !core.has(name)).sort();

        expect([...QSERVER_NON_CORE_METHODS].sort()).toEqual(expectedNonCore);
    });
});

describe('query keys', () => {
    it('uses [root, resource, args, scope] and keeps legacy prefixes matching', async () => {
        recordingDefaultClient(200, { success: true, msg: '', items: [] });
        const { wrapper, queryClient } = makeWrapper();

        const { result } = renderHook(() => hooks.useQueueGetQuery(), { wrapper });
        await waitFor(() => expect(result.current.data).toBeDefined());

        const [entry] = queryClient.getQueryCache().getAll();
        expect(entry.queryKey).toEqual(['qserver', 'queue', null, { baseUrl: BASE_URL }]);

        // Legacy consumers invalidate with this prefix; it must still match.
        expect(
            queryClient.getQueryCache().findAll({ queryKey: ['qserver', 'queue'] }),
        ).toHaveLength(1);
    });

    it('separates cache entries per server but shares them for one server', async () => {
        recordingDefaultClient(200, { success: true, msg: '', items: [] });
        const { wrapper, queryClient } = makeWrapper();

        renderHook(
            () => {
                hooks.useQueueGetQuery();
                hooks.useQueueGetQuery({ baseUrl: 'http://other:60610' });
                hooks.useQueueGetQuery({ baseUrl: 'http://other:60610' });
            },
            { wrapper },
        );

        await waitFor(() =>
            expect(queryClient.getQueryCache().getAll().length).toBeGreaterThanOrEqual(2),
        );
        // A per-request baseUrl overrides the resolver's scope, so the two servers keep separate
        // entries — and the two hooks aimed at the same one share a single entry.
        const scopes = queryClient
            .getQueryCache()
            .getAll()
            .map((entry) => entry.queryKey[3]);
        expect(scopes).toHaveLength(2);
        expect(scopes).toContainEqual({ baseUrl: BASE_URL });
        expect(scopes).toContainEqual({ baseUrl: 'http://other:60610' });
    });
});

describe('Finch config', () => {
    it('reaches the very first request, normalized, with no provider involved', async () => {
        const { recorded } = recordingDefaultClient(200, { msg: 'RE Manager' });
        const { wrapper } = makeWrapper({
            config: {
                qServerApiUrl: 'http://configured:60610/api',
                qServerApiKey: 'cfg-key',
            },
        });

        const { result } = renderHook(() => hooks.useQueueGetStatusQuery(), { wrapper });
        await waitFor(() => expect(result.current.data).toBeDefined());

        // The first request already carries the configured server and key.
        const [first] = recorded.configs;
        expect(first.baseURL).toBe('http://configured:60610');
        expect(first.headers.Authorization).toBe('Apikey cfg-key');
    });

    it('also syncs the default client itself, for the free functions and socket hooks', async () => {
        const { client } = recordingDefaultClient(200, { msg: 'RE Manager' });
        const { wrapper } = makeWrapper({
            config: { qServerApiUrl: 'http://configured:60610', qServerApiKey: 'cfg-key' },
        });

        const { result } = renderHook(() => hooks.useQueueGetStatusQuery(), { wrapper });
        await waitFor(() => expect(result.current.data).toBeDefined());

        expect(client.getBaseUrl()).toBe('http://configured:60610');
        expect(client.getApiKey()).toBe('cfg-key');
    });

    it('lets a per-request apiKey of null disable auth for one call', async () => {
        const { recorded } = recordingDefaultClient(200, { msg: 'RE Manager' });
        const { wrapper } = makeWrapper();

        const { result } = renderHook(() => hooks.useQueueGetStatusQuery({ apiKey: null }), {
            wrapper,
        });
        await waitFor(() => expect(result.current.data).toBeDefined());

        expect(recorded.configs[0].headers.Authorization).toBeUndefined();
        expect(recorded.configs[0].params?.api_key).toBeUndefined();
    });
});

describe('enabled guards', () => {
    it('stays idle without an address, and fetches once given one', async () => {
        const { recorded } = recordingDefaultClient(200, { success: true, msg: '', item: {} });
        const { wrapper } = makeWrapper();

        const { result } = renderHook(
            () => ({
                idle: hooks.useQueueGetItemQuery(undefined),
                fetching: hooks.useQueueGetItemQuery({ uid: 'abc' }),
            }),
            { wrapper },
        );

        await waitFor(() => expect(result.current.fetching.data).toBeDefined());
        expect(result.current.idle.fetchStatus).toBe('idle');
        expect(result.current.idle.data).toBeUndefined();
        // One request, for the addressed hook only.
        expect(recorded.configs).toHaveLength(1);
    });

    /** The bug the legacy hook had: `enabled: undefined` used to clobber the guard. */
    it('does not fetch when the caller passes enabled: undefined', async () => {
        const { recorded } = recordingDefaultClient(200, { success: true, msg: '', item: {} });
        const { wrapper } = makeWrapper();

        renderHook(() => hooks.useQueueGetItemQuery(undefined, {}, { enabled: undefined }), {
            wrapper,
        });

        await new Promise((resolve) => setTimeout(resolve, 20));
        expect(recorded.configs).toHaveLength(0);
    });

    it('honours an explicit enabled: false even with a valid address', async () => {
        const { recorded } = recordingDefaultClient(200, { success: true, msg: '', item: {} });
        const { wrapper } = makeWrapper();

        renderHook(() => hooks.useQueueGetItemQuery({ uid: 'abc' }, {}, { enabled: false }), {
            wrapper,
        });

        await new Promise((resolve) => setTimeout(resolve, 20));
        expect(recorded.configs).toHaveLength(0);
    });
});

describe('injected clients', () => {
    it('rejects a non-core endpoint rather than falling through to the network', async () => {
        const { recorded } = recordingDefaultClient();
        const sim = defaultQServer();
        const { wrapper } = makeWrapper({ injected: createQServerSimClient(sim) });

        const { result } = renderHook(() => hooks.useQueueGetConfigQuery(), { wrapper });

        await waitFor(() => expect(result.current.error).toBeTruthy());
        expect(hooks.isQServerEndpointUnavailableError(result.current.error)).toBe(true);
        expect((result.current.error as hooks.QServerEndpointUnavailableError).method).toBe(
            'getConfig',
        );
        // The whole point: nothing leaked to the real client.
        expect(recorded.configs).toHaveLength(0);
    });

    it('serves core endpoints from the injected client', async () => {
        const { recorded } = recordingDefaultClient();
        const sim = defaultQServer();
        const { wrapper } = makeWrapper({ injected: createQServerSimClient(sim) });

        const { result } = renderHook(() => hooks.useQueueGetQuery(), { wrapper });

        await waitFor(() => expect(result.current.data).toBeDefined());
        expect(result.current.data?.items).toHaveLength(3);
        expect(recorded.configs).toHaveLength(0);
    });

    it('uses a full injected client for non-core endpoints too', async () => {
        const recorded: Recorded = { configs: [] };
        const full = new QServerApiClient({
            baseUrl: 'http://injected:60610',
            client: axios.create({
                adapter: async (config) => {
                    recorded.configs.push(config);
                    return {
                        data: { success: true, msg: '', config: {} },
                        status: 200,
                        statusText: 'OK',
                        headers: {},
                        config,
                    };
                },
            }),
        });
        const { wrapper } = makeWrapper({ injected: full });

        const { result } = renderHook(() => hooks.useQueueGetConfigQuery(), { wrapper });

        await waitFor(() => expect(result.current.data).toBeDefined());
        expect(recorded.configs[0].url).toBe('/api/config/get');
    });
});

describe('cancellation', () => {
    it('passes an abort signal that fires when the query unmounts', async () => {
        let captured: AbortSignal | undefined;
        const client = new QServerApiClient({
            baseUrl: BASE_URL,
            client: axios.create({
                adapter: (config) => {
                    captured = config.signal as AbortSignal | undefined;
                    // Never settles, so the query is still in flight at unmount.
                    return new Promise(() => {});
                },
            }),
        });
        setDefaultQServerClient(client);

        const { wrapper } = makeWrapper();
        const { unmount } = renderHook(() => hooks.useQueueGetStatusQuery(), { wrapper });

        await waitFor(() => expect(captured).toBeDefined());
        expect(captured?.aborted).toBe(false);

        unmount();
        await waitFor(() => expect(captured?.aborted).toBe(true));
    });

    it('also aborts when a caller-supplied signal fires', async () => {
        let captured: AbortSignal | undefined;
        const client = new QServerApiClient({
            baseUrl: BASE_URL,
            client: axios.create({
                adapter: (config) => {
                    captured = config.signal as AbortSignal | undefined;
                    return new Promise(() => {});
                },
            }),
        });
        setDefaultQServerClient(client);

        const controller = new AbortController();
        const { wrapper } = makeWrapper();
        renderHook(() => hooks.useQueueGetStatusQuery({ signal: controller.signal }), {
            wrapper,
        });

        await waitFor(() => expect(captured).toBeDefined());
        controller.abort();
        await waitFor(() => expect(captured?.aborted).toBe(true));
    });
});

describe('invalidation map', () => {
    const exported = hooks as unknown as Record<string, unknown>;

    it('names an exported mutation hook for every entry', () => {
        for (const name of Object.keys(QSERVER_MUTATION_INVALIDATIONS)) {
            expect(typeof exported[name], name).toBe('function');
        }
    });

    it('covers every mutation hook exactly once', () => {
        const mutationHooks = Object.keys(exported).filter(
            (name) => name.endsWith('Mutation') && typeof exported[name] === 'function',
        );
        expect(Object.keys(QSERVER_MUTATION_INVALIDATIONS).sort()).toEqual(mutationHooks.sort());
    });

    it('references only real bundles, and bundles reference only real roots', () => {
        for (const [hook, bundles] of Object.entries(QSERVER_MUTATION_INVALIDATIONS)) {
            for (const bundle of bundles) {
                expect(QSERVER_INVALIDATION_BUNDLES[bundle], `${hook} → ${bundle}`).toBeDefined();
            }
        }
        for (const roots of Object.values(QSERVER_INVALIDATION_BUNDLES)) {
            for (const root of roots) {
                expect(qServerQueryRoots[root], root).toBeDefined();
            }
        }
    });

    it('has a query hook for every declared root', () => {
        const queryHooks = Object.keys(exported).filter((name) => name.endsWith('Query'));
        // 29 roots, 29 query hooks — one each.
        expect(Object.keys(qServerQueryRoots)).toHaveLength(queryHooks.length);
    });
});
