import { useMemo } from 'react';
import type { Config, Data, Layout, Shape } from 'plotly.js';
import { colormapLut } from '@/utils/colorUtils';
import { valueRange } from '@/utils/histogramUtils';
import {
    geometryToPlotlyShape,
    markersToScatterTrace,
    plotlyStyle,
    SCATTER_GL_THRESHOLD,
} from '@/utils/plotlyShapes';
import type {
    Annotation,
    AnnotationStyle,
    DragMode,
    OverlayViewport,
    ResolvedMaskClass,
    ResolvedPointLayer,
} from '@/components/PlotlyMaskOverlay/types';
import type { NormalizedGrid } from '@/components/PlotlyMaskOverlay/hooks/useImageSources';

/** Prefix of the `name` Finch gives the layout shapes it owns, followed by the annotation index. */
export const FINCH_SHAPE_PREFIX = 'finch:';

/*
 * Pixel coordinate convention, the same as PlotlyHeatmap (Plotly's heatmap default):
 * detector pixel (row i, column j) is centred at data coordinates (x = j, y = i) and spans
 * [j - 0.5, j + 0.5] x [i - 0.5, i + 0.5]. A backend array index is therefore shown at that
 * integer with no offset, and raw-array heatmaps and display PNGs cover the same frame.
 */

/** Plotly's home icon, in its own units, for the reset-view modebar button. */
const RESET_ICON = {
    width: 928.6,
    height: 1000,
    path: 'm786 296v-267q0-15-11-26t-25-10h-214v214h-143v-214h-214q-15 0-25 10t-11 26v267q0 1 0 2t0 2l321 264 321-264q1-1 1-4z m124 39l-34-41q-5-5-12-6h-2q-7 0-12 3l-386 322-386-322q-7-4-13-4-7 2-12 7l-35 41q-4 5-3 13t6 12l401 334q18 15 42 15t43-15l136-114v109q0 8 5 13t13 5h107q8 0 13-5t5-13v-227l122-102q5-5 6-12t-4-13z',
    transform: 'matrix(1 0 0 -1 0 850)',
};

/**
 * Placement of a raster that covers the whole `[h, w]` detector frame. A PNG of any size is
 * stretched onto it, so pixel `q` of a PNG downsampled by an integer factor `k` covers detector
 * columns `k*q … k*q + k - 1` exactly.
 */
export function imageExtent([h, w]: [number, number]) {
    return { x: -0.5, y: -0.5, sizex: w, sizey: h };
}

/**
 * The viewport after a Plotly relayout event: `null` after an autorange, `undefined` when the
 * event does not touch the axes. Missing ends are taken from `current`, since Plotly reports
 * only what changed (`xaxis.range[0]` …) or whole ranges (`xaxis.range`).
 */
export function viewportFromRelayout(
    event: Readonly<Record<string, unknown>>,
    current: OverlayViewport | null,
): OverlayViewport | null | undefined {
    if (event['xaxis.autorange'] === true || event['yaxis.autorange'] === true) return null;
    const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
    const end = (axis: 'xaxis' | 'yaxis', i: 0 | 1) => {
        const whole = event[`${axis}.range`];
        return Array.isArray(whole) ? num(whole[i]) : num(event[`${axis}.range[${i}]`]);
    };
    const x0 = end('xaxis', 0);
    const x1 = end('xaxis', 1);
    const y0 = end('yaxis', 0);
    const y1 = end('yaxis', 1);
    if ([x0, x1, y0, y1].every((v) => v === undefined)) return undefined;
    return {
        x: [x0 ?? current?.x[0] ?? 0, x1 ?? current?.x[1] ?? 0],
        y: [y0 ?? current?.y[0] ?? 0, y1 ?? current?.y[1] ?? 0],
    };
}

/** Axis ranges that show the whole `[h, w]` frame, y pointing down. */
export function axisRanges([h, w]: [number, number]): {
    x: [number, number];
    y: [number, number];
} {
    return { x: [-0.5, w - 0.5], y: [h - 0.5, -0.5] };
}

