import { useState, useEffect } from 'react';
import Button from './ui/Button';
import PreviewNDArray from './PreviewNDArray';
import PreviewTable from './PreviewTable';
import PreviewAwkward from './PreviewAwkward';
import PreviewSparse from './PreviewSparse';
import PreviewStructuredArray from './PreviewStructuredArray';
import PreviewXArray from './PreviewXArray';
import {
    PreviewSize,
    TiledSearchItem,
    TiledStructures,
    ArrayStructure,
    TableStructure,
    AwkwardStructure,
    SparseStructure,
    StructuredArrayStructure,
    isArrayStructure,
    isTableStructure,
    isAwkwardStructure,
    isSparseStructure,
    isStructuredArrayStructure,
    isXArrayStructure,
} from './types';
import TiledPreviewMetadata from './TiledPreviewMetadata';
import { ArrowsIn, ArrowsOut, DownloadSimple } from '@phosphor-icons/react';

type TiledPreviewProps = {
    previewItem:
        | TiledSearchItem<ArrayStructure>
        | TiledSearchItem<TableStructure>
        | TiledSearchItem<AwkwardStructure>
        | TiledSearchItem<SparseStructure>
        | TiledSearchItem<StructuredArrayStructure>;
    previewSize: PreviewSize;
    handleSelectClick?: (item: TiledSearchItem<TiledStructures>, currentSlice?: number[]) => void;
    url?: string;
    scrollContainerRef: React.RefObject<HTMLDivElement>;
};

export default function TiledPreview({
    previewItem,
    handleSelectClick,
    previewSize = 'medium',
    url,
    scrollContainerRef,
    ...props
}: TiledPreviewProps) {
    const [isFullWidth, setIsFullWidth] = useState<boolean>(false);

    const previewSizeMap = {
        hidden: 'hidden',
        small: 'min-w-72',
        medium: 'min-w-[32rem]',
        large: 'min-w-[34rem]',
    };

    useEffect(() => {
        //when the preview element loads, scroll the viewer to the right so its always visible
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
    }, [isFullWidth, scrollContainerRef]);

    const renderPreviewComponent = () => {
        if (isXArrayStructure(previewItem)) {
            return <PreviewXArray xarrayItem={previewItem} url={url} />;
        }
        if (isStructuredArrayStructure(previewItem)) {
            return <PreviewStructuredArray structuredArrayItem={previewItem} url={url} />;
        }
        if (isTableStructure(previewItem)) {
            return <PreviewTable tableItem={previewItem} url={url} />;
        }
        if (isArrayStructure(previewItem)) {
            //array preview renders its own button so info on the currently selected slice can be sent into the callback
            return (
                <PreviewNDArray
                    arrayItem={previewItem}
                    url={url}
                    isFullWidth={isFullWidth}
                    handleSelectClick={handleSelectClick}
                />
            );
        }
        if (isAwkwardStructure(previewItem)) {
            return <PreviewAwkward awkwardItem={previewItem} />;
        }
        if (isSparseStructure(previewItem)) {
            return <PreviewSparse sparseItem={previewItem} />;
        }
        return <div className="text-red-500">Unsupported item type</div>;
    };

    return (
        <div
            className={`${previewSizeMap[previewSize]} flex-grow h-full flex flex-col overflow-y-auto relative max-w-full ${isFullWidth && 'min-w-full'}`}
            {...props}
        >
            <div className="flex justify-between px-2 pt-2 absolute top-0 w-full">
                <div
                    className="h-6 aspect-square hover:cursor-pointer hover:text-slate-600"
                    onClick={() => setIsFullWidth(!isFullWidth)}
                >
                    {isFullWidth ? (
                        <ArrowsIn className="w-full h-full" />
                    ) : (
                        <ArrowsOut className="w-full h-full" />
                    )}
                </div>
                <div className="h-6 aspect-square hover:cursor-pointer hover:text-slate-600">
                    <DownloadSimple className="w-full h-full" />
                </div>
            </div>
            <div className="w-full flex flex-col items-center space-y-8 py-4">
                {renderPreviewComponent()}
                {handleSelectClick && !isArrayStructure(previewItem) && (
                    <Button text="Select" size="medium" cb={() => handleSelectClick(previewItem)} />
                )}
            </div>
            <TiledPreviewMetadata item={previewItem} />
        </div>
    );
}
