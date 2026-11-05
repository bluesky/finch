import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Plot from '@/lib/plot';
import type { Config, Data, LegendClickEvent, PlotHoverEvent, PlotRelayoutEvent } from 'plotly.js';
import { cn } from '@/lib/utils';
import { hitTestGeometry } from '@/utils/annotationGeometry';
import { plotlyShapeToGeometry, type PlotlyShapeDict } from '@/utils/plotlyShapes';
import {
    nearestPoint,
    pickPixel,
    pointScreenDistance,
    useImageSources,
    useResolvedPointLayers,
    type ImageSources,
    type ScreenScale,
} from './hooks/useImageSources';
import { useLoadedImages, useRgbaObjectUrl } from './hooks/useMaskRaster';
import type {
    Annotation,
    ImageOverlayBaseProps,
    OverlayLayerId,
    OverlayLoadState,
    OverlayPickInfo,
    OverlayViewport,
    PixelPickInfo,
    PointPickInfo,
    ResolvedPointLayer,
} from './types';
import {
    dragModeFromPlotly,
    EMPTY_IMAGE,
    FINCH_SHAPE_PREFIX,
    usePlotlyOverlayFigure,
    viewportFromRelayout,
    type OverlayLayout,
    type TraceMeta,
} from './hooks/usePlotlyOverlayFigure';
import './PlotlyMaskOverlay.css';

/** Array images larger than this are slow as a heatmap; a warning suggests a PNG. */
const HEATMAP_WARN_PIXELS = 1_000_000;

/** Pointer travel, in CSS pixels, after which a press counts as a drag rather than a click. */
const CLICK_SLOP = 3;

/** Annotation hit tolerance, in CSS pixels. */
const ANNOTATION_SLOP = 4;

/** Point hit tolerance, in CSS pixels: Plotly's default `hoverdistance`, so clicks match the tooltip. */
const POINT_HOVER_DISTANCE = 20;

/** Length of the longer side, in rem, for each fixed size. The other side follows the image. */
const SIZE_REM = {
    small: 16,
    medium: 24,
    large: 40,
} as const;

/** Root classes for `size="full"`, which fills the parent instead. */
const FULL_SIZE_CLASS = 'w-full h-full min-w-32 min-h-32';

/** The box for a fixed size: the longer side gets `longSide` rem, the shorter follows the frame. */
function fitBox(longSide: number, [ih, iw]: [number, number]): { width: string; height: string } {
    const width = iw >= ih ? longSide : (longSide * iw) / ih;
    const height = iw >= ih ? (longSide * ih) / iw : longSide;
    return { width: `${width}rem`, height: `${height}rem` };
}

/** `frameKey` as a string. Objects compare by content, not by `String()`. */
function revisionOf(key: unknown): string {
    if (key !== null && typeof key === 'object') {
        try {
            return JSON.stringify(key);
        } catch {
            return String(key);
        }
    }
    return String(key);
}

/** Props for {@link PlotlyMaskOverlay}: the shared overlay inputs plus Plotly view and editing options. */
export type PlotlyMaskOverlayProps = Omit<
    React.ComponentPropsWithoutRef<'div'>,
    'onClick' | 'onError'
> &
    ImageOverlayBaseProps & {
        /**
         * Called as the image and each image layer start loading, decode, or fail. A failed URL
         * is retried when its URL or the `frameKey` changes
         */
        onLoadStateChange?: (layer: OverlayLayerId, state: OverlayLoadState) => void;
        /** The visible area in image coordinates, for a controlled view. `null` shows the whole frame */
        viewport?: OverlayViewport | null;
        /** Called with the visible area after zooming or panning, or `null` after a reset */
        onViewportChange?: (viewport: OverlayViewport | null) => void;
        /** Let the user zoom and pan */
        zoomable?: boolean;
        /** Show pixel axes with titles */
        showAxes?: boolean;
        /** Show a legend of mask classes and labelled point layers */
        showLegend?: boolean;
        /** Let the user move, resize and erase annotations. Changes are reported by `onAnnotationChange` */
        editableAnnotations?: boolean;
        /** Called with the whole annotation list after an edit. Pass it back to `annotations` */
        onAnnotationChange?: (annotations: Annotation[]) => void;
        /** Additional Plotly traces drawn after Finch's traces. Not reported by `onHover` or `onClick` */
        extraTraces?: Data[];
        /** Plotly layout overrides, merged last. Use `annotations` instead of `layout.shapes` */
        layout?: OverlayLayout;
        /** Plotly configuration overrides, merged last */
        config?: Partial<Config>;
        /**
         * The component's size. Fixed sizes set the longer side and follow the image's aspect
         * ratio; `'full'` fills the parent, which must have a defined height
         */
        size?: 'small' | 'medium' | 'large' | 'full';
        /** Additional CSS classes applied to the root element */
        className?: string;
    };

