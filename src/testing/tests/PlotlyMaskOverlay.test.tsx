import { useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PlotlyMaskOverlay from '../../components/PlotlyMaskOverlay/PlotlyMaskOverlay';
import type {
    ImageInput,
    MaskInput,
    OverlayPickInfo,
} from '../../components/PlotlyMaskOverlay/types';
import {
    axisRanges,
    EMPTY_IMAGE,
    imageExtent,
} from '../../components/PlotlyMaskOverlay/hooks/usePlotlyOverlayFigure';

type PlotProps = {
    data: Record<string, unknown>[];
    layout: Record<string, unknown> & {
        images: Record<string, unknown>[];
        shapes: Record<string, unknown>[];
        xaxis: Record<string, unknown>;
        yaxis: Record<string, unknown>;
    };
    config: Record<string, unknown>;
    onRelayout: (e: Record<string, unknown>) => void;
    onLegendClick: (e: { curveNumber: number; data: Record<string, unknown>[] }) => boolean;
    onHover: (e: { points: Record<string, unknown>[] }) => void;
    onUnhover: () => void;
    onInitialized?: (figure: unknown, gd: HTMLElement) => void;
};

/** CSS pixels per data unit in the fake laid-out axes, unless `plot.length` fixes the plot size. */
const PX = 10;

const plot = vi.hoisted(() => ({
    props: null as PlotProps | null,
    /** A fixed plot-area size in CSS pixels, so zooming in spreads each pixel over more of it. */
    length: null as { x: number; y: number } | null,
}));

/** Shape indices Plotly's own click handler activated, in order (see the fake plot). */
const activated = vi.hoisted(() => ({ list: [] as number[] }));

// Renders a graph div whose `_fullLayout` axes follow the layout Finch produced, from the div's
// top-left corner, as Plotly would after a plot: PX CSS pixels per data unit, or `plot.length`.
// Like Plotly's shape layer, it replaces its shape elements on every render, and each one
// activates itself from the native click on it.
vi.mock('react-plotly.js', async () => {
    const React = await vi.importActual<typeof import('react')>('react');
    function FakePlot(props: PlotProps) {
        plot.props = props;
        const ref = React.useRef<HTMLDivElement>(null);
        React.useLayoutEffect(() => {
            const gd = ref.current!;
            gd.querySelectorAll('.shape-group').forEach((el) => el.remove());
            props.layout.shapes.forEach((_, index) => {
                const el = document.createElement('div');
                el.className = 'shape-group';
                el.dataset.index = String(index);
                el.addEventListener('click', () => activated.list.push(index));
                gd.appendChild(el);
            });
            const axis = (range: [number, number], fixed: number | undefined) => ({
                range,
                _offset: 0,
                _length: fixed ?? PX * Math.abs(range[1] - range[0]),
            });
            (gd as unknown as { _fullLayout: unknown })._fullLayout = {
                xaxis: axis(props.layout.xaxis.range as [number, number], plot.length?.x),
                yaxis: axis(props.layout.yaxis.range as [number, number], plot.length?.y),
            };
            props.onInitialized?.({}, gd);
        });
        return <div data-testid="plot" ref={ref} />;
    }
    return { default: FakePlot };
});

const last = () => plot.props!;

type FakeAxis = { range: [number, number]; _offset: number; _length: number };

/** Client position of continuous data coordinate `(x, y)`, read from the laid-out axes. */
function clientAt(x: number, y: number) {
    const gd = screen.getByTestId('plot') as unknown as {
        _fullLayout: { xaxis: FakeAxis; yaxis: FakeAxis };
    };
    const { xaxis: xa, yaxis: ya } = gd._fullLayout;
    const fx = (x - xa.range[0]) / (xa.range[1] - xa.range[0]);
    const fy = (y - ya.range[0]) / (ya.range[1] - ya.range[0]);
    return { clientX: xa._offset + fx * xa._length, clientY: ya._offset + (1 - fy) * ya._length };
}

const hoverAt = (x: number, y: number) =>
    fireEvent.pointerMove(screen.getByTestId('plot'), clientAt(x, y));

/**
 * A click as a browser delivers it: the press, the release, then `click` on the pressed element,
 * but only if that element is still in the page. A browser fires no click for an element that
 * was removed between press and release.
 */
function browserClick(target: Element, pos: { clientX: number; clientY: number }) {
    fireEvent.pointerDown(target, pos);
    fireEvent.pointerUp(target, pos);
    if (target.isConnected) fireEvent.click(target, pos);
}

const clickAt = (x: number, y: number) => browserClick(screen.getByTestId('plot'), clientAt(x, y));

/**
 * A click on the plot area as Plotly's drag layer delivers it: Plotly covers the page with a
 * `.dragcover` on mouse-down, the browser fires `click` on the common ancestor of press and
 * release, and Plotly dispatches its own `click` on the pressed element as well.
 */
function realClickAt(x: number, y: number) {
    const gd = screen.getByTestId('plot');
    const cover = document.createElement('div');
    cover.className = 'dragcover';
    document.body.appendChild(cover);
    fireEvent.pointerDown(gd, clientAt(x, y));
    fireEvent.pointerUp(cover, clientAt(x, y));
    fireEvent.click(gd, clientAt(x, y));
    fireEvent.click(document.body, clientAt(x, y));
    cover.remove();
}

/**
 * Placement fields of a layout image, without its source or layer. `sizex` is rounded to a
 * millionth of a pixel: pictures differ there only by the 1e-9 that gives each its own key.
 */
const geometry = (entry: Record<string, unknown>) => {
    const { x, y, sizex, sizey, xanchor, yanchor, sizing, xref, yref } = entry;
    const width = Math.round((sizex as number) * 1e6) / 1e6;
    return { x, y, sizex: width, sizey, xanchor, yanchor, sizing, xref, yref };
};

/** plotly.js 3+'s join key for a layout image (`components/images/draw.js`). */
const plotlyImageKey = (d: Record<string, unknown>) =>
    [d.xref, d.x, d.sizex, d.yref, d.y, d.sizey].join('_');

type FakeImage = {
    src: string;
    crossOrigin: string | null;
    naturalWidth: number;
    naturalHeight: number;
    onload: (() => void) | null;
    onerror: (() => void) | null;
};
let created: FakeImage[] = [];

/** Replaces `Image` with one whose loads the test completes by hand. */
function stubImages() {
    created = [];
    vi.stubGlobal(
        'Image',
        class {
            src = '';
            crossOrigin: string | null = null;
            naturalWidth = 0;
            naturalHeight = 0;
            onload: (() => void) | null = null;
            onerror: (() => void) | null = null;
            constructor() {
                created.push(this);
            }
        },
    );
}

/** Completes every pending load of `url` with a decoded image of `width x height`. */
function finishLoad(url: string, width: number, height: number) {
    act(() => {
        for (const img of created.filter((i) => i.src === url)) {
            img.naturalWidth = width;
            img.naturalHeight = height;
            img.onload?.();
        }
    });
}

function failLoad(url: string) {
    act(() => {
        for (const img of created.filter((i) => i.src === url)) img.onerror?.();
    });
}

const below = () => last().layout.images.filter((i) => i.layer === 'below');
const above = () => last().layout.images.filter((i) => i.layer === 'above');

let urlCount = 0;
beforeEach(() => {
    plot.props = null;
    plot.length = null;
    activated.list = [];
    urlCount = 0;
    // The test DOM has no 2D context, ImageData, toBlob or object URLs.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
        () => ({ putImageData: vi.fn() }) as unknown as CanvasRenderingContext2D,
    );
    HTMLCanvasElement.prototype.toBlob = function (cb: BlobCallback) {
        cb(new Blob(['png']));
    };
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
    URL.createObjectURL = vi.fn(() => `blob:mock-${(urlCount += 1)}`);
    URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

const IMAGE = new Float32Array([0, 1, 2, 3, 4, 5]);
const IMAGE_SHAPE: [number, number] = [2, 3];
const LABELS = [1, 0, 0, 0, 2, 2];

describe('PlotlyMaskOverlay', () => {
    it('shows a small raw image as a heatmap trace with pixel centres at integers, like PlotlyHeatmap', () => {
        render(<PlotlyMaskOverlay image={{ type: 'array', data: IMAGE, shape: IMAGE_SHAPE }} />);
        const heatmap = last().data[0];
        expect(heatmap).toMatchObject({
            type: 'heatmap',
            x0: 0,
            dx: 1,
            y0: 0,
            dy: 1,
            zmin: 0,
            zmax: 5,
        });
        const z = heatmap.z as Float32Array[];
        expect(z).toHaveLength(2);
        expect(Array.from(z[1])).toEqual([3, 4, 5]);
        // Rows share memory with the source rather than copying it.
        expect(z[0].buffer).toBe(IMAGE.buffer);
        expect(last().layout.xaxis.range).toEqual([-0.5, 2.5]);
        expect(last().layout.yaxis.range).toEqual([1.5, -0.5]);
    });

    it('never colour-maps a raw image in the browser: it is always a heatmap trace', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: new Uint8Array(1001 * 1000), shape: [1000, 1001] }}
            />,
        );
        expect(last().data[0].type).toBe('heatmap');
        expect(last().layout.images).toHaveLength(0);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('above one megapixel'));
    });

    it('draws nested rows at their own shape, and rejects a flat array without one (JavaScript callers)', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const rows = [Array.from(IMAGE.subarray(0, 3)), Array.from(IMAGE.subarray(3))];
        const { unmount } = render(<PlotlyMaskOverlay image={{ type: 'array', data: rows }} />);
        expect(last().layout.xaxis.range).toEqual([-0.5, 2.5]);
        expect(warn).not.toHaveBeenCalled();
        unmount();
        plot.props = null;

        const noShape = { type: 'array', data: IMAGE } as unknown as ImageInput;
        const { rerender } = render(<PlotlyMaskOverlay image={noShape} />);
        rerender(<PlotlyMaskOverlay image={noShape} className="x" />);
        // No figure at all, only the error: there is no frame to draw on.
        expect(plot.props).toBeNull();
        expect(screen.getByRole('alert')).toHaveTextContent('invalid image');
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][0]).toContain('needs `shape`');
    });

    it('keeps the heatmap in native units under logScale: domain, hover and colorbar', () => {
        const values = new Float32Array([1, 10, 100, 1000, 0, 10000]);
        render(
            <PlotlyMaskOverlay
                image={{
                    type: 'array',
                    data: values,
                    shape: [2, 3],
                    logScale: true,
                    domain: [10, 1000],
                    showColorbar: true,
                }}
            />,
        );
        const heatmap = last().data[0] as Record<string, unknown> & {
            z: ArrayLike<number>[];
            customdata: ArrayLike<number>[];
            colorbar: { tickvals: number[]; ticktext: string[] };
        };
        // The colour range is the native domain, logged once.
        expect(heatmap.zmin).toBeCloseTo(1);
        expect(heatmap.zmax).toBeCloseTo(3);
        // z holds the log10 colours; values at or below zero are gaps.
        expect(Array.from(heatmap.z[0])).toEqual([0, 1, 2]);
        expect(Number.isNaN(heatmap.z[1][1])).toBe(true);
        // Plotly's own hover label reads the untouched native values.
        expect(Array.from(heatmap.customdata[1])).toEqual([1000, 0, 10000]);
        // Plotly's hover only reads 2D customdata whose rows are plain arrays.
        expect(Array.isArray(heatmap.customdata[0])).toBe(true);
        expect(heatmap.hovertemplate).toBe('value %{customdata:.6~g}<extra></extra>');
        expect(heatmap.hovertemplate).not.toContain('log');
        // Colorbar ticks sit on decades and are labelled in native units.
        expect(heatmap.colorbar).toEqual({
            tickvals: [1, 2, 3],
            ticktext: ['10<sup>1</sup>', '10<sup>2</sup>', '10<sup>3</sup>'],
        });
    });

    it('labels a sub-decade log colorbar at its ends, in native units', () => {
        render(
            <PlotlyMaskOverlay
                image={{
                    type: 'array',
                    data: new Float32Array([20, 30, 40, 50, 60, 70]),
                    shape: [2, 3],
                    logScale: true,
                    showColorbar: true,
                }}
            />,
        );
        const { colorbar } = last().data[0] as { colorbar: { ticktext: string[] } };
        expect(colorbar.ticktext).toEqual(['20', '70']);
    });

    it('stacks the mask above the traces with its opacity, and lists classes in the legend', async () => {
        render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: IMAGE, shape: IMAGE_SHAPE }}
                mask={{
                    type: 'labels',
                    data: LABELS,
                    classes: [
                        { id: 1, label: 'Beamstop', color: '#ff0000' },
                        { id: 2, label: 'Gap', color: '#00ff00' },
                    ],
                    opacity: 0.3,
                }}
            />,
        );
        await waitFor(() => expect(last().layout.images).toHaveLength(1));
        expect(last().layout.images[0]).toMatchObject({ layer: 'above', opacity: 0.3 });
        const names = last()
            .data.filter((t) => (t.meta as { kind: string }).kind === 'class')
            .map((t) => t.name);
        expect(names).toEqual(['Beamstop', 'Gap']);
    });

    it('toggles a class from its legend entry and re-renders the mask', async () => {
        const onClassVisibilityChange = vi.fn();
        render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: IMAGE, shape: IMAGE_SHAPE }}
                mask={{ type: 'labels', data: LABELS }}
                onClassVisibilityChange={onClassVisibilityChange}
            />,
        );
        await waitFor(() => expect(last().layout.images).toHaveLength(1));
        const before = last().layout.images[0].source;
        const curve = last().data.findIndex((t) => (t.meta as { kind: string }).kind === 'class');
        let handled = true;
        act(() => {
            handled = last().onLegendClick({ curveNumber: curve, data: last().data });
        });
        expect(handled).toBe(false);
        expect(onClassVisibilityChange).toHaveBeenCalledWith(1, false);
        expect(last().data[curve].visible).toBe('legendonly');
        await waitFor(() => expect(last().layout.images[0].source).not.toBe(before));
    });

    it('turns point layers into named scatter traces and toggles them from the legend', () => {
        const onPointLayerVisibilityChange = vi.fn();
        render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: IMAGE, shape: IMAGE_SHAPE }}
                pointLayers={[{ id: 'cp1', label: 'Ring 1', points: [[1, 1]], color: '#abcdef' }]}
                onPointLayerVisibilityChange={onPointLayerVisibilityChange}
            />,
        );
        const curve = last().data.findIndex((t) => t.name === 'Ring 1');
        expect(last().data[curve]).toMatchObject({
            type: 'scatter',
            mode: 'markers',
            x: [1],
            y: [1],
        });
        act(() => {
            last().onLegendClick({ curveNumber: curve, data: last().data });
        });
        expect(onPointLayerVisibilityChange).toHaveBeenCalledWith('cp1', false);
        expect(last().data[curve].visible).toBe('legendonly');
    });

    it('switches every point layer to WebGL when the total is large', () => {
        const layer = (id: string) => ({ id, label: id, points: new Float32Array(3000 * 2) });
        render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: IMAGE, shape: IMAGE_SHAPE }}
                pointLayers={[layer('a'), layer('b')]}
            />,
        );
        const types = last()
            .data.filter((t) => (t.meta as { kind: string }).kind === 'points')
            .map((t) => t.type);
        expect(types).toEqual(['scattergl', 'scattergl']);
    });

    it('turns annotations into named shapes and skips hidden ones', () => {
        render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: IMAGE, shape: IMAGE_SHAPE }}
                annotations={[
                    { type: 'rect', x0: 0, y0: 0, x1: 1, y1: 1 },
                    { type: 'ellipse', x0: 0, y0: 0, x1: 2, y1: 2, visible: false },
                    {
                        type: 'line',
                        points: [
                            [0, 0],
                            [2, 2],
                        ],
                    },
                ]}
            />,
        );
        expect(last().layout.shapes.map((s) => [s.type, s.name])).toEqual([
            ['rect', 'finch:0'],
            ['line', 'finch:2'],
        ]);
    });

    it.each([
        ['zoom', 'zoom'],
        ['pan', 'pan'],
        ['rect', 'drawrect'],
        ['ellipse', 'drawcircle'],
        ['lasso', 'drawclosedpath'],
    ] as const)('maps dragMode %s to Plotly dragmode %s', (dragMode, plotly) => {
        render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: IMAGE, shape: IMAGE_SHAPE }}
                dragMode={dragMode}
            />,
        );
        expect(last().layout.dragmode).toBe(plotly);
    });

    it('defaults to zoom and reports toolbar zoom or pan through onDragModeChange', () => {
        const onDragModeChange = vi.fn();
        const { rerender } = render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: IMAGE, shape: IMAGE_SHAPE }}
                onDragModeChange={onDragModeChange}
            />,
        );
        expect(last().layout.dragmode).toBe('zoom');
        act(() => last().onRelayout({ dragmode: 'pan' }));
        expect(onDragModeChange).toHaveBeenLastCalledWith('pan');
        rerender(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: IMAGE, shape: IMAGE_SHAPE }}
                dragMode="rect"
                onDragModeChange={onDragModeChange}
            />,
        );
        onDragModeChange.mockClear();
        // Plotly echoing the mode Finch set, or a mode Finch does not offer, is not a change.
        act(() => last().onRelayout({ dragmode: 'drawrect' }));
        act(() => last().onRelayout({ dragmode: 'select' }));
        expect(onDragModeChange).not.toHaveBeenCalled();
        act(() => last().onRelayout({ dragmode: 'zoom' }));
        expect(onDragModeChange).toHaveBeenLastCalledWith('zoom');
    });

    it('reports a newly drawn shape through onDrawComplete', () => {
        const onDrawComplete = vi.fn();
        const existing = { type: 'rect' as const, x0: 0, y0: 0, x1: 1, y1: 1 };
        render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: IMAGE, shape: IMAGE_SHAPE }}
                annotations={[existing]}
                dragMode="lasso"
                onDrawComplete={onDrawComplete}
            />,
        );
        const before = last().layout.datarevision;
        act(() =>
            last().onRelayout({
                shapes: [...last().layout.shapes, { type: 'path', path: 'M0,0L2,0L2,2Z' }],
            }),
        );
        expect(onDrawComplete).toHaveBeenCalledTimes(1);
        expect(onDrawComplete).toHaveBeenCalledWith({
            type: 'polygon',
            points: [
                [0, 0],
                [2, 0],
                [2, 2],
            ],
        });
        // Finch re-syncs the figure so the shape only stays if the app feeds it back.
        expect(last().layout.datarevision).not.toBe(before);
    });

    it('renews editrevision after a shape change, so Plotly drops a draw the app did not keep', () => {
        render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: IMAGE, shape: IMAGE_SHAPE }}
                dragMode="rect"
                frameKey="scan-1"
            />,
        );
        const first = last().layout.editrevision;
        // Plotly keeps user shapes while editrevision is unchanged; by default it is uirevision.
        expect(String(first).startsWith('scan-1')).toBe(true);
        expect(first).not.toBe(last().layout.uirevision);
        act(() => last().onRelayout({ shapes: [{ type: 'rect', x0: 0, y0: 0, x1: 1, y1: 1 }] }));
        const afterDraw = last().layout.editrevision;
        expect(afterDraw).not.toBe(first);
        // Zoom and pan are not shape changes: the revision, and the view it keeps, stay.
        act(() => last().onRelayout({ 'xaxis.range': [0, 1] }));
        expect(last().layout.editrevision).toBe(afterDraw);
        expect(last().layout.uirevision).toBe('scan-1');
    });

    it('reports moved and erased shapes through onAnnotationChange', () => {
        const onAnnotationChange = vi.fn();
        const annotations = [
            { type: 'rect' as const, x0: 0, y0: 0, x1: 1, y1: 1, stroke: '#ff0000' },
            { type: 'ellipse' as const, x0: 0, y0: 0, x1: 2, y1: 2 },
        ];
        render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: IMAGE, shape: IMAGE_SHAPE }}
                annotations={annotations}
                editableAnnotations
                onAnnotationChange={onAnnotationChange}
            />,
        );
        expect(last().layout.shapes[0].editable).toBe(true);
        act(() => last().onRelayout({ 'shapes[0].x0': 0.5, 'shapes[0].x1': 1.5 }));
        expect(onAnnotationChange).toHaveBeenLastCalledWith([
            { type: 'rect', x0: 0.5, y0: 0, x1: 1.5, y1: 1, stroke: '#ff0000' },
            annotations[1],
        ]);
        act(() => last().onRelayout({ shapes: [last().layout.shapes[1]] }));
        expect(onAnnotationChange).toHaveBeenLastCalledWith([annotations[1]]);
    });

    it('merges application traces, layout and config last', () => {
        render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: IMAGE, shape: IMAGE_SHAPE }}
                extraTraces={[{ type: 'scatter', name: 'app trace', x: [1], y: [1] }]}
                layout={{ margin: { l: 1, r: 1, t: 1, b: 1 }, xaxis: { title: { text: 'q' } } }}
                config={{ scrollZoom: false }}
            />,
        );
        expect(last().data.at(-1)).toMatchObject({ name: 'app trace', meta: { kind: 'extra' } });
        expect(last().layout.margin).toEqual({ l: 1, r: 1, t: 1, b: 1 });
        // One level deep: the range Finch sets survives an app axis title.
        expect(last().layout.xaxis).toMatchObject({ range: [-0.5, 2.5], title: { text: 'q' } });
        expect(last().config.scrollZoom).toBe(false);
    });

    it('keeps the view across image swaps of the same size via uirevision', () => {
        const { rerender } = render(
            <PlotlyMaskOverlay image={{ type: 'array', data: IMAGE, shape: IMAGE_SHAPE }} />,
        );
        const rev = last().layout.uirevision;
        rerender(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: new Float32Array(6), shape: IMAGE_SHAPE }}
            />,
        );
        expect(last().layout.uirevision).toBe(rev);
        rerender(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: IMAGE, shape: IMAGE_SHAPE }}
                frameKey="scan-2"
            />,
        );
        expect(last().layout.uirevision).toBe('scan-2');
    });
});

