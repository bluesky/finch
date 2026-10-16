import { TiledSpecPath } from './generatedAliases';
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
export declare const TILED_PATHS: {
    readonly healthz: "/healthz";
    readonly index: "/";
    readonly uiSettings: "/tiled-ui-settings";
    readonly ui: "/ui/{path}";
    readonly about: "/api/v1/";
    readonly metrics: "/api/v1/metrics";
    readonly search: "/api/v1/search/{path}";
    readonly distinct: "/api/v1/distinct/{path}";
    readonly metadata: "/api/v1/metadata/{path}";
    readonly arrayFull: "/api/v1/array/full/{path}";
    readonly arrayBlock: "/api/v1/array/block/{path}";
    readonly raggedFull: "/api/v1/ragged/full/{path}";
    readonly raggedBlock: "/api/v1/ragged/block/{path}";
    readonly tableFull: "/api/v1/table/full/{path}";
    readonly tablePartition: "/api/v1/table/partition/{path}";
    readonly containerFull: "/api/v1/container/full/{path}";
    readonly nodeFull: "/api/v1/node/full/{path}";
    readonly awkwardFull: "/api/v1/awkward/full/{path}";
    readonly awkwardBuffers: "/api/v1/awkward/buffers/{path}";
    readonly register: "/api/v1/register/{path}";
    readonly dataSource: "/api/v1/data_source/{path}";
    readonly revisions: "/api/v1/revisions/{path}";
    readonly streamClose: "/api/v1/stream/close/{path}";
    readonly assetBytes: "/api/v1/asset/bytes/{path}";
    readonly assetManifest: "/api/v1/asset/manifest/{path}";
    readonly webhookTarget: "/api/v1/webhooks/target/{path}";
    readonly webhookById: "/api/v1/webhooks/{webhook_id}";
    readonly webhookHistory: "/api/v1/webhooks/history/{webhook_id}";
    readonly zarrV2Zattrs: "/zarr/v2/{path}/.zattrs";
    readonly zarrV2ZattrsRoot: "/zarr/v2{path}.zattrs";
    readonly zarrV2Zgroup: "/zarr/v2/{path}/.zgroup";
    readonly zarrV2ZgroupRoot: "/zarr/v2{path}.zgroup";
    readonly zarrV2Zarray: "/zarr/v2/{path}/.zarray";
    readonly zarrV2Node: "/zarr/v2/{path}";
    readonly zarrV3MetadataRoot: "/zarr/v3/{path}zarr.json";
    readonly zarrV3Metadata: "/zarr/v3/{path}/zarr.json";
    readonly zarrV3Chunk: "/zarr/v3/{path}/c/{block}";
    readonly zarrV3Node: "/zarr/v3/{path}";
};
/**
 * The graph-of-links GraphQL endpoint. Origin-scoped, like `/healthz`.
 *
 * Not in {@link TILED_PATHS}, because that table is the spec's path list and is checked against it:
 * the graph router is not in `openapi.json` at all. Its coverage is checked against
 * `../graph/schema.graphql` instead — see `TiledGraph.test.tsx`.
 */
export declare const TILED_GRAPHQL_PATH = "/api/graphql";
/** Alias keys of {@link TILED_PATHS}, e.g. `'arrayFull'`. */
export type TiledPathAlias = keyof typeof TILED_PATHS;
/** The registered path literals — a subset of {@link TiledSpecPath} by construction. */
export type TiledRegisteredPath = (typeof TILED_PATHS)[TiledPathAlias];
type MissingPaths = Exclude<TiledSpecPath, TiledRegisteredPath>;
/**
 * Compile-time completeness check. If the regenerated schema adds a path, this alias resolves to a
 * tuple naming the offender instead of `true`, which fails the build.
 */
export type _AssertNoMissingPaths = MissingPaths extends never ? true : ['unregistered paths', MissingPaths];
/** The version segment every data and metadata route sits under. */
export declare const TILED_API_PREFIX = "/api/v1";
/**
 * Where a path is anchored.
 *
 * `'api'` paths are issued relative to the client's base URL, which already ends in `/api/v1`.
 * `'origin'` paths (`/healthz`, `/tiled-ui-settings`, every zarr route) are not under the version
 * segment at all and have to be issued against the bare origin — see `client/urlUtils.ts`.
 */
export type TiledPathScope = 'api' | 'origin';
/** Whether a spec path sits under `/api/v1`. */
export declare function isApiPath(specPath: string): boolean;
/**
 * Convert a spec path to the form the client puts on the wire.
 *
 * ```ts
 * toClientPath('/api/v1/search/{path}'); // { scope: 'api',    path: '/search/{path}' }
 * toClientPath('/api/v1/');              // { scope: 'api',    path: '/' }
 * toClientPath('/healthz');              // { scope: 'origin', path: '/healthz' }
 * ```
 */
export declare function toClientPath(specPath: string): {
    scope: TiledPathScope;
    path: string;
};
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
export declare function buildPath(template: string, params: Record<string, string | number>): string;
export {};
//# sourceMappingURL=paths.d.ts.map