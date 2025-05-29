import { PreviewSize, TiledSearchItem, ArrayStructure, TableStructure } from './types';
type TiledPreviewProps = {
    previewItem: TiledSearchItem<ArrayStructure> | TiledSearchItem<TableStructure>;
    previewSize: PreviewSize;
    handleSelectClick?: Function;
    url?: string;
    scrollContainerRef: React.RefObject<HTMLDivElement>;
};
export default function TiledPreview({ previewItem, handleSelectClick, previewSize, url, scrollContainerRef, ...props }: TiledPreviewProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=TiledPreview.d.ts.map