import { useEffect, useMemo, useRef, useState } from 'react';
import {
    binaryMasksToRgba,
    labelsToRgba,
    rgbaToObjectUrl,
    type RgbaBuffer,
} from '@/utils/maskRaster';
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

/** A decoded image, the URL it was loaded from, and the reset key it was loaded under. */
export type LoadedLayerImage = { image: HTMLImageElement; url: string; key: string };

/** Options of {@link useLoadedImages}. Callbacks are read through a ref, so inline functions are fine. */
export type UseLoadedImagesOptions = {
    /** When this changes, every decoded image and pending load is dropped and all URLs reload. */
    resetKey?: string;
    /** Called when an id starts loading a URL. */
    onLoadStart?: (id: string, url: string) => void;
    /** Called when an id's current URL has decoded. */
    onLoad?: (id: string, loaded: LoadedLayerImage) => void;
    /** Called when an id's current URL fails to load. The id's previous image is dropped. */
    onError?: (message: string, id: string) => void;
};

/**
 * Loads several image URLs, keyed by id, with `crossOrigin = 'anonymous'` as Plotly uses for
 * its own load, so both requests share the browser cache and succeed or fail together.
 *
 * - Only ids whose URL changed are (re)loaded, so changing one layer never refetches the others.
 * - Each id keeps its previous image until its new URL decodes, so a layer whose URL changes
 *   (for example a debounced preview) never flashes empty.
 * - Only the newest URL per id counts: a slower, older load that finishes later is ignored.
 * - A failed URL drops the id's previous image, so a stale picture is never shown as current.
 * - A new `resetKey` drops everything at once: the returned map never holds an image loaded
 *   under a previous key, even in the render where the key changes.
 */
export function useLoadedImages(
    layers: ReadonlyArray<{ id: string; url: string }>,
    { resetKey = '', onLoadStart, onLoad, onError }: UseLoadedImagesOptions = {},
): Map<string, LoadedLayerImage> {
    const [images, setImages] = useState<Map<string, LoadedLayerImage>>(() => new Map());
    const callbacks = useRef({ onLoadStart, onLoad, onError });
    callbacks.current = { onLoadStart, onLoad, onError };
    /** The URL each id currently wants, under `requestedKey`. A load for anything else is stale. */
    const requested = useRef(new Map<string, string>());
    const requestedKey = useRef<string | null>(null);
    const signature = layers.map((l) => `${l.id}\u0000${l.url}`).join('\u0001');

    useEffect(() => {
        if (requestedKey.current !== resetKey) {
            requestedKey.current = resetKey;
            requested.current.clear();
        }
        const wanted = new Map(layers.map((l) => [l.id, l.url]));
        for (const id of [...requested.current.keys()]) {
            if (!wanted.has(id)) requested.current.delete(id);
        }
        setImages((prev) => {
            const next = new Map(
                [...prev].filter(([id, img]) => wanted.has(id) && img.key === resetKey),
            );
            return next.size === prev.size ? prev : next;
        });
        for (const [id, url] of wanted) {
            if (requested.current.get(id) === url) continue;
            requested.current.set(id, url);
            const key = resetKey;
            const current = () => requestedKey.current === key && requested.current.get(id) === url;
            callbacks.current.onLoadStart?.(id, url);
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                if (!current()) return;
                const loaded = { image: img, url, key };
                setImages((prev) => new Map(prev).set(id, loaded));
                callbacks.current.onLoad?.(id, loaded);
            };
            img.onerror = () => {
                if (!current()) return;
                setImages((prev) => {
                    if (!prev.has(id)) return prev;
                    const next = new Map(prev);
                    next.delete(id);
                    return next;
                });
                callbacks.current.onError?.(`Failed to load ${url.split(/[?#]/)[0]}`, id);
            };
            img.src = url;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signature, resetKey]);

    // Loads still in flight after unmount must not set state.
    useEffect(() => {
        const pending = requested.current;
        return () => {
            pending.clear();
            requestedKey.current = null;
        };
    }, []);

    // Images from a previous key are hidden in the same render the key changes.
    return useMemo(() => {
        const stale = [...images.values()].some((img) => img.key !== resetKey);
        return stale ? new Map([...images].filter(([, img]) => img.key === resetKey)) : images;
    }, [images, resetKey]);
}

/**
 * A PNG object URL for an RGBA buffer, re-encoded when the buffer changes. Each URL is revoked
 * once its replacement is on screen, or on unmount, so the picture never points at a revoked
 * URL. `null` without a buffer or when encoding fails.
 */
export function useRgbaObjectUrl(buffer: RgbaBuffer | null): string | null {
    const [url, setUrl] = useState<string | null>(null);
    useEffect(() => {
        if (!buffer) {
            setUrl(null);
            return;
        }
        let cancelled = false;
        rgbaToObjectUrl(buffer)
            .then((next) => {
                if (cancelled) URL.revokeObjectURL(next);
                else setUrl(next);
            })
            .catch(() => {
                if (!cancelled) setUrl(null);
            });
        return () => {
            cancelled = true;
        };
    }, [buffer]);
    useEffect(
        () => () => {
            if (url) URL.revokeObjectURL(url);
        },
        [url],
    );
    return url;
}
