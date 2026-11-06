import { describe, expect, it } from 'vitest';
import {
    nearestPoint,
    normalizeGrid,
    pickPixel,
    resolveInputs,
} from '@/components/PlotlyMaskOverlay/hooks/useImageSources';
import type {
    ImageInput,
    MaskInput,
    ResolvedMaskClass,
    ResolvedPointLayer,
} from '@/components/PlotlyMaskOverlay/types';

// A 2 x 3 frame: values 0..5, row-major. Pixel (row i, column j) is centred at (x = j, y = i).
const imageGrid = normalizeGrid(new Float32Array([0, 1, 2, 3, 4, 5]), 2, 3);
const base = {
    imageSize: [2, 3] as [number, number],
    imageGrid,
    labelGrid: null,
    maskShape: undefined,
    resolvedClasses: [] as ResolvedMaskClass[],
};

describe('pickPixel', () => {
    it.each([
        [0, 0, 0, 0],
        [0.49, 0.49, 0, 0],
        [0.5, 0, 1, 0], // a pixel edge belongs to the pixel to its right / below
        [-0.5, -0.5, 0, 0], // the outer top-left edge is inside
        [2.4, 1.4, 2, 1],
        [1.6, 0.6, 2, 1],
    ])('maps (%s, %s) to the nearest pixel centre (%s, %s)', (fx, fy, x, y) => {
        expect(pickPixel(fx, fy, base)).toMatchObject({ x, y, value: y * 3 + x });
    });

    it.each([
        [-0.51, 0],
        [0, -0.51],
        [2.5, 0],
        [0, 1.5],
    ])('returns null outside the frame at (%s, %s)', (fx, fy) => {
        expect(pickPixel(fx, fy, base)).toBeNull();
    });

    it('reads the class at the same detector pixel, and never from a mask of another shape', () => {
        const classes: ResolvedMaskClass[] = [
            { id: 7, label: 'Gap', color: '#ff0000', visible: true, opacity: 1 },
        ];
        const sources = {
            ...base,
            labelGrid: normalizeGrid([0, 0, 0, 0, 0, 7], 2, 3),
            maskShape: [2, 3] as [number, number],
            resolvedClasses: classes,
        };
        expect(pickPixel(2, 1, sources)).toMatchObject({ x: 2, y: 1, classId: 7, label: 'Gap' });
        expect(pickPixel(2, 0, sources)).toMatchObject({ classId: null });

        // A 1 x 3 mask over a 2 x 3 frame is not stretched onto it.
        const lowRes = {
            ...sources,
            labelGrid: normalizeGrid([0, 0, 7], 1, 3),
            maskShape: [1, 3] as [number, number],
        };
        expect(pickPixel(2, 0, lowRes)).toMatchObject({ x: 2, y: 0, classId: null, value: 2 });
    });

    describe('hidden classes', () => {
        const cls = (id: number, visible: boolean): ResolvedMaskClass => ({
            id,
            label: `Class ${id}`,
            color: '#ffffff',
            visible,
            opacity: 1,
        });
        // Class 2 covers pixel (1, 0) on top of class 1, which covers the whole row.
        const maskLayers = [
            { classId: 1, data: new Uint8Array([1, 1, 1, 0, 0, 0]) },
            { classId: 2, data: new Uint8Array([0, 1, 0, 0, 0, 0]) },
        ];
        const layered = { ...base, maskLayers, maskShape: [2, 3] as [number, number] };

        it('reports the topmost visible binary mask', () => {
            const sources = { ...layered, resolvedClasses: [cls(1, true), cls(2, true)] };
            expect(pickPixel(1, 0, sources)).toMatchObject({ classId: 2 });
        });

        it('skips a hidden binary mask and reports the visible one beneath it', () => {
            const sources = { ...layered, resolvedClasses: [cls(1, true), cls(2, false)] };
            expect(pickPixel(1, 0, sources)).toMatchObject({ classId: 1, label: 'Class 1' });
            expect(pickPixel(0, 1, sources)).toMatchObject({ classId: null });
        });

        it('reports no class for a hidden label, since nothing lies beneath it', () => {
            const sources = {
                ...base,
                labelGrid: normalizeGrid([1, 2, 1, 0, 0, 0], 2, 3),
                maskShape: [2, 3] as [number, number],
                resolvedClasses: [cls(1, true), cls(2, false)],
            };
            expect(pickPixel(1, 0, sources)).toMatchObject({ classId: null });
            expect(pickPixel(0, 0, sources)).toMatchObject({ classId: 1 });
        });
    });
});

