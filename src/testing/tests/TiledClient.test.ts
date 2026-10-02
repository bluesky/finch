import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TiledApiClient, createMemoryTokenStorage } from '../../api/tiled';
import { tableKeyParts } from '../../api/tiled/hooks/internal/keyParts';
import {
    buildArraySlice,
    computeDownsampleSteps,
    getDisplayShape,
} from '../../api/tiled/client/arraySlicing';
import { parseJsonSequence, resolveFormat, TILED_FORMATS } from '../../api/tiled/client/formats';
import { buildDistinctParams, buildSearchOptionParams } from '../../api/tiled/client/searchParams';
import {
    encodeTiledPath,
    formatIndexTuple,
    normalizeTiledBaseUrl,
    normalizeTiledPath,
    resolveTiledPath,
    tiledOriginFromBaseUrl,
} from '../../api/tiled/client/urlUtils';
import { TiledApiError, toTiledApiError } from '../../api/tiled/types/errors';
import type { ArrayStructure } from '../../api/tiled/types/structures';

/**
 * Unit tests for the client's internals — the parts with real logic, as opposed to the endpoint
 * methods, which are thin and are covered end to end by the registry sweep against a live server.
 *
 * Several of these pin behaviour that was verified against Tiled 0.2.15b1 and would otherwise be
 * easy to "simplify" back into a bug.
 */

const arrayStructure = (shape: number[], itemsize = 8): ArrayStructure => ({
    data_type: { endianness: 'little', kind: 'f', itemsize, dt_units: null },
    chunks: [shape],
    shape,
    dims: null,
    resizable: false,
});

describe('path and URL handling', () => {
    it('normalizes paths to bare segments', () => {
        expect(normalizeTiledPath('/scan//primary/')).toBe('scan/primary');
        expect(normalizeTiledPath('')).toBe('');
        expect(normalizeTiledPath('///')).toBe('');
    });

    /**
     * A node path is multi-segment, so its separators must survive encoding.
     *
     * `encodeURIComponent(path)` would turn them into `%2F` and address a single node whose name
     * contains a slash — a different, almost certainly nonexistent node.
     */
    it('encodes each path segment separately, keeping the separators', () => {
        expect(encodeTiledPath('scan/primary')).toBe('scan/primary');
        expect(encodeTiledPath('a b/c#d')).toBe('a%20b/c%23d');
        expect(encodeTiledPath('')).toBe('');
    });

    it('applies the initial path, unless the mode says absolute', () => {
        expect(resolveTiledPath('scan', 'data')).toBe('data/scan');
        expect(resolveTiledPath('scan', '/data/')).toBe('data/scan');
        expect(resolveTiledPath('', 'data')).toBe('data');
        expect(resolveTiledPath('scan', 'data', 'absolute')).toBe('scan');
        expect(resolveTiledPath('scan', '')).toBe('scan');
    });

    it('strips trailing slashes from a base URL', () => {
        expect(normalizeTiledBaseUrl('http://h:8000/api/v1/')).toBe('http://h:8000/api/v1');
    });

    /**
     * The origin is everything before the **last** `/api/v1`.
     *
     * A server mounted under a sub-path is the case that makes "last" matter; a base URL with no
     * version segment is returned unchanged rather than guessed at.
     */
    it('derives the origin behind an api base URL', () => {
        expect(tiledOriginFromBaseUrl('http://h:8000/api/v1')).toBe('http://h:8000');
        expect(tiledOriginFromBaseUrl('https://h/tiled/api/v1')).toBe('https://h/tiled');
        expect(tiledOriginFromBaseUrl('http://h:8000')).toBe('http://h:8000');
    });

    it('formats index tuples the way the block/offset/shape parameters want', () => {
        expect(formatIndexTuple([0, 2])).toBe('0,2');
        expect(formatIndexTuple([])).toBe('');
    });
});

