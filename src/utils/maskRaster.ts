/**
 * Rasterization helpers: turning label arrays and binary masks into RGBA pixel
 * buffers. Detector intensities are never colour-mapped here; that is the
 * application backend's job (or Plotly's, for a small raw-array heatmap).
 *
 * These deliberately return a plain `RgbaBuffer` rather than an `ImageData`.
 * `ImageData` is a DOM class and is unavailable under jsdom, so returning one
 * would make these functions impossible to unit test. The component wraps the
 * buffer at draw time, where a real DOM is present anyway.
 */

import { hexToRgb } from '@/utils/colorUtils';
import type { MaskLayer, ResolvedMaskClass } from '@/components/PlotlyMaskOverlay/types';

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
 * Encodes an RGBA buffer as a PNG and returns an object URL for it, for renderers
 * that take images by URL (such as Plotly `layout.images`). Browser-only. The
 * caller owns the URL and must `URL.revokeObjectURL` it when done.
 */
export function rgbaToObjectUrl(buffer: RgbaBuffer): Promise<string> {
    return new Promise((resolve, reject) => {
        if (typeof document === 'undefined') {
            reject(new Error('rgbaToObjectUrl needs a DOM'));
            return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = buffer.width;
        canvas.height = buffer.height;
        const context = canvas.getContext('2d');
        if (!context) {
            reject(new Error('No 2D canvas context available'));
            return;
        }
        context.putImageData(new ImageData(buffer.data, buffer.width, buffer.height), 0, 0);
        canvas.toBlob((blob) => {
            if (blob) resolve(URL.createObjectURL(blob));
            else reject(new Error('PNG encoding failed'));
        }, 'image/png');
    });
}