describe('PlotlyMaskOverlay detector coordinates and display images', () => {
    beforeEach(() => stubImages());

    const SHAPE: [number, number] = [4, 6];
    const RAW = Float32Array.from({ length: 24 }, (_, i) => i);

    it('tiles the frame identically for heatmap cells and PNG pixels at any integer downsampling', () => {
        const [h, w] = SHAPE;
        const extent = imageExtent(SHAPE);
        const ranges = axisRanges(SHAPE);
        // Heatmap cell j (x0: 0, dx: 1) covers [j - 0.5, j + 0.5]: together exactly the axis range.
        expect([0 - 0.5, w - 1 + 0.5]).toEqual(ranges.x);
        expect([h - 1 + 0.5, 0 - 0.5]).toEqual(ranges.y);
        // A PNG of width w / k stretched over the extent: its pixel q covers detector
        // columns k*q .. k*q + k - 1, i.e. [k*q - 0.5, k*(q + 1) - 0.5].
        for (const k of [1, 2, 3]) {
            const pngWidth = w / k;
            for (let q = 0; q < pngWidth; q += 1) {
                const left = extent.x + (q * extent.sizex) / pngWidth;
                const right = extent.x + ((q + 1) * extent.sizex) / pngWidth;
                expect(left).toBe(k * q - 0.5);
                expect(right).toBe(k * (q + 1) - 0.5);
            }
        }
    });

    it('places a display PNG on the detector frame whatever its resolution', () => {
        render(<PlotlyMaskOverlay image={{ type: 'url', url: 'scan.png', shape: [100, 200] }} />);
        // The slot is on the detector frame from the start; Plotly gets the URL once it decodes.
        expect(below()).toHaveLength(1);
        expect(below()[0]).toMatchObject({
            source: EMPTY_IMAGE,
            x: -0.5,
            y: -0.5,
            sizex: 200,
            sizey: 100,
        });
        expect(last().layout.xaxis.range).toEqual([-0.5, 199.5]);
        expect(last().layout.yaxis.range).toEqual([99.5, -0.5]);
        // An explicitly downsampled PNG changes nothing about the coordinate space.
        finishLoad('scan.png', 50, 25);
        expect(below()[0]).toMatchObject({
            source: 'scan.png',
            x: -0.5,
            y: -0.5,
            sizex: 200,
            sizey: 100,
        });
        expect(last().layout.xaxis.range).toEqual([-0.5, 199.5]);
    });

    it('gives a mask PNG layer, a rasterised label mask and the base image the same geometry', async () => {
        const { unmount } = render(
            <PlotlyMaskOverlay
                image={{ type: 'url', url: 'scan.png', shape: [100, 200] }}
                imageLayers={[{ id: 'mask', url: 'mask.png' }]}
            />,
        );
        finishLoad('scan.png', 200, 100);
        finishLoad('mask.png', 50, 25);
        const base = geometry(below()[0]);
        const maskPng = geometry(above()[0]);
        unmount();

        render(
            <PlotlyMaskOverlay
                image={{ type: 'url', url: 'scan.png', shape: [100, 200] }}
                mask={{ type: 'labels', data: new Uint8Array(200 * 100).fill(1) }}
            />,
        );
        await waitFor(() => expect(above()).toHaveLength(1));
        expect(maskPng).toEqual(base);
        expect(geometry(above()[0])).toEqual(base);
    });

    it('reports the same detector pixel for a heatmap, a full-size PNG and a downsampled PNG', async () => {
        const variants: { image: ImageInput; load: readonly [string, number, number] | null }[] = [
            { image: { type: 'array', data: RAW, shape: SHAPE }, load: null },
            { image: { type: 'url', url: 'full.png', shape: SHAPE }, load: ['full.png', 6, 4] },
            { image: { type: 'url', url: 'half.png', shape: SHAPE }, load: ['half.png', 3, 2] },
        ];
        const seen: unknown[] = [];
        for (const { image, load } of variants) {
            const onHover = vi.fn();
            const { unmount } = render(<PlotlyMaskOverlay image={image} onHover={onHover} />);
            if (load) finishLoad(load[0], load[1], load[2]);
            seen.push([last().layout.xaxis.range, last().layout.yaxis.range]);
            hoverAt(2.4, 0.6);
            await waitFor(() =>
                expect(onHover).toHaveBeenLastCalledWith(expect.objectContaining({ x: 2, y: 1 })),
            );
            unmount();
        }
        expect(seen[1]).toEqual(seen[0]);
        expect(seen[2]).toEqual(seen[0]);
    });

    it.each([
        [2.4, 0.6, { x: 2, y: 1 }],
        [2.6, 1.4, { x: 3, y: 1 }],
        [-0.4, 0, { x: 0, y: 0 }],
        [5.4, 3.4, { x: 5, y: 3 }],
    ])('rounds data coordinate (%s, %s) to its pixel centre', async (x, y, pixel) => {
        const onHover = vi.fn();
        render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: RAW, shape: SHAPE }}
                onHover={onHover}
            />,
        );
        hoverAt(x, y);
        await waitFor(() =>
            expect(onHover).toHaveBeenLastCalledWith(
                expect.objectContaining({ ...pixel, value: RAW[pixel.y * 6 + pixel.x] }),
            ),
        );
    });

    it('reports nothing beyond the outer pixel edge', async () => {
        const onHover = vi.fn();
        render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: RAW, shape: SHAPE }}
                onHover={onHover}
            />,
        );
        hoverAt(5.4, 1);
        await waitFor(() =>
            expect(onHover).toHaveBeenLastCalledWith(expect.objectContaining({ x: 5 })),
        );
        hoverAt(5.6, 1);
        expect(onHover).toHaveBeenLastCalledWith(null);
    });

    it('keeps the previous picture until a new URL decodes, and ignores a slower older load', () => {
        const onLoadStateChange = vi.fn();
        const { rerender } = render(
            <PlotlyMaskOverlay
                image={{ type: 'url', url: 'a.png', shape: SHAPE }}
                onLoadStateChange={onLoadStateChange}
            />,
        );
        expect(below()[0].source).toBe(EMPTY_IMAGE);
        finishLoad('a.png', 6, 4);
        expect(below()[0].source).toBe('a.png');
        rerender(
            <PlotlyMaskOverlay
                image={{ type: 'url', url: 'b.png', shape: SHAPE }}
                onLoadStateChange={onLoadStateChange}
            />,
        );
        expect(below()[0].source).toBe('a.png');
        rerender(
            <PlotlyMaskOverlay
                image={{ type: 'url', url: 'c.png', shape: SHAPE }}
                onLoadStateChange={onLoadStateChange}
            />,
        );
        finishLoad('c.png', 3, 2);
        expect(below()[0].source).toBe('c.png');
        finishLoad('b.png', 6, 4);
        expect(below()[0].source).toBe('c.png');
        expect(onLoadStateChange.mock.calls).toEqual([
            ['image', { status: 'loading' }],
            ['image', { status: 'loaded', naturalWidth: 6, naturalHeight: 4 }],
            ['image', { status: 'loading' }],
            ['image', { status: 'loading' }],
            ['image', { status: 'loaded', naturalWidth: 3, naturalHeight: 2 }],
        ]);
    });

    it('does not refetch other layers when one URL changes', () => {
        const { rerender } = render(
            <PlotlyMaskOverlay
                image={{ type: 'url', url: 'scan.png', shape: SHAPE }}
                imageLayers={[{ id: 'mask', url: 'm1.png' }]}
            />,
        );
        rerender(
            <PlotlyMaskOverlay
                image={{ type: 'url', url: 'scan.png', shape: SHAPE }}
                imageLayers={[{ id: 'mask', url: 'm2.png' }]}
            />,
        );
        expect(created.map((i) => i.src)).toEqual(['scan.png', 'm1.png', 'm2.png']);
        // The same CORS mode as Plotly's own load, so both share the browser cache.
        expect(created.every((i) => i.crossOrigin === 'anonymous')).toBe(true);
    });

    it('drops a failed base image, shows an error, and does not show the stale picture', () => {
        const onLoadStateChange = vi.fn();
        const { rerender } = render(
            <PlotlyMaskOverlay
                image={{ type: 'url', url: 'a.png', shape: SHAPE }}
                onLoadStateChange={onLoadStateChange}
            />,
        );
        finishLoad('a.png', 6, 4);
        rerender(
            <PlotlyMaskOverlay
                image={{ type: 'url', url: 'b.png', shape: SHAPE }}
                onLoadStateChange={onLoadStateChange}
            />,
        );
        failLoad('b.png');
        expect(onLoadStateChange).toHaveBeenLastCalledWith('image', {
            status: 'error',
            message: 'Failed to load b.png',
        });
        expect(below().map((i) => i.source)).toEqual([EMPTY_IMAGE]);
        expect(screen.getByRole('alert')).toHaveTextContent('failed to load image');
    });

    it('reports a failed layer, names it on screen, and keeps its slot empty', () => {
        const onLoadStateChange = vi.fn();
        render(
            <PlotlyMaskOverlay
                image={{ type: 'url', url: 'scan.png', shape: SHAPE }}
                imageLayers={[
                    { id: 'rings', url: 'rings.png?token=x' },
                    { id: 'mask', url: 'mask.png' },
                ]}
                onLoadStateChange={onLoadStateChange}
            />,
        );
        finishLoad('scan.png', 6, 4);
        finishLoad('mask.png', 6, 4);
        failLoad('rings.png?token=x');
        expect(onLoadStateChange).toHaveBeenLastCalledWith('rings', {
            status: 'error',
            message: 'Failed to load rings.png',
        });
        // The slot stays, empty, so the mask keeps its place above it.
        expect(above().map((i) => i.source)).toEqual([EMPTY_IMAGE, 'mask.png']);
        expect(screen.getByRole('status')).toHaveTextContent('Not shown: rings');
        // A layer failing does not block the image.
        expect(screen.queryByRole('alert')).toBeNull();
    });

    it('keeps hidden layers in the figure at opacity 0', () => {
        render(
            <PlotlyMaskOverlay
                image={{ type: 'url', url: 'scan.png', shape: SHAPE }}
                imageLayers={[
                    { id: 'rings', url: 'rings.png', opacity: 0.4, visible: false },
                    { id: 'peaks', url: 'peaks.png', opacity: 0.4 },
                ]}
            />,
        );
        finishLoad('rings.png', 6, 4);
        finishLoad('peaks.png', 6, 4);
        expect(above().map((i) => [i.source, i.opacity])).toEqual([
            ['rings.png', 0],
            ['peaks.png', 0.4],
        ]);
    });

    it('stacks image layers in list order at opacity 1, then the structured mask at 0.5', async () => {
        render(
            <PlotlyMaskOverlay
                image={{ type: 'url', url: 'scan.png', shape: [2, 3] }}
                imageLayers={[
                    { id: 'rings', url: 'rings.png' },
                    { id: 'mask', url: 'mask.png' },
                ]}
                mask={{ type: 'labels', data: LABELS }}
            />,
        );
        finishLoad('rings.png', 3, 2);
        finishLoad('mask.png', 3, 2);
        await waitFor(() => expect(above()).toHaveLength(3));
        expect(above().map((i) => [String(i.source).slice(0, 10), i.opacity])).toEqual([
            ['rings.png', 1],
            ['mask.png', 1],
            ['blob:mock-', 0.5],
        ]);
        // plotly.js 3+ draws only one of pictures with the same key: every one needs its own,
        // while all of them still cover the same frame.
        expect(new Set(above().map(plotlyImageKey)).size).toBe(3);
        const frame = geometry(below()[0] ?? above()[0]);
        for (const entry of above()) expect(geometry(entry)).toEqual(frame);
        expect(Math.max(...above().map((i) => Math.abs((i.sizex as number) - 3)))).toBeLessThan(
            1e-8,
        );
    });

    it('warns once and draws only the first of layers that share an id', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        render(
            <PlotlyMaskOverlay
                image={{ type: 'url', url: 'scan.png', shape: SHAPE }}
                imageLayers={[
                    { id: 'mask', url: 'a.png' },
                    { id: 'mask', url: 'b.png' },
                    { id: 'image', url: 'c.png' },
                ]}
            />,
        );
        expect(above()).toHaveLength(1);
        expect(created.map((i) => i.src)).toEqual(['scan.png', 'a.png']);
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][0]).toContain('must be unique');
    });

    it('warns once when a display image is not an integer fraction of the frame', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { rerender } = render(
            <PlotlyMaskOverlay image={{ type: 'url', url: 'odd.png', shape: [100, 200] }} />,
        );
        finishLoad('odd.png', 60, 30);
        rerender(
            <PlotlyMaskOverlay
                image={{ type: 'url', url: 'odd.png', shape: [100, 200] }}
                className="x"
            />,
        );
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][0]).toContain('"image" is 60x30 for a 200x100 frame');

        warn.mockClear();
        render(
            <PlotlyMaskOverlay image={{ type: 'url', url: 'quarter.png', shape: [100, 200] }} />,
        );
        finishLoad('quarter.png', 50, 25);
        expect(warn).not.toHaveBeenCalled();
    });

    describe('inputs that do not fit the frame are rejected, never resampled', () => {
        /** Lets the mask raster encode, then returns the class-mask entries drawn above. */
        async function settledMasks() {
            await act(async () => {});
            return above();
        }
        const img: ImageInput = { type: 'array', data: IMAGE, shape: IMAGE_SHAPE };

        const misfits: [string, MaskInput, string][] = [
            [
                'nested labels of another shape',
                { type: 'labels', data: [[1, 0, 2]] },
                'rows are 1 × 3 but 2 × 3 was expected',
            ],
            [
                'flat labels of the wrong length',
                { type: 'labels', data: LABELS.slice(1) },
                '5 values but 2 × 3 needs 6',
            ],
            [
                'ragged label rows',
                {
                    type: 'labels',
                    data: [
                        [1, 0, 2],
                        [0, 0],
                    ],
                },
                'same length',
            ],
            [
                'a mask layer of the wrong length',
                {
                    type: 'layers',
                    layers: [
                        { classId: 1, data: new Uint8Array(6) },
                        { classId: 2, data: new Uint8Array(12) },
                    ],
                },
                'class 2 has 12 values',
            ],
        ];
        it.each(misfits)('drops %s and warns once', async (_, mask, message) => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const { rerender } = render(<PlotlyMaskOverlay image={img} mask={mask} />);
            rerender(<PlotlyMaskOverlay image={img} mask={mask} className="x" />);
            expect(await settledMasks()).toHaveLength(0);
            expect(warn).toHaveBeenCalledTimes(1);
            expect(warn.mock.calls[0][0]).toContain(message);
        });

        it('rejects a mask PNG passed as a mask, pointing to imageLayers', async () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const mask = { type: 'url', url: 'mask.png' } as unknown as MaskInput;
            render(<PlotlyMaskOverlay image={img} mask={mask} />);
            expect(await settledMasks()).toHaveLength(0);
            expect(created).toHaveLength(0);
            expect(warn).toHaveBeenCalledWith(expect.stringContaining('pass it in `imageLayers`'));
        });

        it('draws nothing and requests nothing when the image itself is rejected', () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            render(
                <PlotlyMaskOverlay
                    image={{ type: 'array', data: IMAGE, shape: [2, 2] }}
                    mask={{ type: 'labels', data: LABELS }}
                    imageLayers={[{ id: 'rings', url: 'rings.png' }]}
                />,
            );
            expect(plot.props).toBeNull();
            expect(created).toHaveLength(0);
            expect(screen.getByRole('alert')).toHaveTextContent('invalid image');
            expect(warn).toHaveBeenCalledTimes(1);
            expect(warn).toHaveBeenCalledWith(
                expect.stringContaining('6 values but 2 × 2 needs 4'),
            );
        });

        it('rejects ragged image rows instead of padding them', () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            render(
                <PlotlyMaskOverlay
                    image={{
                        type: 'array',
                        data: [
                            [1, 2, 3],
                            [4, 5],
                        ],
                    }}
                />,
            );
            expect(plot.props).toBeNull();
            expect(warn).toHaveBeenCalledWith(expect.stringContaining('same length'));
        });

        it('keeps a full-size label mask in detector pixels under a downsampled PNG', async () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const labels = Array.from({ length: 100 }, () => new Array<number>(200).fill(1));
            render(
                <PlotlyMaskOverlay
                    image={{ type: 'url', url: 'half.png', shape: [100, 200] }}
                    mask={{ type: 'labels', data: labels }}
                />,
            );
            finishLoad('half.png', 100, 50);
            await waitFor(() => expect(above()).toHaveLength(1));
            expect(last().layout.xaxis.range).toEqual([-0.5, 199.5]);
            expect(geometry(below()[0])).toEqual(geometry(above()[0]));
            expect(warn).not.toHaveBeenCalled();
        });

        it('shows no class legend for a mask PNG layer', () => {
            render(
                <PlotlyMaskOverlay
                    image={{ type: 'url', url: 'scan.png', shape: SHAPE }}
                    imageLayers={[{ id: 'mask', url: 'mask.png' }]}
                />,
            );
            const classTraces = last().data.filter(
                (t) => (t.meta as { kind: string }).kind === 'class',
            );
            expect(classTraces).toHaveLength(0);
        });
    });

    it('merges looked-up values into hover, one call at a time, newest pixel only', async () => {
        const onHover = vi.fn();
        const pending: { x: number; y: number; resolve: (v: number) => void }[] = [];
        const resolveValue = vi.fn(
            (x: number, y: number) =>
                new Promise<number>((resolve) => pending.push({ x, y, resolve })),
        );
        render(
            <PlotlyMaskOverlay
                image={{ type: 'url', url: 'scan.png', shape: SHAPE, resolveValue }}
                onHover={onHover}
            />,
        );
        finishLoad('scan.png', 6, 4);

        hoverAt(1, 1);
        await waitFor(() => expect(resolveValue).toHaveBeenCalledWith(1, 1));
        expect(onHover).toHaveBeenLastCalledWith(
            expect.not.objectContaining({ value: expect.anything() }),
        );

        hoverAt(3, 2);
        await waitFor(() =>
            expect(onHover).toHaveBeenLastCalledWith(expect.objectContaining({ x: 3, y: 2 })),
        );
        expect(resolveValue).toHaveBeenCalledTimes(1); // still in flight for (1, 1)

        await act(async () => pending[0].resolve(11));
        await waitFor(() => expect(resolveValue).toHaveBeenLastCalledWith(3, 2));
        await act(async () => pending[1].resolve(32));

        expect(onHover).toHaveBeenLastCalledWith(
            expect.objectContaining({ x: 3, y: 2, value: 32 }),
        );
        expect(onHover.mock.calls.some(([info]) => info?.value === 11)).toBe(false);
    });

    it("reports a click whose pointerup lands on Plotly's drag cover", async () => {
        const onClick = vi.fn();
        const roi = { type: 'rect' as const, x0: 0.5, y0: 0.5, x1: 2.5, y1: 1.5 };
        render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: RAW, shape: SHAPE }}
                annotations={[roi]}
                onClick={onClick}
            />,
        );
        realClickAt(4, 3);
        await waitFor(() =>
            expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ x: 4, y: 3 })),
        );
        expect(onClick.mock.calls[0][0]).not.toHaveProperty('annotation');
        // Inside an annotation, the click reports the annotation and the pixel beneath it.
        realClickAt(1.5, 1);
        expect(onClick).toHaveBeenLastCalledWith(
            expect.objectContaining({ x: 2, y: 1, annotation: { annotation: roi, index: 0 } }),
        );
        // One press, two clicks (the browser's and Plotly's own): one report each time.
        expect(onClick).toHaveBeenCalledTimes(2);
        // A click with no press on the plot, or a press that started on the modebar, is not a click.
        onClick.mockClear();
        fireEvent.click(document.body, clientAt(4, 3));
        const modebar = document.createElement('div');
        modebar.className = 'modebar';
        screen.getByTestId('plot').appendChild(modebar);
        browserClick(modebar, clientAt(4, 3));
        expect(onClick).not.toHaveBeenCalled();
    });

    it('looks up the value of a clicked pixel', async () => {
        const onClick = vi.fn();
        render(
            <PlotlyMaskOverlay
                image={{
                    type: 'url',
                    url: 'scan.png',
                    shape: SHAPE,
                    resolveValue: (x, y) => x * 10 + y,
                }}
                onClick={onClick}
            />,
        );
        clickAt(4.2, 2.8);
        await waitFor(() =>
            expect(onClick).toHaveBeenCalledWith(
                expect.objectContaining({ x: 4, y: 3, value: 43 }),
            ),
        );
    });

    it('exposes the base-image smoothing mode for the stylesheet', () => {
        const { rerender } = render(
            <PlotlyMaskOverlay image={{ type: 'url', url: 'scan.png', shape: SHAPE }} />,
        );
        expect(screen.getByTestId('plotly-mask-overlay')).toHaveAttribute(
            'data-image-smoothing',
            'auto',
        );
        rerender(
            <PlotlyMaskOverlay
                image={{ type: 'url', url: 'scan.png', shape: SHAPE, smoothing: true }}
            />,
        );
        expect(screen.getByTestId('plotly-mask-overlay')).toHaveAttribute(
            'data-image-smoothing',
            'true',
        );
    });
});

