/** A single Tiled node path entry with its data structure family. */
export type PathItem = {
    /** Tiled node identifier / path segment. */
    id: string;
    /** Tiled structure family (e.g. `'container'`, `'array'`, `'table'`). */
    structure: string;
};
/** Breadcrumb navigation item used in Tiled UI navigation bars. */
export type Breadcrumb = {
    /** Display text for the breadcrumb. */
    label: string;
    /** Additional Tailwind classes applied to the label text. */
    labelStyle?: string;
    /** Optional icon element rendered beside the label. */
    icon?: JSX.Element;
    /** Additional Tailwind classes applied to the icon element. */
    iconStyle?: string;
    /** Callback invoked when the breadcrumb is clicked. */
    onClick?: () => void;
};
/** Slider state used for image slice / frame selection controls. */
export type Slider = {
    /** Minimum slider value. */
    min: number;
    /** Maximum slider value. */
    max: number;
    /** Current array index selected by the slider. */
    index: number;
    /** Current numeric value of the slider. */
    value: number;
};
export type Paths = PathItem[];
export declare const pathsSample: Paths;
/** Top-level response shape returned by the Tiled search API for list queries. */
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
/** Top-level response shape returned by the Tiled metadata API for a single node. */
export interface TiledSearchMetadataResult {
    data: TiledSearchItem<TiledStructures>;
    error: string | null;
    links: null;
    meta: null;
}
/** URL links included on every Tiled node object. */
export interface TiledItemLinks {
    /** Canonical URL for this node's metadata. */
    self: string;
    full?: string;
    block?: string;
    buffers?: string;
    partition?: string;
    search?: string;
    default?: string;
}
/** Links object augmented with optional authentication tokens, passed on item selection. */
export interface TiledItemSelectionData extends TiledItemLinks {
    /** JWT refresh token from the Tiled auth session. */
    refreshToken?: string | null;
    /** JWT access token from the Tiled auth session. */
    accessToken?: string | null;
}
/** A single node returned by the Tiled search or metadata API, generic over its structure descriptor. */
export interface TiledSearchItem<StructureType> {
    id: string;
    attributes: {
        ancestors: string[];
        structure_family: 'array' | 'table' | 'container' | 'awkward' | 'sparse' | 'composite';
        specs: Spec[];
        metadata: TiledMetadata;
        structure: StructureType;
        access_blob?: Record<string, unknown>;
        sorting: Sorting[] | null;
        data_sources: string | null;
    };
    links: TiledItemLinks;
    meta: unknown | null;
}
export type TiledStructures = ArrayStructure | StructuredArrayStructure | TableStructure | ContainerStructure | AwkwardStructure | SparseStructure;
/** Tiled spec tag attached to a node (e.g. `{ name: 'xarray_data_var', version: null }`). */
export interface Spec {
    /** Spec name identifying the node's semantic role. */
    name: string;
    /** Spec version string, or `null` if unversioned. */
    version: string | null;
}
/** Sort key and direction applied to a Tiled container's children. */
export interface Sorting {
    /** Field name used for sorting. */
    key: string;
    /** Sort direction: `1` for ascending, `-1` for descending. */
    direction: number;
}
/** Tiled structure descriptor for a homogeneous n-dimensional array node. */
export interface ArrayStructure {
    data_type: {
        endianness: string;
        kind: string;
        itemsize: number;
        dt_units: string | null;
    };
    chunks: number[][];
    shape: number[];
    dims: string[] | null;
    resizable: boolean;
}
/** Tiled structure descriptor for a structured (record) array node. */
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
/** Descriptor for a single named field within a `StructuredArrayStructure`. */
export interface StructuredArrayField {
    name: string;
    dtype: {
        endianness: string;
        kind: string;
        itemsize: number;
        dt_units: string | null;
    };
    shape: number[] | null;
}
/** Tiled structure descriptor for a tabular (Arrow/Parquet) node. */
export interface TableStructure {
    /** Base64-encoded Arrow schema describing column names and dtypes. */
    arrow_schema: string;
    /** Number of Arrow record batch partitions the table is split into. */
    npartitions: number;
    /** Ordered list of column names in the table. */
    columns: string[];
    resizable: boolean;
}
/** Tiled structure descriptor for a container (directory/group) node. */
export interface ContainerStructure {
    contents: unknown | null;
    /** Number of direct children in this container. */
    count: number;
}
/** Tiled structure descriptor for an Awkward Array node. */
export interface AwkwardStructure {
    /** Total number of elements in the outermost array dimension. */
    length: number;
    /** Awkward Array form describing the nested type layout. */
    form: AwkwardForm;
}
/** Recursive Awkward Array form node describing nested type layouts. */
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
/** Tiled structure descriptor for a sparse array node. */
export interface SparseStructure {
    /** Sparse storage layout identifier (e.g. `'COO'`). */
    layout: string;
    shape: number[];
    chunks: number[][];
    dims: string[] | null;
    resizable: boolean;
}
/** Tiled structure descriptor for an xarray-labeled array node; always has non-null `dims`. */
export interface XArrayStructure {
    data_type: {
        endianness: string;
        kind: string;
        itemsize: number;
        dt_units: string | null;
    };
    chunks: number[][];
    shape: number[];
    dims: string[];
    resizable: boolean;
}
/** Controls the rendered size of a Tiled node preview widget. */
export type PreviewSize = 'hidden' | 'small' | 'medium' | 'large';
/** Bluesky run metadata stored in a Tiled node's `attributes.metadata` field. */
export type TiledMetadata = {
    start?: {
        uid: string;
        time: number;
        versions: {
            [key: string]: string;
        };
        scan_id: number;
        plan_type: string;
        plan_name: string;
        detectors: string[];
        num_points: number;
        num_intervals: number;
        plan_args: {
            [key: string]: unknown;
        };
        hints: {
            dimensions: unknown[];
        };
    };
    stop?: {
        uid: string;
        time: number;
        run_start: string;
        exit_status: string;
        reason: string;
        num_events: {
            [stream: string]: number;
        };
    };
    [key: string]: unknown;
};
/** A single row from a Tiled table, keyed by column name. */
export interface TiledTableRow {
    [column: string]: number;
}
/** A single row from a Tiled structured array, represented as a mixed-type tuple. */
export type TiledStructuredArrayRow = Array<string | number>;
/** Full dataset returned by a Tiled table partition fetch. */
export type TiledTableData = TiledTableRow[];
/** Full dataset returned by a Tiled structured array fetch. */
export type TiledStructuredArrayData = TiledStructuredArrayRow[];
export declare const isArrayStructure: (item: TiledSearchItem<any>) => item is TiledSearchItem<ArrayStructure>;
export declare const isTableStructure: (item: TiledSearchItem<any>) => item is TiledSearchItem<TableStructure>;
export declare const isContainerStructure: (item: TiledSearchItem<any>) => item is TiledSearchItem<ContainerStructure>;
export declare const isAwkwardStructure: (item: TiledSearchItem<any>) => item is TiledSearchItem<AwkwardStructure>;
export declare const isSparseStructure: (item: TiledSearchItem<any>) => item is TiledSearchItem<SparseStructure>;
export declare const isStructuredArrayStructure: (item: TiledSearchItem<any>) => item is TiledSearchItem<StructuredArrayStructure>;
export declare const isXArrayStructure: (item: TiledSearchItem<any>) => item is TiledSearchItem<XArrayStructure>;
/** Authentication provider descriptor returned in the Tiled `/api/v1/` info response. */
export type TiledAuthProvider = {
    /** Provider name (e.g. `'toy'`, `'orcid'`). */
    provider: string;
    /** Authentication mode the provider uses. */
    mode: 'password' | 'external' | 'token' | 'internal';
    links: {
        /** URL of the provider's authentication endpoint. */
        auth_endpoint: string;
        [key: string]: string;
    };
    /** Message shown to the user after successful authentication. */
    confirmation_message: string;
    [key: string]: any;
};
/** Top-level response from the Tiled `/api/v1/` info endpoint. */
export type TiledInfoResponse = {
    api_version: number;
    library_version: string;
    formats: {
        container: string[];
        array: string[];
        awkward: string[];
        table: string[];
        sparse: string[];
        xarray_dataset: string[];
    };
    aliases: {
        container: {
            [key: string]: string[];
        };
        array: {
            [key: string]: string[];
        };
        awkward: {
            [key: string]: string[];
        };
        table: {
            [key: string]: string[];
        };
        sparse: {
            [key: string]: string[];
        };
        xarray_dataset: {
            [key: string]: string[];
        };
    };
    queries: string[];
    authentication?: {
        required: boolean;
        providers: TiledAuthProvider[];
        links: {
            whoami: string;
            apikey: string;
            refresh_session: string;
            revoke_session: string;
            logout: string;
        };
    };
    links: {
        self: string;
        documentation: string;
    };
    meta: {
        root_path: string;
    };
};
export declare function isValidTiledInfoResponse(data: any): data is TiledInfoResponse;
export declare const sampleTiledInfoResponse: TiledInfoResponse;
/** JSON response from a Tiled table partition fetch, keyed by column name. */
export type TiledTableJSONResponse = {
    [column: string]: number[];
};
/** Full response shape from the Tiled metadata endpoint for a Bluesky run container node. */
export type TiledBlueskyPlanMetadataResponse = {
    data: {
        id: string;
        attributes: {
            ancestors: string[];
            structure_family: string;
            specs: Array<{
                name: string;
                version: string | null;
            }>;
            metadata: {
                start?: {
                    uid: string;
                    time: number;
                    versions: {
                        [key: string]: string;
                    };
                    scan_id: number;
                    plan_type: string;
                    plan_name: string;
                    detectors: string[];
                    num_points: number;
                    num_intervals: number;
                    plan_args: {
                        [key: string]: unknown;
                    };
                    hints: {
                        dimensions: unknown[];
                    };
                };
                stop?: {
                    uid: string;
                    time: number;
                    run_start: string;
                    exit_status: string;
                    reason: string;
                    num_events: {
                        [stream: string]: number;
                    };
                };
                [key: string]: unknown;
            };
            structure: {
                contents: unknown | null;
                count: number;
            };
            access_blob: {
                [key: string]: unknown;
            };
            sorting: Array<{
                key: string;
                direction: number;
            }>;
            data_sources: unknown | null;
        };
        links: {
            self: string;
            search: string;
            full: string;
            [key: string]: string;
        };
        meta: unknown | null;
    };
    error: unknown | null;
    links: unknown | null;
    meta: {
        [key: string]: unknown;
    };
};
//# sourceMappingURL=tempTypes.d.ts.map