describe('array downsampling', () => {
    it('reads the display shape off the last two axes', () => {
        expect(getDisplayShape(arrayStructure([10, 20]))).toEqual({
            height: 10,
            width: 20,
            channels: 1,
        });
        expect(getDisplayShape(arrayStructure([5, 10, 20]))).toEqual({
            height: 10,
            width: 20,
            channels: 1,
        });
    });

    it('treats a trailing 3-axis as RGB when asked', () => {
        expect(getDisplayShape(arrayStructure([10, 20, 3]), { isRGB: true })).toEqual({
            height: 10,
            width: 20,
            channels: 3,
        });
        expect(
            getDisplayShape(arrayStructure([3, 10, 20]), { isRGB: true, channelFirst: true }),
        ).toEqual({ height: 10, width: 20, channels: 3 });
    });

    it('prefers an explicit ratio over the byte budget', () => {
        const steps = computeDownsampleSteps(arrayStructure([10000, 10000]), {
            downSampleRatio: 4,
            maxBytesAllowed: 1,
        });
        expect(steps).toEqual({ stepX: 4, stepY: 4 });
    });

    it('strides both axes to fit the byte budget', () => {
        // 100×100 float64 = 80 000 bytes; a 20 000-byte budget is 4× over, so sqrt(4) = 2.
        expect(
            computeDownsampleSteps(arrayStructure([100, 100]), { maxBytesAllowed: 20_000 }),
        ).toEqual({ stepX: 2, stepY: 2 });
    });

    it('does not downsample what already fits', () => {
        expect(
            computeDownsampleSteps(arrayStructure([10, 10]), { maxBytesAllowed: 1_000_000 }),
        ).toEqual({ stepX: 1, stepY: 1 });
    });

    /**
     * A structure that is not an array structure must not reach the arithmetic.
     *
     * Found by sweeping the endpoint registry against a live server: pointing an array read at a
     * table fetched the table's structure, which has no `shape`, and `shape.length` threw a
     * `TypeError` from inside the downsampling maths — three layers from the mistake and nothing
     * like the real error. Treating it as "no structure" sends the request and lets the server
     * answer with the 404 that actually explains the problem.
     */
    it('ignores a structure that is not an array structure', () => {
        const tableStructure = {
            arrow_schema: 'x',
            npartitions: 1,
            columns: ['a'],
            resizable: false,
        } as unknown as ArrayStructure;

        expect(() => buildArraySlice({ structure: tableStructure })).not.toThrow();
        expect(buildArraySlice({ structure: tableStructure })).toBe('::1,::1');
        expect(computeDownsampleSteps(tableStructure, {})).toEqual({ stepX: 1, stepY: 1 });
    });

    it('builds slices with stack indices and RGB axes', () => {
        expect(buildArraySlice({})).toBe('::1,::1');
        expect(buildArraySlice({ stack: [5] })).toBe('5,::1,::1');
        expect(buildArraySlice({ isRGB: true })).toBe('::1,::1,:');
        expect(buildArraySlice({ isRGB: true, channelFirst: true })).toBe(':,::1,::1');
    });
});

describe('formats', () => {
    it('resolves a format name or a raw media type to the same spec', () => {
        expect(resolveFormat('PNG')).toEqual(TILED_FORMATS.PNG);
        expect(resolveFormat('image/png')).toEqual(TILED_FORMATS.PNG);
    });

    /**
     * An unknown media type is passed through rather than rejected.
     *
     * A server may support a format this table does not name — `About.formats` lists several this
     * client has no entry for — and handing back bytes is more useful than refusing.
     */
    it('passes an unknown media type through as bytes', () => {
        expect(resolveFormat('application/x-weird')).toEqual({
            accept: 'application/x-weird',
            responseType: 'blob',
        });
    });

    it('parses a newline-delimited JSON sequence', () => {
        expect(parseJsonSequence('{"a":1}\n{"a":2}\n')).toEqual([{ a: 1 }, { a: 2 }]);
        expect(parseJsonSequence('')).toEqual([]);
    });

    /** Tiled prefixes records with RFC 7464 separators on some routes. */
    it('strips record separators', () => {
        expect(parseJsonSequence('\x1e{"a":1}\n\x1e{"a":2}')).toEqual([{ a: 1 }, { a: 2 }]);
    });

    it('tolerates a body axios already parsed', () => {
        expect(parseJsonSequence([{ a: 1 }])).toEqual([{ a: 1 }]);
        expect(parseJsonSequence({ a: 1 })).toEqual([{ a: 1 }]);
        expect(() => parseJsonSequence(42)).toThrow();
    });
});

