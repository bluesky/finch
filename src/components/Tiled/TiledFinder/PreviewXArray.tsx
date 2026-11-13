import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { TiledSearchItem, XArrayStructure, TiledTableRow } from './types';
import { useTiledArrayAsJSONQuery } from '@/api/tiled';
import { generateSearchPath } from './utils';
import Table from './Table';

type PreviewXArrayProps = {
    xarrayItem: TiledSearchItem<XArrayStructure>;
    url?: string;
};

export default function PreviewXArray({ xarrayItem, url }: PreviewXArrayProps) {
    const [visibleData, setVisibleData] = useState<TiledTableRow[]>([]);

    const observerRef = useRef<HTMLDivElement | null>(null);
    const tableContainerRef = useRef<HTMLDivElement | null>(null);

    const structure = xarrayItem.attributes.structure;
    const searchPath = generateSearchPath(xarrayItem);
    const rowLoadSize = 20;

    // Extract dimension names and calculate block counts for each dimension
    const dims = structure.dims;
    const shape = structure.shape;
    //const chunks = structure.chunks;

    // For table display, use dimension names as columns
    const columns = dims;

    // Convert multi-dimensional array data to table format for display
    const convertToTableFormat = useCallback(
        (data: number[][]): TiledTableRow[] => {
            if (!data || data.length === 0) return [];

            // For 1D data
            if (dims.length === 1) {
                return data.map((value, index) => ({
                    [dims[0]]: index,
                    value: Array.isArray(value) ? value[0] : value,
                }));
            }

            // For 2D+ data, flatten and create coordinate pairs
            const tableRows: TiledTableRow[] = [];
            const flattenData = (arr: unknown[], coords: number[] = []): void => {
                if (Array.isArray(arr[0])) {
                    arr.forEach((subArr, index) => {
                        flattenData(subArr as unknown[], [...coords, index]);
                    });
                } else {
                    arr.forEach((value, index) => {
                        const row: TiledTableRow = {};
                        dims.forEach((dim, dimIndex) => {
                            row[dim] = coords[dimIndex] || index;
                        });
                        row.value = value as number;
                        tableRows.push(row);
                    });
                }
            };

            flattenData(data);
            return tableRows;
        },
        [dims],
    );

    const requestOptions = useMemo(() => (url ? { baseUrl: url } : undefined), [url]);
    const {
        data: xarrayData,
        isPending: isLoading,
        error,
    } = useTiledArrayAsJSONQuery<number[][]>(searchPath, undefined, undefined, requestOptions);

    useEffect(() => {
        if (error) console.error(error);
    }, [error]);

    const tableData = useMemo(
        () => (xarrayData ? convertToTableFormat(xarrayData) : []),
        [xarrayData, convertToTableFormat],
    );

    // New data (a different item, or a cache hit): start from the top with the first page of rows.
    useEffect(() => {
        if (tableContainerRef.current) {
            tableContainerRef.current.scrollTop = 0;
        }
        setVisibleData(tableData.slice(0, rowLoadSize));
    }, [tableData, rowLoadSize]);

    const loadMoreRows = useCallback(() => {
        setVisibleData((prev) => {
            const nextRows = tableData.slice(prev.length, prev.length + rowLoadSize);
            return [...prev, ...nextRows];
        });
    }, [tableData, rowLoadSize]);

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
            <p className="text-sky-900 text-center mb-4">{xarrayItem.id}</p>

            {/* Dimension info */}
            <div className="mb-4 text-center">
                <p className="text-sm text-gray-600">
                    Dimensions: {dims.map((dim, i) => `${dim}(${shape[i]})`).join(' × ')}
                </p>
            </div>

            <Table
                isLoading={isLoading}
                columns={[...columns, 'value']}
                visibleData={visibleData}
                observerRef={observerRef}
            />
        </div>
    );
}
