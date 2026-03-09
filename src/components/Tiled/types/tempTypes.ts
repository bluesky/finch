//Temporary file used for types, this is to be replaced by the types exported in the <Tiled /> component once available
export type PathItem = {
    id: string;
    structure: string;
};

export type Breadcrumb = {
    label: string;
    labelStyle?: string;
    icon?: JSX.Element;
    iconStyle?: string;
    onClick?: () => void;
}
export type Slider = {
    min: number;
    max: number;
    index: number;
    value: number;
};


export type Paths = PathItem[];

// Example of a predefined paths array
export const pathsSample: Paths = [
    { id: 'structured_data', structure: "container" },
    { id: 'big_image', structure: "array" },
];

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
};

export interface TiledSearchMetadataResult {
    data: TiledSearchItem<TiledStructures>; // A SINGLE search item
    error: string | null; // Error message, if any
    links: null;
    meta: null;
}

export interface TiledItemLinks {
    self: string;
    full?: string;
    block?: string;
    buffers?: string;
    partition?: string;
    search?: string;
    default?: string;
}

export interface TiledItemSelectionData extends TiledItemLinks {
    refreshToken?: string | null;
    accessToken?: string | null;
}

// Definition for a single search item
export interface TiledSearchItem<StructureType> {
    id: string; // Identifier for the item
    attributes: {
        ancestors: string[]; // Array of ancestor IDs
        structure_family: "array" | "table" | "container" | "awkward" | "sparse" | "composite"; // Enum for structure families
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


export type TiledStructures = ArrayStructure | StructuredArrayStructure | TableStructure | ContainerStructure | AwkwardStructure | SparseStructure

// Specs type
export interface Spec {
    name: string;
    version: string | null;
}

// Sorting details
export interface Sorting {
    key: string;
    direction: number;
}

// Structure definitions for the `structure` key
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

export type PreviewSize = 'hidden' | 'small' | 'medium' | 'large';

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

export interface TiledTableRow {
    [column: string]: number;
}

export type TiledStructuredArrayRow = Array<string | number>;

export type TiledTableData = TiledTableRow[];

export type TiledStructuredArrayData = TiledStructuredArrayRow[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isArrayStructure = (item: TiledSearchItem<any>): item is TiledSearchItem<ArrayStructure> => {
    return item.attributes.structure_family === 'array';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isTableStructure = (item: TiledSearchItem<any>): item is TiledSearchItem<TableStructure> => {
    return item.attributes.structure_family === 'table';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isContainerStructure = (item: TiledSearchItem<any>): item is TiledSearchItem<ContainerStructure> => {
    return (item.attributes.structure_family === 'container' || item.attributes.structure_family === 'composite');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isAwkwardStructure = (item: TiledSearchItem<any>): item is TiledSearchItem<AwkwardStructure> => {
    return item.attributes.structure_family === 'awkward';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isSparseStructure = (item: TiledSearchItem<any>): item is TiledSearchItem<SparseStructure> => {
    return item.attributes.structure_family === 'sparse';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isStructuredArrayStructure = (item: TiledSearchItem<any>): item is TiledSearchItem<StructuredArrayStructure> => {
    return item.attributes.structure_family === 'array' && 
           'fields' in item.attributes.structure.data_type;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isXArrayStructure = (item: TiledSearchItem<any>): item is TiledSearchItem<XArrayStructure> => {
    return item.attributes.structure_family === 'array' && 
           item.attributes.specs.some(spec => 
               spec.name === 'xarray_coord' || 
               spec.name === 'xarray_data_var' || 
               spec.name.startsWith('xarray_')
           ) &&
           item.attributes.structure.dims !== null;
};


export type TiledAuthProvider = {
    provider: string;
    mode: "password" | "external" | "token" | "internal";
    links: {
        auth_endpoint: string;
        [key: string]: string;
    };
    confirmation_message: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
};

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isValidTiledInfoResponse(data: any): data is TiledInfoResponse {
    return data &&
           typeof data.api_version === 'number' &&
           typeof data.library_version === 'string' &&
           data.formats &&
           data.aliases;
}


export const sampleTiledInfoResponse: TiledInfoResponse = {
    "api_version": 0,
    "library_version": "0.1.dev2523+g6314f1d.d20250507",
    "formats": {
        "container": [
            "application/x-hdf5",
            "application/json"
        ],
        "array": [
            "application/octet-stream",
            "application/json",
            "text/csv",
            "text/x-comma-separated-values",
            "text/plain",
            "image/png",
            "image/tiff",
            "text/html"
        ],
        "awkward": [
            "application/zip",
            "application/json",
            "application/vnd.apache.arrow.file",
            "application/x-parquet"
        ],
        "table": [
            "application/vnd.apache.arrow.file",
            "application/x-parquet",
            "text/csv",
            "text/x-comma-separated-values",
            "text/plain",
            "text/html",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/json",
            "application/json-seq",
            "application/x-hdf5"
        ],
        "sparse": [
            "application/x-hdf5",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.apache.arrow.file",
            "application/x-parquet",
            "text/csv",
            "text/plain",
            "text/html",
            "application/json"
        ],
        "xarray_dataset": [
            "application/netcdf",
            "application/x-netcdf",
            "application/vnd.apache.arrow.file",
            "application/x-parquet",
            "text/csv",
            "text/comma-separated-values",
            "text/plain",
            "text/html",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/json",
            "application/x-hdf5"
        ]
    },
    "aliases": {
        "container": {
            "application/x-hdf5": [
                "h5",
                "hdf5"
            ],
            "application/json": [
                "json"
            ],
            "application/x-parquet": [
                "parquet"
            ],
            "application/vnd.apache.arrow.file": [
                "arrow",
                "feather"
            ],
            "application/netcdf": [
                "nc"
            ],
            "text/plain": [
                "text",
                "txt"
            ]
        },
        "array": {
            "application/json": [
                "json"
            ],
            "text/csv": [
                "csv"
            ],
            "image/png": [
                "png"
            ],
            "image/tiff": [
                "tiff",
                "tif"
            ],
            "text/html": [
                "html",
                "htm"
            ],
            "application/x-hdf5": [
                "h5",
                "hdf5"
            ],
            "application/x-parquet": [
                "parquet"
            ],
            "application/vnd.apache.arrow.file": [
                "arrow",
                "feather"
            ],
            "application/netcdf": [
                "nc"
            ],
            "text/plain": [
                "text",
                "txt"
            ]
        },
        "awkward": {
            "application/zip": [
                "zip"
            ],
            "application/json": [
                "json"
            ],
            "application/x-hdf5": [
                "h5",
                "hdf5"
            ],
            "application/x-parquet": [
                "parquet"
            ],
            "application/vnd.apache.arrow.file": [
                "arrow",
                "feather"
            ],
            "application/netcdf": [
                "nc"
            ],
            "text/plain": [
                "text",
                "txt"
            ]
        },
        "table": {
            "text/csv": [
                "csv"
            ],
            "text/html": [
                "html",
                "htm"
            ],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
                "xlsx"
            ],
            "application/json": [
                "json"
            ],
            "application/x-hdf5": [
                "h5",
                "hdf5"
            ],
            "application/x-parquet": [
                "parquet"
            ],
            "application/vnd.apache.arrow.file": [
                "arrow",
                "feather"
            ],
            "application/netcdf": [
                "nc"
            ],
            "text/plain": [
                "text",
                "txt"
            ]
        },
        "sparse": {
            "application/x-hdf5": [
                "h5",
                "hdf5"
            ],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
                "xlsx"
            ],
            "text/csv": [
                "csv"
            ],
            "text/html": [
                "html",
                "htm"
            ],
            "application/json": [
                "json"
            ],
            "application/x-parquet": [
                "parquet"
            ],
            "application/vnd.apache.arrow.file": [
                "arrow",
                "feather"
            ],
            "application/netcdf": [
                "nc"
            ],
            "text/plain": [
                "text",
                "txt"
            ]
        },
        "xarray_dataset": {
            "application/x-netcdf": [
                "cdf",
                "nc"
            ],
            "text/csv": [
                "csv"
            ],
            "text/html": [
                "html",
                "htm"
            ],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
                "xlsx"
            ],
            "application/json": [
                "json"
            ],
            "application/x-hdf5": [
                "h5",
                "hdf5"
            ],
            "application/x-parquet": [
                "parquet"
            ],
            "application/vnd.apache.arrow.file": [
                "arrow",
                "feather"
            ],
            "application/netcdf": [
                "nc"
            ],
            "text/plain": [
                "text",
                "txt"
            ]
        }
    },
    "queries": [
        "fulltext",
        "lookup",
        "keys_filter",
        "regex",
        "eq",
        "noteq",
        "comparison",
        "contains",
        "in",
        "notin",
        "specs",
        "structure_family"
    ],
    "authentication": {
        "required": true,
        "providers": [
            {
                "provider": "toy",
                "mode": "password",
                "links": {
                    "auth_endpoint": "http://localhost:8000/api/v1/auth/provider/toy/token"
                },
                "confirmation_message": "You have logged in as {id}."
            },
            {
                "provider": "orcid",
                "mode": "external",
                "links": {
                    "auth_endpoint": "http://localhost:8000/api/v1/auth/provider/orcid/authorize"
                },
                "confirmation_message": "You have logged in with ORCID as {id}."
            }
        ],
        "links": {
            "whoami": "http://localhost:8000/api/v1/auth/whoami",
            "apikey": "http://localhost:8000/api/v1/auth/apikey",
            "refresh_session": "http://localhost:8000/api/v1/auth/session/refresh",
            "revoke_session": "http://localhost:8000/api/v1/auth/session/revoke/{session_id}",
            "logout": "http://localhost:8000/api/v1/auth/logout"
        }
    },
    "links": {
        "self": "http://localhost:8000/api/v1",
        "documentation": "http://localhost:8000/api/v1/docs"
    },
    "meta": {
        "root_path": "/api"
    }
};

export type TiledTableJSONResponse = {
    [column: string]: number[];
}

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