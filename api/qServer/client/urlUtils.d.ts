/**
 * URL helpers local to this folder.
 *
 * Deliberately self-contained: `src/utils/urlUtils.ts` and `src/utils/apiUtils.ts` belong to
 * the current `src/api/qServer` client and are left untouched until the folder swap.
 */
/** Default port bluesky-httpserver listens on. */
export declare const DEFAULT_QSERVER_PORT = "60610";
/**
 * Strip trailing slashes and a trailing `/api` segment.
 *
 * Spec paths already carry `/api/`, so the client's base URL must be the bare origin.
 * `useQueueServerApiUrls()` (and most existing config) hands out `http://host:60610/api`,
 * which would otherwise produce `/api/api/status`.
 */
export declare function normalizeQServerBaseUrl(baseUrl: string): string;
/** `http://host:60610` for the current page, or an empty string outside a browser. */
export declare function defaultQServerBaseUrl(): string;
/** `http://` → `ws://`, `https://` → `wss://`. */
export declare function httpToWs(url: string): string;
/** Join a normalized origin and a path, tolerating a leading slash on either side. */
export declare function joinUrl(baseUrl: string, path: string): string;
/**
 * Build a queue-server websocket URL.
 *
 * Auth credentials are appended as query parameters because browsers cannot set
 * `Authorization` on a websocket handshake. Pass no credentials when using the
 * first-message handshake instead.
 */
export declare function buildQServerSocketUrl(baseUrl: string, socketPath: string, credentials?: {
    apiKey?: string | null;
    accessToken?: string | null;
}): string;
//# sourceMappingURL=urlUtils.d.ts.map