describe('PlotlyMaskOverlay view and canvas parity', () => {
    const SHAPE: [number, number] = [4, 6];
    const RAW = Float32Array.from({ length: 24 }, (_, i) => i);
    type Button = string | { name: string; click: (gd: unknown) => void };
    const buttons = () => (last().config.modeBarButtons as Button[][])[0];
    const names = () => buttons().map((b) => (typeof b === 'string' ? b : b.name));

    it('resets to the whole frame with explicit ranges, never autorange', () => {
        const onViewportChange = vi.fn();
        render(
            <PlotlyMaskOverlay
                image={{ type: 'url', url: 'scan.png', shape: SHAPE }}
                frameKey="scan-1"
                onViewportChange={onViewportChange}
            />,
        );
        expect(names()).toEqual(['zoom2d', 'pan2d', 'resetView', 'eraseshape']);
        expect(names()).not.toContain('autoScale2d');
        expect(names()).not.toContain('resetScale2d');

        const reset = buttons().find((b) => typeof b !== 'string' && b.name === 'resetView');
        act(() => (reset as Exclude<Button, string>).click({}));
        expect(onViewportChange).toHaveBeenLastCalledWith(null);
        // A new uirevision makes Plotly apply Finch's full-frame ranges again.
        expect(last().layout.uirevision).toBe('scan-1#1');
        expect(last().layout.xaxis.range).toEqual([-0.5, 5.5]);
        expect(last().layout.yaxis.range).toEqual([3.5, -0.5]);
    });

    it('reports zoom and pan as viewport ranges, and autorange as null', () => {
        const onViewportChange = vi.fn();
        render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: RAW, shape: SHAPE }}
                onViewportChange={onViewportChange}
            />,
        );
        act(() =>
            last().onRelayout({
                'xaxis.range[0]': 1,
                'xaxis.range[1]': 3,
                'yaxis.range[0]': 2.5,
                'yaxis.range[1]': 0.5,
            }),
        );
        expect(onViewportChange).toHaveBeenLastCalledWith({ x: [1, 3], y: [2.5, 0.5] });
        // Only the x range changed: y keeps the ranges currently shown.
        act(() => last().onRelayout({ 'xaxis.range': [2, 4] }));
        expect(onViewportChange).toHaveBeenLastCalledWith({ x: [2, 4], y: [3.5, -0.5] });
        act(() => last().onRelayout({ 'xaxis.autorange': true, 'yaxis.autorange': true }));
        expect(onViewportChange).toHaveBeenLastCalledWith(null);
        onViewportChange.mockClear();
        act(() => last().onRelayout({ dragmode: 'pan' }));
        expect(onViewportChange).not.toHaveBeenCalled();
    });

    it('shows a controlled viewport, and the whole frame for null', () => {
        const { rerender } = render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: RAW, shape: SHAPE }}
                viewport={{ x: [1, 3], y: [2.5, 0.5] }}
            />,
        );
        expect(last().layout.xaxis.range).toEqual([1, 3]);
        expect(last().layout.yaxis.range).toEqual([2.5, 0.5]);
        rerender(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: RAW, shape: SHAPE }}
                viewport={null}
            />,
        );
        expect(last().layout.xaxis.range).toEqual([-0.5, 5.5]);
    });

    it('locks the view when zoomable is false', () => {
        render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: RAW, shape: SHAPE }}
                zoomable={false}
            />,
        );
        expect(last().layout.xaxis.fixedrange).toBe(true);
        expect(last().layout.yaxis.fixedrange).toBe(true);
        expect(last().config.scrollZoom).toBe(false);
        expect(last().config.doubleClick).toBe(false);
        expect(names()).toEqual(['eraseshape']);
    });

    it('sizes fixed boxes by the frame aspect ratio, like the canvas renderer', () => {
        const { rerender } = render(
            <PlotlyMaskOverlay image={{ type: 'url', url: 'scan.png', shape: [100, 200] }} />,
        );
        const root = () => screen.getByTestId('plotly-mask-overlay');
        expect(root()).toHaveStyle({ width: '24rem', height: '12rem' });
        rerender(
            <PlotlyMaskOverlay
                image={{ type: 'url', url: 'scan.png', shape: [200, 100] }}
                size="small"
            />,
        );
        expect(root()).toHaveStyle({ width: '8rem', height: '16rem' });
        rerender(
            <PlotlyMaskOverlay
                image={{ type: 'url', url: 'scan.png', shape: [200, 100] }}
                size="full"
            />,
        );
        expect(root()).toHaveClass('w-full', 'h-full');
        expect(root().style.width).toBe('');
    });

    it('styles the shape being drawn with drawStyle dash and fill', () => {
        render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: RAW, shape: SHAPE }}
                dragMode="rect"
                drawStyle={{
                    stroke: '#ff0000',
                    strokeWidth: 2,
                    dash: [4, 3],
                    fill: '#00ff00',
                    fillOpacity: 0.5,
                }}
            />,
        );
        expect(last().layout.newshape).toEqual({
            line: { color: '#ff0000', width: 2, dash: '4px,3px' },
            fillcolor: 'rgba(0, 255, 0, 0.5)',
        });
    });

    it('labels shapes that have a title', () => {
        render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: RAW, shape: SHAPE }}
                annotations={[
                    { type: 'rect', x0: 0, y0: 0, x1: 2, y1: 2, title: 'Beamstop' },
                    { type: 'rect', x0: 3, y0: 0, x1: 4, y1: 1 },
                ]}
            />,
        );
        expect(last().layout.shapes[0].label).toEqual({ text: 'Beamstop' });
        expect(last().layout.shapes[1].label).toBeUndefined();
    });

    it('compares an object frameKey by content', () => {
        const { rerender } = render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: RAW, shape: SHAPE }}
                frameKey={{ scan: 'a', slice: [0] }}
            />,
        );
        const first = last().layout.uirevision;
        rerender(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: RAW, shape: SHAPE }}
                frameKey={{ scan: 'a', slice: [0] }}
            />,
        );
        expect(last().layout.uirevision).toBe(first);
        rerender(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: RAW, shape: SHAPE }}
                frameKey={{ scan: 'b', slice: [0] }}
            />,
        );
        expect(last().layout.uirevision).not.toBe(first);
    });
});

