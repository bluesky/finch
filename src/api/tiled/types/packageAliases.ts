import type { TiledApiClient, TiledRequestOptions } from '@blueskyproject/tiled';

/**
 * Readable names for types `@blueskyproject/tiled` uses but does not export.
 *
 * The package's `exports` map only permits `.` and `./style.css`, so a deep import of
 * `dist/components/Tiled/api/...` is not an option. Everything here is therefore *derived* from the
 * public `TiledApiClient` signatures rather than restated — a shape change in the package becomes a
 * compile error here instead of silent drift. `hooks/typeTests.ts` pins the derivations.
 *
 * As the package exports more of its own types, delete the corresponding alias and import it.
 */

/** The array output formats `getArrayAs` accepts: `'JSON' | 'PNG' | 'BUFFER' | 'IMAGE_PATH'`. */
export type TiledArrayReturnType = NonNullable<Parameters<TiledApiClient['getArrayAs']>[1]>;

/** The table output formats `getTableAs` accepts: `'JSON' | 'JSON_SEQ'`. */
export type TiledTableReturnType = NonNullable<Parameters<TiledApiClient['getTableAs']>[1]>;

/** Which table endpoint to read: `'partition'` (one partition) or `'full'` (every partition). */
export type TiledTableEndpoint = NonNullable<Parameters<TiledApiClient['getTableAs']>[2]>;

/** Options for `getArrayAsJSON` — `TiledArrayRequestOptions` plus a JSON `format`. */
export type TiledArrayJSONOptions = NonNullable<Parameters<TiledApiClient['getArrayAsJSON']>[1]>;

/** Options for `getArrayAsPng`. */
export type TiledArrayPngOptions = NonNullable<Parameters<TiledApiClient['getArrayAsPng']>[1]>;

/** Options for `getArrayAsBuffer`. */
export type TiledArrayBufferOptions = NonNullable<
    Parameters<TiledApiClient['getArrayAsBuffer']>[1]
>;

/** Options for `getArrayAsImagePath`. */
export type TiledArrayImagePathOptions = NonNullable<
    Parameters<TiledApiClient['getArrayAsImagePath']>[1]
>;

/** Options accepted by the generic `getArrayAs` dispatcher — the union of the four above. */
export type TiledArrayAnyOptions = NonNullable<Parameters<TiledApiClient['getArrayAs']>[2]>;

/** Per-format array options, indexable by `TiledArrayReturnType`. */
export interface TiledArrayOptionsMap {
    JSON: TiledArrayJSONOptions;
    PNG: TiledArrayPngOptions;
    BUFFER: TiledArrayBufferOptions;
    IMAGE_PATH: TiledArrayImagePathOptions;
}

/**
 * The transport keys every one of the package's option types carries.
 *
 * `client`, `baseUrl`, `initialPath`, `pathMode`, `apiKey`, `signal` — subtracted below to leave just
 * the endpoint's own parameters. The package merges the two into one object (its
 * `TiledArrayRequestOptions` extends `TiledRequestOptions`); the hooks keep them in separate slots so
 * that `requestOptions` means transport here exactly as it does on every other Finch backend, and
 * recombine before calling through.
 */
type TiledTransportKeys = keyof TiledRequestOptions;

/**
 * Array parameters with the transport fields removed — `stack`, `downSampleRatio`,
 * `maxBytesAllowed`, `structure`, `arrayItem`, `isRGB`, `channelFirst`, `format`.
 *
 * Derived per format rather than as one `Omit` over the union, because `Omit` distributes over a
 * union by collapsing it to the shared keys — which would silently drop each format's own `format`
 * literal type.
 */
export type TiledArrayJSONEndpointOptions = Omit<TiledArrayJSONOptions, TiledTransportKeys>;
export type TiledArrayPngEndpointOptions = Omit<TiledArrayPngOptions, TiledTransportKeys>;
export type TiledArrayBufferEndpointOptions = Omit<TiledArrayBufferOptions, TiledTransportKeys>;
export type TiledArrayImagePathEndpointOptions = Omit<
    TiledArrayImagePathOptions,
    TiledTransportKeys
>;

/** Per-format array *endpoint* options, indexable by `TiledArrayReturnType`. */
export interface TiledArrayEndpointOptionsMap {
    JSON: TiledArrayJSONEndpointOptions;
    PNG: TiledArrayPngEndpointOptions;
    BUFFER: TiledArrayBufferEndpointOptions;
    IMAGE_PATH: TiledArrayImagePathEndpointOptions;
}

