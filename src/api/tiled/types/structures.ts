import type { StructureFamily } from './generatedAliases';

/**
 * Finch's structure types — what a `TiledSearchItem` carries.
 *
 * These are ported verbatim from `@blueskyproject/tiled`, deliberately, because every Tiled
 * component in this repo already destructures them and a shape change would be a silent breakage
 * dressed up as a type improvement. Owning the definitions is the point of this folder; changing
 * them is a separate decision.
 *
 * They are **not** the spec's structures — `./generatedAliases.ts` exports those under a `Schema`
 * prefix. Three differences are worth knowing, because they decide which one to reach for:
 *
 * | | Finch (here) | Spec (`Schema…`) |
 * | --- | --- | --- |
 * | `ArrayStructure.data_type` | the builtin dtype alone | `BuiltinDtype \| StructDtype` |
 * | structured arrays | a separate `StructuredArrayStructure` | folded into `SchemaArrayStructure` |
 * | `dims` / `resizable` | required | optional |
 *
 * **Reading** a response: use these. **Building** a request body the server must accept (a
 * `PostMetadataRequest`, a `PutDataSourceRequest`): use the `Schema…` form, which is what the
 * validator on the other end is checking against.
 */

/** A NumPy-style dtype descriptor. */
export interface TiledDtype {
    endianness: string;
    kind: string;
    itemsize: number;
    dt_units: string | null;
}

export interface ArrayStructure {
    data_type: TiledDtype;
    chunks: number[][];
    shape: number[];
    dims: string[] | null;
    resizable: boolean;
}

/** One field of a structured (record) array. */
export interface StructuredArrayField {
    name: string;
    dtype: TiledDtype;
    shape: number[] | null;
}

/** An array whose dtype is a record rather than a scalar. The spec folds this into `ArrayStructure`. */
export interface StructuredArrayStructure {
    data_type: {
        itemsize: number;
        fields: StructuredArrayField[];
    };
    chunks: number[][];
    shape: number[];
    dims: string[] | null;
    resizable: boolean;
}

export interface TableStructure {
    arrow_schema: string;
    npartitions: number;
    columns: string[];
    resizable: boolean;
}

export interface ContainerStructure {
    contents: unknown | null;
    count: number;
}

export interface AwkwardStructure {
    length: number;
    form: AwkwardForm;
}

export interface AwkwardForm {
    class: string;
    offsets?: string;
    primitive?: string;
    inner_shape?: number[];
    parameters: Record<string, unknown>;
    form_key: string;
    content?: AwkwardForm;
    fields?: string[];
    contents?: AwkwardForm[];
}

export interface SparseStructure {
    layout: string;
    shape: number[];
    chunks: number[][];
    dims: string[] | null;
    resizable: boolean;
}

/**
 * A ragged array — rows of varying length.
 *
 * New here: the package predates the structure family, so there was nothing to port. Shaped after
 * the spec's `RaggedStructure`, with `dims` and `resizable` made required to match its siblings
 * above.
 */
export interface RaggedStructure {
    data_type: TiledDtype;
    shape: number[];
    size: number;
    chunks: number[][];
    dims: string[] | null;
    resizable: boolean;
}

export interface XArrayStructure {
    data_type: TiledDtype;
    chunks: number[][];
    shape: number[];
    dims: string[];
    resizable: boolean;
}

/** Every structure a node can carry. */
export type TiledStructures =
    | ArrayStructure
    | StructuredArrayStructure
    | TableStructure
    | ContainerStructure
    | AwkwardStructure
    | SparseStructure
    | RaggedStructure;

/**
 * Structure-family narrowing.
 *
 * The family is read from `attributes.structure_family`, not inferred from the structure's own
 * fields, because several families are structurally similar enough to confuse a shape check —
 * `ArrayStructure`, `SparseStructure` and `RaggedStructure` all carry `shape` and `chunks`.
 *
 * `'composite'` is accepted alongside the spec's families: this server version does not list it in
 * `StructureFamily`, but older Tiled servers emit it and a guard that crashed on one would be worse
 * than one that simply answers `false`.
 */
export type TiledStructureFamily = StructureFamily | 'composite';

/** The minimum shape a guard needs: anything with a structure family on it. */
interface FamilyBearing {
    attributes: { structure_family?: string | null; structure?: unknown };
}

function hasFamily<T>(
    item: FamilyBearing,
    family: TiledStructureFamily,
): item is FamilyBearing & T {
    return item?.attributes?.structure_family === family;
}

export function isArrayStructure<T extends FamilyBearing>(
    item: T,
): item is T & { attributes: { structure: ArrayStructure } } {
    return hasFamily(item, 'array');
}

export function isTableStructure<T extends FamilyBearing>(
    item: T,
): item is T & { attributes: { structure: TableStructure } } {
    return hasFamily(item, 'table');
}

export function isContainerStructure<T extends FamilyBearing>(
    item: T,
): item is T & { attributes: { structure: ContainerStructure } } {
    return hasFamily(item, 'container');
}

export function isAwkwardStructure<T extends FamilyBearing>(
    item: T,
): item is T & { attributes: { structure: AwkwardStructure } } {
    return hasFamily(item, 'awkward');
}

export function isSparseStructure<T extends FamilyBearing>(
    item: T,
): item is T & { attributes: { structure: SparseStructure } } {
    return hasFamily(item, 'sparse');
}

export function isRaggedStructure<T extends FamilyBearing>(
    item: T,
): item is T & { attributes: { structure: RaggedStructure } } {
    return hasFamily(item, 'ragged');
}

/**
 * A structured (record) array.
 *
 * The one guard that cannot go by family alone: the server reports a structured array as
 * `structure_family: 'array'` like any other, and the difference is in the dtype — a record dtype
 * has `fields` where a scalar one has `kind`.
 */
export function isStructuredArrayStructure<T extends FamilyBearing>(
    item: T,
): item is T & { attributes: { structure: StructuredArrayStructure } } {
    if (!hasFamily(item, 'array')) return false;
    const structure = item.attributes.structure as { data_type?: { fields?: unknown } } | undefined;
    return Array.isArray(structure?.data_type?.fields);
}