describe('PlotlyMaskOverlay annotation editing', () => {
    const SHAPE: [number, number] = [4, 6];
    const RAW = Float32Array.from({ length: 24 }, (_, i) => i);
    const beam = {
        type: 'line' as const,
        points: [
            [1, 2],
            [5, 2],
        ] as [number, number][],
        editable: false,
    };
    const roi = { type: 'rect' as const, x0: 0, y0: 0, x1: 2, y1: 2 };

    it('reports each drawn shape once, even if Plotly lists it again before the next update', () => {
        const onDrawComplete = vi.fn();
        render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: RAW, shape: SHAPE }}
                annotations={[roi]}
                dragMode="rect"
                onDrawComplete={onDrawComplete}
            />,
        );
        const drawn = { type: 'rect', x0: 3, y0: 1, x1: 5, y1: 3 };
        const finch = last().layout.shapes;
        act(() => last().onRelayout({ shapes: [...finch, drawn] }));
        act(() => last().onRelayout({ shapes: [...finch, drawn] }));
        expect(onDrawComplete).toHaveBeenCalledTimes(1);
        const second = { type: 'rect', x0: 1, y0: 1, x1: 2, y1: 2 };
        act(() => last().onRelayout({ shapes: [...finch, drawn, second] }));
        expect(onDrawComplete).toHaveBeenCalledTimes(2);
        expect(onDrawComplete).toHaveBeenLastCalledWith({
            type: 'rect',
            x0: 1,
            y0: 1,
            x1: 2,
            y1: 2,
        });
    });

    it('lets Plotly activate an unselected shape on a single click, even if the app restyles it', () => {
        // An app that highlights the clicked region re-renders in `onClick`, and Plotly then
        // replaces its shape elements. Plotly must have seen the click on the shape first.
        function App() {
            const [selected, setSelected] = useState<number | null>(null);
            return (
                <PlotlyMaskOverlay
                    image={{ type: 'array', data: RAW, shape: SHAPE }}
                    annotations={[{ ...roi, strokeWidth: selected === 0 ? 3 : 1 }]}
                    editableAnnotations
                    onClick={(info) => setSelected(info.annotation?.index ?? null)}
                />
            );
        }
        render(<App />);
        const shape = screen.getByTestId('plot').querySelector('.shape-group')!;
        browserClick(shape, clientAt(1, 1));
        expect(activated.list).toEqual([0]);
        // The app saw the click and restyled the region, which replaced the shape element.
        expect(last().layout.shapes[0].line).toMatchObject({ width: 3 });
        expect(screen.getByTestId('plot').querySelector('.shape-group')).not.toBe(shape);
    });

    it('picks the pixel where the press was, although the click Plotly re-dispatches is rounded to whole pixels', () => {
        const onClick = vi.fn();
        render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: RAW, shape: SHAPE }}
                onClick={onClick}
            />,
        );
        const gd = screen.getByTestId('plot');
        // Pressed just inside pixel (3, 1), at a fractional screen position.
        const press = clientAt(2.55, 0.55);
        fireEvent.pointerDown(gd, press);
        fireEvent.click(gd, {
            clientX: Math.floor(press.clientX),
            clientY: Math.floor(press.clientY),
        });
        expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ x: 3, y: 1 }));
    });

    it('reports a click once per press, although Plotly re-dispatches clicks it covered', () => {
        const onClick = vi.fn();
        render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: RAW, shape: SHAPE }}
                onClick={onClick}
            />,
        );
        const gd = screen.getByTestId('plot');
        fireEvent.pointerDown(gd, clientAt(2, 2));
        fireEvent.click(gd, clientAt(2, 2));
        fireEvent.click(document.body, clientAt(2, 2));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('lets each annotation override editableAnnotations', () => {
        render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: RAW, shape: SHAPE }}
                annotations={[beam, roi]}
                editableAnnotations
            />,
        );
        expect(last().layout.shapes.map((s) => s.editable)).toEqual([false, true]);
    });

    it('ignores edits to a fixed shape and applies them to an editable one', () => {
        const onAnnotationChange = vi.fn();
        render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: RAW, shape: SHAPE }}
                annotations={[beam, roi]}
                editableAnnotations
                onAnnotationChange={onAnnotationChange}
            />,
        );
        act(() => last().onRelayout({ 'shapes[0].x0': 3 }));
        expect(onAnnotationChange).not.toHaveBeenCalled();
        act(() => last().onRelayout({ 'shapes[1].x1': 4 }));
        expect(onAnnotationChange).toHaveBeenLastCalledWith([beam, { ...roi, x1: 4 }]);
    });

    it('never erases a fixed shape', () => {
        const onAnnotationChange = vi.fn();
        render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: RAW, shape: SHAPE }}
                annotations={[beam, roi]}
                editableAnnotations
                onAnnotationChange={onAnnotationChange}
            />,
        );
        // Both Finch shapes missing from the list: only the editable one counts as erased.
        act(() => last().onRelayout({ shapes: [] }));
        expect(onAnnotationChange).toHaveBeenLastCalledWith([beam]);
        onAnnotationChange.mockClear();
        act(() => last().onRelayout({ shapes: [last().layout.shapes[1]] }));
        expect(onAnnotationChange).not.toHaveBeenCalled();
    });
});

