import { useEffect, useMemo, useRef, useState } from 'react';
import { binaryMasksToRgba, labelsToRgba, type RgbaBuffer } from '@/utils/maskRaster';
import type { MaskClass, MaskLayer, ResolvedMaskClass } from '../types';

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
    const height = shape?.[0];
    const width = shape?.[1];
    return useMemo(() => {
        if (height === undefined || width === undefined) return null;
        if (!(width > 0) || !(height > 0)) return null;
        if (labels) return labelsToRgba(labels, width, height, classes);
        if (maskLayers && maskLayers.length > 0) {
            return binaryMasksToRgba(maskLayers, width, height, classes);
        }
        return null;
    }, [labels, maskLayers, height, width, classes]);
}

/**
 * Paints an RGBA buffer onto an offscreen canvas at its native resolution.
 *
 * Kept separate from rasterization so the pure pixel work stays testable without a
 * DOM. Built synchronously in a memo, so the canvas is current on the same render
 * as the buffer it came from. Returns `null` when there is nothing to draw, or
 * when no 2D context is available (as under jsdom).
 */
export function useRasterCanvas(buffer: RgbaBuffer | null): HTMLCanvasElement | null {
    return useMemo(() => {
        if (!buffer || typeof document === 'undefined') return null;
        const canvas = document.createElement('canvas');
        canvas.width = buffer.width;
        canvas.height = buffer.height;
        const context = canvas.getContext('2d');
        if (!context) return null;
        // ImageData is a DOM class, so it is constructed here rather than in the
        // pure rasterizers, which must stay usable without a document.
        context.putImageData(new ImageData(buffer.data, buffer.width, buffer.height), 0, 0);
        return canvas;
    }, [buffer]);
}

/** Options accepted by {@link useLoadedImage}. */
export type UseLoadedImageOptions = {
    /**
     * CORS mode for the request. Left unset by default, as for a plain `<img>`, so
     * servers that send no CORS headers still load.
     */
    crossOrigin?: 'anonymous' | 'use-credentials';
    /**
     * Called with a message when the image fails to load. The URL in the message
     * has its query string and fragment removed, since Tiled URLs can carry an
     * `api_key` that must not end up in logs or toasts.
     */
    onError?: (message: string) => void;
};

/** Result of {@link useLoadedImage}. */
export type LoadedImage = {
    /** The decoded image, or `null` while loading, on error, or without a URL. */
    image: HTMLImageElement | null;
    /** A message when the last load failed, otherwise `null`. */
    error: string | null;
};

/** Loads an image URL into an `HTMLImageElement`, returning it once decoded. */
export function useLoadedImage(
    url?: string,
    { crossOrigin, onError }: UseLoadedImageOptions = {},
): LoadedImage {
    const [state, setState] = useState<LoadedImage>({ image: null, error: null });

    // Held in a ref so an inline callback does not restart the load every render.
    const onErrorRef = useRef(onError);
    onErrorRef.current = onError;

    useEffect(() => {
        if (!url) {
            setState({ image: null, error: null });
            return;
        }
        let cancelled = false;
        const img = new Image();
        if (crossOrigin) img.crossOrigin = crossOrigin;
        img.onload = () => {
            if (!cancelled) setState({ image: img, error: null });
        };
        img.onerror = () => {
            if (cancelled) return;
            const message = `Failed to load ${url.split(/[?#]/)[0]}`;
            setState({ image: null, error: message });
            onErrorRef.current?.(message);
        };
        img.src = url;
        return () => {
            cancelled = true;
        };
    }, [url, crossOrigin]);

    return state;
}

/**
 * Every `MaskClass` field, listed explicitly so render equality can be checked
 * field by field. Each of these is read by the rasterizer or the legend, so two
 * class lists that agree on all of them render identically. The type check below
 * fails to compile if a field is added to `MaskClass` without being added here,
 * so a new field can never be silently ignored by {@link useStableClasses}.
 */
const RENDER_KEYS = [
    'id',
    'label',
    'color',
    'visible',
    'opacity',
] as const satisfies readonly (keyof MaskClass)[];

type MissingRenderKeys = Exclude<keyof MaskClass, (typeof RENDER_KEYS)[number]>;
// Resolves to `never` (and so fails the assignment) when a key is missing.
const RENDER_KEYS_ARE_EXHAUSTIVE: [MissingRenderKeys] extends [never] ? true : never = true;
void RENDER_KEYS_ARE_EXHAUSTIVE;

function sameClasses(a: MaskClass[], b: MaskClass[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
        for (const key of RENDER_KEYS) {
            if (a[i][key] !== b[i][key]) return false;
        }
    }
    return true;
}

/**
 * Returns the previous `classes` array when the new one is equal field by field,
 * so a consumer writing `classes={[...]}` inline does not trigger a full mask
 * re-raster on every parent render.
 */
export function useStableClasses(classes: MaskClass[] | undefined): MaskClass[] | undefined {
    const ref = useRef(classes);
    if (classes !== ref.current) {
        if (!classes || !ref.current || !sameClasses(classes, ref.current)) {
            ref.current = classes;
        }
    }
    return ref.current;
}