/** Internals of a rendered Plotly axis that map pixels back to data. */
type AxisInternals = { range: [number, number]; _offset: number; _length: number };

function axesOf(gd: HTMLElement | null): { xa?: AxisInternals; ya?: AxisInternals } {
    const full = (
        gd as unknown as { _fullLayout?: { xaxis?: AxisInternals; yaxis?: AxisInternals } } | null
    )?._fullLayout;
    return { xa: full?.xaxis, ya: full?.yaxis };
}

/** Data coordinates under a client position, read from Plotly's laid-out axes. */
function clientToData(
    gd: HTMLElement,
    clientX: number,
    clientY: number,
): { x: number; y: number; inside: boolean } | null {
    const { xa, ya } = axesOf(gd);
    if (!xa || !ya || !(xa._length > 0) || !(ya._length > 0)) return null;
    const rect = gd.getBoundingClientRect();
    const px = clientX - rect.left - xa._offset;
    const py = clientY - rect.top - ya._offset;
    const x = xa.range[0] + (px / xa._length) * (xa.range[1] - xa.range[0]);
    const y = ya.range[0] + (1 - py / ya._length) * (ya.range[1] - ya.range[0]);
    const inside = px >= 0 && py >= 0 && px <= xa._length && py <= ya._length;
    return { x, y, inside };
}

/** CSS pixels per image pixel along each axis, for tolerances measured on screen. */
function screenScale(gd: HTMLElement): ScreenScale {
    const { xa, ya } = axesOf(gd);
    const per = (a?: AxisInternals) =>
        a && a._length > 0 && a.range[1] !== a.range[0]
            ? a._length / Math.abs(a.range[1] - a.range[0])
            : 1;
    return { x: per(xa), y: per(ya) };
}

/** The visible ranges of a plotted graph div, or `null` before the first plot. */
function readViewport(gd: HTMLElement | null): OverlayViewport | null {
    const { xa, ya } = axesOf(gd);
    if (!xa?.range || !ya?.range) return null;
    return { x: [xa.range[0], xa.range[1]], y: [ya.range[0], ya.range[1]] };
}

const samePoint = (a: PointPickInfo | null | undefined, b: PointPickInfo | null | undefined) =>
    (!a && !b) || (!!a && !!b && a.layerId === b.layerId && a.index === b.index);

/**
 * A detector image with mask, image-layer, annotation, point and drawing overlays, rendered
 * with Plotly.
 *
 * **Coordinates.** Detector pixel (row `i`, column `j`) is centred at `(x = j, y = i)` and
 * spans `[j - 0.5, j + 0.5]`, as in {@link PlotlyHeatmap}. The `image` defines the frame;
 * everything else is placed in its pixels, and hover rounds to the nearest pixel centre.
 *
 * **Masks.** A `mask` is data Finch draws and understands: classes, legend, the class under the
 * pointer. Its arrays must match the image pixel for pixel and are never resampled. A mask your
 * backend has already rendered is a picture: pass it in `imageLayers`.
 *
 * **Pictures.** The application builds every URL and owns fetching, authentication and
 * caching; for servers that need credentials, pass object or data URLs. A PNG of any size is
 * stretched onto the frame. A changed URL replaces the picture once it has decoded; a changed
 * `frameKey` drops it at once, so a picture from another frame is never shown. While the image
 * fails to load, neither image layers nor the mask are drawn.
 *
 * **Layers, bottom to top.** The image, `pointLayers` and `extraTraces`, `imageLayers` in list
 * order, the `mask`, then `annotations`. Plotly draws pictures above every trace, so image
 * layers and the mask cover the points beneath them.
 */
