import type { Spec } from './generatedAliases';
import type { TiledStructures } from './structures';

/**
 * Nodes, search results and the data shapes the read endpoints return.
 *
 * Ported from `@blueskyproject/tiled` for the same reason as `./structures.ts`: components in this
 * repo already read these fields, so the shapes stay put. Where the package was demonstrably wrong
 * about the wire format the comment says so and the type is corrected.
 */

/** The hypermedia links a node carries. Which ones are present depends on the structure family. */
export interface TiledItemLinks {
    self: string;
    full?: string;
    block?: string;
    buffers?: string;
    partition?: string;
    search?: string;
    default?: string;
}

/** `{ key, direction }`, where direction is `1` ascending / `-1` descending. */
export interface TiledSorting {
    key: string;
    direction: number;
}

/**
 * A node's metadata.
 *
 * Open-ended — Tiled stores whatever the writer put there — with the Bluesky run document shape
 * described optionally on top, because that is what nearly every Finch component is actually
 * reaching for. The index signature keeps any other key accessible.
 */
export type TiledMetadata = {
    start?: {
        uid: string;
        time: number;
        versions: Record<string, string>;
        scan_id: number;
        plan_type: string;
        plan_name: string;
        detectors: string[];
        num_points: number;
        num_intervals: number;
        plan_args: Record<string, unknown>;
        hints: { dimensions: unknown[] };
    };
    stop?: {
        uid: string;
        time: number;
        run_start: string;
        exit_status: string;
        reason: string;
        num_events: Record<string, number>;
    };
    [key: string]: unknown;
};

/**
 * One item from a search or metadata response.
 *
 * `data_sources` is `DataSource[] | null`. The package typed it `string | null`, which the spec and
 * the server both contradict — it is a list of data source objects, present when a request passes
 * `include_data_sources=true`. Corrected here rather than carried over; nothing in this repo read
 * the field, so the fix costs nothing.
 */
export interface TiledSearchItem<StructureType = TiledStructures> {
    id: string;
    attributes: {
        ancestors: string[];
        structure_family: string;
        specs: Spec[];
        metadata: TiledMetadata;
        structure: StructureType;
        access_blob?: Record<string, unknown>;
        sorting: TiledSorting[] | null;
        data_sources: unknown[] | null;
    };
    links: TiledItemLinks;
    meta: unknown | null;
}

/** A page of search results. */
export interface TiledSearchResult {
    data: TiledSearchItem<TiledStructures>[];
    error: string | null;
    links: {
        self: string;
        first: string;
        last: string;
        next: string | null;
        prev: string | null;
    };
    meta: {
        count: number;
    };
}

/** The single-node envelope `GET /metadata/{path}` returns, before the client unwraps `data`. */
export interface TiledMetadataResult {
    data: TiledSearchItem<TiledStructures>;
    error: string | null;
    links: null;
    meta: null;
}

/** One row of a table, keyed by column name. */
export interface TiledTableRow {
    [column: string]: number;
}

/** Column-oriented table JSON: `{ columnName: values[] }`. */
export type TiledTableJSONResponse = Record<string, unknown[]>;

/** One row of a structured array, which can mix strings and numbers. */
export type TiledStructuredArrayRow = Array<string | number>;

export type TiledTableData = TiledTableRow[];
export type TiledStructuredArrayData = TiledStructuredArrayRow[];

/** A metadata response narrowed to a Bluesky run, for call sites that know they have one. */
export type TiledBlueskyPlanMetadataResponse = {
    data: TiledSearchItem<TiledStructures> & {
        attributes: { metadata: Required<Pick<TiledMetadata, 'start'>> & TiledMetadata };
    };
    error: string | null;
    links: null;
    meta: null;
};