describe('resolveInputs', () => {
    const flat: ImageInput = { type: 'array', data: new Float32Array(6), shape: [2, 3] };
    const rows: ImageInput = {
        type: 'array',
        data: [
            [0, 0, 0],
            [0, 0, 0],
        ],
    };
    const png: ImageInput = { type: 'url', url: 'scan.png', shape: [2, 3] };

    it('takes the frame from the image and accepts a mask that fits, without warnings', () => {
        const a = resolveInputs(flat, { type: 'labels', data: new Uint8Array(6) });
        expect(a).toMatchObject({ frame: [2, 3], maskShape: [2, 3], warnings: [] });
        expect(a.imageGrid?.shape).toEqual([2, 3]);

        const layers = [{ classId: 1, data: new Uint8Array(6) }];
        const b = resolveInputs(rows, { type: 'layers', layers });
        expect(b).toMatchObject({
            frame: [2, 3],
            maskShape: [2, 3],
            maskLayers: layers,
            warnings: [],
        });

        const c = resolveInputs(png, { type: 'labels', data: new Uint8Array(6) });
        expect(c).toMatchObject({
            frame: [2, 3],
            imageGrid: null,
            maskShape: [2, 3],
            warnings: [],
        });
    });

    it('draws no mask without a valid frame, and warns only about the image', () => {
        for (const mask of [
            { type: 'labels', data: new Uint8Array(6) },
            { type: 'layers', layers: [{ classId: 1, data: new Uint8Array(6) }] },
        ] as MaskInput[]) {
            const r = resolveInputs(undefined, mask);
            expect(r).toMatchObject({ frame: null, labelGrid: null });
            expect(r.maskShape).toBeUndefined();
            expect(r.warnings).toEqual([expect.stringContaining("must be { type: 'array' }")]);
        }
        const r = resolveInputs({ ...flat, shape: [2, 2] }, { type: 'labels', data: [] });
        expect(r.frame).toBeNull();
        expect(r.warnings).toEqual([expect.stringContaining('6 values but 2 × 2 needs 4')]);
    });

    it('points a mask PNG passed as a mask to imageLayers', () => {
        const r = resolveInputs(png, { type: 'url', url: 'mask.png' } as never);
        expect(r.maskShape).toBeUndefined();
        expect(r.warnings).toEqual([expect.stringContaining('pass it in `imageLayers`')]);
    });

    it('rejects arrays that do not fit, never resampling or padding them', () => {
        const short = resolveInputs({ ...flat, data: new Float32Array(5) });
        expect(short.imageGrid).toBeNull();
        expect(short.warnings).toEqual([expect.stringContaining('5 values but 2 × 3 needs 6')]);

        const ragged = resolveInputs({
            type: 'array',
            data: [
                [1, 2, 3],
                [4, 5],
            ],
        });
        expect(ragged.imageGrid).toBeNull();
        expect(ragged.warnings).toEqual([expect.stringContaining('same length')]);

        const mask = resolveInputs(flat, { type: 'labels', data: [[1, 0, 2]] });
        expect(mask.labelGrid).toBeNull();
        expect(mask.maskShape).toBeUndefined();
        expect(mask.warnings).toEqual([expect.stringContaining('1 × 3 but 2 × 3 was expected')]);

        const layer = resolveInputs(flat, {
            type: 'layers',
            layers: [{ classId: 7, data: new Uint8Array(12) }],
        });
        expect(layer.maskLayers).toBeUndefined();
        expect(layer.warnings).toEqual([expect.stringContaining('class 7 has 12 values')]);
    });

    it('rejects a huge or malformed shape before allocating anything', () => {
        // Accepting either would mean a 10-gigapixel buffer; both are rejected from the lengths alone.
        const huge = resolveInputs(
            { type: 'array', data: new Float32Array(6), shape: [100_000, 100_000] },
            { type: 'labels', data: new Uint8Array(6) },
        );
        expect(huge).toMatchObject({ frame: null, imageGrid: null, labelGrid: null });
        expect(huge.warnings).toEqual([expect.stringContaining('needs 10000000000')]);

        for (const shape of [[2.5, 3], [-2, 3], [NaN, 3], [2]] as never[]) {
            const bad = resolveInputs({ type: 'url', url: 'scan.png', shape });
            expect(bad.frame).toBeNull();
            expect(bad.warnings).toHaveLength(1);
        }

        // A PNG may name a huge frame, but a mask must still fill it exactly.
        const bigFrame = resolveInputs(
            { type: 'url', url: 'scan.png', shape: [100_000, 100_000] },
            { type: 'labels', data: new Uint8Array(6) },
        );
        expect(bigFrame.frame).toEqual([100_000, 100_000]);
        expect(bigFrame.labelGrid).toBeNull();
        expect(bigFrame.maskShape).toBeUndefined();
    });

    it('rejects a flat array without a shape and an unknown type (JavaScript callers)', () => {
        const noShape = resolveInputs({ type: 'array', data: new Float32Array(6) } as never);
        expect(noShape.imageGrid).toBeNull();
        expect(noShape.warnings).toEqual([expect.stringContaining('needs `shape`')]);

        const unknown = resolveInputs(
            { type: 'png', url: 'x' } as never,
            { type: 'blob' } as never,
        );
        expect(unknown.frame).toBeNull();
        expect(unknown.warnings).toEqual([expect.stringContaining('not "png"')]);
    });
});

