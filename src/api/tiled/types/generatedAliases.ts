/**
 * Readable names over `generated/schema.d.ts`.
 *
 * The generated file names things the way FastAPI's OpenAPI emitter does —
 * `Response_List_Resource_NodeAttributes__dict__dict___PaginationLinks_dict_` is a real schema
 * name — and reaching into `components['schemas'][…]` at every call site is unreadable. This file
 * is the single place that indirection lives.
 *
 * **These are re-exports, not redefinitions.** Nothing here widens, narrows or renames a field. If
 * the spec changes, the alias changes with it and the build breaks at the call sites that cared —
 * which is the whole point of generating from the spec rather than hand-writing.
 *
 * This is a sharper tool here than it is for the queue server. The queue-server spec declares
 * almost every body and response as an untyped object, so
 * [`qServer/types/generatedAliases.ts`](../../qServer/types/generatedAliases.ts) covers only the 12
 * auth schemas and everything else is hand-written. Tiled's spec is precise, so the generated types
 * carry real shapes and the hand-written files shrink to `auth.ts` (not in the spec at all) and
 * `searchFilters.ts` (a deliberate widening).
 */

import type { components, operations, paths } from '../generated/schema';

type Schemas = components['schemas'];

// #region spec unions

/** Every path the spec declares. `types/paths.ts` is checked against this. */
export type TiledSpecPath = keyof paths;

/** Every operation id the spec declares. The registry's `operationId` is checked against this. */
export type TiledOperationId = keyof operations;

/** One operation's full description, for deriving parameter and body types. */
export type TiledOperation<Id extends TiledOperationId> = operations[Id];

/**
 * The query parameters of one operation, with the `undefined` an absent `query` block implies
 * stripped off.
 *
 * Used to pin a hand-written options type to the spec: `QueryParamsOf<'...'>` is what the server
 * actually accepts, so a `satisfies` against it catches a renamed or dropped parameter at compile
 * time instead of as a 422.
 */
export type TiledQueryParamsOf<Id extends TiledOperationId> =
    TiledOperation<Id> extends { parameters: { query?: infer Q } } ? NonNullable<Q> : never;

// #endregion

// #region enums

export type StructureFamily = Schemas['StructureFamily'];
export type EntryFields = Schemas['EntryFields'];
export type EventType = Schemas['EventType'];
export type Management = Schemas['Management'];
/** Comparison filter operators: `gt` / `gte` / `lt` / `lte`. */
export type Operator = Schemas['Operator'];
export type SortingDirection = Schemas['SortingDirection'];
export type SparseLayout = Schemas['SparseLayout'];
export type Endianness = Schemas['Endianness'];
export type DtypeKind = Schemas['Kind'];
export type DeliveryOutcome = Schemas['DeliveryOutcome'];

// #endregion

// #region structures
//
// Every structure type here is `Schema`-prefixed, and the rule is worth stating once: the
// unprefixed names (`ArrayStructure`, `TableStructure`, …) are **Finch's**, defined in
// `./structures.ts`, and are what `TiledSearchItem` carries. The prefixed ones are exactly what the
// wire says.
//
// They are not the same types, and the differences are real — the spec's `ArrayStructure.data_type`
// is `BuiltinDtype | StructDtype` where Finch's is the builtin form alone (the spec folds in what
// the package modelled as a separate `StructuredArrayStructure`), and the spec makes `dims` and
// `resizable` optional where Finch's requires them. Keeping both lets the write paths build bodies
// the server will accept while the read paths stay source-compatible with every component that
// already destructures a structure. See `./structures.ts` for the full reconciliation.

export type SchemaArrayStructure = Schemas['ArrayStructure'];
export type SchemaTableStructure = Schemas['TableStructure'];
export type SchemaAwkwardStructure = Schemas['AwkwardStructure'];
export type SchemaCOOStructure = Schemas['COOStructure'];
export type SchemaRaggedStructure = Schemas['RaggedStructure'];
export type SchemaBytesStructure = Schemas['BytesStructure'];
export type SchemaNodeStructure = Schemas['NodeStructure'];

/** Any structure the spec can attach to a node. */
export type SchemaStructure = NonNullable<Schemas['NodeAttributes']['structure']>;

export type BuiltinDtype = Schemas['BuiltinDtype'];
export type StructDtype = Schemas['StructDtype'];
export type DtypeField = Schemas['Field'];
export type SortingItem = Schemas['SortingItem'];

