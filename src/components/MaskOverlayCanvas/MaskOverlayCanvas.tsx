import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import useResizeObserver from '@/hooks/useResizeObserver';
import { CLASS_PALETTE } from '@/utils/colorUtils';
import { arrayToRgba } from '@/utils/maskRaster';
import MaskOverlayCanvasLegend from './MaskOverlayCanvasLegend';
import {
    useLoadedImage,
    useMaskRaster,
    useRasterCanvas,
    useStableClasses,
} from './hooks/useMaskRaster';
import type { MaskClass, MaskLayer, MaskPickInfo, ResolvedMaskClass } from './types';

/** Zoom applied per wheel notch. */
const ZOOM_STEP = 1.15;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 40;

/** Pointer travel, in CSS pixels, after which a press counts as a pan rather than a click. */
const CLICK_SLOP = 3;

/**
 * Longest side of the image area, in rem, for each fixed size. The other side
 * follows the image's aspect ratio, so the box never letterboxes the image.
 */
const SIZE_REM = {
    small: 16,
    medium: 24,
    large: 40,
} as const;

/** Root classes for `size="full"`, which fills the parent instead. */
const FULL_SIZE_CLASS = 'w-full h-full min-w-32 min-h-32';

/**
 * The image area for a fixed size: the longer side gets `longSide` rem and the
 * shorter side is scaled to the image's aspect ratio. A square is used until the
 * image dimensions are known, for example while an `imageUrl` is loading.
 */
function fitBox(
    longSide: number,
    imageSize: [number, number] | null,
): { width: string; height: string } {
    const [ih, iw] = imageSize ?? [1, 1];
    if (!(ih > 0) || !(iw > 0) || iw === ih) {
        return { width: `${longSide}rem`, height: `${longSide}rem` };
    }
    const width = iw > ih ? longSide : (longSide * iw) / ih;
    const height = iw > ih ? (longSide * ih) / iw : longSide;
    return { width: `${width}rem`, height: `${height}rem` };
}

/** Direction the canvas and legend are stacked in. */
const LEGEND_POSITION_CLASS_MAP = {
    right: 'flex-row',
    bottom: 'flex-col',
} as const;

/** Shape of the legend itself: a column beside the canvas, or a wrapped row beneath it. */
const LEGEND_LAYOUT_CLASS_MAP = {
    right: 'w-32 shrink-0 overflow-y-auto',
    bottom: 'max-h-24 flex-row flex-wrap gap-x-3 overflow-y-auto',
} as const;

/** A 2D grid accepted either flat (with a shape) or as nested rows. */
type GridInput = ArrayLike<number> | number[][];

/** Which layer an image URL belongs to, as reported by `onError`. */
export type MaskOverlayLayer = 'image' | 'mask';

export type MaskOverlayCanvasProps = Omit<
    React.ComponentPropsWithoutRef<'div'>,
    'onClick' | 'onError'
