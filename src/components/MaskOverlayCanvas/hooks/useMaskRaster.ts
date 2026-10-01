import { useEffect, useMemo, useRef, useState } from 'react';
import { binaryMasksToRgba, labelsToRgba, type RgbaBuffer } from '@/utils/maskRaster';
import type { MaskLayer, ResolvedMaskClass } from '../types';

/** Inputs to {@link useMaskRaster}. */
export type UseMaskRasterOptions = {
    /** Flat row-major label array, or `undefined` when using `maskLayers`. */
    labels?: ArrayLike<number>;
    /** Per-class binary masks, or `undefined` when using `labels`. */
    maskLayers?: MaskLayer[];
    /** `[height, width]` of the mask data. */
    shape?: [number, number];
    /** Fully resolved class list, including colors and visibility. */
    classes: ResolvedMaskClass[];
};

/**
 * Rasterizes a label array or a set of binary masks into an RGBA buffer.
 *
 * Memoized on the inputs, so scrolling, resizing or changing the global mask
 * opacity re-composites without re-running the per-pixel loop.
 */
export function useMaskRaster({
    labels,
    maskLayers,
    shape,
    classes,
}: UseMaskRasterOptions): RgbaBuffer | null {
    return useMemo(() => {
        if (!shape) return null;
        const [height, width] = shape;
        if (!(width > 0) || !(height > 0)) return null;
        if (labels) return labelsToRgba(labels, width, height, classes);
        if (maskLayers && maskLayers.length > 0) {
            return binaryMasksToRgba(maskLayers, width, height, classes);
        }
        return null;
    }, [labels, maskLayers, shape, classes]);
}

/**
 * Paints an RGBA buffer onto an offscreen canvas at its native resolution.
 *
 * Kept separate from rasterization so the pure pixel work stays testable without a
 * DOM. Returns `null` when there is nothing to draw, or when no 2D context is
 * available (as under jsdom).
 */
export function useRasterCanvas(buffer: RgbaBuffer | null): HTMLCanvasElement | null {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [, forceRender] = useState(0);

    useEffect(() => {
        if (!buffer) {
            canvasRef.current = null;
            forceRender((v) => v + 1);
            return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = buffer.width;
        canvas.height = buffer.height;
        const context = canvas.getContext('2d');
        if (context) {
            // ImageData is a DOM class, so it is constructed here rather than in the
            // pure rasterizers, which must stay usable without a document.
            context.putImageData(new ImageData(buffer.data, buffer.width, buffer.height), 0, 0);
            canvasRef.current = canvas;
        } else {
            canvasRef.current = null;
        }
        forceRender((v) => v + 1);
    }, [buffer]);

    return canvasRef.current;
}

/**
 * Loads an image URL into an `HTMLImageElement`, returning it once decoded.
 *
 * Requests anonymous CORS so a cross-origin base image can be drawn without
 * tainting the canvas.
 */
export function useLoadedImage(url?: string): HTMLImageElement | null {
    const [image, setImage] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        if (!url) {
            setImage(null);
            return;
        }
        let cancelled = false;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            if (!cancelled) setImage(img);
        };
        img.onerror = () => {
            if (!cancelled) setImage(null);
        };
        img.src = url;
        return () => {
            cancelled = true;
        };
    }, [url]);

    return image;
}
