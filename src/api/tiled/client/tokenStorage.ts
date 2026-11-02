/**
 * Where login tokens are kept between page loads.
 *
 * Upstream wrote these straight to `localStorage` from module scope. That works in a browser and
 * fails everywhere else: a bare `localStorage` reference throws under SSR, and in a test suite the
 * store is global, so one test's login leaks into the next. Both are real — the second is why
 * `resetDefaultTiledApiClient()` was not enough to isolate tests that touch auth.
 *
 * So the storage is an injectable interface with a browser-backed default that degrades to memory.
 * Behaviour in a browser is unchanged.
 *
 * ## The keys are deliberately the same as the package's
 *
 * `tiledAccessToken` and `tiledRefreshToken` are the names `@blueskyproject/tiled` uses, and that
 * package is still in the app: `<Tiled>` (the viewer component) keeps its own client. Sharing the
 * keys means a login through either one is a login for both. Renaming them would silently sign the
 * user out of half the UI.
 */

export interface TiledStoredTokens {
    accessToken: string;
    refreshToken: string;
}

export interface TiledTokenStorage {
    read(): TiledStoredTokens | null;
    write(tokens: TiledStoredTokens): void;
    clear(): void;
}

export const TILED_ACCESS_TOKEN_KEY = 'tiledAccessToken';
export const TILED_REFRESH_TOKEN_KEY = 'tiledRefreshToken';

/**
 * `localStorage`, when it is usable.
 *
 * Every access is guarded: Safari in private mode throws on `setItem` rather than returning, and a
 * page served under a restrictive storage policy throws on the property access itself. A failure
 * here means "no stored session", never a crash — losing a token is recoverable, failing a render
 * is not.
 */
export function createBrowserTokenStorage(): TiledTokenStorage {
    return {
        read() {
            try {
                const accessToken = window.localStorage.getItem(TILED_ACCESS_TOKEN_KEY);
                const refreshToken = window.localStorage.getItem(TILED_REFRESH_TOKEN_KEY);
                if (!accessToken || !refreshToken) return null;
                return { accessToken, refreshToken };
            } catch {
                return null;
            }
        },
        write(tokens) {
            try {
                window.localStorage.setItem(TILED_ACCESS_TOKEN_KEY, tokens.accessToken);
                window.localStorage.setItem(TILED_REFRESH_TOKEN_KEY, tokens.refreshToken);
            } catch {
                // Storage unavailable. The tokens still live on the client for this session.
            }
        },
        clear() {
            try {
                window.localStorage.removeItem(TILED_ACCESS_TOKEN_KEY);
                window.localStorage.removeItem(TILED_REFRESH_TOKEN_KEY);
            } catch {
                // Nothing to clear if the store cannot be reached.
            }
        },
    };
}

/** An in-process store, for Node, SSR and tests. */
export function createMemoryTokenStorage(): TiledTokenStorage {
    let tokens: TiledStoredTokens | null = null;
    return {
        read: () => tokens,
        write: (next) => {
            tokens = next;
        },
        clear: () => {
            tokens = null;
        },
    };
}

/** `localStorage` in a browser, memory elsewhere. */
export function createDefaultTokenStorage(): TiledTokenStorage {
    const hasLocalStorage =
        typeof window !== 'undefined' &&
        (() => {
            try {
                return !!window.localStorage;
            } catch {
                return false;
            }
        })();

    return hasLocalStorage ? createBrowserTokenStorage() : createMemoryTokenStorage();
}
