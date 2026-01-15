import ndarray from "ndarray";
import { getDomain } from "@h5web/lib";
const smallSizeDim = 50;
const medSizeDim = 100;
const largeSizeDim = 500;

const generate2DArray = (rows: number, cols: number): number[][] => {
  const array: number[][] = [];
  for (let i = 0; i < rows; i++) {
    const row: number[] = [];
    for (let j = 0; j < cols; j++) {
      row.push(Math.random() * 100); // Random value between 0 and 100
    }
    array.push(row);
  }
  return array;
};

export const smallHeatmapData = generate2DArray(smallSizeDim, smallSizeDim);
export const medHeatmapData = generate2DArray(medSizeDim, medSizeDim);
export const largeHeatmapData = generate2DArray(largeSizeDim, largeSizeDim);

export const smallH5HeatmapData = ndarray(smallHeatmapData.flat(1), [smallSizeDim, smallSizeDim]);
export const smallH5HeatmapDomain = getDomain(smallH5HeatmapData);

export const medH5HeatmapData = ndarray(medHeatmapData.flat(1), [medSizeDim, medSizeDim]);
export const medH5HeatmapDomain = getDomain(medH5HeatmapData);

export const largeH5HeatmapData = ndarray(largeHeatmapData.flat(1), [largeSizeDim, largeSizeDim]);
export const largeH5HeatmapDomain = getDomain(largeH5HeatmapData);