describe('PlotlyMaskOverlay values come from data, never from display images', () => {
    beforeEach(() => stubImages());

    it('shows no Plotly tooltip over gaps, but still reports NaN pixels through onHover', async () => {
        const onHover = vi.fn();
        const values = new Float32Array([1, NaN, 3, 4, 5, 6]);
        render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: values, shape: [2, 3] }}
                onHover={onHover}
            />,
        );
        const heatmap = last().data[0];
        expect(heatmap.hoverongaps).toBe(false);
        expect(heatmap.hovertemplate).toBe('value %{z:.6~g}<extra></extra>');
        hoverAt(1, 0);
        await waitFor(() => expect(onHover).toHaveBeenCalled());
        const info = onHover.mock.calls.at(-1)![0];
        expect(info).toMatchObject({ x: 1, y: 0 });
        expect(Number.isNaN(info.value)).toBe(true);
    });

    it('reports the raw value on hover when the heatmap is log-scaled', async () => {
        const onHover = vi.fn();
        const values = new Float32Array([1, 10, 100, 1000, 0, 10000]);
        render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: values, shape: [2, 3], logScale: true }}
                onHover={onHover}
            />,
        );
        hoverAt(0, 1);
        await waitFor(() =>
            expect(onHover).toHaveBeenLastCalledWith(
                expect.objectContaining({ x: 0, y: 1, value: 1000 }),
            ),
        );
        hoverAt(1, 1);
        await waitFor(() =>
            expect(onHover).toHaveBeenLastCalledWith(
                expect.objectContaining({ x: 1, y: 1, value: 0 }),
            ),
        );
    });

    it('reports no value for a display PNG without a lookup', async () => {
        const onHover = vi.fn();
        render(
            <PlotlyMaskOverlay
                image={{ type: 'url', url: 'scan.png', shape: [2, 3] }}
                onHover={onHover}
            />,
        );
        finishLoad('scan.png', 3, 2);
        hoverAt(1, 1);
        await waitFor(() =>
            expect(onHover).toHaveBeenLastCalledWith(expect.objectContaining({ x: 1, y: 1 })),
        );
        expect(onHover.mock.calls.every(([info]) => info === null || !('value' in info))).toBe(
            true,
        );
    });
});