> & {
    /** URL of a pre-rendered base image. Use instead of `image`. */
    imageUrl?: string;
    /** Raw intensity data, color-mapped client-side. Flat row-major with `imageShape`, or nested rows. */
    image?: GridInput;
    /**
     * `[height, width]` of `image`. Required when `image` is flat; inferred when it is
     * nested. Compared by value, so an inline `[h, w]` literal is fine.
     */
    imageShape?: [number, number];
    /** Colormap id from `COLORMAPS` applied to `image`. Defaults to `'gray'`. */
    imageColormap?: string;
    /** Display range `[min, max]` for `image`. Defaults to the data extent. */
    imageDomain?: [number, number];
    /**
     * Log-scale `image` before color mapping. Pixels at or below zero are outside
     * the log domain and are left transparent rather than sharing a color with the
     * smallest positive value; set `underRangeColor` to paint them instead. A lower
     * `imageDomain` bound at or below zero is replaced by the smallest positive
     * pixel. Defaults to `false`.
     */
    imageLogScale?: boolean;
    /**
     * RGBA (0–255 each) for `image` pixels outside the valid log domain, that is
     * values `<= 0`, when `imageLogScale` is set. Defaults to fully transparent
     * `[0, 0, 0, 0]`. Has no effect without `imageLogScale`, and does not apply to
     * `imageUrl`, `maskImageUrl` or the mask layer, none of which are log-scaled
     * here. Compared by value, so an inline `[r, g, b, a]` literal is fine.
     */
    underRangeColor?: [number, number, number, number];
    /**
     * Smoothing for the base image when it is scaled. `'auto'` smooths when the
     * image is drawn smaller than its native size, which avoids aliasing and moiré
     * on large frames, and keeps pixels crisp when zoomed in. The mask layer is
     * always drawn nearest-neighbour so class boundaries stay hard. Defaults to `'auto'`.
     */
    imageSmoothing?: boolean | 'auto';

    /** Flat row-major label array (or nested rows); `0` is background. Use instead of `maskLayers`. */
    labels?: GridInput;
    /**
     * `[height, width]` of `labels` / `maskLayers`. Required when the data is flat.
     * The mask may differ in resolution from the base image; it is scaled to match.
     * Compared by value, so an inline literal is fine.
     */
    labelsShape?: [number, number];
    /** Per-class binary masks, as an alternative to `labels`. */
    maskLayers?: MaskLayer[];
    /** URL of a pre-rendered RGBA mask image, for server-rendered pipelines. */
    maskImageUrl?: string;
    /**
     * CORS mode for `imageUrl` and `maskImageUrl`. Unset by default, like a plain
     * `<img>`. Set it to `'anonymous'` only if you need an untainted canvas, for
     * example to export pixels. Servers that send no CORS headers fail to load when
     * it is set, which includes Tiled URLs that carry an `api_key` query parameter.
     */
    crossOrigin?: 'anonymous' | 'use-credentials';
    /**
     * Called when `imageUrl` or `maskImageUrl` fails to load, with a message and the
     * layer it belongs to. Replaces the root `<div>`'s own `onError`. An error
     * message is also shown over the canvas. The URL in the message has its query
     * string removed, so an `api_key` parameter is not exposed.
     */
    onError?: (message: string, layer: MaskOverlayLayer) => void;

    /**
     * Class definitions. When omitted, one class per distinct non-zero label value is
     * derived, colored from `CLASS_PALETTE` in ascending id order. Setting `visible` on
     * any class makes visibility controlled; otherwise the component tracks it internally.
     * Compared field by field, so building the list inline is fine.
     */
    classes?: MaskClass[];
    /** Global mask opacity, 0–1, applied once when compositing. Defaults to `0.5`. */
    maskOpacity?: number;
    /** Render the class legend. Defaults to `true`. */
    showLegend?: boolean;
    /** Legend placement relative to the canvas. Defaults to `'right'`. */
    legendPosition?: 'right' | 'bottom';
    /** Called with a class id and its next visibility when a legend toggle is clicked. */
    onClassVisibilityChange?: (classId: number, visible: boolean) => void;
    /** Called as the pointer moves over the image, and with `null` when it leaves. Throttled to one call per frame. */
    onHover?: (info: MaskPickInfo | null) => void;
    /** Called when the image is clicked. Not called at the end of a pan drag. */
    onClick?: (info: MaskPickInfo) => void;
    /** Show a tooltip naming the class under the pointer. Defaults to `true`. */
    showTooltip?: boolean;
    /**
     * Enable wheel zoom and drag pan. Defaults to `false`.
     *
     * The view resets when the image dimensions or `fit` change. Swapping in another
     * image of the same size (a new `imageUrl`, a new `image` array or a new mask)
     * keeps the current zoom and pan.
     */
    zoomable?: boolean;
    /**
     * Initial placement. `'contain'` letterboxes the image into the box; `'none'` draws
     * one image pixel per CSS pixel from the top-left. Defaults to `'contain'`.
     */
    fit?: 'contain' | 'none';
    /**
     * Size of the image area. Defaults to `'medium'`.
     *
     * `'small'`, `'medium'` and `'large'` give the image's longer side 16, 24 or
     * 40 rem and scale the shorter side to the image's aspect ratio, so the box
     * matches the image with no letterboxing. The legend sits outside this box.
     *
     * `'full'` fills the parent instead, letterboxing the image inside it with its
     * ratio preserved. Note that `h-full` resolves to zero unless an ancestor has a
     * real height.
     */
    size?: 'small' | 'medium' | 'large' | 'full';
    /** Additional CSS classes applied to the root element. */
    className?: string;
    /** Additional CSS classes applied to the canvas wrapper. */
    classNameCanvas?: string;
    /** Additional CSS classes applied to the legend. */
    classNameLegend?: string;
};

