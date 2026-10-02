import type { TiledApiClient } from '../client/TiledApiClient';

/**
 * The Tiled operations the hooks call.
 *
 * A `Pick` of {@link TiledApiClient}, so a real client satisfies it structurally for free — and so
 * does any stub or fake that implements the same methods. That is the seam that lets a component
 * run against a live Tiled server, against a stub in tests, and (eventually) against a simulator,
 * without knowing which.
 *
 * It used to be a `Pick` of the package's client and covered seventeen methods. It now covers the
 * whole surface, which is a real cost: a hand-written stub has more to implement. Two things keep
 * that manageable —
 *
 * - a stub only needs the methods its component actually calls; `useTiledClient` substitutes a
 *   thrower for the rest, so the failure is a named `TiledEndpointUnavailableError` rather than an
 *   unexpected network request;
 * - `types/clientSurface.ts` documents the subset a general-purpose fake should implement.
 *
 * The config *getters* are included because the hooks need them to build cache keys: a cached entry
 * belongs to a `{ baseUrl, initialPath }` namespace, and only the client can say what its own is.
 * The config *setters* are deliberately absent — the hooks never reconfigure an injected client.
 */
export type TiledClientLike = Pick<
    TiledApiClient,
    // info
    | 'getServerInfo'
    | 'getAbout'
    | 'getHealth'
    | 'getUiSettings'
    | 'getMetrics'
    // search
    | 'getSearch'
    | 'getDistinct'
    // metadata
    | 'getMetadata'
    | 'createNode'
    | 'updateMetadata'
    | 'patchMetadata'
    | 'patchMetadataMerge'
    | 'patchMetadataJsonPatch'
    | 'deleteNode'
    // arrays
    | 'getArrayAs'
    | 'getArrayAsJSON'
    | 'getArrayAsPng'
    | 'getArrayAsBuffer'
    | 'getArrayAsImagePath'
    | 'getArrayBlock'
    | 'putArrayFull'
    | 'putArrayBlock'
    | 'patchArrayFull'
    // ragged
    | 'getRaggedFull'
    | 'putRaggedFull'
    | 'putRaggedBlock'
    | 'patchRaggedFull'
    // tables
    | 'getTableAs'
    | 'getTablePartitionAsJSON'
    | 'getTablePartitionAsJSONSequence'
    | 'getTableFullAsJSON'
    | 'getTableFullAsJSONSequence'
    | 'getTableFullAs'
    | 'postTableFull'
    | 'postTablePartition'
    | 'putTablePartition'
    | 'patchTablePartition'
    | 'putTableFull'
    // containers and nodes
    | 'getContainerFull'
    | 'postContainerFull'
    | 'getNodeFull'
    | 'putNodeFull'
    // awkward
    | 'getAwkwardFull'
    | 'getAwkwardBuffers'
    | 'postAwkwardBuffers'
    | 'putAwkwardFull'
    // registration, data sources, revisions, streams
    | 'postRegister'
    | 'putDataSource'
    | 'getRevisions'
    | 'deleteRevision'
    | 'closeStream'
    // assets
    | 'getAssetBytes'
    | 'getAssetManifest'
    // webhooks
    | 'listWebhooks'
    | 'registerWebhook'
    | 'deleteWebhook'
    | 'getWebhookHistory'
    // auth
    | 'loginWithUsernamePassword'
    | 'whoami'
    | 'createApiKey'
    | 'revokeApiKey'
    | 'refreshSession'
    | 'revokeSession'
    | 'logout'
    // zarr
    | 'getZarrV2Url'
    | 'getZarrV3Url'
    // read-only config, for cache scoping
    | 'getBaseUrl'
    | 'getInitialPath'
    | 'getApiKey'
>;

/**
 * Every method name in {@link TiledClientLike}, for runtime feature detection.
 *
 * `satisfies` ties the array to the type, so widening `TiledClientLike` without extending this list
 * (or the reverse) fails to compile. `useTiledClient` walks this list to decide whether an injected
 * client is complete, and substitutes a thrower for whatever is missing.
 */
export const TILED_CLIENT_LIKE_METHODS = [
    'getServerInfo',
    'getAbout',
    'getHealth',
    'getUiSettings',
    'getMetrics',
    'getSearch',
    'getDistinct',
    'getMetadata',
    'createNode',
    'updateMetadata',
    'patchMetadata',
    'patchMetadataMerge',
    'patchMetadataJsonPatch',
    'deleteNode',
    'getArrayAs',
    'getArrayAsJSON',
    'getArrayAsPng',
    'getArrayAsBuffer',
    'getArrayAsImagePath',
    'getArrayBlock',
    'putArrayFull',
    'putArrayBlock',
    'patchArrayFull',
    'getRaggedFull',
    'putRaggedFull',
    'putRaggedBlock',
    'patchRaggedFull',
    'getTableAs',
    'getTablePartitionAsJSON',
    'getTablePartitionAsJSONSequence',
    'getTableFullAsJSON',
    'getTableFullAsJSONSequence',
    'getTableFullAs',
    'postTableFull',
    'postTablePartition',
    'putTablePartition',
    'patchTablePartition',
    'putTableFull',
    'getContainerFull',
    'postContainerFull',
    'getNodeFull',
    'putNodeFull',
    'getAwkwardFull',
    'getAwkwardBuffers',
    'postAwkwardBuffers',
    'putAwkwardFull',
    'postRegister',
    'putDataSource',
    'getRevisions',
    'deleteRevision',
    'closeStream',
    'getAssetBytes',
    'getAssetManifest',
    'listWebhooks',
    'registerWebhook',
    'deleteWebhook',
    'getWebhookHistory',
    'loginWithUsernamePassword',
    'whoami',
    'createApiKey',
    'revokeApiKey',
    'refreshSession',
    'revokeSession',
    'logout',
    'getZarrV2Url',
    'getZarrV3Url',
    'getBaseUrl',
    'getInitialPath',
    'getApiKey',
] as const satisfies readonly (keyof TiledClientLike)[];

/** The method names, as a union. */
export type TiledClientLikeMethod = (typeof TILED_CLIENT_LIKE_METHODS)[number];