describe('PlotlyMaskOverlay hover and click report everything under the pointer', () => {
    const SHAPE: [number, number] = [4, 6];
    const RAW = Float32Array.from({ length: 24 }, (_, i) => i);
    // Two points of one layer: A at pixel (1, 1), B at pixel (4, 2). Markers are 5 px.
    const POINTS = [
        [1, 1],
        [4, 2],
    ] as [number, number][];
    const layer = { id: 'cp', label: 'Control points', points: POINTS };
    const A = { layerId: 'cp', label: 'Control points', index: 0, x: 1, y: 1 };
    const B = { layerId: 'cp', label: 'Control points', index: 1, x: 4, y: 2 };

    /** Plotly's own `plotly_hover` for point `index` of the layer, as its throttle delivers it. */
    function plotlyHover(index: number) {
        const trace = last().data.find((t) => t.name === 'Control points')!;
        const [x, y] = POINTS[index];
        act(() => last().onHover({ points: [{ data: trace, pointIndex: index, x, y }] }));
    }
    const lastHover = (fn: ReturnType<typeof vi.fn>) =>
        fn.mock.calls.at(-1)?.[0] as OverlayPickInfo | null | undefined;

    function setup(extra: Record<string, unknown> = {}) {
        const onHover = vi.fn();
        const onClick = vi.fn();
        const result = render(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: RAW, shape: SHAPE }}
                pointLayers={[layer]}
                onHover={onHover}
                onClick={onClick}
                {...extra}
            />,
        );
        return { onHover, onClick, ...result };
    }

    it('adds the hovered point to the pixel, and drops it once the pointer has moved on', async () => {
        const { onHover } = setup();
        hoverAt(1.2, 1.1);
        await waitFor(() => expect(lastHover(onHover)).toMatchObject({ x: 1, y: 1 }));
        plotlyHover(0);
        expect(lastHover(onHover)).toEqual(expect.objectContaining({ x: 1, y: 1, point: A }));

        // Rapidly on to B, before Plotly's next hover: A is 30 px away now, so it is not reported.
        hoverAt(4, 2);
        await waitFor(() => expect(lastHover(onHover)).toMatchObject({ x: 4, y: 2 }));
        expect(lastHover(onHover)).not.toHaveProperty('point');
        plotlyHover(1);
        expect(lastHover(onHover)).toEqual(expect.objectContaining({ x: 4, y: 2, point: B }));

        // A late hover for A, delivered after the pointer reached B, is ignored as too far.
        const calls = onHover.mock.calls.length;
        plotlyHover(0);
        expect(
            onHover.mock.calls.slice(calls).every(([i]) => !i?.point || i.point.index !== 0),
        ).toBe(true);
        // No report ever paired a pixel with a point far from it.
        for (const [info] of onHover.mock.calls) {
            if (info?.point) expect(Math.abs(info.point.x - info.x)).toBeLessThanOrEqual(1);
        }
        act(() => last().onUnhover());
        expect(lastHover(onHover)).not.toHaveProperty('point');
    });

    it('clicks the point at the click position, even before its hover arrives', () => {
        const { onClick } = setup();
        hoverAt(1, 1);
        plotlyHover(0);
        // Click on B while Plotly still has A hovered.
        clickAt(4.1, 2);
        expect(onClick).toHaveBeenLastCalledWith(expect.objectContaining({ x: 4, y: 2, point: B }));
        // More than 20 CSS px from every point: no point at all.
        clickAt(0, 3.4);
        expect(onClick.mock.calls.at(-1)![0]).not.toHaveProperty('point');
        expect(onClick.mock.calls.flatMap(([i]) => (i.point ? [i.point.index] : []))).toEqual([1]);
    });

    it('reports nothing once the pointer leaves, even if a delayed Plotly hover lands after', async () => {
        const { onHover } = setup();
        hoverAt(1, 1);
        await waitFor(() => expect(lastHover(onHover)).toMatchObject({ x: 1 }));
        plotlyHover(0);
        expect(lastHover(onHover)).toHaveProperty('point', A);

        // Leave with a pointer move still waiting for its animation frame.
        hoverAt(1.1, 1);
        fireEvent.pointerLeave(screen.getByTestId('plot'));
        expect(onHover).toHaveBeenLastCalledWith(null);
        const calls = onHover.mock.calls.length;
        plotlyHover(0);
        act(() => last().onUnhover());
        await act(async () => new Promise((r) => requestAnimationFrame(() => r(null))));
        expect(onHover.mock.calls.length).toBe(calls);

        // Coming back far from A reports the pixel alone.
        hoverAt(3, 3);
        await waitFor(() => expect(lastHover(onHover)).toMatchObject({ x: 3, y: 3 }));
        expect(lastHover(onHover)).not.toHaveProperty('point');
    });

    it('reports a point, the topmost annotation and the pixel together where they overlap', () => {
        const outer = { type: 'rect' as const, x0: 0, y0: 0, x1: 3, y1: 3 };
        const inner = { type: 'ellipse' as const, x0: 0.5, y0: 0.5, x1: 1.5, y1: 1.5 };
        const { onClick } = setup({ annotations: [outer, inner] });
        clickAt(1, 1);
        expect(onClick).toHaveBeenLastCalledWith({
            x: 1,
            y: 1,
            classId: null,
            label: undefined,
            value: RAW[1 * 6 + 1],
            point: A,
            annotation: { annotation: inner, index: 1 },
        });
    });

    it('keeps detector coordinates and on-screen tolerances right when zoomed and panned', async () => {
        // A 60 x 40 CSS px plot: the full 6 x 4 frame is 10 px per pixel.
        plot.length = { x: 60, y: 40 };
        const { onHover, onClick, rerender } = setup();
        // One detector pixel right of A is 10 px - 3 px marker radius away: within 20 px.
        clickAt(2, 1);
        expect(onClick).toHaveBeenLastCalledWith(expect.objectContaining({ x: 2, point: A }));

        // Zoom 3x around A: [0.5, 2.5] x [1.5, 0.5] now fills the plot, 30 px per pixel.
        const zoomed = { x: [0.5, 2.5], y: [1.5, 0.5] } as {
            x: [number, number];
            y: [number, number];
        };
        rerender(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: RAW, shape: SHAPE }}
                pointLayers={[layer]}
                onHover={onHover}
                onClick={onClick}
                viewport={zoomed}
            />,
        );
        hoverAt(1.3, 0.8);
        await waitFor(() => expect(lastHover(onHover)).toMatchObject({ x: 1, y: 1 }));
        plotlyHover(0);
        expect(lastHover(onHover)).toHaveProperty('point', A);
        // 0.1 px off A is 3 CSS px: still A. The same one pixel to the right is now 27 px: no point.
        clickAt(1.1, 1);
        expect(onClick).toHaveBeenLastCalledWith(expect.objectContaining({ x: 1, y: 1, point: A }));
        clickAt(2, 1);
        expect(onClick.mock.calls.at(-1)![0]).toMatchObject({ x: 2, y: 1, value: RAW[1 * 6 + 2] });
        expect(onClick.mock.calls.at(-1)![0]).not.toHaveProperty('point');

        // Pan to B: [3, 5] x [2.5, 1.5].
        rerender(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: RAW, shape: SHAPE }}
                pointLayers={[layer]}
                onHover={onHover}
                onClick={onClick}
                viewport={{ x: [3, 5], y: [2.5, 1.5] }}
            />,
        );
        clickAt(4.1, 1.9);
        expect(onClick).toHaveBeenLastCalledWith(
            expect.objectContaining({ x: 4, y: 2, value: RAW[2 * 6 + 4], point: B }),
        );
    });

    it('leaves hidden and non-hoverable layers out of hover and click', () => {
        const { onClick, rerender } = setup({ pointLayers: [{ ...layer, hoverable: false }] });
        clickAt(1, 1);
        expect(onClick.mock.calls.at(-1)![0]).not.toHaveProperty('point');
        rerender(
            <PlotlyMaskOverlay
                image={{ type: 'array', data: RAW, shape: SHAPE }}
                pointLayers={[{ ...layer, visible: false }]}
                onClick={onClick}
            />,
        );
        clickAt(1, 1);
        expect(onClick.mock.calls.at(-1)![0]).not.toHaveProperty('point');
    });
});

