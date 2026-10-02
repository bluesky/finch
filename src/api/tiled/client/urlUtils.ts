import { TILED_API_PREFIX } from '../types/paths';

/**
 * URL and path handling for the Tiled client.
 *
 * Every function here is a faithful port of the equivalent in
 * [`tiled-viewer-react`](https://github.com/bluesky/tiled-viewer-react/tree/main/src/components/Tiled/api),
 * because these rules are what a Tiled server actually expects and changing them silently would
 * break paths that work today. Where a comment says "upstream", the behaviour is deliberate rather
 * than incidental.
 */

/** Strip trailing slashes. A base URL is stored without one so concatenation is unambiguous. */
export function normalizeTiledBaseUrl(baseUrl: string): string {
    return baseUrl.replace(/\/+$/, '');
}

/**
 * Collapse a Tiled node path to its bare segments: no leading, trailing or repeated slashes.
 *
 * `'/scan//primary/'` → `'scan/primary'`, `''` → `''` (the root container, which is legal).
 */
export function normalizeTiledPath(path: string): string {
    return path.split('/').filter(Boolean).join('/');
}

/**
 * Percent-encode a Tiled node path **one segment at a time**.
 *
 * The distinction matters: a node path is multi-segment, so `encodeURIComponent(path)` would turn
 * its separators into `%2F` and address a single node with a slash in its name instead. Encoding
 * per segment keeps the separators and still escapes a key containing `?`, `#` or a space.
 */
export function encodeTiledPath(path: string): string {
    return normalizeTiledPath(path).split('/').map(encodeURIComponent).join('/');
}

/**
 * Apply the client's initial path prefix to a relative request path.
 *
 * `pathMode: 'absolute'` skips the prefix entirely — that is what the mode is for. Both halves are
 * normalized first, so a prefix of `'/data/'` and a path of `'/scan'` compose to `'data/scan'`.
 */
export function resolveTiledPath(
    path: string,
    initialPath: string,
    pathMode: 'relative' | 'absolute' = 'relative',
): string {
    const target = normalizeTiledPath(path);
    if (pathMode === 'absolute') return target;

    const prefix = normalizeTiledPath(initialPath);
    if (!prefix) return target;
    return target ? `${prefix}/${target}` : prefix;
}

/** {@link resolveTiledPath} followed by {@link encodeTiledPath} — what the endpoint builders use. */
export function resolveEncodedTiledPath(
    path: string,
    initialPath: string,
    pathMode: 'relative' | 'absolute' = 'relative',
): string {
    return encodeTiledPath(resolveTiledPath(path, initialPath, pathMode));
}

/**
 * The server origin behind an API base URL.
 *
 * A Tiled base URL ends in the version segment (`http://host:8000/api/v1`), but a handful of routes
 * — `/healthz`, `/tiled-ui-settings`, every zarr route — are not under it. Those are issued against
 * this instead.
 *
 * Everything up to and including the **last** `/api/v1` is dropped, so a server mounted under a
 * sub-path (`https://host/tiled/api/v1`) correctly yields `https://host/tiled`. A base URL with no
 * version segment is returned unchanged rather than guessed at.
 */
export function tiledOriginFromBaseUrl(baseUrl: string): string {
    const normalized = normalizeTiledBaseUrl(baseUrl);
    const index = normalized.lastIndexOf(TILED_API_PREFIX);
    if (index === -1) return normalized;
    return normalizeTiledBaseUrl(normalized.slice(0, index));
}

/**
 * The default base URL when nothing is configured: the current host on Tiled's default port.
 *
 * Mirrors upstream's behaviour and the fallback in `src/utils/apiUtils.ts`, and returns `''` outside
 * a browser rather than inventing a hostname.
 */
export function defaultTiledBaseUrl(): string {
    if (typeof window === 'undefined') return '';
    return `${window.location.protocol}//${window.location.hostname}:8000${TILED_API_PREFIX}`;
}

/**
 * Format a numeric index tuple the way Tiled's `block`, `offset` and `shape` parameters want it:
 * comma-separated, no spaces, no brackets.
 *
 * ```ts
 * formatIndexTuple([0, 2]); // '0,2'
 * ```
 */
export function formatIndexTuple(values: readonly number[]): string {
    return values.join(',');
}