export default function PlotlyMaskOverlay({
    dragMode = 'zoom',
    zoomable = true,
    showAxes = true,
    showLegend = true,
    editableAnnotations = false,
    size = 'medium',
    ...rest
}: PlotlyMaskOverlayProps) {
    const props = { ...rest, dragMode, zoomable, showAxes, showLegend, editableAnnotations, size };
    const sources = useImageSources({
        image: props.image,
        mask: props.mask,
        onClassVisibilityChange: props.onClassVisibilityChange,
    });

    // Inputs that do not fit the frame are not drawn; say why, once per message per instance.
    const warned = useRef(new Set<string>());
    const warn = useCallback((message: string) => {
        if (warned.current.has(message)) return;
        warned.current.add(message);
        console.warn(message);
    }, []);
    const { shapeWarnings } = sources;
    useEffect(() => shapeWarnings.forEach(warn), [shapeWarnings, warn]);

    if (!sources.frame) {
        const { className, style } = props;
        const side = size === 'full' ? undefined : `${SIZE_REM[size]}rem`;
        return (
            <div
                className={cn(
                    'finch-plotly-mask-overlay relative',
                    size === 'full' && FULL_SIZE_CLASS,
                    className,
                )}
                style={{ width: side, height: side, ...style }}
                data-testid="plotly-mask-overlay"
            >
                <p
                    role="alert"
                    className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-2 text-center text-xs text-slate-400"
                >
                    Error: invalid image
                </p>
            </div>
        );
    }
    return <OverlayFrame {...props} sources={sources} frame={sources.frame} warn={warn} />;
}

/** The props {@link PlotlyMaskOverlay} gives defaults to. */
type Defaulted =
    | 'dragMode'
    | 'zoomable'
    | 'showAxes'
    | 'showLegend'
    | 'editableAnnotations'
    | 'size';

type OverlayFrameProps = PlotlyMaskOverlayProps &
    Required<Pick<PlotlyMaskOverlayProps, Defaulted>> & {
        sources: ImageSources;
        frame: [number, number];
        warn: (message: string) => void;
    };

