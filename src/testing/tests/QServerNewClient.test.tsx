import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QServerApiClient } from '../../api/qServer_new/client/QServerApiClient';
import {
    resetGetBodyWarnings,
    setGetBodySupportOverride,
} from '../../api/qServer_new/client/getBodySupport';
import {
    configureQServerClient,
    getDefaultQServerClient,
    resetDefaultQServerClient,
    setGlobalApiKey,
} from '../../api/qServer_new/client/defaultClient';
import {
    QServerApiError,
    QServerGetBodyUnsupportedError,
} from '../../api/qServer_new/types/errors';

const BASE_URL = 'http://qserver.test:60610';

interface Recorded {
    configs: AxiosRequestConfig[];
}

/**
 * Stub the transport with a custom axios adapter rather than a network mock: the adapter
 * runs after every interceptor, so assertions see exactly what would have gone on the wire.
 */
function stubbedAxios(
    respond: (
        config: AxiosRequestConfig,
    ) => Partial<AxiosResponse> | Promise<Partial<AxiosResponse>>,
): { instance: AxiosInstance; recorded: Recorded } {
    const recorded: Recorded = { configs: [] };
    const instance = axios.create({
        adapter: async (config) => {
            recorded.configs.push(config);
            const result = await respond(config);
            const response = {
                data: undefined,
                status: 200,
                statusText: 'OK',
                headers: {},
                config,
                ...result,
            } as AxiosResponse;
            if (response.status >= 400) {
                throw Object.assign(new Error(`Request failed with status ${response.status}`), {
                    isAxiosError: true,
                    config,
                    response,
                    toJSON: () => ({}),
                });
            }
            return response;
        },
    });
    return { instance, recorded };
}

function makeClient(
    respond: (
        config: AxiosRequestConfig,
    ) => Partial<AxiosResponse> | Promise<Partial<AxiosResponse>>,
    overrides: ConstructorParameters<typeof QServerApiClient>[0] = {},
) {
    const { instance, recorded } = stubbedAxios(respond);
    const client = new QServerApiClient({
        client: instance,
        baseUrl: BASE_URL,
        apiKey: 'test-key',
        silenceGetBodyWarnings: true,
        ...overrides,
    });
    return { client, recorded, instance };
}

const okStatus = { data: { msg: 'RE Manager', manager_state: 'idle' } };

beforeEach(() => {
    resetDefaultQServerClient();
    resetGetBodyWarnings();
    // jsdom looks like a browser, which is what most assertions want; the Node path is
    // opted into explicitly where it matters.
    setGetBodySupportOverride(null);
});

afterEach(() => {
    setGetBodySupportOverride(null);
    vi.restoreAllMocks();
});

describe('QServerApiClient auth', () => {
    it('sends the spec-documented Apikey header and resolves paths against the origin', async () => {
        const { client, recorded } = makeClient(() => okStatus);
        await client.getStatus();

        const [config] = recorded.configs;
        expect(config.baseURL).toBe(BASE_URL);
        expect(config.url).toBe('/api/status');
        expect(config.headers?.Authorization).toBe('Apikey test-key');
    });

    it('picks up a new key on the next request, with no rebuild', async () => {
        const { client, recorded } = makeClient(() => okStatus);
        await client.getStatus();
        client.setApiKey('second-key');
        await client.getStatus();

        expect(recorded.configs[0].headers?.Authorization).toBe('Apikey test-key');
        expect(recorded.configs[1].headers?.Authorization).toBe('Apikey second-key');
    });

    it('supports the ApiKey casing used by the legacy client', async () => {
        const { client, recorded } = makeClient(() => okStatus, { apiKeyScheme: 'ApiKey' });
        await client.getStatus();
        expect(recorded.configs[0].headers?.Authorization).toBe('ApiKey test-key');
    });

    it('sends the key as a query parameter in query mode', async () => {
        const { client, recorded } = makeClient(() => okStatus, { apiKeyLocation: 'query' });
        await client.getStatus();

        expect(recorded.configs[0].params).toMatchObject({ api_key: 'test-key' });
        expect(recorded.configs[0].headers?.Authorization).toBeUndefined();
    });

    it('prefers a bearer token over the api key', async () => {
        const { client, recorded } = makeClient(() => okStatus, { bearerToken: 'jwt-abc' });
        await client.getStatus();
        expect(recorded.configs[0].headers?.Authorization).toBe('Bearer jwt-abc');
    });

    it('strips a trailing /api from the base URL', () => {
        const { client } = makeClient(() => okStatus);
        client.setBaseUrl('http://host:60610/api/');
        expect(client.getBaseUrl()).toBe('http://host:60610');
    });

    it('clears every credential with clearAuth', async () => {
        const { client, recorded } = makeClient(() => okStatus, { bearerToken: 'jwt' });
        client.clearAuth();
        await client.getStatus();
        expect(recorded.configs[0].headers?.Authorization).toBeUndefined();
    });
});

