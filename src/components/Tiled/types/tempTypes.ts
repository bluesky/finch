//Temporary file used for types, this is to be replaced by the types exported in the <Tiled /> component once available
/* eslint-disable @typescript-eslint/no-explicit-any*/
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

// Example of a predefined paths array
export const pathsSample: Paths = [
    { id: 'structured_data', structure: 'container' },
    { id: 'big_image', structure: 'array' },
];

/** Top-level response shape returned by the Tiled search API for list queries. */
export interface TiledSearchResult {
    data: TiledSearchItem<TiledStructures>[]; // An array of search items
    error: string | null; // Error message, if any
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
    data: TiledSearchItem<TiledStructures>; // A SINGLE search item
    error: string | null; // Error message, if any
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
    id: string; // Identifier for the item
    attributes: {
        ancestors: string[]; // Array of ancestor IDs
        structure_family: 'array' | 'table' | 'container' | 'awkward' | 'sparse' | 'composite'; // Enum for structure families
        specs: Spec[]; // Optional specs
        metadata: TiledMetadata; // Metadata with optional Bluesky fields and arbitrary JSON
        structure: StructureType;
        access_blob?: Record<string, unknown>; // Optional access blob URL
        sorting: Sorting[] | null; // Sorting details, if applicable
        data_sources: string | null; // Data source, if any
    };
    links: TiledItemLinks; // Links related to the item
    meta: unknown | null; // Optional metadata
}

export type TiledStructures =
    | ArrayStructure
    | StructuredArrayStructure
    | TableStructure
    | ContainerStructure
    | AwkwardStructure
    | SparseStructure;

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

// Structure definitions for the `structure` key
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
    dims: string[]; // XArray always has dims (unlike regular arrays where dims can be null)
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
    [key: string]: unknown; // Allow arbitrary nested JSON
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

export const isArrayStructure = (
    item: TiledSearchItem<any>,
): item is TiledSearchItem<ArrayStructure> => {
    return item.attributes.structure_family === 'array';
};

export const isTableStructure = (
    item: TiledSearchItem<any>,
): item is TiledSearchItem<TableStructure> => {
    return item.attributes.structure_family === 'table';
};

export const isContainerStructure = (
    item: TiledSearchItem<any>,
): item is TiledSearchItem<ContainerStructure> => {
    return (
        item.attributes.structure_family === 'container' ||
        item.attributes.structure_family === 'composite'
    );
};

export const isAwkwardStructure = (
    item: TiledSearchItem<any>,
): item is TiledSearchItem<AwkwardStructure> => {
    return item.attributes.structure_family === 'awkward';
};

export const isSparseStructure = (
    item: TiledSearchItem<any>,
): item is TiledSearchItem<SparseStructure> => {
    return item.attributes.structure_family === 'sparse';
};

export const isStructuredArrayStructure = (
    item: TiledSearchItem<any>,
): item is TiledSearchItem<StructuredArrayStructure> => {
    return (
        item.attributes.structure_family === 'array' &&
        'fields' in item.attributes.structure.data_type
    );
};

export const isXArrayStructure = (
    item: TiledSearchItem<any>,
): item is TiledSearchItem<XArrayStructure> => {
    return (
        item.attributes.structure_family === 'array' &&
        item.attributes.specs.some(
            (spec) =>
                spec.name === 'xarray_coord' ||
                spec.name === 'xarray_data_var' ||
                spec.name.startsWith('xarray_'),
        ) &&
        item.attributes.structure.dims !== null
    );
};

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
        container: { [key: string]: string[] };
        array: { [key: string]: string[] };
        awkward: { [key: string]: string[] };
        table: { [key: string]: string[] };
        sparse: { [key: string]: string[] };
        xarray_dataset: { [key: string]: string[] };
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

export function isValidTiledInfoResponse(data: any): data is TiledInfoResponse {
    return (
        data &&
        typeof data.api_version === 'number' &&
        typeof data.library_version === 'string' &&
        data.formats &&
        data.aliases
    );
}

