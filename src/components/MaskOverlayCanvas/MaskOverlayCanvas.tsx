import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import useResizeObserver from '@/hooks/useResizeObserver';
import { CLASS_PALETTE } from '@/utils/colorUtils';
import { arrayToRgba } from '@/utils/maskRaster';
import MaskOverlayCanvasLegend from './MaskOverlayCanvasLegend';
import { useLoadedImage, useMaskRaster, useRasterCanvas } from './hooks/useMaskRaster';
import type { MaskClass, MaskLayer, MaskPickInfo, ResolvedMaskClass } from './types';

/** Zoom applied per wheel notch. */
const ZOOM_STEP = 1.15;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 40;

const SIZE_CLASS_MAP = {
    small: 'w-64 h-64',
    medium: 'w-96 h-96',
    large: 'w-[40rem] h-[40rem]',
    full: 'w-full h-full min-w-32 min-h-32',
} as const;

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

export type MaskOverlayCanvasProps = Omit<
    React.ComponentPropsWithoutRef<'div'>,
    'onClick' | 'onError'
> & {
    /** URL of a pre-rendered base image. Use instead of `image`. */
    imageUrl?: string;
    /** Raw intensity data, color-mapped client-side. Flat row-major with `imageShape`, or nested rows. */
    image?: GridInput;
    /** `[height, width]` of `image`. Required when `image` is flat; inferred when it is nested. */
    imageShape?: [number, number];
    /** Colormap id from `COLORMAPS` applied to `image`. Defaults to `'gray'`. */
    imageColormap?: string;
    /** Display range `[min, max]` for `image`. Defaults to the data extent. */
    imageDomain?: [number, number];
    /** Log-scale `image` before color mapping. Defaults to `false`. */
    imageLogScale?: boolean;

    /** Flat row-major label array (or nested rows); `0` is background. Use instead of `maskLayers`. */
    labels?: GridInput;
    /**
     * `[height, width]` of `labels` / `maskLayers`. Required when the data is flat.
     * The mask may differ in resolution from the base image; it is scaled to match.
     */
    labelsShape?: [number, number];
    /** Per-class binary masks, as an alternative to `labels`. */
    maskLayers?: MaskLayer[];
    /** URL of a pre-rendered RGBA mask image, for server-rendered pipelines. */
    maskImageUrl?: string;

    /**
     * Class definitions. When omitted, one class per distinct non-zero label value is
     * derived, colored from `CLASS_PALETTE` in ascending id order. Setting `visible` on
     * any class makes visibility controlled; otherwise the component tracks it internally.
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
    /** Called when the image is clicked. */
    onClick?: (info: MaskPickInfo) => void;
    /** Show a tooltip naming the class under the pointer. Defaults to `true`. */
    showTooltip?: boolean;
    /** Enable wheel zoom and drag pan. Defaults to `false`. */
    zoomable?: boolean;
    /**
     * Initial placement. `'contain'` letterboxes the image into the box; `'none'` draws
     * one image pixel per CSS pixel from the top-left. Defaults to `'contain'`.
     */
    fit?: 'contain' | 'none';
    /**
     * Fixed dimensions. Defaults to `'full'`, which fills the parent — note that
     * `h-full` resolves to zero unless an ancestor has a real height.
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
    shape: [number, number] | undefined,
): { data: ArrayLike<number>; shape: [number, number] } | null {
    if (!input) return null;
    const first = (input as number[][])[0];
    if (Array.isArray(first)) {
        const rows = input as number[][];
        const height = rows.length;
        const width = rows[0]?.length ?? 0;
        if (!(width > 0) || !(height > 0)) return null;
        const flat = new Float64Array(width * height);
        for (let y = 0; y < height; y += 1) {
            const row = rows[y];
            for (let x = 0; x < width; x += 1) flat[y * width + x] = row[x] ?? 0;
        }
        return { data: flat, shape: [height, width] };
    }
    if (!shape) return null;
    return { data: input as ArrayLike<number>, shape };
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
 * of its own.
 */
export default function MaskOverlayCanvas({
    imageUrl,
    image,
    imageShape,
    imageColormap = 'gray',
    imageDomain,
    imageLogScale = false,
    labels,
    labelsShape,
    maskLayers,
    maskImageUrl,
    classes,
    maskOpacity = 0.5,
    showLegend = true,
    legendPosition = 'right',
    onClassVisibilityChange,
    onHover,
    onClick,
    showTooltip = true,
    zoomable = false,
    fit = 'contain',
    size = 'full',
    className,
    classNameCanvas,
    classNameLegend,
    ...props
}: MaskOverlayCanvasProps) {
    const { containerRef, dimensions } = useResizeObserver();
    const baseCanvasRef = useRef<HTMLCanvasElement>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement>(null);

    const imageGrid = useMemo(() => normalizeGrid(image, imageShape), [image, imageShape]);
    const labelGrid = useMemo(() => normalizeGrid(labels, labelsShape), [labels, labelsShape]);

    const maskShape = labelGrid?.shape ?? labelsShape;

    // --- classes -------------------------------------------------------------

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

    const baseBuffer = useMemo(() => {
        if (!imageGrid) return null;
        const [height, width] = imageGrid.shape;
        return arrayToRgba(imageGrid.data, width, height, {
            colormap: imageColormap,
            domain: imageDomain,
            log: imageLogScale,
        });
    }, [imageGrid, imageColormap, imageDomain, imageLogScale]);

    const maskBuffer = useMaskRaster({
        labels: labelGrid?.data,
        maskLayers,
        shape: maskShape,
        classes: resolvedClasses,
    });

    const baseRaster = useRasterCanvas(baseBuffer);
    const maskRaster = useRasterCanvas(maskBuffer);
    const baseImageEl = useLoadedImage(imageUrl);
    const maskImageEl = useLoadedImage(maskImageUrl);

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

    const view = useMemo(() => {
        const { width: cw, height: ch } = dimensions;
        if (!imageSize || cw <= 0 || ch <= 0) return { scale: 1, tx: 0, ty: 0 };
        const [ih, iw] = imageSize;
        const baseScale = fit === 'contain' ? Math.min(cw / iw, ch / ih) : 1;
        const baseTx = fit === 'contain' ? (cw - iw * baseScale) / 2 : 0;
        const baseTy = fit === 'contain' ? (ch - ih * baseScale) / 2 : 0;
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
        for (const el of [baseEl, maskEl]) {
            el.width = Math.round(cw * dpr);
            el.height = Math.round(ch * dpr);
            el.style.width = `${cw}px`;
            el.style.height = `${ch}px`;
        }

        const [ih, iw] = imageSize;
        const paint = (el: HTMLCanvasElement, source: CanvasImageSource | null, alpha: number) => {
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
            // Nearest-neighbour keeps class boundaries hard rather than blurring
            // them into neighbouring classes.
            ctx.imageSmoothingEnabled = false;
            ctx.globalAlpha = alpha;
            // Drawing to the image extent rescales a mask captured at a different
            // resolution onto the same coordinate space as the base.
            ctx.drawImage(source, 0, 0, iw, ih);
        };

        paint(baseEl, baseSource, 1);
        paint(maskEl, maskSource, Math.max(0, Math.min(1, maskOpacity)));
    }, [dimensions, imageSize, view, baseSource, maskSource, maskOpacity]);

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

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (panRef.current) {
            setPan({
                x: panRef.current.panX + (event.clientX - panRef.current.x),
                y: panRef.current.panY + (event.clientY - panRef.current.y),
            });
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
        if (!onClick) return;
        const info = pick(event.clientX, event.clientY);
        if (info) onClick(info);
    };

    const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
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

        const { width: cw, height: ch } = dimensions;
        const [ih, iw] = imageSize;
        const baseScale = fit === 'contain' ? Math.min(cw / iw, ch / ih) : 1;
        const baseTx = fit === 'contain' ? (cw - iw * baseScale) / 2 : 0;
        const baseTy = fit === 'contain' ? (ch - ih * baseScale) / 2 : 0;
        const nextScale = baseScale * nextZoom;

        setZoom(nextZoom);
        setPan({
            x: px - imageX * nextScale - baseTx * nextZoom,
            y: py - imageY * nextScale - baseTy * nextZoom,
        });
    };

    const hasLegend = showLegend && resolvedClasses.length > 0;

    return (
        <div
            className={cn(
                'flex gap-2 text-slate-700',
                LEGEND_POSITION_CLASS_MAP[legendPosition],
                SIZE_CLASS_MAP[size],
                className,
            )}
            {...props}
        >
            <div
                ref={containerRef}
                className={cn(
                    'relative flex-1 overflow-hidden bg-slate-900',
                    zoomable && 'cursor-grab touch-none',
                    classNameCanvas,
                )}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onClick={handleClick}
                onWheel={handleWheel}
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
                />
            )}
        </div>
    );
}