/** Plotly `dragmode` for each Finch drag mode. */
export const PLOTLY_DRAGMODE: Record<DragMode, Layout['dragmode']> = {
    zoom: 'zoom',
    pan: 'pan',
    rect: 'drawrect',
    ellipse: 'drawcircle',
    lasso: 'drawclosedpath',
};

/** Finch drag mode for a Plotly `dragmode`, or `undefined` for modes Finch does not offer. */
export function dragModeFromPlotly(mode: unknown): DragMode | undefined {
    if (typeof mode !== 'string') return undefined;
    return (Object.keys(PLOTLY_DRAGMODE) as DragMode[]).find((m) => PLOTLY_DRAGMODE[m] === mode);
}

/**
 * A transparent 1×1 picture for an image slot whose URL has not decoded yet. Plotly binds
 * layout images by position and shows a `data:` URL at once, so a placeholder keeps every
 * slot in place and replaces a stale picture in the same update.
 */
export const EMPTY_IMAGE =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/**
 * Plotly's layout plus `newshape`, a real layout option (styling a shape while it is
 * drawn) that `@types/plotly.js` does not declare yet.
 */
export type OverlayLayout = Partial<Layout> & {
    newshape?: { line?: { color?: string; width?: number }; fillcolor?: string };
};

/** What a trace stands for, stored in its `meta` so legend and hover events map back. */
export type TraceMeta =
    | { kind: 'image' }
    | { kind: 'points'; layerId: string; label?: string }
    | { kind: 'class'; classId: number }
    | { kind: 'extra' };

/** A Plotly colorscale sampled from a Finch colormap, for heatmap traces. */
export function colormapToColorscale(colormap: string, stops = 16): [number, string][] {
    const lut = colormapLut(colormap);
    const out: [number, string][] = [];
    for (let i = 0; i < stops; i += 1) {
        const t = i / (stops - 1);
        const k = Math.round(t * 255) * 3;
        out.push([t, `rgb(${lut[k]},${lut[k + 1]},${lut[k + 2]})`]);
    }
    return out;
}

/**
 * Colorbar ticks for a log10 colour axis spanning `[lo, hi]` (log10 units), labelled in
 * native units: one tick per decade, or the two ends when the range is under a decade.
 */
export function logColorbarTicks(
    lo: number,
    hi: number,
): { tickvals: number[]; ticktext: string[] } {
    const decades: number[] = [];
    for (let k = Math.ceil(lo); k <= Math.floor(hi); k += 1) decades.push(k);
    if (decades.length >= 2) {
        return { tickvals: decades, ticktext: decades.map((k) => `10<sup>${k}</sup>`) };
    }
    const ends = [lo, hi];
    return {
        tickvals: ends,
        ticktext: ends.map((v) => Number((10 ** v).toPrecision(3)).toString()),
    };
}

/**
 * Heatmap `z` rows for a flat grid. Typed arrays are sliced with `subarray`, so the
 * rows share memory with the source rather than copying it. Under `log`, a log10
 * copy is made, with values at or below zero set to `NaN` (shown as gaps).
 */
export function heatmapRows(grid: NormalizedGrid, log: boolean): ArrayLike<number>[] {
    const [h, w] = grid.shape;
    let data = grid.data;
    if (log) {
        const copy = new Float32Array(w * h);
        for (let i = 0; i < copy.length; i += 1) {
            const v = data[i];
            copy[i] = v > 0 ? Math.log10(v) : NaN;
        }
        data = copy;
    }
    const rows: ArrayLike<number>[] = new Array(h);
    const typed = ArrayBuffer.isView(data) && 'subarray' in data;
    for (let y = 0; y < h; y += 1) {
        rows[y] = typed
            ? (data as Float32Array).subarray(y * w, (y + 1) * w)
            : Array.prototype.slice.call(data, y * w, (y + 1) * w);
    }
    return rows;
}

