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
export declare function normalizeTiledBaseUrl(baseUrl: string): string;
/**
 * Collapse a Tiled node path to its bare segments: no leading, trailing or repeated slashes.
 *
 * `'/scan//primary/'` → `'scan/primary'`, `''` → `''` (the root container, which is legal).
 */
export declare function normalizeTiledPath(path: string): string;
/**
 * Percent-encode a Tiled node path **one segment at a time**.
 *
 * The distinction matters: a node path is multi-segment, so `encodeURIComponent(path)` would turn
 * its separators into `%2F` and address a single node with a slash in its name instead. Encoding
 * per segment keeps the separators and still escapes a key containing `?`, `#` or a space.
 */
export declare function encodeTiledPath(path: string): string;
/**
 * Apply the client's initial path prefix to a relative request path.
 *
 * `pathMode: 'absolute'` skips the prefix entirely — that is what the mode is for. Both halves are
 * normalized first, so a prefix of `'/data/'` and a path of `'/scan'` compose to `'data/scan'`.
 */
export declare function resolveTiledPath(path: string, initialPath: string, pathMode?: 'relative' | 'absolute'): string;
/** {@link resolveTiledPath} followed by {@link encodeTiledPath} — what the endpoint builders use. */
export declare function resolveEncodedTiledPath(path: string, initialPath: string, pathMode?: 'relative' | 'absolute'): string;
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
export declare function tiledOriginFromBaseUrl(baseUrl: string): string;
/**
 * The default base URL when nothing is configured: the current host on Tiled's default port.
 *
 * Mirrors upstream's behaviour and the fallback in `src/utils/apiUtils.ts`, and returns `''` outside
 * a browser rather than inventing a hostname.
 */
export declare function defaultTiledBaseUrl(): string;
/**
 * Format a numeric index tuple the way Tiled's `block`, `offset` and `shape` parameters want it:
 * comma-separated, no spaces, no brackets.
 *
 * ```ts
 * formatIndexTuple([0, 2]); // '0,2'
 * ```
 */
export declare function formatIndexTuple(values: readonly number[]): string;
//# sourceMappingURL=urlUtils.d.ts.map