describe('nearestPoint', () => {
    const layer = (id: string, xy: number[], extra: Partial<ResolvedPointLayer> = {}) =>
        ({
            id,
            xy,
            count: xy.length / 2,
            color: '#fff',
            symbol: 'x',
            size: 6,
            strokeWidth: 1,
            visible: true,
            hoverable: true,
            ...extra,
        }) as ResolvedPointLayer;
    const tenPx = { x: 10, y: 10 };

    it('measures on screen, from the marker edge, and picks the nearest', () => {
        const layers = [layer('a', [0, 0, 3, 0])];
        // 1 image pixel at 10 CSS px per pixel is 10 px from the centre, 7 px from the edge.
        expect(nearestPoint(layers, 1, 0, tenPx, 20)).toMatchObject({ layerId: 'a', index: 0 });
        expect(nearestPoint(layers, 2, 0, tenPx, 20)).toMatchObject({ index: 1 });
        // 2.4 pixels away is 24 - 3 = 21 px from the edge.
        expect(nearestPoint([layer('a', [0, 0])], 2.4, 0, tenPx, 20)).toBeNull();
        // Zoomed out to 1 CSS px per pixel, the same tolerance covers 23 image pixels.
        expect(nearestPoint([layer('a', [0, 0])], 22, 0, { x: 1, y: 1 }, 20)).not.toBeNull();
    });

    it('skips hidden and non-hoverable layers', () => {
        const hidden = layer('h', [0, 0], { visible: false });
        const silent = layer('s', [0, 0], { hoverable: false });
        expect(nearestPoint([hidden, silent], 0, 0, tenPx, 20)).toBeNull();
    });

    // These follow plotly.js 2.35 (`traces/scatter/hover.js`, `traces/scattergl/hover.js`), so the
    // point reported is the one Plotly's tooltip shows.
    it('prefers the smaller marker when the pointer is inside several, as Plotly does', () => {
        // The pointer is 0.15 px from a small spot and 0.5 px from a large cross: inside both.
        const spot = layer('spot', [0, 0], { size: 4 });
        const cross = layer('cross', [0.065, 0], { size: 14 });
        expect(nearestPoint([spot, cross], 0.015, 0, tenPx, 20)?.layerId).toBe('spot');
        expect(nearestPoint([cross, spot], 0.015, 0, tenPx, 20)?.layerId).toBe('spot');
    });

    it('keeps the later point and layer on an SVG tie, as Plotly does', () => {
        // Two equal spots, both under the pointer: the same distance for Plotly.
        expect(nearestPoint([layer('a', [0, 0, 0.1, 0])], 0.05, 0, tenPx, 20)?.index).toBe(1);
        const below = layer('below', [0, 0]);
        const above = layer('above', [0, 0]);
        expect(nearestPoint([below, above], 0, 0, tenPx, 20)?.layerId).toBe('above');
    });

    it('picks the nearest centre once the layers are drawn with WebGL, as Plotly does', () => {
        // More than 5000 points in all: Plotly's WebGL hover measures to the centre, without
        // the marker radius, and only within the tolerance of it.
        const filler = layer(
            'filler',
            Array.from({ length: 2 * 5000 }, () => 500),
        );
        const spots = layer('spots', [0, 0, 0.2, 0], { size: 4 });
        // Inside both 3 px markers; the second centre is nearer.
        expect(nearestPoint([filler, spots], 0.15, 0, tenPx, 20)?.index).toBe(1);
        // 2.2 image pixels is 22 px from the centre: beyond 20 px, although the edge is 19 px away.
        expect(nearestPoint([filler, layer('one', [0, 0])], 2.2, 0, tenPx, 20)).toBeNull();
        // The same in SVG: within 20 px of the edge.
        expect(nearestPoint([layer('one', [0, 0])], 2.2, 0, tenPx, 20)).not.toBeNull();
    });
});
