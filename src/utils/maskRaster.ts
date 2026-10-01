/**
 * Rasterization helpers: turning label arrays, binary masks and raw intensity
 * data into RGBA pixel buffers.
 *
 * These deliberately return a plain `RgbaBuffer` rather than an `ImageData`.
 * `ImageData` is a DOM class and is unavailable under jsdom, so returning one
 * would make these functions impossible to unit test. The component wraps the
 * buffer at draw time, where a real DOM is present anyway.
 */

import { colormapLut, hexToRgb } from '@/utils/colorUtils';
import type { MaskLayer, ResolvedMaskClass } from '@/components/MaskOverlayCanvas/types';

/** A row-major RGBA pixel buffer. `data.length` is `width * height * 4`. */
export type RgbaBuffer = {
    /** Interleaved RGBA bytes. */
    data: Uint8ClampedArray;
    /** Width in pixels. */
    width: number;
    /** Height in pixels. */
    height: number;
};

/** Options accepted by {@link arrayToRgba}. */
export type ArrayToRgbaOptions = {
    /** Colormap id from `COLORMAPS`. Defaults to `'gray'`. */
    colormap?: string;
    /** Display range as `[min, max]`. Defaults to the extent of the finite data. */
    domain?: [number, number];
    /** Apply `log10` to positive values before normalizing. Defaults to `false`. */
    log?: boolean;
};

/**
 * Renders a label array to RGBA.
 *
 * Each pixel takes the color of the class matching its label value. Pixels whose
 * label matches no class, or matches a class with `visible: false`, are left fully
 * transparent. Per-class `opacity` goes into the alpha channel; the global mask
 * opacity does not — that is applied once when the layer is composited, so that
 * changing it is a redraw rather than a re-rasterize.
 */
export function labelsToRgba(
    labels: ArrayLike<number>,
    width: number,
    height: number,
    classes: ResolvedMaskClass[],
): RgbaBuffer {
    const data = new Uint8ClampedArray(width * height * 4);

    // Dense lookup keyed by label value, so the per-pixel loop is a single index
    // rather than a search through `classes`.
    const byId = new Map<number, { r: number; g: number; b: number; a: number }>();
    for (const cls of classes) {
        if (!cls.visible) continue;
        const [r, g, b] = hexToRgb(cls.color);
        byId.set(cls.id, { r, g, b, a: Math.max(0, Math.min(1, cls.opacity)) * 255 });
    }
    if (byId.size === 0) return { data, width, height };

    const pixels = Math.min(labels.length, width * height);
    for (let i = 0; i < pixels; i += 1) {
        const entry = byId.get(labels[i]);
        if (entry === undefined) continue;
        const o = i * 4;
        data[o] = entry.r;
        data[o + 1] = entry.g;
        data[o + 2] = entry.b;
        data[o + 3] = entry.a;
    }

    return { data, width, height };
}

/**
 * Renders a set of per-class binary masks to RGBA.
 *
 * Layers are drawn in array order, so where two masks overlap the later one wins —
 * the same "last writer on top" rule a label array gives you implicitly. Hidden
 * classes and layers with no matching class are skipped.
 */
export function binaryMasksToRgba(
    masks: MaskLayer[],
    width: number,
    height: number,
    classes: ResolvedMaskClass[],
): RgbaBuffer {
    const data = new Uint8ClampedArray(width * height * 4);
    const byId = new Map(classes.map((c) => [c.id, c]));
    const capacity = width * height;

    for (const layer of masks) {
        const cls = byId.get(layer.classId);
        if (!cls || !cls.visible) continue;
        const [r, g, b] = hexToRgb(cls.color);
        const a = Math.max(0, Math.min(1, cls.opacity)) * 255;
        const pixels = Math.min(layer.data.length, capacity);
        for (let i = 0; i < pixels; i += 1) {
            if (!layer.data[i]) continue;
            const o = i * 4;
            data[o] = r;
            data[o + 1] = g;
            data[o + 2] = b;
            data[o + 3] = a;
        }
    }

    return { data, width, height };
}

/**
 * Color-maps a raw intensity array to opaque RGBA.
 *
 * Mirrors the server-side rendering used by the calibration backend: optional
 * `log10` of positive values, clip-normalize into `domain`, then a lookup-table
 * read. Non-finite samples are treated as the domain minimum so a stray `NaN`
 * renders as the low end of the colormap rather than a transparent hole.
 */
export function arrayToRgba(
    values: ArrayLike<number>,
    width: number,
    height: number,
    options: ArrayToRgbaOptions = {},
): RgbaBuffer {
    const { colormap = 'gray', domain, log = false } = options;
    const data = new Uint8ClampedArray(width * height * 4);
    const lut = colormapLut(colormap);
    const pixels = Math.min(values.length, width * height);

    const transform = (v: number) => (log && v > 0 ? Math.log10(v) : v);

    let lo: number;
    let hi: number;
    if (domain) {
        lo = transform(domain[0]);
        hi = transform(domain[1]);
    } else {
        lo = Infinity;
        hi = -Infinity;
        for (let i = 0; i < pixels; i += 1) {
            const v = transform(values[i]);
            if (!Number.isFinite(v)) continue;
            if (v < lo) lo = v;
            if (v > hi) hi = v;
        }
        if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
            lo = 0;
            hi = 1;
        }
    }

    const span = hi - lo;
    for (let i = 0; i < pixels; i += 1) {
        const v = transform(values[i]);
        // A flat domain maps everything to the bottom of the colormap, matching
        // how a zero-range image renders server-side.
        const t = !Number.isFinite(v) || span <= 0 ? 0 : Math.max(0, Math.min(1, (v - lo) / span));
        const idx = Math.round(t * 255) * 3;
        const o = i * 4;
        data[o] = lut[idx];
        data[o + 1] = lut[idx + 1];
        data[o + 2] = lut[idx + 2];
        data[o + 3] = 255;
    }

    return { data, width, height };
}