describe('QServerApiClient per-request overrides', () => {
    it('uses options.client instead of the instance client', async () => {
        const { client, recorded } = makeClient(() => okStatus);
        const other = stubbedAxios(() => okStatus);

        await client.getStatus(undefined, { client: other.instance });

        expect(recorded.configs).toHaveLength(0);
        expect(other.recorded.configs).toHaveLength(1);
    });

    it('honours a one-off api key without mutating client state', async () => {
        const { client, recorded } = makeClient(() => okStatus);
        await client.getStatus(undefined, { apiKey: 'one-off' });
        await client.getStatus();

        expect(recorded.configs[0].headers?.Authorization).toBe('Apikey one-off');
        expect(recorded.configs[1].headers?.Authorization).toBe('Apikey test-key');
        expect(client.getApiKey()).toBe('test-key');
    });
});

describe('QServerApiClient errors', () => {
    it('wraps failures in QServerApiError with the server message', async () => {
        const { client } = makeClient(() => ({
            status: 400,
            data: { success: false, msg: 'Queue is empty' },
        }));

        await expect(client.startQueue()).rejects.toBeInstanceOf(QServerApiError);
        await client.startQueue().catch((error: QServerApiError) => {
            expect(error.status).toBe(400);
            expect(error.path).toBe('/api/queue/start');
            expect(error.method).toBe('POST');
            expect(error.message).toContain('Queue is empty');
        });
    });

    it('parses a 422 into validation errors', async () => {
        const { client } = makeClient(() => ({
            status: 422,
            data: { detail: [{ loc: ['body'], msg: 'Field required', type: 'missing' }] },
        }));

        await client.getTaskStatus({ task_uid: 'x' }).catch((error: QServerApiError) => {
            expect(error.isValidationError).toBe(true);
            expect(error.validationErrors?.[0].msg).toBe('Field required');
        });
        expect.hasAssertions();
    });
});

describe('QServerApiClient token refresh', () => {
    it('refreshes once for concurrent 401s and retries each request', async () => {
        let unauthorized = true;
        const { client, recorded } = makeClient(
            () => (unauthorized ? { status: 401, data: {} } : okStatus),
            { refreshToken: 'refresh-1' },
        );

        const refresh = vi.spyOn(axios, 'post').mockImplementation(async () => {
            unauthorized = false;
            return {
                data: { access_token: 'new-access', refresh_token: 'refresh-2' },
            } as AxiosResponse;
        });

        const [first, second] = await Promise.all([client.getStatus(), client.getQueue()]);

        expect(refresh).toHaveBeenCalledTimes(1);
        expect(first).toEqual(okStatus.data);
        expect(second).toEqual(okStatus.data);
        expect(client.getBearerToken()).toBe('new-access');
        expect(client.getRefreshToken()).toBe('refresh-2');
        // two original attempts + two retries
        expect(recorded.configs).toHaveLength(4);
    });

    it('clears auth and notifies onAuthError when the refresh fails', async () => {
        const onAuthError = vi.fn();
        const { client } = makeClient(() => ({ status: 401, data: {} }), {
            refreshToken: 'refresh-1',
            onAuthError,
        });
        vi.spyOn(axios, 'post').mockRejectedValue(new Error('refresh rejected'));

        await expect(client.getStatus()).rejects.toBeTruthy();
        expect(onAuthError).toHaveBeenCalledTimes(1);
        expect(client.getApiKey()).toBeNull();
        expect(client.getBearerToken()).toBeNull();
    });

    it('does not attempt a refresh without a refresh token', async () => {
        const { client } = makeClient(() => ({ status: 401, data: {} }));
        const refresh = vi.spyOn(axios, 'post');

        await expect(client.getStatus()).rejects.toBeInstanceOf(QServerApiError);
        expect(refresh).not.toHaveBeenCalled();
    });
});

