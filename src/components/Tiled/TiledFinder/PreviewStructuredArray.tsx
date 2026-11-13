import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { TiledSearchItem, StructuredArrayStructure, TiledStructuredArrayData } from './types';
import { useTiledArrayAsJSONQuery } from '@/api/tiled';
import { generateSearchPath } from './utils';
import InputSliderRange from './ui/InputSliderRange';
import SelectInteger from './ui/SelectInteger';
import Table from './Table';

type PreviewStructuredArrayProps = {
    structuredArrayItem: TiledSearchItem<StructuredArrayStructure>;
    /** Not used for requests: the client (and its base URL) comes from TiledApiProvider. */
    url?: string;
};

export default function PreviewStructuredArray({
    structuredArrayItem,
}: PreviewStructuredArrayProps) {
    const [visibleData, setVisibleData] = useState<TiledStructuredArrayData>([]);
    const [block, setBlock] = useState<number>(0);
    const [domain, setDomain] = useState<[number, number] | undefined>(undefined);

    const observerRef = useRef<HTMLDivElement | null>(null);
    const tableContainerRef = useRef<HTMLDivElement | null>(null);

    const showPlot = false;

    // Calculate block count based on chunks (similar to partitions for tables)
    const blockCount = structuredArrayItem.attributes.structure.chunks[0].length;
    const searchPath = useMemo(
        () => generateSearchPath(structuredArrayItem),
        [structuredArrayItem],
    );
    const rowLoadSize = 20;

    // Extract column names from the structured array fields
    const columns = structuredArrayItem.attributes.structure.data_type.fields.map(
        (field) => field.name,
    );

    // A different array starts again at its first block.
    useEffect(() => {
        setBlock(0);
    }, [searchPath]);

    // `block` only drives the selector: the request is for the whole array either way, so it is not
    // part of the query and changing it is served from cache.
    const {
        data,
        isPending: isLoading,
        error,
    } = useTiledArrayAsJSONQuery<TiledStructuredArrayData>(searchPath, undefined, undefined);
    const structuredArrayData = useMemo(() => data ?? [], [data]);

    useEffect(() => {
        if (error) console.error(error);
    }, [error]);

    useEffect(() => {
        if (tableContainerRef.current) {
            tableContainerRef.current.scrollTop = 0;
        }
        setVisibleData(structuredArrayData.slice(0, rowLoadSize));
        setDomain(structuredArrayData.length > 0 ? [0, structuredArrayData.length - 1] : undefined);
    }, [structuredArrayData]);

    const handleBlockChange = useCallback((newValue: number) => {
        setBlock(newValue);
    }, []);

    const loadMoreRows = useCallback(() => {
        setVisibleData((prev) => {
            const nextRows = structuredArrayData.slice(prev.length, prev.length + rowLoadSize);
            return [...prev, ...nextRows];
        });
    }, [structuredArrayData]);

    useEffect(() => {
        if (!observerRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMoreRows();
                }
            },
            { threshold: 1.0 },
        );

        observer.observe(observerRef.current);

        return () => observer.disconnect();
    }, [loadMoreRows]);

    return (
        <div className="w-full px-12">
            <p className="text-sky-900 text-center mb-4">{structuredArrayItem.id}</p>

            <Table
                isLoading={isLoading}
                columns={columns}
                visibleData={visibleData}
                observerRef={observerRef}
                isStructuredArray={true}
            />

            {/* block selector */}
            {blockCount > 1 && (
                <SelectInteger
                    value={block}
                    min={0}
                    max={blockCount - 1}
                    onChange={handleBlockChange}
                    label="Block"
                    className="mt-4"
                />
            )}

            {/* scatter plot, to be implemented later if it makes sense for structured data */}
            {showPlot && (
                <div
                    className={`${isLoading ? 'animate-pulse opacity-50' : ''} mt-8 mb-4 shadow-md p-2 rounded border border-slate-100`}
                >
                    <h3 className="text-center mt-4">{structuredArrayItem.id}</h3>
                    {blockCount > 1 && (
                        <p className="text-center text-sm text-gray-500">Block: {block}</p>
                    )}

                    <InputSliderRange
                        min={0}
                        max={structuredArrayData.length - 1}
                        value={domain || [0, structuredArrayData.length - 1]}
                        showSideInput={false}
                        onChange={setDomain}
                        className="px-12"
                    />

                    {/* Scatter plot */}
                    {/* <VisxLinePlot
                        plotData={structuredArrayData}
                        domain={domain}
                    /> */}
                </div>
            )}
        </div>
    );
}
