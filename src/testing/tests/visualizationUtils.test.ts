import { describe, it, expect, vi } from 'vitest';
import {
    computeHistogram,
    cumulativeCounts,
    percentileBelowEdge,
    edgeAtPercentile,
    edgesFromCenters,
} from '../../utils/histogramUtils';
import type { ColormapDef } from '../../components/ColormapPicker/colormaps';
import {
    hexToRgb,
    withAlpha,
    colormapLut,
    sampleColormap,
    pickNextColor,
    CLASS_PALETTE,
    CLASS_PALETTE_COLORBLIND,
} from '../../utils/colorUtils';
import { labelsToRgba, binaryMasksToRgba, rgbaToObjectUrl } from '../../utils/maskRaster';
import type { ResolvedMaskClass } from '../../components/PlotlyMaskOverlay/types';

const cls = (over: Partial<ResolvedMaskClass> & { id: number }): ResolvedMaskClass => ({
    label: `Class ${over.id}`,
    color: '#ff0000',
    visible: true,
    opacity: 1,
    ...over,
});

describe('computeHistogram', () => {
    it('bins values into the requested number of bins', () => {
        const { counts, binEdges, binCenters } = computeHistogram([0, 1, 2, 3], { bins: 4 });
        expect(counts).toHaveLength(4);
        expect(binEdges).toHaveLength(5);
        expect(binCenters).toHaveLength(4);
        expect(counts.reduce((a, b) => a + b, 0)).toBe(4);
    });

    it('computes correct edges and centers for a known domain', () => {
        const { binEdges, binCenters } = computeHistogram([], { bins: 2, domain: [0, 10] });
        expect(binEdges).toEqual([0, 5, 10]);
        expect(binCenters).toEqual([2.5, 7.5]);
    });

    it('counts the maximum sample in the final bin rather than overflowing', () => {
        const { counts } = computeHistogram([0, 10], { bins: 2, domain: [0, 10] });
        expect(counts).toEqual([1, 1]);
    });

    it('ends exactly at the maximum, as numpy does, even when bin widths do not add up', () => {
        // With these inputs min + bins * width is a rounding error short of the maximum
        // (0.8999999999999999 and 999.9999999999999); the last edge must be the maximum itself.
        const { binEdges, counts } = computeHistogram([0.2, 0.5, 0.9], { bins: 3 });
        expect(binEdges[3]).toBe(0.9);
        expect(counts[2]).toBe(1); // the maximum sample sits in the closed last bin
        expect(computeHistogram([], { bins: 13, domain: [1, 1000] }).binEdges[13]).toBe(1000);
    });

    it('places each value in the expected bin', () => {
        const { counts } = computeHistogram([1, 1, 1, 6, 9], { bins: 2, domain: [0, 10] });
        expect(counts).toEqual([3, 2]);
    });

    it('skips values outside an explicit domain instead of clamping them', () => {
        const { counts } = computeHistogram([-5, 1, 20], { bins: 2, domain: [0, 10] });
        expect(counts.reduce((a, b) => a + b, 0)).toBe(1);
    });

    it('skips non-finite values', () => {
        const { counts } = computeHistogram([NaN, Infinity, -Infinity, 5], {
            bins: 2,
            domain: [0, 10],
        });
        expect(counts.reduce((a, b) => a + b, 0)).toBe(1);
    });

    it('handles empty input without throwing and still returns a valid shape', () => {
        const { counts, binEdges } = computeHistogram([], { bins: 3 });
        expect(counts).toEqual([0, 0, 0]);
        expect(binEdges).toHaveLength(4);
    });

    it('puts every sample in bin 0 for a degenerate all-equal domain', () => {
        const { counts, binCenters } = computeHistogram([7, 7, 7], { bins: 4 });
        expect(counts[0]).toBe(3);
        expect(counts.slice(1)).toEqual([0, 0, 0]);
        expect(binCenters.every((c) => c === 7)).toBe(true);
    });

    it('clamps a bin count below one up to one', () => {
        const { counts } = computeHistogram([1, 2, 3], { bins: 0 });
        expect(counts).toEqual([3]);
    });

    it('bins zero and negative values like any others, in their own units', () => {
        const { counts, binEdges } = computeHistogram([-3, 0, 0, 2], { bins: 5 });
        expect(counts.reduce((a, b) => a + b, 0)).toBe(4);
        expect(binEdges[0]).toBe(-3);
        expect(binEdges[5]).toBe(2);
        expect(counts).toEqual([1, 0, 0, 2, 1]);
    });

    it('accepts a typed array', () => {
        const { counts } = computeHistogram(new Uint8Array([0, 0, 255]), {
            bins: 2,
            domain: [0, 255],
        });
        expect(counts).toEqual([2, 1]);
    });
});

