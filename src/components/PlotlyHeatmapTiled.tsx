import React, { useEffect, useState } from 'react';
import PlotlyHeatmap from './PlotlyHeatmap';
// import { logNormalizeArray, histEqualizeArray } from '@/utils/plotProcessors';
import { cn } from '@/lib/utils';
type Props = {
  url: string; // Metadata URL from Tiled (e.g., /api/v1/metadata/my_image)
  className?: string; // Optional className for styling
  size?: 'small' | 'medium' | 'large'; // Optional size prop for styling
};

export default function PlotlyHeatmapTiled({ url, className, size='medium' }: Props) {
  const [array, setArray] = useState<number[][] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sliderIndex, setSliderIndex] = useState<number>(0);
  const [shape, setShape] = useState<number[] | null>(null);
  const [ metadata, setMetadata ] = useState<any>(null);

  const sizeClassMap = {
    small: 'w-[400px] h-[500px]',
    medium: 'w-[700px] h-[800px]',
    large: 'w-[1000px] h-[1200px]',
};

  const fetchAndDecodeBlock = async (frameIndex: number, blockUrl: string, shape: number[]) => {
    try {
      setError(null);

      // Construct block URL - for 3D array [frames, height, width], we want block=frameIndex,0,0
      // For 2D array [height, width], we want block=0,0
      const blockParam = shape.length === 3 ? `${frameIndex},0,0` : '0,0';
      const fullBlockUrl = `${blockUrl}?block=${blockParam}`;

      const response = await fetch(fullBlockUrl);
      if (!response.ok) throw new Error(`Failed to fetch block data: ${response.status}`);

      const arrayBuffer = await response.arrayBuffer();
      
      // Parse binary data based on structure from metadata
      // Assuming int32, little-endian based on your JSON structure
      const dataView = new DataView(arrayBuffer);
      const pixelCount = shape.length === 3 ? shape[1] * shape[2] : shape[0] * shape[1];
      
      // Read int32 values (4 bytes each) in little-endian format
      const flatArray: number[] = [];
      for (let i = 0; i < pixelCount; i++) {
        const value = dataView.getInt32(i * 4, true); // true for little-endian
        flatArray.push(value);
      }

      // Convert flat array to 2D array
      const height = shape.length === 3 ? shape[1] : shape[0];
      const width = shape.length === 3 ? shape[2] : shape[1];
      
      const array2D: number[][] = [];
      for (let y = 0; y < height; y++) {
        const row: number[] = [];
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          row.push(flatArray[idx]);
        }
        array2D.push(row);
      }

      setArray(array2D);
      // Uncomment these for data processing:
      // setArray(logNormalizeArray(array2D));
      // setArray(histEqualizeArray(array2D));

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to load block data: ${msg}`);
      setArray(null);
      setSliderIndex(0);
      setShape(null);
    }
  };

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const resp = await fetch(url);
        const json = await resp.json();
        const shape = json.data?.attributes?.structure?.shape;
        const fullUrl = json.data?.links?.full;
        setMetadata(json.data);

        if (!shape || !fullUrl) throw new Error('Invalid metadata response');

        setShape(shape);
        if (shape.length === 2) {
          //2d image
          fetchAndDecodeBlock(0, fullUrl, shape); // load single frame
        } else {
          fetchAndDecodeBlock(0, fullUrl, shape); // load first z-slice
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(`Failed to load metadata: ${msg}`);
        setArray(null);
      }
    };

    fetchMetadata();
  }, [url]);

  useEffect(() => {
    if (shape) {
      const fetchSlice = async () => {
        const metadataResp = await fetch(url);
        const metadataJson = await metadataResp.json();
        const fullUrl = metadataJson.data?.links?.full;
        if (fullUrl) fetchAndDecodeBlock(sliderIndex, fullUrl, shape);
      };
      fetchSlice();
    }
  }, [sliderIndex]);

  return (
    <section className={cn(`flex flex-col items-center gap-4 max-h-full max-w-full p-2 rounded-md ${error ? "border-slate-400 border bg-slate-500" : "bg-white"}  ${sizeClassMap[size]}`, className)}>
      {error && 
        <div className="flex flex-col">
          <h2 className="text-5xl font-medium text-center mt-24">Select image from Tiled to display as a heatmap</h2>
          <p className="mt-12 text-sm text-center">Unable to display current url path: "{url}"</p>
          <p className="text-sm text-center">{error}</p>
        </div>
      }
      {array && (
        <>
          <h3 className="h-8 text-sky-900 text-ellipsis">{metadata?.id}</h3>
          <div className={`w-full ${shape?.length === 3 ? 'h-[calc(100%-6rem)]' : 'h-full'}`}>
            <PlotlyHeatmap
              array={array}
              lockPlotHeightToParent={true}
              lockPlotWidthHeightToInputArray={false}
              colorScale='Viridis'
              showTicks={false}
              showScale={true}
              />
          </div>
        </>
      )}
      {shape?.length === 3 && (
        <div className="w-full px-8 h-12">
          <input
            type="range"
            min={0}
            max={shape[0] - 1}
            value={sliderIndex}
            onChange={(e) => setSliderIndex(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-center text-sm text-gray-600">Z-slice: {sliderIndex} of {shape[0] - 1}</div>
        </div>
      )}
    </section>
  );
}
