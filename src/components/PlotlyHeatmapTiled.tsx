import React, { useEffect, useRef, useState } from 'react';
import PlotlyHeatmap from './PlotlyHeatmap';
import { logNormalizeArray, histEqualizeArray, histEqualizeUint8Array } from '@/utils/plotProcessors';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sizeClassMap = {
    small: 'w-[400px] h-[500px]',
    medium: 'w-[700px] h-[800px]',
    large: 'w-[1000px] h-[1200px]',
};

  const fetchAndDecodePNG = async (zIndex: number | null, baseUrl: string) => {
    try {
      setError(null);

      const sliceUrl = `${baseUrl}?format=image/png&slice=${zIndex === null ? "::1,::1" : zIndex + ',::1,::1'}`;

      const response = await fetch(sliceUrl);
      if (!response.ok) throw new Error('Failed to fetch PNG image');

      const blob = await response.blob();
      const img = new Image();
      const objectURL = URL.createObjectURL(blob);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image from blob'));
        img.src = objectURL;
      });

      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas element not available');

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Unable to get 2D context');

      // Set canvas size to image size
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const { data, width, height } = ctx.getImageData(0, 0, img.width, img.height);

      // Convert RGBA to grayscale intensity
      const array2D: number[][] = [];
      for (let y = 0; y < height; y++) {
        const row: number[] = [];
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          // Simple luminance approximation
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          row.push(gray);
        }
        array2D.push(row);
      }

      setArray(array2D.reverse());
      //setArray(logNormalizeArray(array2D.reverse()));
      //setArray(histEqualizeUint8Array(array2D.reverse()))

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to load PNG slice: ${msg}`);
      setArray(null);
      setSliderIndex(0); // Reset slider index on error
      setShape(null); // Reset shape on error
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
          fetchAndDecodePNG(null, fullUrl); // load first image
        } else {
          fetchAndDecodePNG(0, fullUrl); // load first z-slice
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
        if (fullUrl) fetchAndDecodePNG(sliderIndex, fullUrl);
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
      <canvas ref={canvasRef} style={{ display: 'none' }} />
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
