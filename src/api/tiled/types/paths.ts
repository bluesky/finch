import type { TiledSpecPath } from './generatedAliases';

/**
 * Every URL the Tiled server exposes, keyed by a stable camelCase alias.
 *
 * The values are **spec paths** — absolute from the server origin, exactly as `openapi.json`
 * writes them. That is what makes the `satisfies` clause below meaningful and what lets
 * `_AssertNoMissingPaths` fail the build when a regenerated schema gains a route.
 *
 * It is *not* what the client puts on the wire. A Tiled base URL carries the API version segment
 * (`http://host:8000/api/v1`), so a request for `/api/v1/search/x` is issued as `/search/x`
 * against that base. {@link toClientPath} does that conversion, and it is the only place the
 * knowledge lives.
 *
 * This differs from the queue server, whose base URL is the bare origin because its spec paths
 * already start with `/api/`. The two conventions are each forced by their own server; the
 * difference is documented in both READMEs rather than papered over.
 */
export const TILED_PATHS = {
    // #region origin-scoped — these sit outside /api/v1
    healthz: '/healthz',
    index: '/',
    uiSettings: '/tiled-ui-settings',
    ui: '/ui/{path}',
    // #endregion

    // #region info
    about: '/api/v1/',
    metrics: '/api/v1/metrics',
    // #endregion

    // #region search
    search: '/api/v1/search/{path}',
    distinct: '/api/v1/distinct/{path}',
    // #endregion

    // #region metadata
    metadata: '/api/v1/metadata/{path}',
    // #endregion

    // #region array
    arrayFull: '/api/v1/array/full/{path}',
    arrayBlock: '/api/v1/array/block/{path}',
    // #endregion

    // #region ragged
    raggedFull: '/api/v1/ragged/full/{path}',
    raggedBlock: '/api/v1/ragged/block/{path}',
    // #endregion

    // #region table
    tableFull: '/api/v1/table/full/{path}',
    tablePartition: '/api/v1/table/partition/{path}',
    // #endregion

    // #region container and node
    containerFull: '/api/v1/container/full/{path}',
    nodeFull: '/api/v1/node/full/{path}',
    // #endregion

    // #region awkward
    awkwardFull: '/api/v1/awkward/full/{path}',
    awkwardBuffers: '/api/v1/awkward/buffers/{path}',
    // #endregion

    // #region writing and registration
    register: '/api/v1/register/{path}',
    dataSource: '/api/v1/data_source/{path}',
    revisions: '/api/v1/revisions/{path}',
    streamClose: '/api/v1/stream/close/{path}',
    // #endregion

    // #region assets
    assetBytes: '/api/v1/asset/bytes/{path}',
    assetManifest: '/api/v1/asset/manifest/{path}',
    // #endregion

    // #region webhooks
    webhookTarget: '/api/v1/webhooks/target/{path}',
    webhookById: '/api/v1/webhooks/{webhook_id}',
    webhookHistory: '/api/v1/webhooks/history/{webhook_id}',
    // #endregion

    // #region zarr — URL surface only; see client/TiledZarrApi.ts
    zarrV2Zattrs: '/zarr/v2/{path}/.zattrs',
    zarrV2ZattrsRoot: '/zarr/v2{path}.zattrs',
    zarrV2Zgroup: '/zarr/v2/{path}/.zgroup',
    zarrV2ZgroupRoot: '/zarr/v2{path}.zgroup',
    zarrV2Zarray: '/zarr/v2/{path}/.zarray',
    zarrV2Node: '/zarr/v2/{path}',
    zarrV3MetadataRoot: '/zarr/v3/{path}zarr.json',
    zarrV3Metadata: '/zarr/v3/{path}/zarr.json',
    zarrV3Chunk: '/zarr/v3/{path}/c/{block}',
    zarrV3Node: '/zarr/v3/{path}',
    // #endregion
} as const satisfies Record<string, TiledSpecPath>;

/** Alias keys of {@link TILED_PATHS}, e.g. `'arrayFull'`. */
export type TiledPathAlias = keyof typeof TILED_PATHS;

/** The registered path literals — a subset of {@link TiledSpecPath} by construction. */
export type TiledRegisteredPath = (typeof TILED_PATHS)[TiledPathAlias];

type MissingPaths = Exclude<TiledSpecPath, TiledRegisteredPath>;
/**
 * Compile-time completeness check. If the regenerated schema adds a path, this alias resolves to a
 * tuple naming the offender instead of `true`, which fails the build.
 */
export type _AssertNoMissingPaths = MissingPaths extends never
    ? true
    : ['unregistered paths', MissingPaths];

/** The version segment every data and metadata route sits under. */
export const TILED_API_PREFIX = '/api/v1';

/**
 * Where a path is anchored.
 *
 * `'api'` paths are issued relative to the client's base URL, which already ends in `/api/v1`.
 * `'origin'` paths (`/healthz`, `/tiled-ui-settings`, every zarr route) are not under the version
 * segment at all and have to be issued against the bare origin — see `client/urlUtils.ts`.
 */
export type TiledPathScope = 'api' | 'origin';

/** Whether a spec path sits under `/api/v1`. */
export function isApiPath(specPath: string): boolean {
    return specPath === TILED_API_PREFIX || specPath.startsWith(`${TILED_API_PREFIX}/`);
}

/**
 * Convert a spec path to the form the client puts on the wire.
 *
 * ```ts
 * toClientPath('/api/v1/search/{path}'); // { scope: 'api',    path: '/search/{path}' }
 * toClientPath('/api/v1/');              // { scope: 'api',    path: '/' }
 * toClientPath('/healthz');              // { scope: 'origin', path: '/healthz' }
 * ```
 */
export function toClientPath(specPath: string): { scope: TiledPathScope; path: string } {
    if (!isApiPath(specPath)) return { scope: 'origin', path: specPath };
    const stripped = specPath.slice(TILED_API_PREFIX.length);
    return { scope: 'api', path: stripped === '' ? '/' : stripped };
}

/**
 * Substitute `{placeholder}` segments in a templated path.
 *
 * Values are percent-encoded, so a webhook id or block index containing `/` cannot escape its
 * segment.
 *
 * **Not for Tiled node paths.** A node path is itself multi-segment (`scan/primary/data`) and its
 * slashes must survive, so those go through `encodeTiledPath` in `client/urlUtils.ts`, which
 * encodes each segment separately. `buildPath` is for scalars: `{webhook_id}`, `{block}`.
 *
 * ```ts
 * buildPath(TILED_PATHS.webhookById, { webhook_id: 7 }); // '/api/v1/webhooks/7'
 * ```
 */
export function buildPath(template: string, params: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (_match, name: string) => {
        const value = params[name];
        if (value === undefined || value === null || value === '') {
            throw new Error(`Missing path parameter '${name}' for '${template}'`);
        }
        return encodeURIComponent(String(value));
    });
}