describe('search options', () => {
    it('maps camelCase options to the spec parameter names', () => {
        expect(
            buildSearchOptionParams({
                pageOffset: 10,
                pageLimit: 5,
                sort: 'start.time',
                selectMetadata: 'start',
                maxDepth: 2,
                omitLinks: true,
                includeDataSources: false,
                fields: ['specs'],
            }),
        ).toEqual({
            'page[offset]': 10,
            'page[limit]': 5,
            sort: 'start.time',
            select_metadata: 'start',
            max_depth: 2,
            omit_links: true,
            include_data_sources: false,
            fields: ['specs'],
        });
    });

    /** Cursor pagination was in the spec all along and the package never sent it. */
    it('supports cursor pagination', () => {
        expect(buildSearchOptionParams({ pageCursor: 7 })).toEqual({ 'page[cursor]': 7 });
    });

    it('omits what was not asked for', () => {
        expect(buildSearchOptionParams({})).toEqual({});
        expect(buildSearchOptionParams(undefined)).toEqual({});
        expect(buildSearchOptionParams({ fields: [] })).toEqual({});
    });

    it('builds distinct facets alongside the shared filters', () => {
        expect(
            buildDistinctParams({
                structureFamilies: true,
                counts: true,
                metadata: ['start.plan_name'],
                searchFilters: { fulltext: { text: 'x' } },
            }),
        ).toEqual({
            structure_families: true,
            counts: true,
            metadata: ['start.plan_name'],
            'filter[fulltext][condition][text]': 'x',
        });
    });
});

describe('errors', () => {
    it('reads FastAPI validation detail into a named error', () => {
        const error = toTiledApiError(
            {
                isAxiosError: true,
                message: 'Request failed',
                response: {
                    status: 422,
                    data: { detail: [{ loc: ['body', 'specs'], msg: 'field required' }] },
                },
            },
            'POST',
            '/metadata/x',
        );

        expect(error).toBeInstanceOf(TiledApiError);
        const apiError = error as TiledApiError;
        expect(apiError.status).toBe(422);
        expect(apiError.isValidationError).toBe(true);
        expect(apiError.validationErrors).toHaveLength(1);
        expect(apiError.message).toContain('body.specs: field required');
    });

    it("reads Tiled's own error envelope", () => {
        const error = toTiledApiError(
            {
                isAxiosError: true,
                message: 'Request failed',
                response: { status: 404, data: { detail: 'No such entry' } },
            },
            'GET',
            '/metadata/x',
        ) as TiledApiError;

        expect(error.status).toBe(404);
        expect(error.isValidationError).toBe(false);
        expect(error.message).toBe('GET /metadata/x failed with 404: No such entry');
    });

    /**
     * A cancelled request is not an API failure.
     *
     * Wrapping it would hide the `AbortError` name that TanStack checks for, turning an unmount
     * into a rendered error state.
     */
    it('lets an AbortError through untouched', () => {
        const abort = new Error('aborted');
        abort.name = 'AbortError';
        expect(toTiledApiError(abort, 'GET', '/x')).toBe(abort);
    });

    it('describes a network failure with no status', () => {
        const error = toTiledApiError(
            { isAxiosError: true, message: 'Network Error', response: undefined },
            'GET',
            '/x',
        ) as TiledApiError;
        expect(error.status).toBeUndefined();
        expect(error.message).toBe('GET /x failed: Network Error');
    });
});

describe('table cache key parts', () => {
    /**
     * `column` narrows the response, so it has to reach the key.
     *
     * Without it, a read of `['energy']` and a read of `['intensity']` from the same path hashed
     * identically and each could be served the other's columns — silently, and looking like the
     * server had returned the wrong thing.
     */
    it('distinguishes column selections', () => {
        const energy = tableKeyParts({ column: ['energy'] });
        const intensity = tableKeyParts({ column: ['intensity'] });

        expect(energy).toEqual({ column: ['energy'] });
        expect(JSON.stringify(energy)).not.toBe(JSON.stringify(intensity));
    });

    /** No selection and an empty selection both mean "every column", so they share an entry. */
    it('treats an empty column list as no selection', () => {
        expect(tableKeyParts({ column: [] })).toEqual({});
        expect(tableKeyParts({})).toEqual({});
    });

    it('keys by value, so a fresh array each render is the same key', () => {
        expect(JSON.stringify(tableKeyParts({ column: ['a', 'b'] }))).toBe(
            JSON.stringify(tableKeyParts({ column: ['a', 'b'] })),
        );
    });

    it('still excludes the fields that cannot change the response', () => {
        const parts = tableKeyParts({
            partition: 1,
            format: 'application/json',
            structure: { arrow_schema: 'x', npartitions: 1, columns: ['a'], resizable: false },
        });
        expect(parts).toEqual({ partition: 1, format: 'application/json' });
    });
});

