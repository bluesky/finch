import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { TiledSearchItem, TableStructure, TiledTableRow } from './types';
import { useTiledTablePartitionAsJSONSequenceQuery } from '@/api/tiled';
import { generateSearchPath } from './utils';
import InputSliderRange from './ui/InputSliderRange';
import VisxLinePlot from './VisxLinePlot/VisxLinePlot';
import SelectInteger from './ui/SelectInteger';
import Table from './Table';

type PreviewTableProps = {
    tableItem: TiledSearchItem<TableStructure>;
    /** Not used for requests: the client (and its base URL) comes from TiledApiProvider. */
    url?: string;
};

export default function PreviewTable({ tableItem }: PreviewTableProps) {
    const [visibleData, setVisibleData] = useState<TiledTableRow[]>([]);
    const [partition, setPartition] = useState<number>(0);
    const [domain, setDomain] = useState<[number, number] | undefined>(undefined);

    const observerRef = useRef<HTMLDivElement | null>(null);
    const tableContainerRef = useRef<HTMLDivElement | null>(null);

    const partitionCount = tableItem.attributes.structure.npartitions;
    const searchPath = useMemo(() => generateSearchPath(tableItem), [tableItem]);
    const rowLoadSize = 20;

    // A different table starts again at its first partition.
    useEffect(() => {
        setPartition(0);
    }, [searchPath]);

    const { data, isPending, isPlaceholderData, error } = useTiledTablePartitionAsJSONSequenceQuery<
        TiledTableRow[]
    >(
        searchPath,
        { partition },
        // Keep the current partition on screen (dimmed) while the next one loads.
        { placeholderData: keepPreviousData },
    );
    const tableData = useMemo(() => data ?? [], [data]);
    const isLoading = isPending || isPlaceholderData;

    useEffect(() => {
        if (error) console.error(error);
    }, [error]);

    useEffect(() => {
        if (tableContainerRef.current) {
            tableContainerRef.current.scrollTop = 0;
        }
        setVisibleData(tableData.slice(0, rowLoadSize));
        setDomain(tableData.length > 0 ? [0, tableData.length - 1] : undefined);
    }, [tableData]);

    const columns = tableData.length > 0 ? Object.keys(tableData[0]) : [];

    const handlePartitionChange = useCallback((newValue: number) => {
        setPartition(newValue);
    }, []);

    const loadMoreRows = useCallback(() => {
        setVisibleData((prev) => {
            const nextRows = tableData.slice(prev.length, prev.length + rowLoadSize);
            return [...prev, ...nextRows];
        });
    }, [tableData]);

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
            <p className="text-sky-900 text-center mb-4">{tableItem.id}</p>
            <p className="text-sm text-center">
                Rows: {tableData?.length && tableData.length}{' '}
                {partitionCount > 1 && '(in selected partition)'}
            </p>

            <Table
                isLoading={isLoading}
                columns={columns}
                visibleData={visibleData}
                observerRef={observerRef}
            />

            {/* partition selector */}
            {partitionCount > 1 && (
                <SelectInteger
                    value={partition}
                    min={0}
                    max={partitionCount - 1}
                    onChange={handlePartitionChange}
                    className="mt-4"
                />
            )}
            {/* scatter plot goes here from visx */}
            {columns.length >= 2 && (
                <div
                    className={`${isLoading ? 'animate-pulse opacity-50' : ''} mt-8 mb-4 shadow-md p-2 rounded border border-slate-100`}
                >
                    <h3 className="text-center mt-4">{tableItem.id}</h3>
                    {partitionCount > 1 && (
                        <p className="text-center text-sm text-gray-500">Partition: {partition}</p>
                    )}

                    {tableData.length > 1 && (
                        <InputSliderRange
                            min={0}
                            max={tableData.length - 1}
                            value={domain || [0, tableData.length - 1]}
                            showSideInput={false}
                            onChange={setDomain}
                            className="px-12"
                        />
                    )}

                    {/* Scatter plot */}
                    <VisxLinePlot plotData={tableData} domain={domain} defaultHeight={400} />
                </div>
            )}
        </div>
    );
}
