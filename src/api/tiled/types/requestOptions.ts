import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { FinchHttpRequestOptions } from '@/api/shared/requestOptions';

/**
 * The per-call transport contract for Tiled.
 *
 * "Transport" means **where this one call goes and who it is** — see
 * [`@/api/shared/requestOptions`](../../shared/requestOptions.ts) for the cross-backend statement of
 * the convention and why `requestOptions` is always the last parameter of every hook.
 *
 * Previously this type came from `@blueskyproject/tiled`. Defining it here does three things the
 * re-export could not:
 *
 * 1. **It gains `headers`, `query` and `axiosConfig`**, which the queue-server client has always
 *    had. After this, `requestOptions` means *exactly* the same thing on both backends — the
 *    asymmetry that `shared/requestOptions.ts` had to apologise for is down to `initialPath` and
 *    `pathMode`, which are genuinely Tiled-only.
 * 2. **`client` widens to `AxiosInstance`.** The package required its own `TiledClientLike` (an
 *    axios instance *plus* config accessors), so passing a plain axios instance — the obvious thing,
 *    and what the queue server accepts — did not type-check. Nothing in the request path ever called
 *    those accessors.
 * 3. `apiKey: null` is given a meaning distinct from an absent `apiKey`: send **no** credentials for
 *    this call, rather than inherit the client's. `mergeRequestOptions` copies only defined keys,
 *    which is what makes the distinction survive a spread of props.
 */
export interface TiledRequestOptions extends FinchHttpRequestOptions<AxiosInstance> {
    /** Send this one call to a different server. Must include the `/api/v1` segment. */
    baseUrl?: string;
    /** Override the credential for this one call. `null` sends none. */
    apiKey?: string | null;
    /** Abort signal for this call. Composed with TanStack's, never replacing it. */
    signal?: AbortSignal;
    /** Issue this call through a different axios instance. */
    client?: AxiosInstance;
    /** Override the path prefix prepended to relative request paths. */
    initialPath?: string;
    /** `'relative'` (default) prepends `initialPath`; `'absolute'` ignores it. */
    pathMode?: TiledPathMode;
    /** Extra request headers. Merged over the client's, under anything the endpoint itself sets. */
    headers?: Record<string, string>;
    /** Extra query parameters. Merged with the endpoint's own. */
    query?: Record<string, string | number | boolean | undefined>;
    /** Escape hatch: axios options applied beneath everything above (`timeout`, `onUploadProgress`). */
    axiosConfig?: AxiosRequestConfig;
}

/**
 * How a request path is resolved against the client's initial path.
 *
 * - `'relative'` (default) — prepend `initialPath`
 * - `'absolute'` — ignore `initialPath` entirely
 */
export type TiledPathMode = 'relative' | 'absolute';

/** Tokens a successful login resolves to. */
export interface TiledLoginTokens {
    access_token: string;
    refresh_token: string;
}

/** Called when a token refresh fails, so an app can prompt for login. */
export type TiledAuthErrorCallback = (error: unknown) => void;

/**
 * Where the API key travels.
 *
 * `'header'` is the default and the right answer for HTTP. `'query'` exists for the two places a
 * header cannot go: an `<img src>` built by `getArrayAsImagePath`, and — once they land — websocket
 * handshakes, which browsers will not let you set headers on.
 */
export type TiledApiKeyLocation = 'header' | 'query';

/**
 * The casing of the API key authorization scheme.
 *
 * Tiled accepts both. `'ApiKey'` is what `@blueskyproject/tiled` sends and so is the default here,
 * to keep the bytes on the wire identical to what works today; `'Apikey'` is the casing Tiled's own
 * documentation and the queue server use.
 */
export type TiledApiKeyScheme = 'ApiKey' | 'Apikey';