/** Normalizes a flat-or-nested grid into a flat array plus its shape. */
function normalizeGrid(
    input: GridInput | undefined,
    height: number | undefined,
    width: number | undefined,
): { data: ArrayLike<number>; shape: [number, number] } | null {
    if (!input) return null;
    const first = (input as number[][])[0];
    if (Array.isArray(first)) {
        const rows = input as number[][];
        const h = rows.length;
        const w = rows[0]?.length ?? 0;
        if (!(w > 0) || !(h > 0)) return null;
        const flat = new Float64Array(w * h);
        for (let y = 0; y < h; y += 1) {
            const row = rows[y];
            for (let x = 0; x < w; x += 1) flat[y * w + x] = row[x] ?? 0;
        }
        return { data: flat, shape: [h, w] };
    }
    if (height === undefined || width === undefined) return null;
    return { data: input as ArrayLike<number>, shape: [height, width] };
}

/**
 * The placement before zoom and pan: the scale and offset that fit the image into
 * the box. Shared by the view transform and the wheel handler so the two cannot
 * drift apart.
 */
function computeBaseView(
    imageSize: [number, number],
    box: { width: number; height: number },
    fit: 'contain' | 'none',
): { baseScale: number; baseTx: number; baseTy: number } {
    const [ih, iw] = imageSize;
    if (fit !== 'contain') return { baseScale: 1, baseTx: 0, baseTy: 0 };
    const baseScale = Math.min(box.width / iw, box.height / ih);
    return {
        baseScale,
        baseTx: (box.width - iw * baseScale) / 2,
        baseTy: (box.height - ih * baseScale) / 2,
    };
}

/** Sizes a canvas's backing store, touching it only when it actually changes. */
function ensureCanvasSize(el: HTMLCanvasElement, cssWidth: number, cssHeight: number, dpr: number) {
    const w = Math.round(cssWidth * dpr);
    const h = Math.round(cssHeight * dpr);
    // Assigning width or height reallocates the backing store even when the value
    // is unchanged, so compare first.
    if (el.width !== w) el.width = w;
    if (el.height !== h) el.height = h;
    const sw = `${cssWidth}px`;
    const sh = `${cssHeight}px`;
    if (el.style.width !== sw) el.style.width = sw;
    if (el.style.height !== sh) el.style.height = sh;
}

/**
 * An image with one or more segmentation masks drawn over it.
 *
 * The base image and the mask are rasterized to separate stacked canvases sharing
 * a single view transform, so they stay registered under zoom and pan. Masks are
 * supplied as a label array (one integer per pixel, `0` for background) or as a set
 * of per-class binary masks — the form both the calibration and annotation backends
 * already persist. A pre-rendered RGBA mask image is accepted as well, for pipelines
 * that color-map server-side.
 *
 * Global opacity is applied once when the mask layer is composited rather than baked
 * into each pixel, so overlapping regions of one class read as a uniform wash instead
 * of darkening where they meet.
 *
 * This is a display component. It has no editing tools and makes no network requests
 * of its own beyond loading the image URLs it is given.
 */
