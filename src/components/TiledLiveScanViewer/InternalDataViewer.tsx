import React, { useEffect, useState } from "react";
import PlotlyHeatmap from "../PlotlyHeatmap";
import { getTableData } from "../Tiled/apiClient";

interface InternalDataViewerProps {
  uid: string;
  xValues?: string;
  yValues?: string;
  intensityValues?: string;
  isScanComplete: boolean;
  pollingIntervalMs: number;
}

export default function InternalDataViewer({
  uid,
  xValues = "sampleholder_x",
  yValues = "sampleholder_y",
  intensityValues = "beamstop_diode",
  isScanComplete,
  pollingIntervalMs
}: InternalDataViewerProps) {
const [tableData, setTableData] = useState<{ [key: string]: any }[]>([]);
//   useEffect(() => {
//     if (!uid) return;

//     getTableData(
//       `${uid}/primary/internal/events`,
//       0,
//       (parsedData: object[]) => {
//         setTableData(parsedData);
//       }
//     );
//   }, [uid]);


  useEffect(() => {
    if (!uid) return;

    if (isScanComplete) {
        //get all data once
        getTableData(
            `${uid}/primary/internal/events`,
            0,
            (parsedData: object[]) => {
                setTableData(parsedData);
            }
        );
    } else {
        //keep pinging server for currently running scan
        const interval = setInterval(() => {
            getTableData(
                `${uid}/primary/internal/events`,
                0,
                (parsedData: object[]) => {
                    setTableData(parsedData);
                }
            );
        }, pollingIntervalMs);
    
        return () => clearInterval(interval);
    }
  }, [pollingIntervalMs, isScanComplete]);

  // Extract and sort unique X and Y values
  const uniqueX = Array.from(
    new Set(tableData.map((row: any) => row[xValues]))
  ).sort((a, b) => a - b);

  const uniqueY = Array.from(
    new Set(tableData.map((row: any) => row[yValues]))
  ).sort((a, b) => a - b);

  // Create a 2D array (zArray) where rows are Y, columns are X
  const zArray: number[][] = uniqueY.map((yVal) =>
    uniqueX.map((xVal) => {
      const match = tableData.find(
        (row: any) => row[xValues] === xVal && row[yValues] === yVal
      );
      return match ? match[intensityValues] : NaN; // or 0
    })
  );

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded border">
      <h3 className="text-lg font-medium text-gray-800 mb-2">Internal Table Data</h3>
      <div className="text-sm font-mono text-gray-700 whitespace-pre-wrap overflow-x-auto max-h-[500px] overflow-y-auto bg-white p-4 rounded">
        {tableData.length > 0 ? (
          <pre>{JSON.stringify(tableData.slice(0, 5), null, 2)}...</pre> // Show preview
        ) : (
          <p className="text-gray-500">No internal data available.</p>
        )}
      </div>
      <div className="w-[500px] h-[500px] mt-4">
        {zArray.length > 0 && (
          <PlotlyHeatmap
            array={zArray}
            xArray={uniqueX}
            yArray={uniqueY}
            xAxisTitle={xValues}
            yAxisTitle={yValues}
            showTicks={true}
            showScale={true}
            lockPlotHeightToParent={true}
          />
        )}
      </div>
    </div>
  );
}
