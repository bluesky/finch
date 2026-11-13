import React, { useRef } from 'react';
import { TiledTableRow, TiledStructuredArrayRow } from './types';

interface TableProps {
    isLoading: boolean;
    columns: string[];
    visibleData: (TiledTableRow | TiledStructuredArrayRow)[];
    observerRef: React.RefObject<HTMLDivElement>;
    precision?: number;
    isStructuredArray?: boolean;
}

export default function Table({
    isLoading,
    columns,
    visibleData,
    observerRef,
    precision,
    isStructuredArray = false,
}: TableProps) {
    const isExpanded = false;
    const dataHasKeys = !isStructuredArray; //structured arrays have data formatted as true arrays, tables on the other hand have objects for each element
    const precisionValue = precision !== undefined ? precision : 4;
    const tableContainerRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={tableContainerRef}
            className={`${isExpanded ? 'max-h-[48rem]' : 'max-h-96'} overflow-auto max-w-[100%] w-fit m-auto shadow-inner`}
        >
            {isLoading ? (
                <div className="flex items-center justify-center w-full h-96 overflow-hidden">
                    {/* Loading Wheel */}
                    <svg
                        className="animate-spin h-10 w-10 overflow-hidden text-slate-400 m-auto my-12"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                </div>
            ) : (
                <table className="m-auto shadow-md h-full bg-white">
                    <thead className="bg-gray-200 sticky top-0 z-10">
                        <tr>
                            <th className="w-12 px-2 py-2 border-r border-gray-300 bg-gray-200 sticky left-0 z-20"></th>
                            {columns.map((col) => (
                                <th
                                    key={col}
                                    className="border border-gray-300 px-4 py-2 text-left"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {visibleData.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-100 max-h-5">
                                <td className="w-12 px-2 py-2 text-xs text-gray-400 text-center border-r bg-gray-50 sticky left-0 z-10">
                                    {rowIndex}
                                </td>
                                {dataHasKeys && Object.keys(row as TiledTableRow).length === 0 && (
                                    <td
                                        colSpan={columns.length}
                                        className="text-center text-gray-500"
                                    >
                                        No data available
                                    </td>
                                )}
                                {dataHasKeys &&
                                    Object.keys(row as TiledTableRow).length > 0 &&
                                    columns.map((col) => (
                                        <td key={col} className="border border-gray-300 px-4 py-2">
                                            {typeof (row as TiledTableRow)[col] === 'number'
                                                ? parseFloat(
                                                      (
                                                          (row as TiledTableRow)[col] as number
                                                      ).toFixed(precisionValue),
                                                  ).toString()
                                                : (row as TiledTableRow)[col]}
                                        </td>
                                    ))}
                                {!dataHasKeys &&
                                    (row as TiledStructuredArrayRow).map(
                                        (element: string | number, index: number) => (
                                            <td
                                                key={index}
                                                className="border border-gray-300 px-4 py-2"
                                            >
                                                {typeof element === 'number'
                                                    ? parseFloat(
                                                          element.toFixed(precisionValue),
                                                      ).toString()
                                                    : element}
                                            </td>
                                        ),
                                    )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* infinite scroll effect - when scroll approaches observerRef more values are loaded */}
            <div ref={observerRef} className=""></div>
        </div>
    );
}