describe('QServerApiClient interceptors', () => {
    it('adds, ejects, and reports handles', async () => {
        const { client } = makeClient(() => okStatus);
        const seen: string[] = [];

        const handle = client.addRequestInterceptor((config) => {
            seen.push(String(config.url));
            return config;
        });
        expect(client.listInterceptors()).toHaveLength(1);

        await client.getStatus();
        expect(seen).toEqual(['/api/status']);

        expect(client.ejectInterceptor(handle)).toBe(true);
        expect(client.listInterceptors()).toHaveLength(0);
        await client.getStatus();
        expect(seen).toEqual(['/api/status']);
    });

    it('keeps the built-in auth interceptor when clearing user interceptors', async () => {
        const { client, recorded } = makeClient(() => okStatus);
        client.addRequestInterceptor((config) => config);
        client.addResponseInterceptor((response) => response);

        client.clearInterceptors();
        expect(client.listInterceptors()).toHaveLength(0);

        await client.getStatus();
        expect(recorded.configs[0].headers?.Authorization).toBe('Apikey test-key');
    });

    it('runs user request interceptors before auth is attached (axios is LIFO)', async () => {
        const { client } = makeClient(() => okStatus);
        let sawAuthHeader: unknown = 'unset';

        client.addRequestInterceptor((config) => {
            sawAuthHeader = config.headers.Authorization;
            return config;
        });
        await client.getStatus();

        expect(sawAuthHeader).toBeUndefined();
    });

    it('carries built-in and user interceptors onto a replacement axios instance', async () => {
        const { client } = makeClient(() => okStatus);
        const seen: string[] = [];
        client.addRequestInterceptor((config) => {
            seen.push(String(config.url));
            return config;
        });

        const replacement = stubbedAxios(() => okStatus);
        client.setAxiosClient(replacement.instance);
        await client.getStatus();

        expect(replacement.recorded.configs[0].headers?.Authorization).toBe('Apikey test-key');
        expect(seen).toEqual(['/api/status']);
    });
});

