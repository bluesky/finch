import { TiledSearchResult, TiledSearchItem, Breadcrumb, ArrayStructure, TableStructure, TiledStructures, PreviewSize } from './types';
type Url = string;
export declare const useTiled: (url?: Url) => {
    columns: TiledSearchResult[];
    breadcrumbs: Breadcrumb[];
    imageUrl: string | undefined;
    popoutUrl: string | undefined;
    previewSize: PreviewSize;
    previewItem: TiledSearchItem<ArrayStructure> | TiledSearchItem<TableStructure> | null;
    handleColumnItemClick: (item: TiledSearchItem<TiledStructures>) => void;
    handleLeftArrowClick: Function;
    handleRightArrowClick: Function;
    resetAllData: () => void;
};
export {};
//# sourceMappingURL=useTiled.d.ts.map