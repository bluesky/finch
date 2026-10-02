import { describe, it, expect } from 'vitest';
import {
    computeHistogram,
    cumulativeCounts,
    valueToPercentile,
    percentileToValue,
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
import { labelsToRgba, binaryMasksToRgba, arrayToRgba } from '../../utils/maskRaster';
import type { ResolvedMaskClass } from '../../components/MaskOverlayCanvas/types';

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

    it('applies log10 to positive values when log is set', () => {
        // With log, 1 -> 0 and 100 -> 2, so the domain spans 0..2 and the two
        // samples land in opposite bins.
        const { counts } = computeHistogram([1, 100], { bins: 2, log: true });
        expect(counts).toEqual([1, 1]);
    });

    describe('log mode with non-positive values', () => {
        const binOf = (edges: number[], v: number) => {
            const t = Math.log10(v);
            const i = edges.findIndex((e, k) => k > 0 && t <= e);
            return Math.max(0, i - 1);
        };

        it('excludes zero but counts every positive sample under a zero-based domain', () => {
            const { counts } = computeHistogram([0, 0.5, 1, 10], {
                bins: 16,
                domain: [0, 1000],
                log: true,
            });
            expect(counts.reduce((a, b) => a + b, 0)).toBe(3);
        });

        it('excludes negative values', () => {
            const { counts } = computeHistogram([-3, -0.1, 0, 2], { bins: 4, log: true });
            expect(counts.reduce((a, b) => a + b, 0)).toBe(1);
        });

        it('starts the bins at the smallest positive sample when the lower bound is non-positive', () => {
            const { binEdges } = computeHistogram([0, 0.5, 1, 10], {
                bins: 16,
                domain: [0, 1000],
                log: true,
            });
            expect(binEdges[0]).toBeCloseTo(Math.log10(0.5));
            expect(binEdges[binEdges.length - 1]).toBeCloseTo(3);
            for (let i = 1; i < binEdges.length; i += 1) {
                expect(binEdges[i]).toBeGreaterThan(binEdges[i - 1]);
            }
        });

        it('uses a positive lower bound exactly', () => {
            const { binEdges, counts } = computeHistogram([0.5, 1, 10], {
                bins: 4,
                domain: [1, 1000],
                log: true,
            });
            expect(binEdges[0]).toBeCloseTo(0);
            // 0.5 is below the explicit domain, so it is filtered out.
            expect(counts.reduce((a, b) => a + b, 0)).toBe(2);
        });

        it('keeps sub-unit, unit and larger positive samples in distinct bins', () => {
            const values = [0.5, 1, 10];
            const { binEdges, counts } = computeHistogram(values, { bins: 8, log: true });
            const indices = values.map((v) => binOf(binEdges, v));
            expect(new Set(indices).size).toBe(3);
            for (const i of indices) expect(counts[i]).toBe(1);
        });
    });

    it('accepts a typed array', () => {
        const { counts } = computeHistogram(new Uint8Array([0, 0, 255]), {
            bins: 2,
            domain: [0, 255],
        });
        expect(counts).toEqual([2, 1]);
    });
});

