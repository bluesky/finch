import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { QServerSim } from '../core/QServerSim';
import { handleRequest, normalizePath } from './handleRequest';
import type { SimRequest } from './routes';

export interface QServerSimAdapterOptions {
    /**
     * When set, requests must present this exact API key (header or `?api_key=`) or the adapter
     * answers 401 — enough to exercise the real client's auth and refresh handling.
     */
    expectApiKey?: string;
}

/**
 * An axios adapter that answers from the simulator instead of the network.
 *
 * This is the high-fidelity seam: the **real** `QServerApiClient` runs on top of it, so
 * interceptors, auth injection, error normalization and every one of its 70 methods behave
 * exactly as they would against a live server, with no server.
 *
 * ```ts
 * const client = new QServerApiClient({
 *     baseUrl: 'http://sim.local:60610',
 *     apiKey: 'test',
 *     client: axios.create({ adapter: createQServerSimAdapter(sim) }),
 * });
 * await client.getStatus();
 * ```
 *
 * Prefer `createQServerSimClient` when you just want an in-memory client; prefer this when you
 * want the production code path.
 */
export function createQServerSimAdapter(
    sim: QServerSim,
    options: QServerSimAdapterOptions = {},
): AxiosAdapter {
    return async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
        const request = toSimRequest(config);

        let result = handleRequest(sim, request);
        const authFailure = checkAuth(config, request, options.expectApiKey);
        if (authFailure) result = authFailure;

        const { latencyMs } = sim.getBehavior();
        if (latencyMs > 0) await sim.delay(latencyMs);

        const response: AxiosResponse = {
            data: result.data,
            status: result.status,
            statusText: statusText(result.status),
            headers: {},
            config,
            request: { simulated: true },
        };

        if (result.status >= 400) throw toAxiosError(response, config);
        return response;
    };
}

function toSimRequest(config: InternalAxiosRequestConfig): SimRequest {
    const method = (config.method ?? 'get').toUpperCase() as SimRequest['method'];
    return {
        method,
        path: extractPath(config.url ?? ''),
        body: parseBody(config.data),
        query: extractQuery(config),
    };
}

/**
 * Reduce whatever axios put in `url` to a spec path.
 *
 * The client sets `baseURL` separately so `url` is normally already `/api/...`, but an absolute
 * URL and a stray query string are both cheap to tolerate.
 */
function extractPath(url: string): string {
    const withoutOrigin = url.replace(/^[a-z]+:\/\/[^/]+/i, '');
    const [pathname] = withoutOrigin.split('?');
    return normalizePath(pathname.startsWith('/') ? pathname : `/${pathname}`);
}

/** Axios has already serialized the body by the time an adapter runs, so it is usually a string. */
function parseBody(data: unknown): Record<string, unknown> {
    if (data === undefined || data === null || data === '') return {};
    if (typeof data === 'string') {
        try {
            const parsed: unknown = JSON.parse(data);
            return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
        } catch {
            return {};
        }
    }
    // FormData (the spreadsheet upload) is not modelled; the route table answers 501 for it.
    if (typeof FormData !== 'undefined' && data instanceof FormData) return {};
    if (typeof data === 'object') return data as Record<string, unknown>;
    return {};
}

function extractQuery(config: InternalAxiosRequestConfig): Record<string, string> {
    const query: Record<string, string> = {};
    const params = (config.params ?? {}) as Record<string, unknown>;
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) query[key] = String(value);
    }
    const queryString = (config.url ?? '').split('?')[1];
    if (queryString) {
        for (const [key, value] of new URLSearchParams(queryString)) query[key] = value;
    }
    return query;
}

/** Mirrors how the server rejects an unauthenticated request. */
function checkAuth(
    config: InternalAxiosRequestConfig,
    request: SimRequest,
    expectApiKey?: string,
): { status: number; data: unknown } | null {
    if (!expectApiKey) return null;

    const header = String(config.headers?.Authorization ?? '');
    const headerKey = header.replace(/^(Apikey|ApiKey|Bearer)\s+/i, '');
    const presented = request.query.api_key ?? (header ? headerKey : undefined);

    if (presented === expectApiKey) return null;
    return { status: 401, data: { detail: 'Not authenticated' } };
}

/**
 * Shape the rejection like axios does, so the real client's `toQServerApiError` recognizes it
 * and produces a proper `QServerApiError` rather than a bare `Error`.
 */
function toAxiosError(response: AxiosResponse, config: InternalAxiosRequestConfig): Error {
    return Object.assign(new Error(`Request failed with status code ${response.status}`), {
        isAxiosError: true,
        config,
        response,
        toJSON: () => ({ message: `Request failed with status code ${response.status}` }),
    });
}

function statusText(status: number): string {
    if (status === 200) return 'OK';
    if (status === 401) return 'Unauthorized';
    if (status === 500) return 'Internal Server Error';
    if (status === 501) return 'Not Implemented';
    return '';
}
