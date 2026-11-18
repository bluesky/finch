import TiledPreview from './TiledPreview';
import TiledPreviewMetadata from './TiledPreviewMetadata';
import {
    PreviewSize,
    TiledSearchItem,
    TiledStructures,
    ArrayStructure,
    TableStructure,
    AwkwardStructure,
    SparseStructure,
    ContainerStructure,
} from './types';

type TiledRowPreviewProps = {
    selectedContainerForPreview: TiledSearchItem<ContainerStructure> | null;
    previewItem:
        | TiledSearchItem<ArrayStructure>
        | TiledSearchItem<TableStructure>
        | TiledSearchItem<AwkwardStructure>
        | TiledSearchItem<SparseStructure>
        | null;
    previewSize: PreviewSize;
    handleSelectClick?: (item: TiledSearchItem<TiledStructures>, currentSlice?: number[]) => void;
    url?: string;
    scrollContainerRef: React.RefObject<HTMLDivElement>;
};

export default function TiledRowPreview({
    selectedContainerForPreview,
    previewItem,
    previewSize,
    handleSelectClick,
    url,
    scrollContainerRef,
}: TiledRowPreviewProps) {
    if (!selectedContainerForPreview && !previewItem) {
        return (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm select-none">
                Select container or data to preview
            </div>
        );
    }

    if (selectedContainerForPreview) {
        return (
            <div className="w-full h-full overflow-y-auto py-4">
                <h2 className="px-4 pb-2 font-medium text-slate-700 truncate">
                    {selectedContainerForPreview.id}
                </h2>
                <TiledPreviewMetadata item={selectedContainerForPreview} />
            </div>
        );
    }

    return (
        <TiledPreview
            previewItem={previewItem!}
            previewSize={previewSize}
            handleSelectClick={handleSelectClick}
            url={url}
            scrollContainerRef={scrollContainerRef}
        />
    );
}
