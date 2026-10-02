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
import { valueRange } from '@/utils/histogramUtils';
import type { MaskLayer, ResolvedMaskClass } from '@/components/MaskOverlayCanvas/types';

/** Largest class id handled by the dense lookup table in {@link labelsToRgba}. */
const MAX_DENSE_LABEL = 65535;

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
    /**
     * Display range as `[min, max]` in data units. Defaults to the extent of the
     * finite data. Under `log` a lower bound at or below zero does not set the
     * bottom of the colormap: it becomes the smallest positive sample within the
     * domain. A positive lower bound is used exactly.
     */
    domain?: [number, number];
    /**
     * Apply `log10` before normalizing. Values at or below zero are outside the
     * log domain and are painted with `underRangeColor` instead of a colormap
     * color, so `0` never shares a color with the smallest positive value.
     * Defaults to `false`.
     */
    log?: boolean;
    /**
     * RGBA (0–255 each) for non-positive pixels under `log`. Defaults to fully
     * transparent `[0, 0, 0, 0]`. Unused without `log`.
     */
    underRangeColor?: [number, number, number, number];
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
    const pixels = Math.min(labels.length, width * height);

    const visible = classes.filter((cls) => cls.visible);
    if (visible.length === 0) return { data, width, height };

    // Fast path: when every visible id is a small non-negative integer, build a
    // dense RGBA table indexed directly by label value. A typed-array read per
    // pixel is several times faster than a `Map.get` on a detector-sized mask.
    let maxId = -1;
    let dense = true;
    for (const cls of visible) {
        if (!Number.isInteger(cls.id) || cls.id < 0 || cls.id > MAX_DENSE_LABEL) {
            dense = false;
            break;
        }
        if (cls.id > maxId) maxId = cls.id;
    }

    if (dense) {
        const lut = new Uint8ClampedArray((maxId + 1) * 4);
        for (const cls of visible) {
            const [r, g, b] = hexToRgb(cls.color);
            const o = cls.id * 4;
            lut[o] = r;
            lut[o + 1] = g;
            lut[o + 2] = b;
            lut[o + 3] = Math.max(0, Math.min(1, cls.opacity)) * 255;
        }
        const lutLength = maxId + 1;
        for (let i = 0; i < pixels; i += 1) {
            const v = labels[i];
            // `v >>> 0 !== v` rejects negatives and fractions; the bound check
            // rejects labels above every class. Either way the pixel stays clear.
            // Ids inside the table with no class hold zeros, which is also clear.
            if (v >>> 0 !== v || v >= lutLength) continue;
            const s = v * 4;
            const o = i * 4;
            data[o] = lut[s];
            data[o + 1] = lut[s + 1];
            data[o + 2] = lut[s + 2];
            data[o + 3] = lut[s + 3];
        }
        return { data, width, height };
    }

    // General path for negative, fractional or very large ids: a hash lookup.
    const byId = new Map<number, { r: number; g: number; b: number; a: number }>();
    for (const cls of visible) {
        const [r, g, b] = hexToRgb(cls.color);
        byId.set(cls.id, { r, g, b, a: Math.max(0, Math.min(1, cls.opacity)) * 255 });
    }

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
 * Color-maps a raw intensity array to RGBA.
 *
 * Clip-normalizes into `domain` (after `log10` when `log` is set), then reads a
 * lookup table. Values outside the domain clamp to the ends of the colormap.
 * Under `log`, non-positive values are under-range rather than clamped, and take
 * `underRangeColor`. Non-finite samples are treated as the domain minimum so a
 * stray `NaN` renders as the low end of the colormap rather than a hole. Every
 * pixel is opaque except under-range pixels with a translucent `underRangeColor`.
 */
export function arrayToRgba(
    values: ArrayLike<number>,
    width: number,
    height: number,
    options: ArrayToRgbaOptions = {},
): RgbaBuffer {
    const { colormap = 'gray', domain, log = false, underRangeColor = [0, 0, 0, 0] } = options;
    const data = new Uint8ClampedArray(width * height * 4);
    const lut = colormapLut(colormap);
    const pixels = Math.min(values.length, width * height);

    const [lo, hi] = valueRange(values, pixels, domain, log);
    const span = hi - lo;
    for (let i = 0; i < pixels; i += 1) {
        const raw = values[i];
        const o = i * 4;
        if (log && raw <= 0) {
            data[o] = underRangeColor[0];
            data[o + 1] = underRangeColor[1];
            data[o + 2] = underRangeColor[2];
            data[o + 3] = underRangeColor[3];
            continue;
        }
        const v = log ? Math.log10(raw) : raw;
        // A flat domain maps everything to the bottom of the colormap, matching
        // how a zero-range image renders server-side.
        const t = !Number.isFinite(v) || span <= 0 ? 0 : Math.max(0, Math.min(1, (v - lo) / span));
        const idx = Math.round(t * 255) * 3;
        data[o] = lut[idx];
        data[o + 1] = lut[idx + 1];
        data[o + 2] = lut[idx + 2];
        data[o + 3] = 255;
    }

    return { data, width, height };
}
