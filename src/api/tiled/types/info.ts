/**
 * The `GET /api/v1/` document, and the auth description it carries.
 *
 * `./generatedAliases.ts` exports the spec's own `About` type, which is correct but loose — every
 * format map is `{ [key: string]: string[] }`. This is the shape Finch presents: the same document,
 * with the structure families the server actually reports named, so `info.formats.array` resolves
 * rather than needing an index lookup.
 *
 * It is also the **only** description of Tiled's auth API anywhere in the spec. The auth routes
 * themselves do not appear in `openapi.json` at all — see `../README.md` — so
 * `client/TiledAuthApi.ts` resolves every auth URL from `authentication.links` and
 * `authentication.providers[].links` here rather than hard-coding paths.
 */

export type TiledAuthProviderMode = 'password' | 'external' | 'token' | 'internal';

export type TiledAuthProvider = {
    provider: string;
    mode: TiledAuthProviderMode;
    links: {
        auth_endpoint: string;
        [key: string]: string;
    };
    confirmation_message?: string | null;
    extra_scopes?: string[] | null;
    [key: string]: unknown;
};

/** The five endpoints a server with authentication enabled advertises. */
export interface TiledAuthLinks {
    whoami: string;
    apikey: string;
    refresh_session: string;
    revoke_session: string;
    logout: string;
}

/**
 * The authentication block.
 *
 * `links` is **nullable**, and that is not an edge case: a server running without authentication
 * reports `{ required: false, providers: [], links: null }` — verified against Tiled 0.2.15b1. Every
 * auth method checks for it and fails with a clear message rather than requesting a URL built from
 * `null`.
 */
export interface TiledAuthenticationInfo {
    required: boolean;
    providers: TiledAuthProvider[];
    links: TiledAuthLinks | null;
}

/**
 * Media types per structure family.
 *
 * The named keys are the families Tiled 0.2.15b1 reports; the index signature is what makes this
 * survive a server that adds one. The package typed this with named keys only and so could not
 * express `ragged`, which this server does report.
 */
export interface TiledFormatMap {
    container?: string[];
    array?: string[];
    awkward?: string[];
    table?: string[];
    sparse?: string[];
    ragged?: string[];
    xarray_dataset?: string[];
    [family: string]: string[] | undefined;
}

/** Short aliases per media type, e.g. `'text/csv': ['csv']`. */
export interface TiledAliasMap {
    [family: string]: Record<string, string[]> | undefined;
}

export type TiledInfoResponse = {
    api_version: number;
    library_version: string;
    formats: TiledFormatMap;
    aliases: TiledAliasMap;
    /** The filter names this server supports, e.g. `'fulltext'`, `'keys_filter'`. */
    queries: string[];
    authentication?: TiledAuthenticationInfo;
    links: {
        self: string;
        documentation: string;
        [key: string]: string;
    };
    meta: {
        root_path?: string;
        [key: string]: unknown;
    };
};

/**
 * Whether a response really is the About document.
 *
 * `getServerInfo` resolves `null` rather than throwing when a server is unreachable or answers with
 * something else — a long-standing behaviour this client preserves — and this is the check behind
 * that decision. Deliberately shallow: `api_version` and `library_version` are enough to tell a
 * Tiled root document from an HTML error page or a proxy's JSON, and demanding more would reject
 * real servers over fields that are allowed to vary.
 */
export function isValidTiledInfoResponse(data: unknown): data is TiledInfoResponse {
    if (!data || typeof data !== 'object') return false;
    const candidate = data as Partial<TiledInfoResponse>;
    return (
        typeof candidate.api_version === 'number' && typeof candidate.library_version === 'string'
    );
}