describe('PlotlyMaskOverlay never shows pictures from another frame', () => {
    beforeEach(() => stubImages());
    const SHAPE: [number, number] = [4, 6];

    function overlay(
        key: string,
        image: string,
        mask: string,
        extra: Record<string, unknown> = {},
    ) {
        return (
            <PlotlyMaskOverlay
                image={{ type: 'url', url: image, shape: SHAPE }}
                imageLayers={[{ id: 'mask', url: mask }]}
                frameKey={key}
                {...extra}
            />
        );
    }

    it('drops every picture at once when frameKey changes, and ignores late loads of the old frame', () => {
        const onLoadStateChange = vi.fn();
        const { rerender } = render(overlay('s1', 'a.png', 'ma.png', { onLoadStateChange }));
        finishLoad('a.png', 6, 4);
        finishLoad('ma.png', 6, 4);
        expect([below()[0].source, above()[0].source]).toEqual(['a.png', 'ma.png']);

        // A new picture for the same frame is still loading when the frame changes.
        rerender(overlay('s1', 'a2.png', 'ma.png', { onLoadStateChange }));
        expect(below()[0].source).toBe('a.png');
        rerender(overlay('s2', 'b.png', 'mb.png', { onLoadStateChange }));
        // In the very render the key changes, nothing of frame s1 is left on screen.
        expect([below()[0].source, above()[0].source]).toEqual([EMPTY_IMAGE, EMPTY_IMAGE]);

        onLoadStateChange.mockClear();
        finishLoad('a2.png', 6, 4);
        expect(below()[0].source).toBe(EMPTY_IMAGE);
        expect(onLoadStateChange).not.toHaveBeenCalled();

        finishLoad('b.png', 6, 4);
        expect([below()[0].source, above()[0].source]).toEqual(['b.png', EMPTY_IMAGE]);
        finishLoad('mb.png', 6, 4);
        expect([below()[0].source, above()[0].source]).toEqual(['b.png', 'mb.png']);
    });

    it('reloads a URL the new frame shares with the old one rather than reusing its picture', () => {
        const { rerender } = render(overlay('s1', 'a.png', 'm.png'));
        finishLoad('a.png', 6, 4);
        finishLoad('m.png', 6, 4);
        rerender(overlay('s2', 'b.png', 'm.png'));
        expect(above()[0].source).toBe(EMPTY_IMAGE);
        expect(created.filter((i) => i.src === 'm.png')).toHaveLength(2);
        finishLoad('m.png', 6, 4);
        expect(above()[0].source).toBe('m.png');
    });

    it('defaults frameKey to the image shape', () => {
        const { rerender } = render(
            <PlotlyMaskOverlay image={{ type: 'url', url: 'a.png', shape: SHAPE }} />,
        );
        finishLoad('a.png', 6, 4);
        rerender(<PlotlyMaskOverlay image={{ type: 'url', url: 'b.png', shape: [8, 12] }} />);
        expect(below()[0].source).toBe(EMPTY_IMAGE);
    });
});