/** Inputs to {@link usePlotlyOverlayFigure}. */
export type PlotlyOverlayFigureInput = {
    imageSize: [number, number];
    imageGrid: NormalizedGrid | null;
    imageColormap: string;
    imageDomain?: [number, number];
    imageLogScale: boolean;
    baseUrl: string | null;
    maskUrl: string | null;
    maskOpacity: number;
    layers: { id: string; url: string; opacity: number; visible: boolean }[];
    annotations?: Annotation[];
    pointLayers: ResolvedPointLayer[];
    classes: ResolvedMaskClass[];
    showClassLegend: boolean;
    dragMode: DragMode;
    drawStyle?: AnnotationStyle;
    editableAnnotations: boolean;
    showAxes: boolean;
    showLegend: boolean;
    showColorbar: boolean;
    uirevision: string;
    /** Bumped after each shape change, so Plotly shows exactly the annotations passed in. */
    tick: number;
    /** Controlled ranges; `null` or `undefined` shows the whole frame. */
    viewport?: OverlayViewport | null;
    zoomable: boolean;
    /** Called by the modebar's reset button. */
    onResetView: () => void;
    extraTraces?: Data[];
    layout?: OverlayLayout;
    config?: Partial<Config>;
};

/**
 * Width added to the `k`-th picture in a layer, in detector pixels, so each has its own key.
 * plotly.js 3 and later join layout images by their geometry (`x`, `y`, `sizex`, `sizey` and the
 * axis refs) and draw only the first of pictures that share it, and every Finch picture covers
 * the same frame. 1e-9 pixel per picture changes the key and nothing visible or measurable.
 */
export const IMAGE_KEY_STEP = 1e-9;

/** A layout image anchored to the detector frame in data coordinates; `k` makes its key unique. */
function imageEntry(
    source: string,
    shape: [number, number],
    layer: 'below' | 'above',
    opacity = 1,
    k = 0,
): Partial<Layout['images'][number]> {
    const extent = imageExtent(shape);
    return {
        source,
        ...extent,
        sizex: extent.sizex + k * IMAGE_KEY_STEP,
        xref: 'x',
        yref: 'y',
        xanchor: 'left',
        yanchor: 'top',
        sizing: 'stretch',
        layer,
        opacity,
    };
}

/**
 * Builds the Plotly figure for {@link PlotlyMaskOverlay} from resolved inputs.
 *
 * - The base image is a `heatmap` trace for a raw `image`, with cell `j` centred at `j`, or
 *   the backend's display PNG as a `layout.images` entry below the traces; both cover the
 *   frame given by {@link imageExtent}. Under `imageLogScale` the heatmap colours log10
 *   values, applied once in {@link heatmapRows}; its hover label and colorbar stay native.
 * - Image layers, then the rasterised class mask, are `layout.images` drawn above the
 *   traces, as in Plotly's own layering model: they therefore sit above point markers too.
 *   Hidden layers stay in the list at opacity 0, and undecoded ones hold {@link EMPTY_IMAGE},
 *   so Plotly's image elements, which it binds by position, never trade pictures.
 * - Annotations become layout shapes named `finch:<index>`; point layers become scatter
 *   traces.
 * - Classes get legend-only placeholder traces, so the Plotly legend can toggle them.
 */
