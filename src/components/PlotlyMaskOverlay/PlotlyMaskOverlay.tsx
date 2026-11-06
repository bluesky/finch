import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Plot from '@/lib/plot';
import type { LegendClickEvent, PlotRelayoutEvent } from 'plotly.js';
import { cn } from '@/lib/utils';
import { hitTestGeometry } from '@/utils/annotationGeometry';
import { plotlyShapeToGeometry, type PlotlyShapeDict } from '@/utils/plotlyShapes';
import {
    nearestPoint,
    pickPixel,
    useImageSources,
    useResolvedPointLayers,
    type ScreenScale,
} from './hooks/useImageSources';
import { useLoadedImages, useRgbaObjectUrl } from './hooks/useMaskRaster';
import type {
    Annotation,
    AnnotationStyle,
    DragMode,
    DrawEvent,
    ImageInput,
    ImageLayer,
    MaskInput,
    OverlayLayerId,
    OverlayLoadState,
    OverlayPickInfo,
    OverlayViewport,
    PixelPickInfo,
    PointLayer,
    PointPickInfo,
    ResolvedPointLayer,
} from './types';
import {
    dragModeFromPlotly,
    EMPTY_IMAGE,
    FINCH_SHAPE_PREFIX,
    usePlotlyOverlayFigure,
    viewportFromRelayout,
    type TraceMeta,
} from './hooks/usePlotlyOverlayFigure';
import './PlotlyMaskOverlay.css';

/** Array images larger than this are slow as a heatmap; a warning suggests a PNG. */
const HEATMAP_WARN_PIXELS = 1_000_000;

/**
 * Pointer travel, in CSS pixels, after which a press counts as a drag rather than a click.
 * Plotly's own threshold (`MINDRAG`), so a press is a click for Finch exactly when it is for Plotly.
 */
const CLICK_SLOP = 8;

/** Annotation hit tolerance, in CSS pixels. */
const ANNOTATION_SLOP = 4;

/** Point hit tolerance, in CSS pixels: Plotly's default `hoverdistance`, so picks match the tooltip. */
const POINT_HOVER_DISTANCE = 20;

/** A hex colour as `hexToRgb` reads it; anything else is drawn magenta. */
const HEX_COLOR = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Length of the longer side, in rem, for each fixed size. The other side follows the image. */
const SIZE_REM = {
    small: 16,
    medium: 24,
    large: 40,
} as const;

/** The frame used while the image is invalid, so the hooks below stay no-ops. */
const NO_FRAME: [number, number] = [1, 1];

/** Root classes for `size="full"`, which fills the parent instead. */
const FULL_SIZE_CLASS = 'w-full h-full min-w-32 min-h-32';

/** The box for a fixed size: the longer side gets `longSide` rem, the shorter follows the frame. */
function fitBox(longSide: number, [ih, iw]: [number, number]): { width: string; height: string } {
    const width = iw >= ih ? longSide : (longSide * iw) / ih;
    const height = iw >= ih ? (longSide * ih) / iw : longSide;
    return { width: `${width}rem`, height: `${height}rem` };
}

/** Props for {@link PlotlyMaskOverlay}: the image, what is drawn over it, and how the user works with it. */
export type PlotlyMaskOverlayProps = Omit<
    React.ComponentPropsWithoutRef<'div'>,
    'onClick' | 'onError'