describe('PlotlyMaskOverlay recovers from loading errors', () => {
    beforeEach(() => stubImages());
    const SHAPE: [number, number] = [4, 6];
    const status = () => screen.queryByRole('status');

    function overlay(layers: { id: string; url: string }[], key = 's1', image = 'scan.png') {
        return (
            <PlotlyMaskOverlay
                image={{ type: 'url', url: image, shape: SHAPE }}
                imageLayers={layers}
                frameKey={key}
            />
        );
    }

    it('shows nothing for an absent layer and no status while one loads', () => {
        const { rerender } = render(overlay([]));
        expect(above()).toHaveLength(0);
        rerender(overlay([{ id: 'mask', url: 'm.png' }]));
        expect(above()[0].source).toBe(EMPTY_IMAGE);
        expect(status()).toBeNull();
    });

    it('clears a failure when the layer gets a new URL that loads', () => {
        const { rerender } = render(overlay([{ id: 'mask', url: 'bad.png' }]));
        failLoad('bad.png');
        expect(status()).toHaveTextContent('Not shown: mask');
        rerender(overlay([{ id: 'mask', url: 'good.png' }]));
        expect(status()).toBeNull();
        finishLoad('good.png', 6, 4);
        expect(above()[0].source).toBe('good.png');
    });

    it('clears a failure when the layer is removed', () => {
        const { rerender } = render(overlay([{ id: 'mask', url: 'bad.png' }]));
        failLoad('bad.png');
        rerender(overlay([]));
        expect(status()).toBeNull();
    });

    it('clears a failure, and retries the same URL, when the frame changes', () => {
        const { rerender } = render(overlay([{ id: 'mask', url: 'bad.png' }]));
        failLoad('bad.png');
        rerender(overlay([{ id: 'mask', url: 'bad.png' }], 's2', 'scan2.png'));
        expect(status()).toBeNull();
        expect(created.filter((i) => i.src === 'bad.png')).toHaveLength(2);
    });

    it('draws no layer and no mask over a failed image, and restores them once it loads', async () => {
        const labels = new Uint8Array(24).fill(1);
        const view = (image: string) => (
            <PlotlyMaskOverlay
                image={{ type: 'url', url: image, shape: SHAPE }}
                imageLayers={[{ id: 'mask', url: 'm.png' }]}
                mask={{ type: 'labels', data: labels }}
                frameKey="s1"
            />
        );
        const { rerender } = render(view('scan.png'));
        finishLoad('m.png', 6, 4);
        failLoad('scan.png');
        await act(async () => {});
        // The layer slot stays, empty; the rasterised mask is not drawn at all.
        expect(above().map((i) => i.source)).toEqual([EMPTY_IMAGE]);
        expect(screen.getByRole('alert')).toHaveTextContent('failed to load image');

        rerender(view('scan-retry.png'));
        finishLoad('scan-retry.png', 6, 4);
        await waitFor(() => expect(above()).toHaveLength(2));
        expect(above()[0].source).toBe('m.png');
        expect(String(above()[1].source)).toMatch(/^blob:/);
    });

    it('blocks only for a failed image, never for a failed layer', () => {
        const { rerender } = render(overlay([{ id: 'mask', url: 'm.png' }]));
        failLoad('scan.png');
        finishLoad('m.png', 6, 4);
        expect(screen.getByRole('alert')).toHaveTextContent('failed to load image');
        expect(status()).toBeNull();
        rerender(overlay([{ id: 'mask', url: 'm.png' }], 's1', 'scan-retry.png'));
        expect(screen.queryByRole('alert')).toBeNull();
    });
});