/** Array endpoint options accepted by the generic dispatcher. */
export type TiledArrayAnyEndpointOptions = Omit<TiledArrayAnyOptions, TiledTransportKeys>;

/** What each array format resolves to. */
export interface TiledArrayReturnMap {
    JSON: Awaited<ReturnType<TiledApiClient['getArrayAsJSON']>>;
    PNG: Awaited<ReturnType<TiledApiClient['getArrayAsPng']>>;
    BUFFER: Awaited<ReturnType<TiledApiClient['getArrayAsBuffer']>>;
    IMAGE_PATH: ReturnType<TiledApiClient['getArrayAsImagePath']>;
}

/** Options for the column-oriented table reads. */
export type TiledTableJSONOptions = NonNullable<
    Parameters<TiledApiClient['getTablePartitionAsJSON']>[1]
>;

/** Options for the row-oriented (`json-seq`) table reads. */
export type TiledTableJSONSequenceOptions = NonNullable<
    Parameters<TiledApiClient['getTablePartitionAsJSONSequence']>[1]
>;

/** Options accepted by the generic `getTableAs` dispatcher — the union of the two above. */
export type TiledTableAnyOptions = NonNullable<Parameters<TiledApiClient['getTableAs']>[3]>;

/** Per-format table options, indexable by `TiledTableReturnType`. */
export interface TiledTableOptionsMap {
    JSON: TiledTableJSONOptions;
    JSON_SEQ: TiledTableJSONSequenceOptions;
}

/**
 * Table parameters with the transport fields removed — `partition`, `structure`, `tableItem`,
 * `format`. Per format, for the same reason as their array counterparts.
 */
export type TiledTableJSONEndpointOptions = Omit<TiledTableJSONOptions, TiledTransportKeys>;
export type TiledTableJSONSequenceEndpointOptions = Omit<
    TiledTableJSONSequenceOptions,
    TiledTransportKeys
>;

/** Per-format table *endpoint* options, indexable by `TiledTableReturnType`. */
export interface TiledTableEndpointOptionsMap {
    JSON: TiledTableJSONEndpointOptions;
    JSON_SEQ: TiledTableJSONSequenceEndpointOptions;
}

/** Table endpoint options accepted by the generic dispatcher. */
export type TiledTableAnyEndpointOptions = Omit<TiledTableAnyOptions, TiledTransportKeys>;

/** What each table format resolves to. */
export interface TiledTableReturnMap {
    JSON: Awaited<ReturnType<TiledApiClient['getTablePartitionAsJSON']>>;
    JSON_SEQ: Awaited<ReturnType<TiledApiClient['getTablePartitionAsJSONSequence']>>;
}

/**
 * A column-oriented table response: `{ colA: [...], colB: [...] }`.
 *
 * Use this rather than the package's own `TiledTableJSONResponse`, which is exported from **two**
 * modules with two different definitions — `Record<string, unknown[]>` beside the table methods, and
 * the narrower `{ [column: string]: number[] }` from the shared types module, which is the one the
 * package index happens to re-export. Only the former matches what the methods actually resolve to, so
 * deriving from the method is the only way to stay honest.
 */
export type TiledTableJSONData = TiledTableReturnMap['JSON'];

/** A row-oriented table response: `[{ colA, colB }, …]`. */
export type TiledTableJSONSequenceData = TiledTableReturnMap['JSON_SEQ'];

/**
 * The `/api/v1/` root document: api and library versions, supported formats, auth providers.
 *
 * `getServerInfo` resolves `TiledInfoResponse | null` — `null` when the server is unreachable or
 * answers something unparseable — so this alias strips the `null` the hook keeps.
 */
export type TiledInfoResponse = NonNullable<Awaited<ReturnType<TiledApiClient['getServerInfo']>>>;

/** What a successful `loginWithUsernamePassword` resolves to. */
export type TiledLoginTokens = NonNullable<
    Awaited<ReturnType<TiledApiClient['loginWithUsernamePassword']>>
>;

/**
 * The substitute client a caller may pass in `requestOptions.client`.
 *
 * The package calls this `TiledClientLike` internally but does not export it, and it is **not** the
 * same thing as our `runtime/clientLike.ts` `TiledClientLike`: this one is an axios instance plus the
 * config accessors — what a single request can be issued through — whereas ours is the set of data
 * methods the hooks call. Same name, two different jobs; derived here so the distinction is visible
 * rather than inferred from a collision.
 */
export type TiledPackageClient = NonNullable<TiledRequestOptions['client']>;