describe('cumulativeCounts', () => {
    it('accumulates counts and reports the total', () => {
        const { cumulative, total } = cumulativeCounts([1, 2, 3]);
        expect(cumulative).toEqual([1, 3, 6]);
        expect(total).toBe(6);
    });

    it('returns zero for an empty distribution', () => {
        const { cumulative, total } = cumulativeCounts([]);
        expect(cumulative).toEqual([]);
        expect(total).toBe(0);
    });
});

describe('edge-based percentiles', () => {
    // Four bins with counts 1, 2, 3, 4 between edges 0, 10, 20, 30, 40.
    const EDGES = [0, 10, 20, 30, 40];
    const { cumulative, total } = cumulativeCounts([1, 2, 3, 4]);

    it('reports the population strictly below each edge', () => {
        expect(percentileBelowEdge(0, cumulative, total)).toBe(0);
        expect(percentileBelowEdge(1, cumulative, total)).toBeCloseTo(10, 10);
        expect(percentileBelowEdge(2, cumulative, total)).toBeCloseTo(30, 10);
        expect(percentileBelowEdge(3, cumulative, total)).toBeCloseTo(60, 10);
        expect(percentileBelowEdge(4, cumulative, total)).toBe(100);
    });

    it('clamps edge indices outside the edge range', () => {
        expect(percentileBelowEdge(-3, cumulative, total)).toBe(0);
        expect(percentileBelowEdge(99, cumulative, total)).toBe(100);
    });

    it('maps 0% and 100% to the outer edges', () => {
        expect(edgeAtPercentile(0, EDGES, cumulative, total)).toBe(0);
        expect(edgeAtPercentile(100, EDGES, cumulative, total)).toBe(40);
    });

    it('round-trips exactly at every edge', () => {
        EDGES.forEach((edge, i) => {
            const p = percentileBelowEdge(i, cumulative, total);
            expect(edgeAtPercentile(p, EDGES, cumulative, total)).toBe(edge);
        });
    });

    it('returns the first edge with at least the requested population below it', () => {
        // 10% lies below edge 10 and 30% below edge 20, so 15% needs edge 20.
        expect(edgeAtPercentile(15, EDGES, cumulative, total)).toBe(20);
    });

    it('handles an empty distribution', () => {
        expect(percentileBelowEdge(2, [], 0)).toBe(0);
        expect(edgeAtPercentile(50, [], [], 0)).toBe(0);
        expect(edgeAtPercentile(50, [5, 6], [0], 0)).toBe(5);
    });
});

describe('edgesFromCenters', () => {
    it('reproduces the edges of evenly spaced bins exactly', () => {
        const { binCenters, binEdges } = computeHistogram([0, 10], { bins: 5, domain: [0, 10] });
        expect(edgesFromCenters(binCenters)).toEqual(binEdges);
    });

    it('keeps irregular spacing, extending half a bin at each end', () => {
        expect(edgesFromCenters([1, 2, 4, 8])).toEqual([0.5, 1.5, 3, 6, 10]);
    });

    it('gives a single center a unit-width bin and handles no centers', () => {
        expect(edgesFromCenters([3])).toEqual([2.5, 3.5]);
        expect(edgesFromCenters([])).toEqual([]);
    });
});

