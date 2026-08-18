/**
 * URL helpers local to this folder.
 *
 * Deliberately self-contained: `src/utils/urlUtils.ts` and `src/utils/apiUtils.ts` belong to
 * the current `src/api/qServer` client and are left untouched until the folder swap.
 */

/** Default port bluesky-httpserver listens on. */
export const DEFAULT_QSERVER_PORT = '60610';

/**
 * Strip trailing slashes and a trailing `/api` segment.
 *
 * Spec paths already carry `/api/`, so the client's base URL must be the bare origin.
 * `useQueueServerApiUrls()` (and most existing config) hands out `http://host:60610/api`,
 * which would otherwise produce `/api/api/status`.
 */
export function normalizeQServerBaseUrl(baseUrl: string): string {
    return baseUrl
        .trim()
        .replace(/\/+$/, '')
        .replace(/\/api$/i, '')
        .replace(/\/+$/, '');
}

/** `http://host:60610` for the current page, or an empty string outside a browser. */
export function defaultQServerBaseUrl(): string {
    if (typeof window === 'undefined' || !window.location) return '';
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    return `${protocol}//${window.location.hostname}:${DEFAULT_QSERVER_PORT}`;
}

/** `http://` → `ws://`, `https://` → `wss://`. */
export function httpToWs(url: string): string {
    return url.replace(/^https:\/\//i, 'wss://').replace(/^http:\/\//i, 'ws://');
}

/** Join a normalized origin and a path, tolerating a leading slash on either side. */
export function joinUrl(baseUrl: string, path: string): string {
    if (!baseUrl) return path;
    return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

/**
 * Build a queue-server websocket URL.
 *
 * Auth credentials are appended as query parameters because browsers cannot set
 * `Authorization` on a websocket handshake. Pass no credentials when using the
 * first-message handshake instead.
 */
export function buildQServerSocketUrl(
    baseUrl: string,
    socketPath: string,
    credentials: { apiKey?: string | null; accessToken?: string | null } = {},
): string {
    const url = joinUrl(httpToWs(normalizeQServerBaseUrl(baseUrl)), socketPath);
    const params = new URLSearchParams();
    if (credentials.accessToken) params.set('access_token', credentials.accessToken);
    else if (credentials.apiKey) params.set('api_key', credentials.apiKey);
    const query = params.toString();
    return query ? `${url}?${query}` : url;
}