/** The overlay for a valid frame. */
function OverlayFrame({
    sources,
    frame,
    warn,
    image,
    mask: _mask,
    imageLayers,
    annotations,
    pointLayers,
    dragMode,
    onDragModeChange,
    drawStyle,
    onDrawComplete,
    onHover,
    onClick,
    onClassVisibilityChange: _onClassVisibilityChange,
    onPointLayerVisibilityChange,
    frameKey,
    onLoadStateChange,
    viewport,
    onViewportChange,
    zoomable,
    showAxes,
    showLegend,
    editableAnnotations,
    onAnnotationChange,
    extraTraces,
    layout: layoutOverride,
    config: configOverride,
    size,
    className,
    style,
    ...props
}: OverlayFrameProps) {
    const { imageGrid, labelGrid, maskLayers, maskShape, resolvedClasses, toggleClass } = sources;
    const { layers: resolvedPointLayers, toggleLayer } = useResolvedPointLayers(
        pointLayers,
        onPointLayerVisibilityChange,
    );
    const [frameHeight, frameWidth] = frame;

    // Display options of the variant in use.
    const isArray = image.type === 'array';
    const imageColormap = (isArray && image.colormap) || 'gray';
    const imageDomain = isArray ? image.domain : undefined;
    const imageLogScale = isArray && !!image.logScale;
    const showColorbar = isArray && !!image.showColorbar;
    const imageSmoothing = (!isArray && image.smoothing) || 'auto';
    const imageUrl = isArray ? undefined : image.url;
    const resolveValue = isArray ? undefined : image.resolveValue;

    /** What is on screen. A new revision resets the view and drops every loaded picture. */
    const frameRevision =
        frameKey === undefined ? `${frameHeight}x${frameWidth}` : revisionOf(frameKey);

    // --- URL pictures: decoded once for load state, natural size and errors ----

    // Each id loads once: the base image is `'image'`, so a layer may not reuse it.
    const layerList = useMemo(() => {
        const seen = new Set<string>(['image']);
        return (imageLayers ?? []).filter((l) => {
            if (seen.has(l.id)) return false;
            seen.add(l.id);
            return true;
        });
    }, [imageLayers]);
    const droppedLayerIds = (imageLayers?.length ?? 0) - layerList.length;
    useEffect(() => {
        if (droppedLayerIds > 0) {
            warn(
                'PlotlyMaskOverlay: `imageLayers` ids must be unique and not `"image"`; repeated ids are not drawn.',
            );
        }
    }, [droppedLayerIds, warn]);

    const urlLayers = useMemo(() => {
        const out: { id: OverlayLayerId; url: string }[] = [];
        if (imageUrl) out.push({ id: 'image', url: imageUrl });
        for (const l of layerList) out.push({ id: l.id, url: l.url });
        return out;
    }, [imageUrl, layerList]);

    // Failed ids, for the frame they failed in. A new frame starts with none.
    const [failed, setFailed] = useState<{ key: string; ids: ReadonlySet<string> }>(() => ({
        key: frameRevision,
        ids: new Set(),
    }));
    const failedIds = failed.key === frameRevision ? failed.ids : new Set<string>();
    const markFailed = (id: string, isFailed: boolean) =>
        setFailed((prev) => {
            const ids = prev.key === frameRevision ? prev.ids : new Set<string>();
            if (ids.has(id) === isFailed && prev.key === frameRevision) return prev;
            const next = new Set(ids);
            if (isFailed) next.add(id);
            else next.delete(id);
            return { key: frameRevision, ids: next };
        });
    const loaded = useLoadedImages(urlLayers, {
        resetKey: frameRevision,
        onLoadStart: (id) => {
            markFailed(id, false);
            onLoadStateChange?.(id, { status: 'loading' });
        },
        onLoad: (id, { image: img }) =>
            onLoadStateChange?.(id, {
                status: 'loaded',
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
            }),
        onError: (message, id) => {
            markFailed(id, true);
            onLoadStateChange?.(id, { status: 'error', message });
        },
    });
    /**
     * What Plotly is given for a URL: the newest one Finch has decoded for this frame, kept
     * until the next one decodes. Before that, and after a failure, a transparent placeholder
     * holds the slot, so Plotly never shows a picture Finch has not confirmed for this frame.
     */
    const sourceFor = (id: string): string => loaded.get(id)?.url ?? EMPTY_IMAGE;

    useEffect(() => {
        if (imageGrid && imageGrid.shape[0] * imageGrid.shape[1] > HEATMAP_WARN_PIXELS) {
            warn(
                "PlotlyMaskOverlay: an array image above one megapixel is slow as a heatmap. Render it on the backend and pass it as `{ type: 'url' }` with the detector `shape`.",
            );
        }
        for (const [id, { image: img }] of loaded) {
            const rx = frameWidth / img.naturalWidth;
            const ry = frameHeight / img.naturalHeight;
            if (!(Number.isInteger(rx) && Number.isInteger(ry))) {
                warn(
                    `PlotlyMaskOverlay: "${id}" is ${img.naturalWidth}x${img.naturalHeight} for a ${frameWidth}x${frameHeight} frame. Render pictures at the detector size or an exact integer fraction of it, or pixel boundaries will not line up.`,
                );
            }
        }
    }, [loaded, frameHeight, frameWidth, imageGrid, warn]);

    // The base image is a heatmap trace for an array image, or the backend's PNG. Only the
    // class mask Finch rasterises from a mask array is encoded here.
    const maskObjectUrl = useRgbaObjectUrl(sources.maskBuffer);
    const baseUrl = imageUrl ? sourceFor('image') : null;
    const baseFailed = !!imageUrl && failedIds.has('image');
    const failedLayers = layerList.map((l) => l.id).filter((id) => failedIds.has(id));

    // Bumped after each shape change; it renews `editrevision`, so Plotly drops any drawn or
    // edited shape the app did not pass back in `annotations`.
    const [tick, setTick] = useState(0);
    // Drawn shapes already passed to `onDrawComplete`, until the app's next annotation list.
    const reportedDraws = useRef(new WeakSet<object>());
    useEffect(() => {
        reportedDraws.current = new WeakSet();
    }, [annotations]);
    // Bumped by the reset button: a new `uirevision` makes Plotly apply Finch's full-frame ranges.
    const [resets, setResets] = useState(0);
    const uirevision = frameRevision + (resets ? `#${resets}` : '');

    // --- view: reset, controlled ranges ---------------------------------------

    const [graphDiv, setGraphDiv] = useState<HTMLElement | null>(null);
    const handleGraphDiv = useCallback((_: unknown, gd: Readonly<HTMLElement>) => {
        setGraphDiv((prev) => (prev === gd ? prev : (gd as HTMLElement)));
    }, []);
    const onViewportChangeRef = useRef(onViewportChange);
    onViewportChangeRef.current = onViewportChange;
    const resetView = useCallback(() => {
        setResets((n) => n + 1);
        onViewportChangeRef.current?.(null);
    }, []);

    const { data, layout, config, shapes } = usePlotlyOverlayFigure({
        imageSize: frame,
        imageGrid,
        imageColormap,
        imageDomain,
        imageLogScale,
        baseUrl,
        // Nothing is drawn over a failed image: a mask or layer without its image would mislead.
        maskUrl: baseFailed ? null : maskObjectUrl,
        maskOpacity: sources.maskOpacity,
        layers: layerList.map((l) => ({
            id: l.id,
            url: baseFailed ? EMPTY_IMAGE : sourceFor(l.id),
            opacity: Math.max(0, Math.min(1, l.opacity ?? 1)),
            visible: l.visible ?? true,
        })),
        annotations,
        pointLayers: resolvedPointLayers,
        classes: resolvedClasses,
        showClassLegend: resolvedClasses.length > 0,
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
        onResetView: resetView,
        extraTraces,
        layout: layoutOverride,
        config: configOverride,
    });

    // --- relayout: view, drag mode, drawn, edited and erased shapes -----------

    const handleRelayout = (event: Readonly<PlotRelayoutEvent>) => {
        const raw = event as unknown as Record<string, unknown>;
        const keys = Object.keys(raw);
        const nextViewport = viewportFromRelayout(raw, readViewport(graphDiv));
        if (nextViewport !== undefined) onViewportChange?.(nextViewport);
        const nextMode = dragModeFromPlotly(raw.dragmode);
        if (nextMode && nextMode !== dragMode) onDragModeChange?.(nextMode);
        const touchesShapes = keys.some((k) => k === 'shapes' || k.startsWith('shapes['));
        if (!touchesShapes) return;
        const list = annotations ?? [];
        const isEditable = (a: Annotation | undefined) =>
            !!a && (a.editable ?? editableAnnotations);
        if (Array.isArray(raw.shapes)) {
            const full = raw.shapes as PlotlyShapeDict[];
            // New shapes are the ones Finch did not name. Plotly keeps a drawn shape in its
            // list until Finch's next update, so each one is reported only once.
            for (const s of full) {
                if (typeof s.name === 'string' && s.name.startsWith(FINCH_SHAPE_PREFIX)) continue;
                if (reportedDraws.current.has(s)) continue;
                reportedDraws.current.add(s);
                const g = plotlyShapeToGeometry(s);
                if (g && g.type !== 'line') onDrawComplete?.(g);
            }
            // Editable Finch shapes that are missing were erased. Fixed ones never are.
            if (onAnnotationChange) {
                const kept = new Set(
                    full
                        .map((s) => (typeof s.name === 'string' ? s.name : ''))
                        .filter((n) => n.startsWith(FINCH_SHAPE_PREFIX))
                        .map((n) => Number(n.slice(FINCH_SHAPE_PREFIX.length))),
                );
                const erased = new Set(
                    shapes
                        .map((s) => Number(String(s.name).slice(FINCH_SHAPE_PREFIX.length)))
                        .filter((i) => !kept.has(i) && isEditable(list[i])),
                );
                if (erased.size > 0) onAnnotationChange(list.filter((_, i) => !erased.has(i)));
            }
        } else if (onAnnotationChange) {
            // Partial edits: `shapes[i].x0` and friends, indexed into Finch's shape list.
            const edits = new Map<number, Record<string, unknown>>();
            for (const key of keys) {
                const m = key.match(/^shapes\[(\d+)\]\.(.+)$/);
                if (!m) continue;
                const i = Number(m[1]);
                edits.set(i, { ...edits.get(i), [m[2]]: raw[key] });
            }
            const next = [...list];
            let changed = false;
            for (const [i, patch] of edits) {
                const shape = shapes[i];
                if (!shape) continue;
                const index = Number(String(shape.name).slice(FINCH_SHAPE_PREFIX.length));
                const g = plotlyShapeToGeometry({ ...(shape as PlotlyShapeDict), ...patch });
                const original = list[index];
                if (!g || !original || !isEditable(original)) continue;
                next[index] = { ...original, ...g } as Annotation;
                changed = true;
            }
            if (changed) onAnnotationChange(next);
        }
        setTick((t) => t + 1);
    };

    // --- legend: drive visibility from Finch state ---------------------------

    const handleLegendClick = (event: Readonly<LegendClickEvent>): boolean => {
        const meta = (event.data[event.curveNumber] as { meta?: TraceMeta } | undefined)?.meta;
        if (meta?.kind === 'points') {
            const layer = resolvedPointLayers.find((l) => l.id === meta.layerId);
            if (layer) toggleLayer(layer.id, !layer.visible);
            return false;
        }
        if (meta?.kind === 'class') {
            const cls = resolvedClasses.find((c) => c.id === meta.classId);
            if (cls) toggleClass(cls.id, !cls.visible);
            return false;
        }
        return true;
    };

    // --- hover and click -------------------------------------------------------
    //
    // Pixels and annotations are read from the laid-out axes on every pointer move. The point
    // under the pointer during hover is Plotly's own pick (the one its tooltip shows), held in
    // `hoverPoint` and re-checked against the current pointer before it is reported. Clicks
    // never use it: they look up the nearest point at the click position.

    const hoverPoint = useRef<PointPickInfo | null>(null);
    const pointerInside = useRef(false);
    const refreshHover = useRef(() => {});
    const hoverDistance =
        typeof layoutOverride?.hoverdistance === 'number' && layoutOverride.hoverdistance >= 0
            ? layoutOverride.hoverdistance
            : POINT_HOVER_DISTANCE;

    const handleHover = (event: Readonly<PlotHoverEvent>) => {
        // Plotly hovers on a trailing timer: one that lands after the pointer left is stale.
        if (!pointerInside.current) return;
        const p = event.points.find(
            (pt) => (pt.data as { meta?: TraceMeta }).meta?.kind === 'points',
        );
        const meta = (p?.data as { meta?: TraceMeta } | undefined)?.meta;
        const next: PointPickInfo | null =
            p && meta?.kind === 'points'
                ? {
                      layerId: meta.layerId,
                      label: meta.label,
                      index: p.pointIndex,
                      x: Number(p.x),
                      y: Number(p.y),
                  }
                : null;
        if (samePoint(next, hoverPoint.current)) return;
        hoverPoint.current = next;
        refreshHover.current();
    };
    const handleUnhover = () => {
        if (!hoverPoint.current) return;
        hoverPoint.current = null;
        refreshHover.current();
    };

    // Latest values for the native listeners, so they stay attached across renders.
    const latest = useRef({
        onHover,
        onClick,
        annotations,
        pointLayers: resolvedPointLayers as ResolvedPointLayer[],
        hoverDistance,
        resolver: resolveValue,
        valueKey: '',
        pick: (_fx: number, _fy: number): PixelPickInfo | null => null,
    });
    latest.current = {
        onHover,
        onClick,
        annotations,
        pointLayers: resolvedPointLayers,
        hoverDistance,
        // Raw values are read from an array image directly; the lookup is only for PNGs.
        resolver: resolveValue,
        // Looked-up values belong to one picture of one frame.
        valueKey: `${frameRevision}\u0000${imageUrl ?? ''}`,
        pick: (fx, fy) =>
            pickPixel(fx, fy, {
                imageSize: frame,
                imageGrid,
                labelGrid,
                maskLayers,
                maskShape,
                resolvedClasses,
            }),
    };

    useEffect(() => {
        const gd = graphDiv;
        if (!gd) return;
        let raf: number | null = null;
        let pending: { x: number; y: number } | null = null;
        let down: { x: number; y: number; target: Element | null } | null = null;

        // --- value lookup for display PNGs: one call in flight, newest pixel wins ---
        type Pixel = { x: number; y: number };
        const samePixel = (a: Pixel | null, b: Pixel | null) =>
            !!a && !!b && a.x === b.x && a.y === b.y;
        let inFlight: PixelPickInfo | null = null;
        let resolvedValue: { x: number; y: number; value: number; key: string } | null = null;
        /** The looked-up value, only while it still belongs to the picture on screen. */
        const current = () =>
            resolvedValue && resolvedValue.key === latest.current.valueKey ? resolvedValue : null;
        const withValue = (info: PixelPickInfo): PixelPickInfo => {
            const r = current();
            return r && samePixel(info, r) ? { ...info, value: r.value } : info;
        };
        const lookup = (info: PixelPickInfo): Promise<number | undefined> => {
            const fn = latest.current.resolver;
            if (!fn) return Promise.resolve(undefined);
            return Promise.resolve()
                .then(() => fn(info.x, info.y))
                .then(
                    (v) => (typeof v === 'number' ? v : undefined),
                    () => undefined,
                );
        };

        const annotationAt = (fx: number, fy: number) => {
            const list = latest.current.annotations ?? [];
            const tol = ANNOTATION_SLOP / screenScale(gd).x;
            for (let i = list.length - 1; i >= 0; i -= 1) {
                const a = list[i];
                if (a.visible === false) continue;
                if (hitTestGeometry(a, fx, fy, tol)) return { annotation: a, index: i };
            }
            return undefined;
        };
        /** Plotly's hovered point, if it is still near the pointer and its layer still reports. */
        const hoveredPointAt = (fx: number, fy: number): PointPickInfo | undefined => {
            const p = hoverPoint.current;
            if (!p) return undefined;
            const layer = latest.current.pointLayers.find((l) => l.id === p.layerId);
            if (!layer || !layer.visible || !layer.hoverable || p.index >= layer.count) {
                return undefined;
            }
            const d = pointScreenDistance(p.x, p.y, layer.size, fx, fy, screenScale(gd));
            return d <= latest.current.hoverDistance ? p : undefined;
        };
        const compose = (
            pixel: PixelPickInfo,
            fx: number,
            fy: number,
            point: PointPickInfo | null | undefined,
        ): OverlayPickInfo => {
            const annotation = annotationAt(fx, fy);
            return {
                ...withValue(pixel),
                ...(point && { point }),
                ...(annotation && { annotation }),
            };
        };

        // --- hover ----------------------------------------------------------
        let last: { pixel: PixelPickInfo; fx: number; fy: number } | null = null;
        let emitted: OverlayPickInfo | null = null;
        const emit = (info: OverlayPickInfo | null) => {
            const prev = emitted;
            emitted = info;
            if (!info && !prev) return;
            if (
                info &&
                prev &&
                info.x === prev.x &&
                info.y === prev.y &&
                info.classId === prev.classId &&
                info.value === prev.value &&
                samePoint(info.point, prev.point) &&
                info.annotation?.index === prev.annotation?.index &&
                info.annotation?.annotation === prev.annotation?.annotation
            ) {
                return;
            }
            latest.current.onHover?.(info);
        };
        const emitCurrent = () => {
            if (!last) return emit(null);
            emit(compose(last.pixel, last.fx, last.fy, hoveredPointAt(last.fx, last.fy)));
        };
        const resolveHover = (info: PixelPickInfo) => {
            if (inFlight || samePixel(info, current())) return;
            inFlight = info;
            const key = latest.current.valueKey;
            void lookup(info).then((value) => {
                inFlight = null;
                if (value !== undefined) resolvedValue = { x: info.x, y: info.y, value, key };
                if (last && samePixel(last.pixel, info)) {
                    if (value !== undefined) emitCurrent();
                } else if (last) {
                    // The pointer moved on while this was in flight: look up where it is now.
                    resolveHover(last.pixel);
                }
            });
        };
        const hoverAt = (fx: number, fy: number) => {
            const pixel = latest.current.pick(fx, fy);
            last = pixel ? { pixel, fx, fy } : null;
            emitCurrent();
            if (pixel && latest.current.resolver) resolveHover(pixel);
        };
        refreshHover.current = () => {
            if (latest.current.onHover) emitCurrent();
        };

        const onMove = (e: PointerEvent) => {
            pointerInside.current = true;
            if (!latest.current.onHover) return;
            const p = clientToData(gd, e.clientX, e.clientY);
            pending = p && p.inside ? { x: p.x, y: p.y } : null;
            if (!pending) {
                // In the margins: report the exit now rather than on the next frame.
                if (raf !== null) cancelAnimationFrame(raf);
                raf = null;
                last = null;
                emitCurrent();
                return;
            }
            if (raf !== null) return;
            raf = requestAnimationFrame(() => {
                raf = null;
                if (pending) hoverAt(pending.x, pending.y);
            });
        };
        const onLeave = () => {
            pointerInside.current = false;
            hoverPoint.current = null;
            if (raf !== null) cancelAnimationFrame(raf);
            raf = null;
            pending = null;
            last = null;
            if (latest.current.onHover) emitCurrent();
        };

        // --- click ----------------------------------------------------------
        // A press is recorded on the plot; the click is heard on the window, in the bubble
        // phase, so it arrives after Plotly's own click handlers. Plotly activates an editable
        // shape from the native click on it, and reporting earlier (on pointerup) let an app
        // re-render replace that shape before its click could fire. Plotly also covers the page
        // with a "dragcover" during a press on the plot area and then dispatches its own click
        // on the pressed element, so a press may bring two clicks: the first one counts. That
        // click carries whole-pixel coordinates, so the pixel is picked where the press was.
        const onDown = (e: PointerEvent) => {
            down = { x: e.clientX, y: e.clientY, target: e.target as Element | null };
        };
        const onClickEvent = (e: MouseEvent) => {
            const start = down;
            down = null;
            if (
                !start ||
                Math.abs(e.clientX - start.x) + Math.abs(e.clientY - start.y) > CLICK_SLOP
            )
                return;
            if (start.target?.closest?.('.modebar, .legend')) return;
            if (!latest.current.onClick) return;
            const p = clientToData(gd, start.x, start.y);
            if (!p || !p.inside) return;
            const pixel = latest.current.pick(p.x, p.y);
            if (!pixel) return;
            // The point at the click position, never a hovered point from earlier.
            const point = nearestPoint(
                latest.current.pointLayers,
                p.x,
                p.y,
                screenScale(gd),
                latest.current.hoverDistance,
            );
            const info = compose(pixel, p.x, p.y, point);
            if (!latest.current.resolver || samePixel(pixel, current())) {
                latest.current.onClick(info);
                return;
            }
            void lookup(pixel).then((value) =>
                latest.current.onClick?.(value === undefined ? info : { ...info, value }),
            );
        };

        gd.addEventListener('pointermove', onMove);
        gd.addEventListener('pointerleave', onLeave);
        gd.addEventListener('pointerdown', onDown, true);
        window.addEventListener('click', onClickEvent);
        return () => {
            if (raf !== null) cancelAnimationFrame(raf);
            refreshHover.current = () => {};
            gd.removeEventListener('pointermove', onMove);
            gd.removeEventListener('pointerleave', onLeave);
            gd.removeEventListener('pointerdown', onDown, true);
            window.removeEventListener('click', onClickEvent);
        };
    }, [graphDiv]);

    const box = size === 'full' ? undefined : fitBox(SIZE_REM[size], frame);
    return (
        <div
            className={cn(
                'finch-plotly-mask-overlay relative',
                size === 'full' && FULL_SIZE_CLASS,
                className,
            )}
            style={{ ...box, ...style }}
            data-testid="plotly-mask-overlay"
            data-image-smoothing={String(imageSmoothing)}
            {...props}
        >
            <Plot
                data={data}
                layout={layout}
                config={config}
                onInitialized={handleGraphDiv}
                onUpdate={handleGraphDiv}
                onRelayout={handleRelayout}
                onHover={handleHover}
                onUnhover={handleUnhover}
                onLegendClick={handleLegendClick}
                useResizeHandler
                style={{ width: '100%', height: '100%' }}
            />
            {baseFailed && (
                <p
                    role="alert"
                    className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 px-2 text-center text-xs text-slate-400"
                >
                    Error: failed to load image
                </p>
            )}
            {failedLayers.length > 0 && (
                <p
                    role="status"
                    className="pointer-events-none absolute rounded bg-slate-900/70 px-2 py-0.5 text-xs text-amber-300"
                    // Inside the plot area, clear of the axis labels.
                    style={{ left: (layout.margin?.l ?? 0) + 8, top: (layout.margin?.t ?? 0) + 8 }}
                >
                    Not shown: {failedLayers.join(', ')}
                </p>
            )}
        </div>
    );
}