describe('hexToRgb and withAlpha', () => {
    it('parses six-digit hex', () => {
        expect(hexToRgb('#ff8000')).toEqual([255, 128, 0]);
    });

    it('parses three-digit hex by doubling each nibble', () => {
        expect(hexToRgb('#f80')).toEqual([255, 136, 0]);
    });

    it('parses hex without a leading hash', () => {
        expect(hexToRgb('00ff00')).toEqual([0, 255, 0]);
    });

    it('falls back to magenta for malformed input rather than throwing', () => {
        expect(hexToRgb('nonsense')).toEqual([255, 0, 255]);
        expect(hexToRgb('#12')).toEqual([255, 0, 255]);
        expect(hexToRgb('#gggggg')).toEqual([255, 0, 255]);
        expect(hexToRgb('')).toEqual([255, 0, 255]);
    });

    it('builds an rgba string and clamps alpha', () => {
        expect(withAlpha('#ff0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
        expect(withAlpha('#ff0000', 5)).toBe('rgba(255, 0, 0, 1)');
        expect(withAlpha('#ff0000', -1)).toBe('rgba(255, 0, 0, 0)');
    });
});

describe('colormapLut and sampleColormap', () => {
    it('returns 256 RGB entries', () => {
        expect(colormapLut('viridis')).toHaveLength(256 * 3);
    });

    it('has black and white endpoints for gray', () => {
        const lut = colormapLut('gray');
        expect([lut[0], lut[1], lut[2]]).toEqual([0, 0, 0]);
        expect([lut[765], lut[766], lut[767]]).toEqual([255, 255, 255]);
    });

    it('has viridis endpoints matching its stop definition', () => {
        const lut = colormapLut('viridis');
        expect([lut[0], lut[1], lut[2]]).toEqual(hexToRgb('#440154'));
        expect([lut[765], lut[766], lut[767]]).toEqual(hexToRgb('#fde725'));
    });

    it('falls back to a black-to-white ramp for an unknown id', () => {
        const lut = colormapLut('does-not-exist');
        expect([lut[0], lut[1], lut[2]]).toEqual([0, 0, 0]);
        expect([lut[765], lut[766], lut[767]]).toEqual([255, 255, 255]);
    });

    it('caches per colormap list, so a custom list cannot poison the default', () => {
        const custom: ColormapDef[] = [{ id: 'gray', label: 'Red ramp', stops: '#000000,#ff0000' }];
        const customLut = colormapLut('gray', custom);
        const defaultLut = colormapLut('gray');
        // The custom ramp ends in pure red; the default gray ends in white.
        expect(Array.from(customLut.slice(765, 768))).toEqual([255, 0, 0]);
        expect(Array.from(defaultLut.slice(765, 768))).toEqual([255, 255, 255]);
        // Repeated calls hit the cache for each list independently.
        expect(colormapLut('gray', custom)).toBe(customLut);
        expect(colormapLut('gray')).toBe(defaultLut);
    });

    it('strips CSS position tokens from stops such as tab10', () => {
        const lut = colormapLut('tab10');
        expect([lut[0], lut[1], lut[2]]).toEqual(hexToRgb('#1f77b4'));
    });

    it('samples the endpoints and clamps out-of-range t', () => {
        expect(sampleColormap('gray', 0)).toEqual([0, 0, 0]);
        expect(sampleColormap('gray', 1)).toEqual([255, 255, 255]);
        expect(sampleColormap('gray', -1)).toEqual([0, 0, 0]);
        expect(sampleColormap('gray', 2)).toEqual([255, 255, 255]);
        expect(sampleColormap('gray', NaN)).toEqual([0, 0, 0]);
    });

    it('interpolates between stops', () => {
        const [r, g, b] = sampleColormap('gray', 0.5);
        expect(r).toBeGreaterThan(100);
        expect(r).toBeLessThan(160);
        expect(g).toBe(r);
        expect(b).toBe(r);
    });
});

describe('pickNextColor', () => {
    it('returns the first palette color when nothing is used', () => {
        expect(pickNextColor([], 0)).toBe(CLASS_PALETTE[0]);
    });

    it('skips colors already in use', () => {
        expect(pickNextColor([CLASS_PALETTE[0], CLASS_PALETTE[1]], 0)).toBe(CLASS_PALETTE[2]);
    });

    it('ignores case when comparing used colors', () => {
        expect(pickNextColor([CLASS_PALETTE[0].toUpperCase()], 0)).toBe(CLASS_PALETTE[1]);
    });

    it('cycles using the fallback index once every color is taken', () => {
        expect(pickNextColor(CLASS_PALETTE, 3)).toBe(CLASS_PALETTE[3]);
        expect(pickNextColor(CLASS_PALETTE, CLASS_PALETTE.length + 1)).toBe(CLASS_PALETTE[1]);
    });

    it('accepts a custom palette', () => {
        expect(pickNextColor([], 0, CLASS_PALETTE_COLORBLIND)).toBe(CLASS_PALETTE_COLORBLIND[0]);
    });

    it('falls back to magenta for an empty palette', () => {
        expect(pickNextColor([], 0, [])).toBe('#ff00ff');
    });
});

describe('labelsToRgba', () => {
    const classes = [cls({ id: 1, color: '#ff0000' }), cls({ id: 2, color: '#00ff00' })];

    it('leaves background pixels fully transparent', () => {
        const { data } = labelsToRgba([0, 0, 0, 0], 2, 2, classes);
        expect([...data]).toEqual(new Array(16).fill(0));
    });

    it('colors each pixel by its class', () => {
        const { data } = labelsToRgba([1, 2, 0, 1], 2, 2, classes);
        expect([...data.slice(0, 4)]).toEqual([255, 0, 0, 255]);
        expect([...data.slice(4, 8)]).toEqual([0, 255, 0, 255]);
        expect([...data.slice(8, 12)]).toEqual([0, 0, 0, 0]);
        expect([...data.slice(12, 16)]).toEqual([255, 0, 0, 255]);
    });

    it('reports the buffer dimensions', () => {
        const buffer = labelsToRgba([0, 0, 0, 0, 0, 0], 3, 2, classes);
        expect(buffer.width).toBe(3);
        expect(buffer.height).toBe(2);
        expect(buffer.data).toHaveLength(24);
    });

    it('skips hidden classes', () => {
        const hidden = [cls({ id: 1, color: '#ff0000', visible: false }), classes[1]];
        const { data } = labelsToRgba([1, 2, 0, 0], 2, 2, hidden);
        expect([...data.slice(0, 4)]).toEqual([0, 0, 0, 0]);
        expect([...data.slice(4, 8)]).toEqual([0, 255, 0, 255]);
    });

    it('applies per-class opacity to the alpha channel', () => {
        const faded = [cls({ id: 1, color: '#ff0000', opacity: 0.5 })];
        const { data } = labelsToRgba([1], 1, 1, faded);
        expect(data[3]).toBe(128);
    });

    it('leaves labels with no matching class transparent', () => {
        const { data } = labelsToRgba([99], 1, 1, classes);
        expect([...data]).toEqual([0, 0, 0, 0]);
    });

    it('returns an empty buffer when every class is hidden', () => {
        const allHidden = classes.map((c) => ({ ...c, visible: false }));
        const { data } = labelsToRgba([1, 2, 1, 2], 2, 2, allHidden);
        expect([...data]).toEqual(new Array(16).fill(0));
    });

    it('gives the same result on the dense and general lookup paths', () => {
        const labels = [0, 1, 2, 3, 2, 1];
        const dense = labelsToRgba(labels, 6, 1, [
            cls({ id: 1, color: '#ff0000' }),
            cls({ id: 2, color: '#00ff00', opacity: 0.5 }),
        ]);
        // A negative id forces the general path; it matches no pixel here.
        const general = labelsToRgba(labels, 6, 1, [
            cls({ id: 1, color: '#ff0000' }),
            cls({ id: 2, color: '#00ff00', opacity: 0.5 }),
            cls({ id: -1, color: '#0000ff' }),
        ]);
        expect(Array.from(dense.data)).toEqual(Array.from(general.data));
    });

    it('colors negative and fractional ids on the general path', () => {
        const { data } = labelsToRgba([-1, 1.5, 0], 3, 1, [
            cls({ id: -1, color: '#0000ff' }),
            cls({ id: 1.5, color: '#00ff00' }),
        ]);
        expect(Array.from(data.slice(0, 4))).toEqual([0, 0, 255, 255]);
        expect(Array.from(data.slice(4, 8))).toEqual([0, 255, 0, 255]);
        expect(data[11]).toBe(0);
    });

    it('leaves negative and fractional labels clear on the dense path', () => {
        const { data } = labelsToRgba([-1, 1.5, 1], 3, 1, [cls({ id: 1, color: '#ff0000' })]);
        expect(data[3]).toBe(0);
        expect(data[7]).toBe(0);
        expect(Array.from(data.slice(8, 12))).toEqual([255, 0, 0, 255]);
    });

    it('does not read past the end of a short label array', () => {
        const { data } = labelsToRgba([1], 2, 2, classes);
        expect([...data.slice(0, 4)]).toEqual([255, 0, 0, 255]);
        expect([...data.slice(4)]).toEqual(new Array(12).fill(0));
    });
});

describe('binaryMasksToRgba', () => {
    const classes = [cls({ id: 1, color: '#ff0000' }), cls({ id: 2, color: '#00ff00' })];

    it('colors set pixels and leaves unset pixels transparent', () => {
        const { data } = binaryMasksToRgba([{ classId: 1, data: [1, 0, 0, 0] }], 2, 2, classes);
        expect([...data.slice(0, 4)]).toEqual([255, 0, 0, 255]);
        expect([...data.slice(4, 8)]).toEqual([0, 0, 0, 0]);
    });

    it('lets a later layer win where masks overlap', () => {
        const { data } = binaryMasksToRgba(
            [
                { classId: 1, data: [1] },
                { classId: 2, data: [1] },
            ],
            1,
            1,
            classes,
        );
        expect([...data]).toEqual([0, 255, 0, 255]);
    });

    it('skips hidden classes and layers with no matching class', () => {
        const hidden = [cls({ id: 1, color: '#ff0000', visible: false }), classes[1]];
        const { data } = binaryMasksToRgba(
            [
                { classId: 1, data: [1] },
                { classId: 77, data: [1] },
            ],
            1,
            1,
            hidden,
        );
        expect([...data]).toEqual([0, 0, 0, 0]);
    });
});

describe('rgbaToObjectUrl', () => {
    it('encodes the buffer through a canvas and returns an object URL', async () => {
        const putImageData = vi.fn();
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
            () => ({ putImageData }) as unknown as CanvasRenderingContext2D,
        );
        const toBlob = vi
            .spyOn(HTMLCanvasElement.prototype, 'toBlob')
            .mockImplementation((cb: BlobCallback) => cb(new Blob(['png'])));
        vi.stubGlobal(
            'ImageData',
            class {
                constructor(
                    public data: Uint8ClampedArray,
                    public width: number,
                    public height: number,
                ) {}
            },
        );
        const original = URL.createObjectURL;
        URL.createObjectURL = vi.fn(() => 'blob:encoded');
        try {
            const url = await rgbaToObjectUrl({
                data: new Uint8ClampedArray(8),
                width: 2,
                height: 1,
            });
            expect(url).toBe('blob:encoded');
            expect(putImageData).toHaveBeenCalledOnce();
            expect(toBlob.mock.calls[0][1]).toBe('image/png');
        } finally {
            URL.createObjectURL = original;
            vi.restoreAllMocks();
            vi.unstubAllGlobals();
        }
    });

    it('rejects when no 2D context is available', async () => {
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
        await expect(
            rgbaToObjectUrl({ data: new Uint8ClampedArray(4), width: 1, height: 1 }),
        ).rejects.toThrow(/2D canvas context/);
        vi.restoreAllMocks();
    });
});
