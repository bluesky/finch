import React, { useEffect, useState, useRef } from 'react';
import PlotlyHeatmap from './PlotlyHeatmap';
// import { logNormalizeArray, histEqualizeArray } from '@/utils/plotProcessors';
import { cn } from '@/lib/utils';
type Props = {
  url: string | null; // Metadata URL from Tiled (e.g., /api/v1/metadata/my_image), or null for empty display
  className?: string; // Optional className for styling
  size?: 'small' | 'medium' | 'large'; // Optional size prop for styling
  enablePolling?: boolean; // Whether to poll for shape updates
  pollingIntervalMs?: number; // Polling interval in milliseconds
};

export default function PlotlyHeatmapTiled({ 
  url, 
  className, 
  size='medium', 
  enablePolling = false,
  pollingIntervalMs = 2000
}: Props) {
  const [array, setArray] = useState<number[][] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sliderIndex, setSliderIndex] = useState<number>(0);
  const [shape, setShape] = useState<number[] | null>(null);
  const [ metadata, setMetadata ] = useState<any>(null);
  
  // Track if user has manually interacted with slider
  const [userHasMovedSlider, setUserHasMovedSlider] = useState<boolean>(false);
  const initialSliderPosition = useRef<number>(0);

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
      // Assuming int32, little-endian
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
    if (!url) {
      // Handle null URL - reset state
      setError(null);
      setMetadata(null);
      setShape(null);
      setSliderIndex(0);
      setUserHasMovedSlider(false);
      initialSliderPosition.current = 0;
      setArray(null);
      return;
    }

    const fetchMetadata = async () => {
      try {
        const resp = await fetch(url);
        const json = await resp.json();
        const shape = json.data?.attributes?.structure?.shape;
        const fullUrl = json.data?.links?.full;
        setMetadata(json.data);

        if (!shape || !fullUrl) throw new Error('Invalid metadata response');

        setShape(shape);
        setSliderIndex(0);
        setUserHasMovedSlider(false);
        initialSliderPosition.current = 0;
        
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
    if (shape && url) {
      const fetchSlice = async () => {
        const metadataResp = await fetch(url);
        const metadataJson = await metadataResp.json();
        const fullUrl = metadataJson.data?.links?.full;
        if (fullUrl) fetchAndDecodeBlock(sliderIndex, fullUrl, shape);
      };
      fetchSlice();
    }
  }, [sliderIndex]);

  // Polling effect for shape updates
  useEffect(() => {
    if (!enablePolling || !url) return;

    const pollForShapeChanges = async () => {
      console.log({enablePolling})
      console.log(`[PlotlyHeatmapTiled] Polling for shape changes at ${url}...`);
      try {
        const resp = await fetch(url);
        const json = await resp.json();
        const newShape = json.data?.attributes?.structure?.shape;
        const fullUrl = json.data?.links?.full;

        if (newShape && shape) {
          // Check if shape has changed (specifically the number of frames for 3D arrays)
          const shapeChanged = newShape.length !== shape.length || 
                              (newShape.length === 3 && newShape[0] !== shape[0]);
          
          if (shapeChanged) {
            console.log(`[PlotlyHeatmapTiled] Shape changed from ${JSON.stringify(shape)} to ${JSON.stringify(newShape)}`);
            setShape(newShape);
            
            // Only fetch and decode if user hasn't moved the slider
            if (!userHasMovedSlider && fullUrl) {
              console.log(`[PlotlyHeatmapTiled] Auto-updating to latest frame`);
              const latestFrameIndex = newShape.length === 3 ? newShape[0] - 1 : 0;
              setSliderIndex(latestFrameIndex);
              initialSliderPosition.current = latestFrameIndex;
              fetchAndDecodeBlock(latestFrameIndex, fullUrl, newShape);
            }
          }
        }
      } catch (err) {
        console.warn(`[PlotlyHeatmapTiled] Error polling for shape changes:`, err);
      }
    };

    const interval = setInterval(pollForShapeChanges, pollingIntervalMs);
    return () => clearInterval(interval);
  }, [enablePolling, url, shape, userHasMovedSlider, pollingIntervalMs]);

  return (
    <section className={cn(`flex flex-col items-center gap-4 max-h-full max-w-full p-2 rounded-md ${error ? "border-slate-400 border bg-slate-500" : "bg-white"}  ${sizeClassMap[size]}`, className)}>
      {(error || !url) && 
        <div className="flex flex-col">
          <h2 className="text-5xl font-medium text-center mt-24">Select image from Tiled to display as a heatmap</h2>
          <p className="mt-12 text-sm text-center">Unable to display current url path: "{url || 'No URL provided'}"</p>
          <p className="text-sm text-center">{error}</p>
        </div>
      }
      {array && (
        <>
          <h3 className="h-8 text-sky-900 text-ellipsis">{metadata?.id || 'No data available'}</h3>
          <div className={`w-full ${shape?.length === 3 ? 'h-[calc(100%-6rem)]' : 'h-full'}`}>
            <PlotlyHeatmap
              array={array}
              lockPlotHeightToParent={true}
              lockPlotWidthHeightToInputArray={false}
              colorScale='Viridis'
              showTicks={false}
              showScale={true}
              enableLogScale={true}
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
            onChange={(e) => {
              const newIndex = Number(e.target.value);
              setSliderIndex(newIndex);
              
              // Track if user has manually moved the slider
              if (newIndex !== initialSliderPosition.current) {
                setUserHasMovedSlider(true);
                console.log(`[PlotlyHeatmapTiled] User moved slider to position ${newIndex}`);
              }
            }}
            className="w-full"
          />
          <div className="text-center text-sm text-gray-600">
            Z-slice: {sliderIndex} of {shape[0] - 1}
            {enablePolling && !userHasMovedSlider && (
              <span className="ml-2 text-xs text-blue-600">
                (Auto-updating)
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