export default function MaskOverlayCanvas({
    imageUrl,
    image,
    imageShape,
    imageColormap = 'gray',
    imageDomain,
    imageLogScale = false,
    underRangeColor,
    imageSmoothing = 'auto',
    labels,
    labelsShape,
    maskLayers,
    maskImageUrl,
    crossOrigin,
    onError,
    classes: classesProp,
    maskOpacity = 0.5,
    showLegend = true,
    legendPosition = 'right',
    onClassVisibilityChange,
    onHover,
    onClick,
    showTooltip = true,
    zoomable = false,
    fit = 'contain',
    size = 'medium',
    className,
    classNameCanvas,
    classNameLegend,
    ...props
}: MaskOverlayCanvasProps) {
    const { containerRef, dimensions } = useResizeObserver();
    const baseCanvasRef = useRef<HTMLCanvasElement>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement>(null);

    // Shapes are memoized on their numbers, not the tuple identity, so an inline
    // `imageShape={[h, w]}` does not re-run the colormap pass every render.
    const imageH = imageShape?.[0];
    const imageW = imageShape?.[1];
    const labelsH = labelsShape?.[0];
    const labelsW = labelsShape?.[1];
    const imageGrid = useMemo(() => normalizeGrid(image, imageH, imageW), [image, imageH, imageW]);
    const labelGrid = useMemo(
        () => normalizeGrid(labels, labelsH, labelsW),
        [labels, labelsH, labelsW],
    );

    const maskShape = useMemo<[number, number] | undefined>(() => {
        if (labelGrid) return labelGrid.shape;
        if (labelsH !== undefined && labelsW !== undefined) return [labelsH, labelsW];
        return undefined;
    }, [labelGrid, labelsH, labelsW]);

    // --- classes -------------------------------------------------------------

    const classes = useStableClasses(classesProp);
    const [hiddenIds, setHiddenIds] = useState<ReadonlySet<number>>(() => new Set());
    const visibilityIsControlled = useMemo(
        () => (classes ?? []).some((c) => c.visible !== undefined),
        [classes],
    );

    const derivedIds = useMemo(() => {
        if (classes) return null;
        const seen = new Set<number>();
        if (labelGrid) {
            const { data } = labelGrid;
            for (let i = 0; i < data.length; i += 1) {
                const v = data[i];
                if (v !== 0) seen.add(v);
            }
        }
        for (const layer of maskLayers ?? []) seen.add(layer.classId);
        return [...seen].sort((a, b) => a - b);
    }, [classes, labelGrid, maskLayers]);

    const resolvedClasses = useMemo<ResolvedMaskClass[]>(() => {
        const source: MaskClass[] = classes ?? (derivedIds ?? []).map((id) => ({ id }));
        return source.map((cls, index) => ({
            id: cls.id,
            label: cls.label ?? `Class ${cls.id}`,
            color: cls.color ?? CLASS_PALETTE[index % CLASS_PALETTE.length],
            opacity: cls.opacity ?? 1,
            visible: visibilityIsControlled ? (cls.visible ?? true) : !hiddenIds.has(cls.id),
        }));
    }, [classes, derivedIds, visibilityIsControlled, hiddenIds]);

    const handleToggle = useCallback(
        (classId: number, visible: boolean) => {
            if (!visibilityIsControlled) {
                setHiddenIds((prev) => {
                    const next = new Set(prev);
                    if (visible) next.delete(classId);
                    else next.add(classId);
                    return next;
                });
            }
            onClassVisibilityChange?.(classId, visible);
        },
        [visibilityIsControlled, onClassVisibilityChange],
    );

    // --- rasters -------------------------------------------------------------

    const [underR, underG, underB, underA] = underRangeColor ?? [0, 0, 0, 0];
    const baseBuffer = useMemo(() => {
        if (!imageGrid) return null;
        const [height, width] = imageGrid.shape;
        return arrayToRgba(imageGrid.data, width, height, {
            colormap: imageColormap,
            domain: imageDomain,
            log: imageLogScale,
            underRangeColor: [underR, underG, underB, underA],
        });
    }, [imageGrid, imageColormap, imageDomain, imageLogScale, underR, underG, underB, underA]);

    const maskBuffer = useMaskRaster({
        labels: labelGrid?.data,
        maskLayers,
        shape: maskShape,
        classes: resolvedClasses,
    });

    const baseRaster = useRasterCanvas(baseBuffer);
    const maskRaster = useRasterCanvas(maskBuffer);
    const baseImage = useLoadedImage(imageUrl, {
        crossOrigin,
        onError: (message) => onError?.(message, 'image'),
    });
    const maskImage = useLoadedImage(maskImageUrl, {
        crossOrigin,
        onError: (message) => onError?.(message, 'mask'),
    });
    const baseImageEl = baseImage.image;
    const maskImageEl = maskImage.image;

    const baseSource: CanvasImageSource | null = baseRaster ?? baseImageEl;
    const maskSource: CanvasImageSource | null = maskRaster ?? maskImageEl;

    /** The coordinate space everything is drawn in: the base image if there is one, else the mask. */
    const imageSize = useMemo<[number, number] | null>(() => {
        if (imageGrid) return imageGrid.shape;
        if (baseImageEl) return [baseImageEl.naturalHeight, baseImageEl.naturalWidth];
        if (maskShape) return maskShape;
        if (maskImageEl) return [maskImageEl.naturalHeight, maskImageEl.naturalWidth];
        return null;
    }, [imageGrid, baseImageEl, maskShape, maskImageEl]);

    // --- view transform ------------------------------------------------------

    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });

    // Reset the view when the coordinate space changes. Keyed on the dimensions,
    // not the image identity, so a same-sized replacement keeps the viewport.
    const sizeH = imageSize?.[0];
    const sizeW = imageSize?.[1];
    useEffect(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    }, [sizeH, sizeW, fit]);

    const view = useMemo(() => {
        const { width: cw, height: ch } = dimensions;
        if (!imageSize || cw <= 0 || ch <= 0) return { scale: 1, tx: 0, ty: 0 };
        const { baseScale, baseTx, baseTy } = computeBaseView(imageSize, dimensions, fit);
        return {
            scale: baseScale * zoom,
            tx: baseTx * zoom + pan.x,
            ty: baseTy * zoom + pan.y,
        };
    }, [dimensions, imageSize, fit, zoom, pan]);

    useEffect(() => {
        const baseEl = baseCanvasRef.current;
        const maskEl = maskCanvasRef.current;
        const { width: cw, height: ch } = dimensions;
        if (!baseEl || !maskEl || cw <= 0 || ch <= 0 || !imageSize) return;

        const dpr = window.devicePixelRatio || 1;
        ensureCanvasSize(baseEl, cw, ch, dpr);
        ensureCanvasSize(maskEl, cw, ch, dpr);

        const [ih, iw] = imageSize;
        const paint = (
            el: HTMLCanvasElement,
            source: CanvasImageSource | null,
            alpha: number,
            smooth: boolean,
        ) => {
            const ctx = el.getContext('2d');
            if (!ctx) return;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, el.width, el.height);
            if (!source) return;
            ctx.setTransform(
                view.scale * dpr,
                0,
                0,
                view.scale * dpr,
                view.tx * dpr,
                view.ty * dpr,
            );
            ctx.imageSmoothingEnabled = smooth;
            ctx.globalAlpha = alpha;
            // Drawing to the image extent rescales a mask captured at a different
            // resolution onto the same coordinate space as the base.
            ctx.drawImage(source, 0, 0, iw, ih);
        };

        const smoothBase = imageSmoothing === 'auto' ? view.scale < 1 : imageSmoothing;
        paint(baseEl, baseSource, 1, smoothBase);
        // Nearest-neighbour keeps class boundaries hard rather than blurring them
        // into neighbouring classes.
        paint(maskEl, maskSource, Math.max(0, Math.min(1, maskOpacity)), false);
    }, [dimensions, imageSize, view, baseSource, maskSource, maskOpacity, imageSmoothing]);

    // --- picking -------------------------------------------------------------

    const pick = useCallback(
        (clientX: number, clientY: number): MaskPickInfo | null => {
            const el = containerRef.current;
            if (!el || !imageSize) return null;
            const rect = el.getBoundingClientRect();
            const x = Math.floor((clientX - rect.left - view.tx) / view.scale);
            const y = Math.floor((clientY - rect.top - view.ty) / view.scale);
            const [ih, iw] = imageSize;
            if (x < 0 || y < 0 || x >= iw || y >= ih) return null;

            let classId: number | null = null;
            if (labelGrid && maskShape) {
                const [mh, mw] = maskShape;
                const mx = Math.min(mw - 1, Math.floor((x * mw) / iw));
                const my = Math.min(mh - 1, Math.floor((y * mh) / ih));
                const raw = labelGrid.data[my * mw + mx];
                classId = raw === 0 ? null : raw;
            } else if (maskLayers && maskShape) {
                const [mh, mw] = maskShape;
                const mx = Math.min(mw - 1, Math.floor((x * mw) / iw));
                const my = Math.min(mh - 1, Math.floor((y * mh) / ih));
                // Later layers render on top, so the last hit wins.
                for (const layer of maskLayers) {
                    if (layer.data[my * mw + mx]) classId = layer.classId;
                }
            }

            const cls = resolvedClasses.find((c) => c.id === classId && c.visible);
            return { x, y, classId: cls ? classId : null, label: cls?.label };
        },
        [containerRef, imageSize, view, labelGrid, maskLayers, maskShape, resolvedClasses],
    );

    const [tooltip, setTooltip] = useState<{ info: MaskPickInfo; x: number; y: number } | null>(
        null,
    );
    const hoverRafRef = useRef<number | null>(null);
    const hoverPendingRef = useRef<MaskPickInfo | null>(null);
    useEffect(
        () => () => {
            if (hoverRafRef.current !== null) cancelAnimationFrame(hoverRafRef.current);
        },
        [],
    );

    const panRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
    /** Set once a press has travelled far enough to be a pan, so the trailing click is ignored. */
    const panMovedRef = useRef(false);

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (panRef.current) {
            const dx = event.clientX - panRef.current.x;
            const dy = event.clientY - panRef.current.y;
            if (Math.abs(dx) + Math.abs(dy) > CLICK_SLOP) panMovedRef.current = true;
            setPan({ x: panRef.current.panX + dx, y: panRef.current.panY + dy });
            return;
        }

        const info = pick(event.clientX, event.clientY);
        if (showTooltip) {
            const rect = containerRef.current?.getBoundingClientRect();
            setTooltip(
                info && rect
                    ? { info, x: event.clientX - rect.left, y: event.clientY - rect.top }
                    : null,
            );
        }
        if (!onHover) return;
        hoverPendingRef.current = info;
        if (hoverRafRef.current !== null) return;
        hoverRafRef.current = requestAnimationFrame(() => {
            hoverRafRef.current = null;
            onHover(hoverPendingRef.current);
        });
    };

    const handlePointerLeave = () => {
        setTooltip(null);
        onHover?.(null);
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        panMovedRef.current = false;
        if (!zoomable) return;
        panRef.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!panRef.current) return;
        panRef.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    };

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (panMovedRef.current) {
            panMovedRef.current = false;
            return;
        }
        if (!onClick) return;
        const info = pick(event.clientX, event.clientY);
        if (info) onClick(info);
    };

    const handleWheel = (event: WheelEvent) => {
        if (!zoomable || !imageSize) return;
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const px = event.clientX - rect.left;
        const py = event.clientY - rect.top;
        // Anchor the zoom on the pointer: the image point under the cursor stays put.
        const imageX = (px - view.tx) / view.scale;
        const imageY = (py - view.ty) / view.scale;
        const nextZoom = Math.max(
            MIN_ZOOM,
            Math.min(MAX_ZOOM, event.deltaY < 0 ? zoom * ZOOM_STEP : zoom / ZOOM_STEP),
        );
        const { baseScale, baseTx, baseTy } = computeBaseView(imageSize, dimensions, fit);
        const nextScale = baseScale * nextZoom;

        setZoom(nextZoom);
        setPan({
            x: px - imageX * nextScale - baseTx * nextZoom,
            y: py - imageY * nextScale - baseTy * nextZoom,
        });
    };

    // React attaches `onWheel` as a passive listener, which cannot cancel the page
    // scroll, so the wheel handler is attached natively with `passive: false`. The
    // ref lets the listener stay attached while always calling the latest handler.
    const wheelRef = useRef(handleWheel);
    wheelRef.current = handleWheel;
    useEffect(() => {
        const el = containerRef.current;
        if (!el || !zoomable) return;
        const listener = (event: WheelEvent) => {
            event.preventDefault();
            wheelRef.current(event);
        };
        el.addEventListener('wheel', listener, { passive: false });
        return () => el.removeEventListener('wheel', listener);
    }, [zoomable, containerRef]);

    const canvasBox = size === 'full' ? null : fitBox(SIZE_REM[size], imageSize);
    const hasLegend = showLegend && resolvedClasses.length > 0;
    const loadError = baseImage.error
        ? 'Error: failed to load image'
        : maskImage.error
          ? 'Error: failed to load mask'
          : null;

    return (
        <div
            className={cn(
                'flex gap-2 text-slate-700',
                LEGEND_POSITION_CLASS_MAP[legendPosition],
                size === 'full' ? FULL_SIZE_CLASS : 'w-fit',
                className,
            )}
            {...props}
        >
            <div
                ref={containerRef}
                data-testid="mask-overlay-canvas-box"
                className={cn(
                    'relative overflow-hidden bg-slate-900',
                    size === 'full' ? 'flex-1' : 'flex-none',
                    zoomable && 'cursor-grab touch-none',
                    classNameCanvas,
                )}
                style={canvasBox ? { width: canvasBox.width, height: canvasBox.height } : undefined}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onClick={handleClick}
            >
                <canvas
                    ref={baseCanvasRef}
                    aria-label="Base image"
                    className="absolute inset-0"
                    data-testid="mask-overlay-base-canvas"
                />
                <canvas
                    ref={maskCanvasRef}
                    aria-label="Segmentation mask overlay"
                    className="absolute inset-0"
                    data-testid="mask-overlay-mask-canvas"
                />
                {loadError && (
                    <p
                        role="alert"
                        className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-2 text-center text-xs text-slate-300"
                    >
                        {loadError}
                    </p>
                )}
                {showTooltip && tooltip && (
                    <div
                        role="status"
                        className="pointer-events-none absolute z-10 rounded bg-slate-800 px-1.5 py-0.5 text-xs text-white"
                        style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
                    >
                        {tooltip.info.label ?? `(${tooltip.info.x}, ${tooltip.info.y})`}
                    </div>
                )}
            </div>
            {hasLegend && (
                <MaskOverlayCanvasLegend
                    classes={resolvedClasses}
                    onToggle={handleToggle}
                    className={cn(LEGEND_LAYOUT_CLASS_MAP[legendPosition], classNameLegend)}
                    // Below a fixed-size canvas, the legend wraps at the canvas width
                    // rather than widening the component.
                    style={
                        canvasBox && legendPosition === 'bottom'
                            ? { width: canvasBox.width }
                            : undefined
                    }
                />
            )}
        </div>
    );
}
