export interface TiledSocketConfig {
    /** `undefined` when an injected stub client has no URL, so there is nothing to connect to. */
    baseUrl: string | undefined;
    /** `path` with the client's `initialPath` applied, the same way HTTP requests are resolved. */
    path: string;
    apiKey: string | undefined;
    accessToken: string | undefined;
}
/**
 * Where a streaming hook should connect, and with which credentials, using the same resolution as the
 * HTTP hooks:
 *
 * - With a client injected through `TiledApiProvider`, its URL, initial path and API key are used.
 * - Otherwise `FinchConfigProvider`'s `tiledApiUrl` / `tiledApiKey` are used, falling back to the
 *   default client.
 * - A login session's access token is read from the default client, and only when no client is
 *   injected. `TiledClientLike` does not expose tokens, and widening it for this is not worth it.
 */
export declare function useTiledSocketConfig(path: string): TiledSocketConfig;
//# sourceMappingURL=useTiledSocketConfig.d.ts.map