/** Resolve or reject exactly as a real axios adapter would for a given status. */
function respond(config: InternalAxiosRequestConfig, status: number): Promise<AxiosResponse> {
    const response = {
        data: {},
        status,
        statusText: '',
        headers: {},
        config,
    } as AxiosResponse;

    if (status >= 400) {
        return Promise.reject(
            new AxiosError(
                `Request failed with status code ${status}`,
                String(status),
                config,
                null,
                response,
            ),
        );
    }
    return Promise.resolve(response);
}

describe('401 refresh and credential isolation', () => {
    const BASE = 'http://tiled.test:8000/api/v1';

    /**
     * A client whose transport is a stub adapter, so requests never leave the process.
     *
     * The adapter rejects a failing status itself rather than resolving it: axios applies `settle`
     * inside its built-in adapters, not around a custom one, so a resolved 401 would never reach
     * the response interceptor this suite is about.
     */
    function makeClient(status: number) {
        const seen: InternalAxiosRequestConfig[] = [];
        const transport = axios.create({
            adapter: (config) => {
                seen.push(config as InternalAxiosRequestConfig);
                return respond(
                    config as InternalAxiosRequestConfig,
                    seen.length === 1 ? status : 200,
                );
            },
        });

        const storage = createMemoryTokenStorage();
        storage.write({ accessToken: 'stored-access', refreshToken: 'stored-refresh' });

        const client = new TiledApiClient({
            baseUrl: BASE,
            apiKey: 'client-key',
            client: transport,
            tokenStorage: storage,
        });

        return { client, seen };
    }

    /** Intercepts the bare `axios.post` the refresh uses, and reports where it was aimed. */
    function stubRefresh() {
        return vi
            .spyOn(axios, 'post')
            .mockResolvedValue({ status: 200, data: { access_token: 'refreshed' } });
    }

    afterEach(() => vi.restoreAllMocks());

    it('refreshes and retries an ordinary 401', async () => {
        const refresh = stubRefresh();
        const { client, seen } = makeClient(401);

        await client.getSearch('');

        expect(refresh).toHaveBeenCalledOnce();
        expect(seen).toHaveLength(2);
        expect(seen[1].headers.Authorization).toBe('Bearer refreshed');
    });

    /**
     * A call that opted out of credentials must not be retried with the stored session.
     *
     * `apiKey: null` means "send nothing" — an anonymous probe of a public endpoint, say. Refreshing
     * and retrying with a bearer token substitutes an identity the caller deliberately withheld, and
     * does it invisibly.
     */
    it('does not substitute the stored session for an apiKey: null call', async () => {
        const refresh = stubRefresh();
        const { client, seen } = makeClient(401);

        await expect(client.getSearch('', {}, { apiKey: null })).rejects.toThrow();

        expect(refresh).not.toHaveBeenCalled();
        expect(seen).toHaveLength(1);
    });

    it('does not substitute the stored session for a one-off key', async () => {
        const refresh = stubRefresh();
        const { client, seen } = makeClient(401);

        await expect(client.getSearch('', {}, { apiKey: 'other-key' })).rejects.toThrow();

        expect(refresh).not.toHaveBeenCalled();
        expect(seen).toHaveLength(1);
    });

    it('does not substitute the stored session when the caller set an Authorization header', async () => {
        const refresh = stubRefresh();
        const { client, seen } = makeClient(401);

        await expect(
            client.getSearch('', {}, { headers: { Authorization: 'Bearer caller-token' } }),
        ).rejects.toThrow();

        expect(refresh).not.toHaveBeenCalled();
        expect(seen).toHaveLength(1);
    });

    /**
     * The stored refresh token belongs to the configured server and must not be offered elsewhere.
     *
     * A per-call `baseUrl` points at a different host; a 401 from it used to derive the refresh
     * origin from that request, handing the credential to a server that never issued it.
     */
    it('does not send the refresh token to a server named by a per-call baseUrl', async () => {
        const refresh = stubRefresh();
        const { client, seen } = makeClient(401);

        await expect(
            client.getSearch('', {}, { baseUrl: 'http://elsewhere.test:8000/api/v1' }),
        ).rejects.toThrow();

        expect(refresh).not.toHaveBeenCalled();
        expect(seen).toHaveLength(1);
    });

    it('refreshes against the configured server, not the failed request host', async () => {
        const refresh = stubRefresh();
        const { client } = makeClient(401);

        await client.getHealth(); // origin-scoped: baseURL is the derived origin, still our server

        expect(refresh).toHaveBeenCalledOnce();
        expect(String(refresh.mock.calls[0][0])).toContain('http://tiled.test:8000');
    });

    it('retries at most once', async () => {
        stubRefresh();
        const seen: InternalAxiosRequestConfig[] = [];
        const transport = axios.create({
            adapter: (config) => {
                seen.push(config as InternalAxiosRequestConfig);
                return respond(config as InternalAxiosRequestConfig, 401);
            },
        });
        const storage = createMemoryTokenStorage();
        storage.write({ accessToken: 'a', refreshToken: 'r' });
        const client = new TiledApiClient({
            baseUrl: BASE,
            client: transport,
            tokenStorage: storage,
        });

        await expect(client.getSearch('')).rejects.toThrow();
        expect(seen).toHaveLength(2);
    });
});

