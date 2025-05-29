export type PathItem = {
    id: string;
    structure: string;
};
export type Breadcrumb = {
    label: string;
    labelStyle?: string;
    icon?: JSX.Element;
    iconStyle?: string;
    onClick?: Function;
};
export type Slider = {
    min: number;
    max: number;
    index: number;
    value: number;
};
export type Paths = PathItem[];
export declare const pathsSample: Paths;
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
export interface TiledSearchItem<StructureType> {
    id: string;
    attributes: {
        ancestors: string[];
        structure_family: "array" | "table" | "container" | "awkward" | "sparse";
        specs: Spec[];
        metadata: Record<string, unknown>;
        structure: StructureType;
        sorting: Sorting[] | null;
        data_sources: string | null;
    };
    links: {
        self: string;
        full?: string;
        block?: string;
        buffers?: string;
        partition?: string;
        search?: string;
        default?: string;
    };
    meta: unknown | null;
}
export type TiledStructures = ArrayStructure | TableStructure | ContainerStructure | AwkwardStructure | SparseStructure;
export interface Spec {
    name: string;
    version: string | null;
}
export interface Sorting {
    key: string;
    direction: number;
}
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
export type PreviewSize = 'hidden' | 'small' | 'medium' | 'large';
export interface TiledTableRow {
    [column: string]: number;
}
export type TiledTableData = TiledTableRow[];
export declare const isArrayStructure: (item: TiledSearchItem<any>) => item is TiledSearchItem<ArrayStructure>;
export declare const isTableStructure: (item: TiledSearchItem<any>) => item is TiledSearchItem<TableStructure>;
export declare const isContainerStructure: (item: TiledSearchItem<any>) => item is TiledSearchItem<ContainerStructure>;
//# sourceMappingURL=types.d.ts.map