export const sampleTiledInfoResponse: TiledInfoResponse = {
    api_version: 0,
    library_version: '0.1.dev2523+g6314f1d.d20250507',
    formats: {
        container: ['application/x-hdf5', 'application/json'],
        array: [
            'application/octet-stream',
            'application/json',
            'text/csv',
            'text/x-comma-separated-values',
            'text/plain',
            'image/png',
            'image/tiff',
            'text/html',
        ],
        awkward: [
            'application/zip',
            'application/json',
            'application/vnd.apache.arrow.file',
            'application/x-parquet',
        ],
        table: [
            'application/vnd.apache.arrow.file',
            'application/x-parquet',
            'text/csv',
            'text/x-comma-separated-values',
            'text/plain',
            'text/html',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/json',
            'application/json-seq',
            'application/x-hdf5',
        ],
        sparse: [
            'application/x-hdf5',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.apache.arrow.file',
            'application/x-parquet',
            'text/csv',
            'text/plain',
            'text/html',
            'application/json',
        ],
        xarray_dataset: [
            'application/netcdf',
            'application/x-netcdf',
            'application/vnd.apache.arrow.file',
            'application/x-parquet',
            'text/csv',
            'text/comma-separated-values',
            'text/plain',
            'text/html',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/json',
            'application/x-hdf5',
        ],
    },
    aliases: {
        container: {
            'application/x-hdf5': ['h5', 'hdf5'],
            'application/json': ['json'],
            'application/x-parquet': ['parquet'],
            'application/vnd.apache.arrow.file': ['arrow', 'feather'],
            'application/netcdf': ['nc'],
            'text/plain': ['text', 'txt'],
        },
        array: {
            'application/json': ['json'],
            'text/csv': ['csv'],
            'image/png': ['png'],
            'image/tiff': ['tiff', 'tif'],
            'text/html': ['html', 'htm'],
            'application/x-hdf5': ['h5', 'hdf5'],
            'application/x-parquet': ['parquet'],
            'application/vnd.apache.arrow.file': ['arrow', 'feather'],
            'application/netcdf': ['nc'],
            'text/plain': ['text', 'txt'],
        },
        awkward: {
            'application/zip': ['zip'],
            'application/json': ['json'],
            'application/x-hdf5': ['h5', 'hdf5'],
            'application/x-parquet': ['parquet'],
            'application/vnd.apache.arrow.file': ['arrow', 'feather'],
            'application/netcdf': ['nc'],
            'text/plain': ['text', 'txt'],
        },
        table: {
            'text/csv': ['csv'],
            'text/html': ['html', 'htm'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
            'application/json': ['json'],
            'application/x-hdf5': ['h5', 'hdf5'],
            'application/x-parquet': ['parquet'],
            'application/vnd.apache.arrow.file': ['arrow', 'feather'],
            'application/netcdf': ['nc'],
            'text/plain': ['text', 'txt'],
        },
        sparse: {
            'application/x-hdf5': ['h5', 'hdf5'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
            'text/csv': ['csv'],
            'text/html': ['html', 'htm'],
            'application/json': ['json'],
            'application/x-parquet': ['parquet'],
            'application/vnd.apache.arrow.file': ['arrow', 'feather'],
            'application/netcdf': ['nc'],
            'text/plain': ['text', 'txt'],
        },
        xarray_dataset: {
            'application/x-netcdf': ['cdf', 'nc'],
            'text/csv': ['csv'],
            'text/html': ['html', 'htm'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
            'application/json': ['json'],
            'application/x-hdf5': ['h5', 'hdf5'],
            'application/x-parquet': ['parquet'],
            'application/vnd.apache.arrow.file': ['arrow', 'feather'],
            'application/netcdf': ['nc'],
            'text/plain': ['text', 'txt'],
        },
    },
    queries: [
        'fulltext',
        'lookup',
        'keys_filter',
        'regex',
        'eq',
        'noteq',
        'comparison',
        'contains',
        'in',
        'notin',
        'specs',
        'structure_family',
    ],
    authentication: {
        required: true,
        providers: [
            {
                provider: 'toy',
                mode: 'password',
                links: {
                    auth_endpoint: 'http://localhost:8000/api/v1/auth/provider/toy/token',
                },
                confirmation_message: 'You have logged in as {id}.',
            },
            {
                provider: 'orcid',
                mode: 'external',
                links: {
                    auth_endpoint: 'http://localhost:8000/api/v1/auth/provider/orcid/authorize',
                },
                confirmation_message: 'You have logged in with ORCID as {id}.',
            },
        ],
        links: {
            whoami: 'http://localhost:8000/api/v1/auth/whoami',
            apikey: 'http://localhost:8000/api/v1/auth/apikey',
            refresh_session: 'http://localhost:8000/api/v1/auth/session/refresh',
            revoke_session: 'http://localhost:8000/api/v1/auth/session/revoke/{session_id}',
            logout: 'http://localhost:8000/api/v1/auth/logout',
        },
    },
    links: {
        self: 'http://localhost:8000/api/v1',
        documentation: 'http://localhost:8000/api/v1/docs',
    },
    meta: {
        root_path: '/api',
    },
};

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
                [key: string]: unknown; // Allow additional metadata fields
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
            [key: string]: string; // Allow additional links
        };
        meta: unknown | null;
    };
    error: unknown | null;
    links: unknown | null;
    meta: {
        [key: string]: unknown;
    };
};