describe('cumulativeCounts and percentile conversion', () => {
    it('accumulates counts and reports the total', () => {
        const { cumulative, total } = cumulativeCounts([1, 2, 3]);
        expect(cumulative).toEqual([1, 3, 6]);
        expect(total).toBe(6);
    });

    it('returns zero for an empty distribution', () => {
        const { cumulative, total } = cumulativeCounts([]);
        expect(cumulative).toEqual([]);
        expect(total).toBe(0);
        expect(valueToPercentile(5, [], cumulative, total)).toBe(0);
        expect(percentileToValue(50, [], cumulative, total)).toBe(0);
    });

    it('maps a value to its percentile of the distribution', () => {
        const counts = [1, 1, 1, 1];
        const binCenters = [0, 1, 2, 3];
        const { cumulative, total } = cumulativeCounts(counts);
        expect(valueToPercentile(0, binCenters, cumulative, total)).toBe(25);
        expect(valueToPercentile(1, binCenters, cumulative, total)).toBe(50);
        expect(valueToPercentile(3, binCenters, cumulative, total)).toBe(100);
    });

    it('round-trips value to percentile and back', () => {
        const counts = [5, 10, 20, 5];
        const binCenters = [10, 20, 30, 40];
        const { cumulative, total } = cumulativeCounts(counts);
        for (const v of binCenters) {
            const p = valueToPercentile(v, binCenters, cumulative, total);
            expect(percentileToValue(p, binCenters, cumulative, total)).toBe(v);
        }
    });

    it('clamps percentiles into the 0-100 range', () => {
        const { cumulative, total } = cumulativeCounts([1, 1]);
        expect(valueToPercentile(-999, [0, 1], cumulative, total)).toBeGreaterThanOrEqual(0);
        expect(valueToPercentile(999, [0, 1], cumulative, total)).toBeLessThanOrEqual(100);
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

describe('arrayToRgba', () => {
    it('maps the data extent across the full colormap', () => {
        const { data } = arrayToRgba([0, 255], 2, 1, { colormap: 'gray' });
        expect([...data.slice(0, 4)]).toEqual([0, 0, 0, 255]);
        expect([...data.slice(4, 8)]).toEqual([255, 255, 255, 255]);
    });

    it('honours an explicit domain', () => {
        // With the domain capped at 50, a sample of 100 clips to the top of the ramp.
        const { data } = arrayToRgba([0, 100], 2, 1, { colormap: 'gray', domain: [0, 50] });
        expect(data[4]).toBe(255);
    });

    it('is always fully opaque', () => {
        const { data } = arrayToRgba([0, 10, 20, 30], 2, 2, { colormap: 'viridis' });
        expect(data[3]).toBe(255);
        expect(data[7]).toBe(255);
        expect(data[11]).toBe(255);
        expect(data[15]).toBe(255);
    });

    it('maps a flat domain to the bottom of the colormap', () => {
        const { data } = arrayToRgba([5, 5], 2, 1, { colormap: 'gray' });
        expect([...data.slice(0, 3)]).toEqual([0, 0, 0]);
        expect([...data.slice(4, 7)]).toEqual([0, 0, 0]);
    });

    it('treats non-finite samples as the domain minimum', () => {
        const { data } = arrayToRgba([NaN, 100], 2, 1, { colormap: 'gray', domain: [0, 100] });
        expect([...data.slice(0, 3)]).toEqual([0, 0, 0]);
        expect([...data.slice(4, 7)]).toEqual([255, 255, 255]);
    });

    it('log-scales positive values', () => {
        // log10 of 1, 10, 100 is 0, 1, 2 — so the middle sample lands mid-ramp.
        const { data } = arrayToRgba([1, 10, 100], 3, 1, { colormap: 'gray', log: true });
        expect(data[0]).toBe(0);
        expect(data[4]).toBeGreaterThan(100);
        expect(data[4]).toBeLessThan(160);
        expect(data[8]).toBe(255);
    });

    describe('log mode with non-positive values', () => {
        const px = (data: Uint8ClampedArray, i: number) => [...data.slice(i * 4, i * 4 + 4)];

        it('paints zero as under-range (transparent by default), distinct from one', () => {
            const { data } = arrayToRgba([0, 1, 100], 3, 1, { colormap: 'gray', log: true });
            expect(px(data, 0)).toEqual([0, 0, 0, 0]);
            expect(px(data, 1)).toEqual([0, 0, 0, 255]);
            expect(px(data, 0)).not.toEqual(px(data, 1));
        });

        it('paints negative values as under-range', () => {
            const { data } = arrayToRgba([-5, 1, 100], 3, 1, { colormap: 'gray', log: true });
            expect(px(data, 0)).toEqual([0, 0, 0, 0]);
        });

        it('honours a custom underRangeColor', () => {
            const { data } = arrayToRgba([0, 1, 100], 3, 1, {
                colormap: 'gray',
                log: true,
                underRangeColor: [255, 0, 255, 128],
            });
            expect(px(data, 0)).toEqual([255, 0, 255, 128]);
        });

        it('keeps sub-unit positive values log-distinguishable under a zero-based domain', () => {
            // The lower edge becomes log10(0.5), so 0.5 sits at the bottom and 1 above it.
            const { data } = arrayToRgba([0, 0.5, 1, 1000], 4, 1, {
                colormap: 'gray',
                domain: [0, 1000],
                log: true,
            });
            expect(px(data, 0)[3]).toBe(0);
            expect(data[4]).toBe(0);
            expect(data[8]).toBeGreaterThan(data[4]);
            expect(data[12]).toBe(255);
        });

        it('clamps positive values below a positive lower bound to the bottom of the colormap', () => {
            const { data } = arrayToRgba([0.5, 10, 100], 3, 1, {
                colormap: 'gray',
                domain: [10, 100],
                log: true,
            });
            expect(px(data, 0)).toEqual([0, 0, 0, 255]);
            expect(px(data, 1)).toEqual([0, 0, 0, 255]);
        });

        it('leaves zero opaque at the bottom of the colormap without log', () => {
            const { data } = arrayToRgba([0, 100], 2, 1, { colormap: 'gray' });
            expect(px(data, 0)).toEqual([0, 0, 0, 255]);
        });
    });

    it('defaults to the gray colormap', () => {
        const withDefault = arrayToRgba([0, 255], 2, 1, {});
        const explicit = arrayToRgba([0, 255], 2, 1, { colormap: 'gray' });
        expect([...withDefault.data]).toEqual([...explicit.data]);
    });
});
