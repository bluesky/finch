import type { TiledApiKeyLocation, TiledApiKeyScheme } from '@/api/tiled';
import type { TiledConnectionConfig } from './TiledConnectionBar';

/**
 * `localStorage` persistence for a `TiledConnectionBar` config.
 *
 * Retyping a base URL and an API key on every reload is the main friction in using these harnesses,
 * so Apply writes the committed config here and the harness reads it back on mount.
 *
 * ## Two deliberate choices
 *
 * **The keys are namespaced per harness** under `finch.devtools.tiledConnection.*`, and in
 * particular they are *not* `tiledAccessToken` / `tiledRefreshToken` — those are the browser token
 * store, shared with the `<Tiled>` viewer component. Writing a harness config must never change the
 * rest of the app's session, which is the same reason `useBrowserStorage` defaults off. The two
 * stores are independent: this one records what the form should say, that one records who the
 * client is logged in as.
 *
 * **Reads are validated, not trusted.** `localStorage` survives schema changes, hand edits, and
 * other tabs, so a stored value is untyped input. Anything missing or of the wrong type falls back
 * to the caller's default field by field, so a stale entry degrades to a partial restore rather
 * than handing the client `undefined` where it expects a string.
 *
 * ## It stores secrets
 *
 * The API key and both tokens are written in clear text, because a connection form that forgets the
 * credential is a connection form you still have to retype. That is the point of the feature and
 * the reason these harnesses are dev-only: anything with script access to the origin can read them.
 * `clearTiledConnection` exists so there is a way back out, and the bar exposes it as *Forget*.
 */

const STORAGE_PREFIX = 'finch.devtools.tiledConnection.';

/**
 * Distinguishes harnesses, so they keep separate connections.
 *
 * `playground` is `TiledQueryPlayground`. `endpoint-harness` is reserved for `TestTiled`, which
 * shares the bar but does not persist yet — the name is here so that wiring it up later cannot
 * accidentally land on the playground's entry.
 */
export type TiledConnectionStorageKey = 'playground' | 'endpoint-harness';

function storageKey(harness: TiledConnectionStorageKey): string {
    return `${STORAGE_PREFIX}${harness}`;
}

/**
 * The stored config, with any field that is missing or malformed taken from `fallback`.
 *
 * Returns `fallback` untouched when nothing is stored, when the entry is not an object, or when
 * `localStorage` is unavailable — Safari private mode and a blocked third-party context both throw
 * on access rather than returning null.
 */
export function loadTiledConnection(
    harness: TiledConnectionStorageKey,
    fallback: TiledConnectionConfig,
): TiledConnectionConfig {
    let raw: string | null = null;
    try {
        raw = window.localStorage.getItem(storageKey(harness));
    } catch {
        return fallback;
    }
    if (!raw) return fallback;

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return fallback;
    }
    if (typeof parsed !== 'object' || parsed === null) return fallback;

    const stored = parsed as Record<string, unknown>;
    const text = (key: keyof TiledConnectionConfig, byDefault: string) =>
        typeof stored[key] === 'string' ? (stored[key] as string) : byDefault;

    return {
        baseUrl: text('baseUrl', fallback.baseUrl),
        initialPath: text('initialPath', fallback.initialPath),
        apiKey: text('apiKey', fallback.apiKey),
        apiKeyScheme: oneOf<TiledApiKeyScheme>(
            stored.apiKeyScheme,
            ['ApiKey', 'Apikey'],
            fallback.apiKeyScheme,
        ),
        apiKeyLocation: oneOf<TiledApiKeyLocation>(
            stored.apiKeyLocation,
            ['header', 'query'],
            fallback.apiKeyLocation,
        ),
        accessToken: text('accessToken', fallback.accessToken),
        refreshToken: text('refreshToken', fallback.refreshToken),
        useBrowserStorage:
            typeof stored.useBrowserStorage === 'boolean'
                ? stored.useBrowserStorage
                : fallback.useBrowserStorage,
    };
}

/** Writes the committed config. Failures are swallowed: a full quota must not break Apply. */
export function saveTiledConnection(
    harness: TiledConnectionStorageKey,
    config: TiledConnectionConfig,
): void {
    try {
        window.localStorage.setItem(storageKey(harness), JSON.stringify(config));
    } catch {
        // Quota, private mode, blocked storage. The harness works without persistence.
    }
}

/** Removes the stored config, including the credentials in it. */
export function clearTiledConnection(harness: TiledConnectionStorageKey): void {
    try {
        window.localStorage.removeItem(storageKey(harness));
    } catch {
        // Nothing to do; the caller's own state is already the source of truth.
    }
}

/** True when a config is stored, so the bar can say whether *Forget* would do anything. */
export function hasStoredTiledConnection(harness: TiledConnectionStorageKey): boolean {
    try {
        return window.localStorage.getItem(storageKey(harness)) !== null;
    } catch {
        return false;
    }
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], byDefault: T): T {
    return typeof value === 'string' && (allowed as readonly string[]).includes(value)
        ? (value as T)
        : byDefault;
}