/**
 * `{ name, version }`.
 *
 * Unprefixed because there is nothing to reconcile: the spec's version differs from the package's
 * only in making `version` optional, which is a widening every reader already tolerates and which
 * the write paths need.
 */
export type Spec = Schemas['Spec'];

// #endregion

// #region nodes, links and envelopes

export type NodeAttributes = Schemas['NodeAttributes'];
export type ArrayLinks = Schemas['ArrayLinks'];
export type DataFrameLinks = Schemas['DataFrameLinks'];
export type SparseLinks = Schemas['SparseLinks'];
export type PaginationLinks = Schemas['PaginationLinks'];

/** One node as the server returns it: `{ id, attributes, links, meta }`. */
export type NodeResource = Schemas['Resource_NodeAttributes_dict_dict_'];

/** The envelope around a single node — what `GET /metadata/{path}` returns. */
export type NodeResponse = Schemas['Response_Resource_NodeAttributes__dict__dict__dict_dict_'];

/** The envelope around a page of nodes — what `GET /search/{path}` returns. */
export type NodeListResponse =
    Schemas['Response_List_Resource_NodeAttributes__dict__dict___PaginationLinks_dict_'];

/**
 * The generic envelope the data endpoints declare.
 *
 * Deliberately unhelpful in the spec (`data`, `error`, `links`, `meta` all loosely typed), because
 * one route serves JSON, CSV, parquet, arrow, PNG and HDF5 depending on `Accept`. The client's own
 * return types are narrower; see `client/formats.ts`.
 */
export type GenericResponse = Schemas['Response'];

export type ErrorResponse = Schemas['Error'];

// #endregion

// #region data sources and assets

export type DataSource = Schemas['DataSource'];
export type Asset = Schemas['Asset'];

// #endregion

// #region request and response bodies

export type PostMetadataRequest = Schemas['PostMetadataRequest'];
export type PostMetadataResponse = Schemas['PostMetadataResponse'];
export type PutMetadataRequest = Schemas['PutMetadataRequest'];
export type PutMetadataResponse = Schemas['PutMetadataResponse'];
export type PatchMetadataRequest = Schemas['PatchMetadataRequest'];
export type PatchMetadataResponse = Schemas['PatchMetadataResponse'];
export type PutDataSourceRequest = Schemas['PutDataSourceRequest'];

/**
 * One RFC 6902 JSON Patch operation.
 *
 * The spec emits this type twice under two mangled names — `__1` is the one `metadata` and
 * `access_blob` use, `__2` is the one `specs` uses — because FastAPI generated a separate schema
 * per field. They are structurally identical; this alias is the `__1` form and
 * {@link JSONPatchSpecOperation} the `__2` form, so a future divergence is visible rather than
 * silently assumed away.
 */
export type JSONPatchOperation = Schemas['tiled__server__schemas__JSONPatchType__1'];
export type JSONPatchSpecOperation = Schemas['tiled__server__schemas__JSONPatchType__2'];

// #endregion

// #region distinct

export type GetDistinctResponse = Schemas['GetDistinctResponse'];
export type DistinctValueInfo = Schemas['DistinctValueInfo'];

// #endregion

// #region webhooks

export type WebhookRegistrationRequest = Schemas['WebhookRegistrationRequest'];
export type WebhookResponse = Schemas['WebhookResponse'];
export type DeliveryResponse = Schemas['DeliveryResponse'];

// #endregion

// #region server info

/** The `GET /api/v1/` document. */
export type About = Schemas['About'];
export type AboutAuthentication = Schemas['AboutAuthentication'];
export type AboutAuthenticationProvider = Schemas['AboutAuthenticationProvider'];

/**
 * The five auth endpoints a server advertises: `whoami`, `apikey`, `refresh_session`,
 * `revoke_session`, `logout`.
 *
 * This is the **only** description of the auth API in the spec — the routes themselves are absent.
 * `client/TiledAuthApi.ts` resolves its URLs from here rather than hard-coding them. On a server
 * with authentication disabled the whole block is `null`.
 */
export type AboutAuthenticationLinks = Schemas['AboutAuthenticationLinks'];

// #endregion

// #region errors

export type HTTPValidationError = Schemas['HTTPValidationError'];
export type ValidationError = Schemas['ValidationError'];

// #endregion