describe('QServerApiClient payload-bearing GETs', () => {
    it('sends no body when the payload is empty', async () => {
        const { client, recorded } = makeClient(() => okStatus);
        await client.getStatus();
        expect(recorded.configs[0].data).toBeUndefined();
    });

    it('always sends a body for endpoints that require one', async () => {
        setGetBodySupportOverride(true);
        const { client, recorded } = makeClient(() => ({ data: { success: true } }));
        await client.getLockInfo();
        // axios has already serialized the body by the time the adapter runs.
        expect(recorded.configs[0].data).toBe('{}');
    });

    it('attaches the body outside a browser', async () => {
        setGetBodySupportOverride(true);
        const { client, recorded } = makeClient(() => ({ data: { success: true, item: {} } }));

        await client.getQueueItem({ uid: 'abc' });

        expect(recorded.configs[0].method?.toUpperCase()).toBe('GET');
        expect(JSON.parse(recorded.configs[0].data as string)).toEqual({ uid: 'abc' });
    });

    it('uses the declared fallback in a browser under the auto strategy', async () => {
        setGetBodySupportOverride(false);
        const onFallback = vi.fn();
        const { client, recorded } = makeClient(
            () => ({
                data: {
                    success: true,
                    items: [{ item_uid: 'abc', name: 'count', item_type: 'plan' }],
                },
            }),
            { onFallback },
        );

        const result = await client.getQueueItem({ uid: 'abc' });

        expect(result.item).toMatchObject({ item_uid: 'abc' });
        expect(recorded.configs[0].url).toBe('/api/queue/get');
        expect(onFallback).toHaveBeenCalledWith(
            expect.objectContaining({ endpointId: 'queue.itemGet' }),
        );
    });

    it('reports a missing item through the fallback rather than throwing', async () => {
        setGetBodySupportOverride(false);
        const { client } = makeClient(() => ({ data: { success: true, items: [] } }));

        const result = await client.getQueueItem({ uid: 'nope' });
        expect(result.success).toBe(false);
        expect(result.msg).toContain('nope');
    });

    it('throws under the throw strategy', async () => {
        setGetBodySupportOverride(false);
        const { client } = makeClient(() => okStatus, { getBodyStrategy: 'throw' });

        await expect(client.getTaskStatus({ task_uid: 'x' })).rejects.toBeInstanceOf(
            QServerGetBodyUnsupportedError,
        );
    });

    it('throws under the fallback strategy when no fallback exists', async () => {
        setGetBodySupportOverride(false);
        const { client } = makeClient(() => okStatus, { getBodyStrategy: 'fallback' });

        await expect(client.getTaskResult({ task_uid: 'x' })).rejects.toBeInstanceOf(
            QServerGetBodyUnsupportedError,
        );
    });

    it('attempts the request anyway under the body strategy', async () => {
        setGetBodySupportOverride(false);
        const { client, recorded } = makeClient(() => ({ data: { success: true, item: {} } }), {
            getBodyStrategy: 'body',
        });

        await client.getQueueItem({ uid: 'abc' });
        expect(recorded.configs[0].url).toBe('/api/queue/item/get');
    });

    it('rebuilds lock info from status in a browser', async () => {
        setGetBodySupportOverride(false);
        const { client, recorded } = makeClient(() => ({
            data: { lock: { environment: true, queue: false }, lock_info_uid: 'uid-1' },
        }));

        const info = await client.getLockInfo();

        expect(recorded.configs[0].url).toBe('/api/status');
        expect(info.lock_info).toEqual({ environment: true, queue: false });
        expect(info.lock_info_uid).toBe('uid-1');
    });
});

describe('QServerApiClient miscellaneous endpoints', () => {
    it('builds multipart form data for the spreadsheet upload', async () => {
        const { client, recorded } = makeClient(() => ({ data: { success: true } }));
        const file = new File(['a,b\n1,2\n'], 'plans.csv', { type: 'text/csv' });

        await client.uploadQueueSpreadsheet({ spreadsheet: file, dataType: 'excel' });

        const form = recorded.configs[0].data as FormData;
        expect(form).toBeInstanceOf(FormData);
        expect(form.get('data_type')).toBe('excel');
        expect(form.get('spreadsheet')).toBeInstanceOf(File);
    });

    it('interpolates and encodes path parameters', async () => {
        const { client, recorded } = makeClient(() => ({ data: {} }));
        await client.getPrincipal('a/b c');
        expect(recorded.configs[0].url).toBe('/api/auth/principal/a%2Fb%20c');
    });

    it('passes first_eight as a query parameter when revoking a key', async () => {
        const { client, recorded } = makeClient(() => ({ data: {} }));
        await client.revokeApiKey('abcd1234');

        expect(recorded.configs[0].method?.toUpperCase()).toBe('DELETE');
        expect(recorded.configs[0].params).toMatchObject({ first_eight: 'abcd1234' });
    });
});

describe('default client singleton', () => {
    it('applies partial configuration to the active instance', () => {
        const client = configureQServerClient({ baseUrl: BASE_URL, apiKey: 'k1' });
        expect(getDefaultQServerClient()).toBe(client);

        setGlobalApiKey('k2');
        expect(getDefaultQServerClient().getApiKey()).toBe('k2');
        expect(getDefaultQServerClient().getBaseUrl()).toBe(BASE_URL);
    });

    it('builds a fresh instance after a reset', () => {
        const first = getDefaultQServerClient();
        resetDefaultQServerClient();
        expect(getDefaultQServerClient()).not.toBe(first);
    });
});