> & {
    /** The base image that defines the pixel coordinate system for all overlays */
    image: ImageInput;
    /** Structured mask arrays with class colors, visibility, and hover information */
    mask?: MaskInput;
    /**
     * Additional images overlaid on the base image. Drawn in list order, with later layers on
     * top, and not drawn while the base image fails to load
     */
    imageLayers?: ImageLayer[];
    /** Vector shapes in image coordinates */
    annotations?: Annotation[];
    /** Read-only collections of points in image coordinates */
    pointLayers?: PointLayer[];
    /** What dragging does: zoom into a box, pan, or draw with a tool */
    dragMode?: DragMode;
    /** Called when the user picks zoom or pan in the toolbar. Pass it back to `dragMode` */
    onDragModeChange?: (mode: DragMode) => void;
    /** Stroke and fill of a shape while it is drawn. Defaults to a white 1.5 px outline */
    drawStyle?: AnnotationStyle;
    /** Called with a finished shape. Add it to `annotations` to keep it displayed */
    onDrawComplete?: (shape: DrawEvent) => void;
    /**
     * Called with pixel, mask, point, and annotation information under the pointer, or null
     * when the pointer leaves
     */
    onHover?: (info: OverlayPickInfo | null) => void;
    /** Called with what was clicked. Dragging is not a click */
    onClick?: (info: OverlayPickInfo) => void;
    /**
     * Called when a mask class is clicked in the legend, with the visibility it asks for. Pass it
     * back in `mask.classes[].visible`
     */
    onClassVisibilityChange?: (classId: number, visible: boolean) => void;
    /**
     * Called when a point layer is clicked in the legend, with the visibility it asks for. Pass it
     * back in `pointLayers[].visible`
     */
    onPointLayerVisibilityChange?: (layerId: string, visible: boolean) => void;
    /**
     * Identifies the current image frame. Changing it clears previously loaded images and
     * resets zoom and pan. When unset, the image shape is used
     */
    frameKey?: string | number;
    /**
     * Called as the image and each image layer start loading, decode, or fail. A failed URL
     * is retried when its URL or the `frameKey` changes
     */
    onLoadStateChange?: (layer: OverlayLayerId, state: OverlayLoadState) => void;
    /**
     * The visible area in image coordinates. A new value is applied, replacing the user's zoom;
     * `null` shows the whole frame. Pass `onViewportChange` values back to keep it in sync
     */
    viewport?: OverlayViewport | null;
    /** Called with the visible area after zooming or panning, or `null` after a reset */
    onViewportChange?: (viewport: OverlayViewport | null) => void;
    /** Show pixel axes with titles */
    showAxes?: boolean;
    /** Show a legend of mask classes and labelled point layers */
    showLegend?: boolean;
    /** Let the user move, resize and erase annotations. Changes are reported by `onAnnotationChange` */
    editableAnnotations?: boolean;
    /** Called with the whole annotation list after an edit. Pass it back to `annotations` */
    onAnnotationChange?: (annotations: Annotation[]) => void;
    /**
     * Color shown where there is no image data: pixels with NaN values, transparent pixels of a
     * picture, and the area around the image when zoomed out. Any CSS color. Defaults to dark slate
     */
    missingColor?: string;
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
 * pointer. Its arrays must match the image pixel for pixel and are never resampled; a mask that
 * does not fit is not drawn and its classes leave the legend, a note on the plot says so and
 * the console says why. A mask your
 * backend has already rendered is a picture: pass it in `imageLayers`.
 *
 * **Pictures.** The application builds every URL and owns fetching, authentication and
 * caching; for servers that need credentials, pass object or data URLs. Finch loads URLs
 * without credentials and never makes any other request. A PNG of any size is stretched onto
 * the frame. A changed URL replaces the picture once it has decoded; a changed `frameKey`
 * drops it at once, so a picture from another frame is never shown. While the image fails to
 * load, neither image layers nor the mask are drawn.
 *
 * **Frames and view.** A new `image` or `pointLayers` of the same shape is redrawn in place and
 * the current zoom is kept, so a live detector stream can replace its frame on every update.
 * `image.domain` fixes the color range, so a value keeps its color from frame to frame. A new
 * `frameKey` means a different frame: pictures of the previous one are dropped at once and the
 * view returns to the whole image. `viewport` is applied whenever its value changes (`null` is
 * the whole image), and the user's zoom persists while it is unchanged; pass `onViewportChange`
 * values back to keep it in step. The toolbar's home button resets the view in either case.
 *
 * **Layers, bottom to top.** The image, `pointLayers`, `imageLayers` in list order, the `mask`,
 * then `annotations`. Plotly draws pictures above every trace, so image layers and the mask
 * cover the points beneath them.
 *
 * **Plotly coupling** (tested with plotly.js 2.35 and 4.1). Hover and click read Plotly's laid-out axes
 * (`_fullLayout.xaxis._offset`/`_length`); `PlotlyMaskOverlay.css` targets Plotly's image layer
 * classes; layout images get distinct sizes (`IMAGE_KEY_STEP`) so a Plotly that joins them by
 * geometry keeps them apart. Finch warns once if the axis internals are missing.
 */
export default function PlotlyMaskOverlay({
    image,
    mask,
    imageLayers,
    annotations,
    pointLayers,
    dragMode = 'zoom',
    onDragModeChange,
    drawStyle,
    onDrawComplete,
    onHover,
    onClick,
    onClassVisibilityChange,
    onPointLayerVisibilityChange,
    frameKey,
    onLoadStateChange,
    viewport,
    onViewportChange,
    showAxes = true,
    showLegend = true,
    editableAnnotations = false,
    onAnnotationChange,
    missingColor,
    size = 'medium',
    className,
    style,
    ...props
}: PlotlyMaskOverlayProps) {
    const sources = useImageSources({ image, mask });
    const { frame, imageGrid, labelGrid, maskLayers, maskShape, resolvedClasses } = sources;
    const resolvedPointLayers = useResolvedPointLayers(pointLayers);
    // Without a valid frame nothing is loaded or drawn; every hook below is then a no-op. The
    // frame keeps its identity across renders: a new layout during a drag would undo the drag.
    const imageSize = frame ?? NO_FRAME;
    const [frameHeight, frameWidth] = imageSize;

    // Inputs that do not fit the frame are not drawn; say why, once per message per instance.
    const warned = useRef(new Set<string>());
    const warn = useCallback((message: string) => {
        if (warned.current.has(message)) return;
        warned.current.add(message);
        console.warn(message);
    }, []);
    const { shapeWarnings } = sources;
    useEffect(() => shapeWarnings.forEach(warn), [shapeWarnings, warn]);

    // Display options of the variant in use.
    const isArray = image.type === 'array';
    const imageColormap = (isArray && image.colormap) || 'gray';
    const imageDomain = isArray ? image.domain : undefined;
    const imageLogScale = isArray && !!image.logScale;
    const showColorbar = isArray && !!image.showColorbar;
    const imageUrl = !frame || isArray ? undefined : image.url;
    const resolveValue = isArray ? undefined : image.resolveValue;

    /** What is on screen. A new revision resets the view and drops every loaded picture. */
    const frameRevision =
        frameKey === undefined ? `${frameHeight}x${frameWidth}` : String(frameKey);

    // Colours that are not hex are drawn magenta by the mask raster and fills; say which.
    const nonHexClasses = resolvedClasses
        .filter((c) => !HEX_COLOR.test(c.color.trim()))
        .map((c) => c.id)
        .join(', ');
    const hasNonHexFill = (annotations ?? []).some((a) => a.fill && !HEX_COLOR.test(a.fill.trim()));
    useEffect(() => {
        if (nonHexClasses) {
            warn(
                `PlotlyMaskOverlay: mask class colors must be hex (#rgb or #rrggbb); class ${nonHexClasses} is drawn magenta.`,
            );
        }
        if (hasNonHexFill) {
            warn(
                'PlotlyMaskOverlay: annotation `fill` must be hex (#rgb or #rrggbb); it is drawn magenta.',
            );
        }
    }, [nonHexClasses, hasNonHexFill, warn]);

    // --- URL pictures: decoded once for load state, natural size and errors ----

    // Each id loads once: the base image is `'image'`, so a layer may not reuse it.
    const layerList = useMemo(() => {
        const seen = new Set<string>(['image']);
        return (frame ? (imageLayers ?? []) : []).filter((l) => {
            if (seen.has(l.id)) return false;
            seen.add(l.id);
            return true;
        });
    }, [imageLayers, frame]);
    const droppedLayerIds = frame ? (imageLayers?.length ?? 0) - layerList.length : 0;
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
    // A misfit mask is named too: a server that downsamples one array but not the other
    // causes it at runtime, so the viewer needs to know, not only the console. The reason
    // tells it apart from an image layer that happens to be called "mask".
    const notShown = [
        ...(sources.maskRejection ? [`mask (${sources.maskRejection})`] : []),
        ...layerList.map((l) => l.id).filter((id) => failedIds.has(id)),
    ];

    // Bumped after each shape change; it renews `editrevision`, so Plotly drops any drawn or
    // edited shape the app did not pass back in `annotations`.
    const [tick, setTick] = useState(0);
    // Bumped by the reset button, so Plotly applies the whole frame instead of the user's zoom.
    const [resets, setResets] = useState(0);

    // --- view: reset, controlled ranges ---------------------------------------
    //
    // Plotly keeps the user's zoom while the axes' `uirevision` is unchanged, even when Finch
    // passes the ranges it passed before. So the axis revision names the requested view by
    // value: any new `viewport` value (including `null` after none) is applied, an unchanged one
    // leaves the user's zoom alone. Other UI state, such as the drag mode, is not touched.
    const viewportKey = viewport
        ? `${viewport.x[0]},${viewport.x[1]},${viewport.y[0]},${viewport.y[1]}`
        : String(viewport);
    const axisRevision = `${frameRevision}|${viewportKey}|${resets}`;

    const [graphDiv, setGraphDiv] = useState<HTMLElement | null>(null);
    // The plot area's top-left corner as Plotly laid it out. A colorbar, the legend or square
    // pixels in a box of another shape move it away from the configured margins.
    const [plotCorner, setPlotCorner] = useState<{ left: number; top: number } | null>(null);
    // Called after every plot, and after every relayout, including Plotly's own on a resize.
    const handleGraphDiv = useCallback((_: unknown, gd: Readonly<HTMLElement>) => {
        setGraphDiv((prev) => (prev === gd ? prev : (gd as HTMLElement)));
        const { xa, ya } = axesOf(gd as HTMLElement);
        if (!xa || !ya) return;
        setPlotCorner((prev) =>
            prev?.left === xa._offset && prev.top === ya._offset
                ? prev
                : { left: xa._offset, top: ya._offset },
        );
    }, []);
    const onViewportChangeRef = useRef(onViewportChange);
    onViewportChangeRef.current = onViewportChange;
    const resetView = useCallback(() => {
        setResets((n) => n + 1);
        onViewportChangeRef.current?.(null);
    }, []);

    const { data, layout, config, shapes } = usePlotlyOverlayFigure({
        imageSize,
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
        // A rejected mask lists no classes: the legend would say it is drawn.
        showClassLegend: resolvedClasses.length > 0 && !sources.maskRejection,
        dragMode,
        drawStyle,
        editableAnnotations,
        showAxes,
        showLegend,
        showColorbar,
        missingColor,
        uirevision: frameRevision,
        axisRevision,
        tick,
        viewport,
        onResetView: resetView,
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
            // New shapes are the ones Finch did not name. The `tick` bump below renews
            // `editrevision`, so Plotly drops each one before the next relayout: reported once.
            for (const s of full) {
                if (typeof s.name === 'string' && s.name.startsWith(FINCH_SHAPE_PREFIX)) continue;
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

    // --- legend: visibility is the application's, the legend only asks -------

    const handleLegendClick = (event: Readonly<LegendClickEvent>): boolean => {
        const meta = (event.data[event.curveNumber] as { meta?: TraceMeta } | undefined)?.meta;
        if (meta?.kind === 'points') {
            const layer = resolvedPointLayers.find((l) => l.id === meta.layerId);
            if (layer) onPointLayerVisibilityChange?.(layer.id, !layer.visible);
            return false;
        }
        if (meta?.kind === 'class') {
            const cls = resolvedClasses.find((c) => c.id === meta.classId);
            if (cls) onClassVisibilityChange?.(cls.id, !cls.visible);
            return false;
        }
        return true;
    };

    // --- hover and click -------------------------------------------------------
    //
    // Pixels, points and annotations are read from the laid-out axes at the pointer, the same
    // way for hover and click. Points are found by screen distance with Plotly's own metric and
    // `hoverdistance`, so the reported point is the one its tooltip shows.

    // Latest values for the native listeners, so they stay attached across renders.
    const latest = useRef({
        onHover,
        onClick,
        annotations,
        pointLayers: resolvedPointLayers as ResolvedPointLayer[],
        resolver: resolveValue,
        valueKey: '',
        pick: (_fx: number, _fy: number): PixelPickInfo | null => null,
    });
    latest.current = {
        onHover,
        onClick,
        annotations,
        pointLayers: resolvedPointLayers,
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
        if (!axesOf(gd).xa) {
            warn(
                'PlotlyMaskOverlay: Plotly axis internals not found; hover and click are disabled. Check the plotly.js version.',
            );
        }
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
        const pointAt = (fx: number, fy: number) =>
            nearestPoint(latest.current.pointLayers, fx, fy, screenScale(gd), POINT_HOVER_DISTANCE);
        const compose = (
            pixel: PixelPickInfo,
            fx: number,
            fy: number,
            point: PointPickInfo | null,
        ): OverlayPickInfo => {
            const annotation = annotationAt(fx, fy);
            return {
                ...withValue(pixel),
                ...(point && { point }),
                ...(annotation && { annotation }),
            };
        };

        // --- hover ----------------------------------------------------------
        let last: {
            pixel: PixelPickInfo;
            fx: number;
            fy: number;
            point: PointPickInfo | null;
        } | null = null;
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
            emit(compose(last.pixel, last.fx, last.fy, last.point));
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
            last = pixel ? { pixel, fx, fy, point: pointAt(fx, fy) } : null;
            emitCurrent();
            if (pixel && latest.current.resolver) resolveHover(pixel);
        };

        const onMove = (e: PointerEvent) => {
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
            const info = compose(pixel, p.x, p.y, pointAt(p.x, p.y));
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
            gd.removeEventListener('pointermove', onMove);
            gd.removeEventListener('pointerleave', onLeave);
            gd.removeEventListener('pointerdown', onDown, true);
            window.removeEventListener('click', onClickEvent);
        };
    }, [graphDiv, warn]);

    const rootClassName = cn(
        'finch-plotly-mask-overlay relative',
        size === 'full' && FULL_SIZE_CLASS,
        className,
    );

    if (!frame) {
        const side = size === 'full' ? undefined : `${SIZE_REM[size]}rem`;
        return (
            <div
                className={rootClassName}
                style={{ width: side, height: side, ...style }}
                data-testid="plotly-mask-overlay"
                {...props}
            >
                <p
                    role="alert"
                    className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-2 text-center text-xs text-slate-600"
                >
                    Error: invalid image
                </p>
            </div>
        );
    }

    const box = size === 'full' ? undefined : fitBox(SIZE_REM[size], frame);
    return (
        <div
            className={rootClassName}
            style={{ ...box, ...style }}
            data-testid="plotly-mask-overlay"
            {...props}
        >
            <Plot
                data={data}
                layout={layout}
                config={config}
                onInitialized={handleGraphDiv}
                onUpdate={handleGraphDiv}
                onRelayout={handleRelayout}
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
            {notShown.length > 0 && (
                <p
                    role="status"
                    className="pointer-events-none absolute rounded bg-slate-900/70 px-2 py-0.5 text-xs text-amber-300"
                    // Inside the plot area's corner; the margins until Plotly has laid it out.
                    style={{
                        left: (plotCorner?.left ?? layout.margin?.l ?? 0) + 8,
                        top: (plotCorner?.top ?? layout.margin?.t ?? 0) + 8,
                    }}
                >
                    Not shown: {notShown.join(', ')}
                </p>
            )}
        </div>
    );
}