export function usePlotlyOverlayFigure(input: PlotlyOverlayFigureInput) {
    const {
        imageSize,
        imageGrid,
        imageColormap,
        imageDomain,
        imageLogScale,
        baseUrl,
        maskUrl,
        maskOpacity,
        layers,
        annotations,
        pointLayers,
        classes,
        showClassLegend,
        dragMode,
        drawStyle,
        editableAnnotations,
        showAxes,
        showLegend,
        showColorbar,
        uirevision,
        tick,
        viewport,
        zoomable,
        onResetView,
        extraTraces,
        layout: layoutOverride,
        config: configOverride,
    } = input;

    const domainLo = imageDomain?.[0];
    const domainHi = imageDomain?.[1];

    // The heatmap trace is the expensive part, so it is memoized on its own inputs.
    const heatmapTrace = useMemo((): Data | null => {
        if (!imageGrid) return null;
        // `imageDomain` is native; under log, `valueRange` returns the colour range in log10.
        const [lo, hi] = valueRange(
            imageGrid.data,
            imageGrid.data.length,
            domainLo !== undefined && domainHi !== undefined ? [domainLo, domainHi] : undefined,
            imageLogScale,
        );
        const native = heatmapRows(imageGrid, false);
        return {
            type: 'heatmap',
            z: (imageLogScale ? heatmapRows(imageGrid, true) : native) as unknown as number[][],
            // Plotly's own hover label reads the native values, never the log10 colours.
            // Plotly only looks up 2D `customdata` when each row is a plain array, so typed
            // rows are copied here (log mode only).
            ...(imageLogScale && {
                customdata: native.map((row) => Array.prototype.slice.call(row)) as number[][],
            }),
            x0: 0,
            dx: 1,
            y0: 0,
            dy: 1,
            zmin: lo,
            zmax: hi,
            zsmooth: false,
            colorscale: colormapToColorscale(imageColormap),
            showscale: showColorbar,
            ...(imageLogScale && showColorbar && { colorbar: logColorbarTicks(lo, hi) }),
            hovertemplate: `value %{${imageLogScale ? 'customdata' : 'z'}:.6~g}<extra></extra>`,
            // A gap (NaN, or a value that cannot be logged) has nothing to fill the template
            // with; Plotly would print it verbatim. Finch's own onHover still reports the pixel.
            hoverongaps: false,
            meta: { kind: 'image' } satisfies TraceMeta,
        } as Data;
    }, [imageGrid, domainLo, domainHi, imageLogScale, imageColormap, showColorbar]);

    const pointTraces = useMemo((): Data[] => {
        // WebGL is chosen on the total, not per layer: many medium layers are as slow in
        // SVG as one large one.
        const total = pointLayers.reduce((sum, l) => sum + l.count, 0);
        const gl = total > SCATTER_GL_THRESHOLD;
        return pointLayers.map(
            (l) =>
                ({
                    ...markersToScatterTrace(
                        {
                            id: l.id,
                            label: l.label,
                            points: l.xy,
                            color: l.color,
                            symbol: l.symbol,
                            size: l.size,
                            strokeWidth: l.strokeWidth,
                        },
                        { gl },
                    ),
                    visible: l.visible ? true : 'legendonly',
                    showlegend: l.label !== undefined,
                    hoverinfo: l.hoverable ? 'name+x+y' : 'skip',
                    meta: { kind: 'points', layerId: l.id, label: l.label } satisfies TraceMeta,
                }) as Data,
        );
    }, [pointLayers]);

    const shapes = useMemo(() => {
        const out: Partial<Shape>[] = [];
        (annotations ?? []).forEach((a, index) => {
            if (a.visible === false) return;
            const shape = geometryToPlotlyShape(a);
            if (!shape) return;
            out.push({
                ...shape,
                name: `${FINCH_SHAPE_PREFIX}${index}`,
                editable: a.editable ?? editableAnnotations,
                layer: 'above',
                ...(a.title ? { label: { text: a.title } } : {}),
            } as Partial<Shape>);
        });
        return out;
    }, [annotations, editableAnnotations]);

    const classTraces = useMemo(
        (): Data[] =>
            showClassLegend
                ? classes.map(
                      (c) =>
                          ({
                              type: 'scatter',
                              mode: 'markers',
                              x: [null],
                              y: [null],
                              name: c.label,
                              marker: { symbol: 'square', size: 10, color: c.color },
                              visible: c.visible ? true : 'legendonly',
                              hoverinfo: 'skip',
                              legendgroup: 'classes',
                              meta: { kind: 'class', classId: c.id } satisfies TraceMeta,
                          }) as Data,
                  )
                : [],
        [classes, showClassLegend],
    );

    const data = useMemo(
        (): Data[] => [
            ...(heatmapTrace ? [heatmapTrace] : []),
            ...pointTraces,
            ...classTraces,
            ...(extraTraces ?? []).map(
                (t) => ({ meta: { kind: 'extra' } satisfies TraceMeta, ...t }) as Data,
            ),
        ],
        [heatmapTrace, pointTraces, classTraces, extraTraces],
    );

    const layerSignature = layers
        .map((l) => `${l.id}|${l.url}|${l.opacity}|${l.visible}`)
        .join(';');
    const images = useMemo(() => {
        const out: Partial<Layout['images'][number]>[] = [];
        if (baseUrl) out.push(imageEntry(baseUrl, imageSize, 'below'));
        layers.forEach((l, k) => {
            out.push(imageEntry(l.url, imageSize, 'above', l.visible ? l.opacity : 0, k));
        });
        if (maskUrl) {
            out.push(imageEntry(maskUrl, imageSize, 'above', maskOpacity, layers.length));
        }
        return out;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageSize, baseUrl, layerSignature, maskUrl, maskOpacity]);

    const vx0 = viewport?.x[0];
    const vx1 = viewport?.x[1];
    const vy0 = viewport?.y[0];
    const vy1 = viewport?.y[1];
    const layout = useMemo((): OverlayLayout => {
        const full = axisRanges(imageSize);
        const controlled =
            vx0 !== undefined && vx1 !== undefined && vy0 !== undefined && vy1 !== undefined;
        const ranges = controlled ? { x: [vx0, vx1], y: [vy0, vy1] } : full;
        const base: OverlayLayout = {
            autosize: true,
            uirevision,
            datarevision: tick,
            // Plotly keeps user-drawn and user-edited shapes while `editrevision` is unchanged
            // (it defaults to `uirevision`, which stays fixed to keep zoom). A new value after
            // every shape change makes Plotly show exactly the annotations the app passes.
            editrevision: `${uirevision}:${tick}`,
            hovermode: 'closest',
            dragmode: PLOTLY_DRAGMODE[dragMode],
            // The same styling as a finished annotation with this style.
            newshape: {
                fillcolor: 'rgba(0,0,0,0)',
                ...(plotlyStyle(drawStyle) as OverlayLayout['newshape']),
            },
            images: images as Layout['images'],
            shapes,
            showlegend: showLegend,
            legend: { orientation: 'v', x: 1.02, y: 1, xanchor: 'left', yanchor: 'top' },
            margin: showAxes ? { l: 50, r: 10, t: 10, b: 40 } : { l: 0, r: 0, t: 0, b: 0 },
            plot_bgcolor: '#0f172a',
            xaxis: {
                range: ranges.x,
                fixedrange: !zoomable,
                constrain: 'domain',
                showgrid: false,
                zeroline: false,
                visible: showAxes,
                title: showAxes ? { text: 'x [pixel]' } : undefined,
            },
            yaxis: {
                range: ranges.y,
                fixedrange: !zoomable,
                scaleanchor: 'x',
                constrain: 'domain',
                showgrid: false,
                zeroline: false,
                visible: showAxes,
                title: showAxes ? { text: 'y [pixel]' } : undefined,
            },
        };
        if (!layoutOverride) return base;
        return {
            ...base,
            ...layoutOverride,
            xaxis: { ...base.xaxis, ...layoutOverride.xaxis },
            yaxis: { ...base.yaxis, ...layoutOverride.yaxis },
        };
    }, [
        imageSize,
        uirevision,
        tick,
        dragMode,
        drawStyle,
        images,
        shapes,
        showLegend,
        showAxes,
        zoomable,
        vx0,
        vx1,
        vy0,
        vy1,
        layoutOverride,
    ]);

    const config = useMemo((): Partial<Config> => {
        // Back to the whole frame with explicit ranges. Plotly's own autoscale fits traces and
        // ignores layout images, so it would frame a PNG-only figure arbitrarily.
        const resetView = {
            name: 'resetView',
            title: 'Reset view',
            icon: RESET_ICON,
            click: () => onResetView(),
        };
        return {
            displaylogo: false,
            scrollZoom: zoomable,
            doubleClick: zoomable ? 'reset' : false,
            responsive: true,
            modeBarButtons: [
                zoomable ? ['zoom2d', 'pan2d', resetView, 'eraseshape'] : ['eraseshape'],
            ] as Config['modeBarButtons'],
            ...configOverride,
        };
    }, [configOverride, zoomable, onResetView]);

    return { data, layout, config, shapes };
}