describe('logout', () => {
    /**
     * Local credentials go whatever the server says — including when it says nothing.
     *
     * Endpoint discovery used to sit outside the `finally`, so the most likely failure (an
     * unreachable server, or one with authentication disabled, where `requireAuthLink` throws) left
     * the bearer token and stored session untouched while appearing to fail at logging out.
     */
    it('clears credentials even when the auth endpoint cannot be discovered', async () => {
        const storage = createMemoryTokenStorage();
        storage.write({ accessToken: 'a', refreshToken: 'r' });

        const transport = axios.create({
            adapter: () => Promise.reject(new Error('server unreachable')),
        });
        const client = new TiledApiClient({
            baseUrl: 'http://tiled.test:8000/api/v1',
            apiKey: 'key',
            bearerToken: 'token',
            client: transport,
            tokenStorage: storage,
        });

        await expect(client.logout()).rejects.toThrow();

        expect(client.getApiKey()).toBeNull();
        expect(client.getBearerToken()).toBeNull();
        expect(storage.read()).toBeNull();
    });
});

describe('session seeding', () => {
    /**
     * `setSession` closes the read/write asymmetry: the client could read a stored session through
     * `getStoredTokens` but had no way to write one, so handing it a session you already held meant
     * constructing a `TiledTokenStorage` yourself.
     */
    it('sets the bearer token and persists both halves', () => {
        const storage = createMemoryTokenStorage();
        const client = new TiledApiClient({ baseUrl: 'http://h/api/v1', tokenStorage: storage });

        client.setSession({ accessToken: 'access', refreshToken: 'refresh' });

        expect(client.getBearerToken()).toBe('access');
        expect(storage.read()).toEqual({ accessToken: 'access', refreshToken: 'refresh' });
        expect(client.getStoredTokens()).toEqual({
            accessToken: 'access',
            refreshToken: 'refresh',
        });
    });

    it('clears both halves on null, leaving the API key alone', () => {
        const storage = createMemoryTokenStorage();
        const client = new TiledApiClient({
            baseUrl: 'http://h/api/v1',
            apiKey: 'key',
            tokenStorage: storage,
        });
        client.setSession({ accessToken: 'a', refreshToken: 'r' });

        client.setSession(null);

        expect(client.getBearerToken()).toBeNull();
        expect(storage.read()).toBeNull();
        // `clearAuth` drops the key too; this is the narrower operation.
        expect(client.getApiKey()).toBe('key');
    });
});
