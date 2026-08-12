import type {
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios';

/** Where the API key travels. Browsers can use either; websockets can only use `'query'`. */
export type ApiKeyLocation = 'header' | 'query';

/**
 * Casing of the `Authorization` scheme.
 *
 * The spec documents `Apikey` (`"Prefix value with 'Apikey ' as in, 'Apikey SECRET'"`) and
 * the server compares case-insensitively, but `src/api/qServer` historically sent `ApiKey`,
 * so both are selectable.
 */
export type ApiKeyScheme = 'Apikey' | 'ApiKey';

/**
 * How to handle the 18 endpoints that are `GET` yet read their arguments from a JSON
 * request body — something a browser cannot send.
 *
 * - `'auto'` (default) — use a declared fallback when one exists, otherwise warn once
 *   and attempt the request anyway (the server then sees an empty payload).
 * - `'body'` — always attach the body. Correct outside browsers; silently dropped inside.
 * - `'fallback'` — require a fallback; throw `QServerGetBodyUnsupportedError` without one.
 * - `'throw'` — never attempt a browser payload-GET; always throw.
 */
export type GetBodyStrategy = 'auto' | 'body' | 'fallback' | 'throw';

/** Free-form JSON payload, as accepted by the queue server's `payload` bodies. */
export type QServerPayload = Record<string, unknown>;

/**
 * Any JSON object a request funnel will serialize.
 *
 * Wider than {@link QServerPayload} on purpose: the typed body interfaces in this folder are
 * plain interfaces without index signatures, so they are not assignable to a `Record`.
 */
export type QServerBody = object;

/** Envelope shared by essentially every queue-server response. */
export interface QServerSuccessResponse {
    success: boolean;
    msg: string;
}

/** Called when a token refresh fails, e.g. to prompt for login. */
export type QServerAuthErrorCallback = (error: unknown) => void;

/** Per-request overrides. Nothing here mutates client state. */
export interface QServerRequestOptions {
    /** Use this axios instance instead of the client's own, for this call only. */
    client?: AxiosInstance;
    signal?: AbortSignal;
    headers?: Record<string, string>;
    query?: Record<string, string | number | boolean | undefined>;
    /** Override the API key for this call only. */
    apiKey?: string | null;
    /** Escape hatch merged into the axios config (`responseType`, `timeout`, …). */
    axiosConfig?: Omit<AxiosRequestConfig, 'url' | 'method' | 'data' | 'params'>;
}

/** Extra options accepted by payload-GET endpoints. */
export interface GetWithBodyOptions<T> extends QServerRequestOptions {
    /** Override the client-wide {@link GetBodyStrategy} for this call. */
    strategy?: GetBodyStrategy;
    /** Browser-viable substitute for this endpoint. Endpoint methods supply their own. */
    fallback?: () => Promise<T>;
}

export type QServerRequestInterceptor = (
    config: InternalAxiosRequestConfig,
) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;

export type QServerResponseInterceptor = (
    response: AxiosResponse,
) => AxiosResponse | Promise<AxiosResponse>;

export type QServerErrorInterceptor = (error: unknown) => unknown;

/** Handle returned when registering an interceptor; pass it to `ejectInterceptor`. */
export interface InterceptorHandle {
    readonly kind: 'request' | 'response';
    readonly id: number;
}
