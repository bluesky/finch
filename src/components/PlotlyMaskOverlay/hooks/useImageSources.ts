import { useCallback, useMemo, useRef, useState } from 'react';
import { flattenPoints } from '@/utils/annotationGeometry';
import { CLASS_PALETTE } from '@/utils/colorUtils';
import type { RgbaBuffer } from '@/utils/maskRaster';
import { useMaskRaster, useStableClasses } from './useMaskRaster';
import type {
    GridInput,
    ImageInput,
    MaskClass,
    MaskInput,
    MaskLayer,
    PixelPickInfo,
    PointLayer,
    PointPickInfo,
    ResolvedMaskClass,
    ResolvedPointLayer,
} from '../types';

/** A grid flattened to row-major data plus its `[height, width]`. */
export type NormalizedGrid = { data: ArrayLike<number>; shape: [number, number] };

const isRows = (input: GridInput): input is number[][] => Array.isArray((input as number[][])[0]);

/**
 * Normalizes a flat-or-nested grid into a flat array plus its shape. Nested rows must all
 * have the same length; ragged rows return `null`, since padding would invent values.
 */
export function normalizeGrid(
    input: GridInput | undefined,
    height: number | undefined,
    width: number | undefined,
): NormalizedGrid | null {
    if (!input) return null;
    if (isRows(input)) {
        const rows = input as number[][];
        const h = rows.length;
        const w = rows[0]?.length ?? 0;
        if (!(w > 0) || !(h > 0)) return null;
        const flat = new Float64Array(w * h);
        for (let y = 0; y < h; y += 1) {
            const row = rows[y];
            if (row.length !== w) return null;
            for (let x = 0; x < w; x += 1) flat[y * w + x] = row[x];
        }
        return { data: flat, shape: [h, w] };
    }
    if (height === undefined || width === undefined) return null;
    return { data: input as ArrayLike<number>, shape: [height, width] };
}

/** The validated inputs: what fits the detector frame, and one warning per input that does not. */
export type ResolvedInputs = {
    /** `[height, width]` of the detector frame, from `image`. `null` when the image is rejected. */
    frame: [number, number] | null;
    /** The raw base image, flattened. Source values, never modified. */
    imageGrid: NormalizedGrid | null;
    /** The raw label array, flattened. `null` when it does not fit the frame. */
    labelGrid: NormalizedGrid | null;
    /** Binary masks that fit the frame. */
    maskLayers: MaskLayer[] | undefined;
    /** `[height, width]` of a mask array that fits the frame: always the frame itself. */
    maskShape: [number, number] | undefined;
    warnings: string[];
};

const fmt = ([h, w]: [number, number]) => `${h} × ${w}`;
const isShape = (s: unknown): s is [number, number] =>
    Array.isArray(s) && s.length === 2 && s.every((n) => Number.isInteger(n) && n > 0);
const MASK_HINT = ' Masks are never resampled; pass a lower-resolution mask PNG in `imageLayers`.';

type Reject = (why: string) => null;

/**
 * Flattens the `data` of `what`: nested rows carry their own shape and must equal
 * `expected` when one is given; a flat array needs `expected` and must fill it exactly.
 */
function gridOf(
    data: GridInput,
    expected: [number, number] | undefined,
    what: string,
    hint: string,
    reject: Reject,
): NormalizedGrid | null {
    if (isRows(data)) {
        const grid = normalizeGrid(data, undefined, undefined);
        if (!grid) return reject(`${what} rows must all have the same length; it is not drawn.`);
        if (expected && (grid.shape[0] !== expected[0] || grid.shape[1] !== expected[1])) {
            return reject(
                `${what} rows are ${fmt(grid.shape)} but ${fmt(expected)} was expected; it is not drawn.${hint}`,
            );
        }
        return grid;
    }
    if (!expected)
        return reject(`a flat ${what} array needs \`shape\` ([height, width]); it is not drawn.`);
    if (!isShape(expected))
        return reject(`${what} shape must be two positive integers; it is not drawn.`);
    if (data.length !== expected[0] * expected[1]) {
        return reject(
            `${what} has ${data.length} values but ${fmt(expected)} needs ${expected[0] * expected[1]}; it is not drawn.${hint}`,
        );
    }
    return normalizeGrid(data, expected[0], expected[1]);
}

/**
 * Validates `image` and `mask` against each other. The frame is the image's: its `shape`, or
 * the shape of its rows. Arrays are never resized, resampled, padded or truncated: an image
 * or mask that does not fit is rejected with a warning and not drawn.
 */
export function resolveInputs(image: ImageInput | undefined, mask?: MaskInput): ResolvedInputs {
    const warnings: string[] = [];
    const reject: Reject = (why) => {
        warnings.push(`PlotlyMaskOverlay: ${why}`);
        return null;
    };

    let imageGrid: NormalizedGrid | null = null;
    let frame: [number, number] | null = null;
    if (image?.type === 'array') {
        imageGrid = gridOf(image.data, image.shape, '`image`', '', reject);
        frame = imageGrid?.shape ?? null;
    } else if (image?.type === 'url') {
        frame = isShape(image.shape)
            ? image.shape
            : reject(
                  '`image.shape` must be [height, width] in positive integers; nothing is drawn.',
              );
    } else {
        reject(
            `\`image\` must be { type: 'array' } or { type: 'url' }, not ${JSON.stringify((image as { type?: unknown } | undefined)?.type)}; nothing is drawn.`,
        );
    }

    let labelGrid: NormalizedGrid | null = null;
    let maskLayers: MaskLayer[] | undefined;
    let maskShape: [number, number] | undefined;
    if (!frame || !mask) {
        // Without a frame nothing is drawn, and the image's own warning says why.
    } else if (mask.type === 'labels') {
        labelGrid = gridOf(mask.data, frame, '`mask`', MASK_HINT, reject);
        maskShape = labelGrid?.shape;
    } else if (mask.type === 'layers') {
        const need = frame[0] * frame[1];
        const bad = mask.layers.find((l) => l.data.length !== need);
        if (bad) {
            reject(
                `mask layer for class ${bad.classId} has ${bad.data.length} values but the ${fmt(frame)} frame needs ${need}; the mask is not drawn.${MASK_HINT}`,
            );
        } else if (mask.layers.length > 0) {
            maskLayers = mask.layers;
            maskShape = frame;
        }
    } else {
        const type = (mask as { type?: unknown }).type;
        reject(
            type === 'url'
                ? 'a mask PNG is a picture, not a mask: pass it in `imageLayers`. The mask is not drawn.'
                : `unknown \`mask.type\` ${JSON.stringify(type)}; the mask is not drawn.`,
        );
    }

    return { frame, imageGrid, labelGrid, maskLayers, maskShape, warnings };
}

/** Inputs to {@link useImageSources}. A subset of `ImageOverlayBaseProps`. */
export type UseImageSourcesOptions = {
    image: ImageInput;
    mask?: MaskInput;
    onClassVisibilityChange?: (classId: number, visible: boolean) => void;
};

/** Result of {@link useImageSources}. */
export type ImageSources = Omit<ResolvedInputs, 'warnings'> & {
    /** One message per rejected input (see {@link resolveInputs}). */
    shapeWarnings: string[];
    /** Classes with every field filled in, including current visibility. */
    resolvedClasses: ResolvedMaskClass[];
    /** Toggles a class, tracking it internally unless visibility is controlled. */
    toggleClass: (classId: number, visible: boolean) => void;
    /** The class mask as RGBA, or `null` without a mask array that fits. */
    maskBuffer: RgbaBuffer | null;
    /** Opacity of the whole mask, 0–1: `mask.opacity`, default 0.5. */
    maskOpacity: number;
};

/** `value` as of the render in which `keys` last changed, so an inline object literal keeps its identity. */
function useKeyed<T>(value: T, keys: readonly unknown[]): T {
    const ref = useRef({ value, keys });
    const changed =
        keys.length !== ref.current.keys.length ||
        keys.some((k, i) => !Object.is(k, ref.current.keys[i]));
    if (changed) ref.current = { value, keys };
    return ref.current.value;
}

/**
 * Everything an overlay renderer needs from the raw inputs, independent of how it
 * draws: the validated grids, resolved classes, and the class-mask raster. Shared by
 * the renderer and by applications that need the same picking outside it.
 *
 * `image` and `mask` are compared by their fields, so inline object literals are fine; the
 * arrays inside them should be stable. The base image is never colour-mapped here; the source
 * arrays are only ever read.
 */
export function useImageSources({
    image,
    mask,
    onClassVisibilityChange,
}: UseImageSourcesOptions): ImageSources {
    const imageIn = useKeyed(image, [
        image?.type,
        image?.type === 'array' ? image.data : undefined,
        image?.type === 'url' ? image.url : undefined,
        image?.shape?.[0],
        image?.shape?.[1],
    ]);
    const maskIn = useKeyed(mask, [
        mask?.type,
        mask?.type === 'labels' ? mask.data : undefined,
        mask?.type === 'layers' ? mask.layers : undefined,
    ]);
    const {
        frame,
        imageGrid,
        labelGrid,
        maskLayers,
        maskShape,
        warnings: shapeWarnings,
    } = useMemo(() => resolveInputs(imageIn, maskIn), [imageIn, maskIn]);

    // --- classes -------------------------------------------------------------

    const classes = useStableClasses(mask?.classes);
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

    const toggleClass = useCallback(
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

    // --- class mask raster -------------------------------------------------

    const maskBuffer = useMaskRaster({
        labels: labelGrid?.data,
        maskLayers,
        shape: maskShape,
        classes: resolvedClasses,
    });

    return {
        frame,
        imageGrid,
        labelGrid,
        maskLayers,
        maskShape,
        shapeWarnings,
        resolvedClasses,
        toggleClass,
        maskBuffer,
        maskOpacity: Math.max(0, Math.min(1, mask?.opacity ?? 0.5)),
    };
}

/** What {@link pickPixel} reads. */
export type PickSources = Pick<
    ImageSources,
    'imageGrid' | 'labelGrid' | 'maskShape' | 'resolvedClasses'
> & {
    maskLayers?: MaskLayer[];
    /** `[height, width]` of the coordinate space. */
    imageSize: [number, number] | null;
};

/**
 * What lies under continuous detector coordinate `(fx, fy)`: the pixel whose centre is
 * nearest (pixel `i` covers `[i - 0.5, i + 0.5)`, centres at integers, as in PlotlyHeatmap),
 * the visible class there, and the raw base-image value. Returns `null` outside the frame.
 */
export function pickPixel(fx: number, fy: number, sources: PickSources): PixelPickInfo | null {
    const { imageSize, labelGrid, maskLayers, maskShape, resolvedClasses, imageGrid } = sources;
    if (!imageSize) return null;
    const x = Math.floor(fx + 0.5);
    const y = Math.floor(fy + 0.5);
    const [ih, iw] = imageSize;
    if (!(x >= 0 && y >= 0 && x < iw && y < ih)) return null;

    // A mask is read only when it is the frame itself; one that is not is never resampled.
    const maskFits = !!maskShape && maskShape[0] === ih && maskShape[1] === iw;
    const i = y * iw + x;
    let classId: number | null = null;
    if (labelGrid && maskFits) {
        const raw = labelGrid.data[i];
        classId = raw === 0 ? null : raw;
    } else if (maskLayers && maskFits) {
        // Later layers render on top, so the last visible hit wins; a hidden class is not
        // drawn, so whatever is visible beneath it is what the pointer is over.
        const visible = new Set(resolvedClasses.filter((c) => c.visible).map((c) => c.id));
        for (const layer of maskLayers) {
            if (visible.has(layer.classId) && layer.data[i]) classId = layer.classId;
        }
    }

    const cls = resolvedClasses.find((c) => c.id === classId && c.visible);
    const info: PixelPickInfo = { x, y, classId: cls ? classId : null, label: cls?.label };
    // The raw value of the base image, not its colour-mapped display value.
    if (imageGrid) info.value = imageGrid.data[y * imageGrid.shape[1] + x];
    return info;
}

/** CSS pixels per image pixel along x and y, as laid out on screen. */
export type ScreenScale = { x: number; y: number };

/** Screen radius of a marker in CSS pixels, as Plotly uses for hover: at least 3. */
const markerRadius = (size: number) => Math.max(3, size / 2);

/**
 * Screen distance, in CSS pixels, from `(fx, fy)` to the edge of a marker at `(px, py)`:
 * the centre distance minus the marker radius, never below 0.
 */
export function pointScreenDistance(
    px: number,
    py: number,
    size: number,
    fx: number,
    fy: number,
    scale: ScreenScale,
): number {
    const d = Math.hypot((px - fx) * scale.x, (py - fy) * scale.y);
    return Math.max(0, d - markerRadius(size));
}

/**
 * The nearest visible, hoverable point within `tolerance` CSS pixels of image coordinate
 * `(fx, fy)`, measured on screen so it behaves the same at every zoom. Ties go to the later
 * layer, which is drawn on top. One pass over the flat point arrays.
 */
export function nearestPoint(
    layers: readonly ResolvedPointLayer[],
    fx: number,
    fy: number,
    scale: ScreenScale,
    tolerance: number,
): PointPickInfo | null {
    let best: PointPickInfo | null = null;
    let bestDistance = Infinity;
    for (const l of layers) {
        if (!l.visible || !l.hoverable) continue;
        const { xy } = l;
        for (let i = 0; i < l.count; i += 1) {
            const px = xy[2 * i];
            const py = xy[2 * i + 1];
            const d = pointScreenDistance(px, py, l.size, fx, fy, scale);
            if (d <= tolerance && d <= bestDistance) {
                bestDistance = d;
                best = { layerId: l.id, label: l.label, index: i, x: px, y: py };
            }
        }
    }
    return best;
}

/**
 * Resolves point layers with defaults and tracked visibility. Visibility is
 * controlled when any layer sets `visible`; otherwise legend toggles are tracked
 * internally, as for mask classes.
 */
export function useResolvedPointLayers(
    pointLayers: PointLayer[] | undefined,
    onPointLayerVisibilityChange?: (layerId: string, visible: boolean) => void,
): { layers: ResolvedPointLayer[]; toggleLayer: (layerId: string, visible: boolean) => void } {
    const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set());
    const controlled = (pointLayers ?? []).some((l) => l.visible !== undefined);

    // Flattening is memoized per `points` identity, so restyling a layer never re-copies its points.
    const flatCache = useRef(new WeakMap<object, ArrayLike<number>>());
    const layers = useMemo<ResolvedPointLayer[]>(
        () =>
            (pointLayers ?? []).map((l) => {
                const key = l.points as unknown as object;
                let xy = flatCache.current.get(key);
                if (!xy) {
                    xy = flattenPoints(l.points);
                    flatCache.current.set(key, xy);
                }
                return {
                    id: l.id,
                    label: l.label,
                    xy,
                    count: Math.floor(xy.length / 2),
                    color: l.color ?? '#ffffff',
                    symbol: l.symbol ?? 'x',
                    size: l.size ?? 5,
                    strokeWidth: l.strokeWidth ?? 1,
                    visible: controlled ? (l.visible ?? true) : !hidden.has(l.id),
                    hoverable: l.hoverable ?? true,
                };
            }),
        [pointLayers, controlled, hidden],
    );

    const toggleLayer = useCallback(
        (layerId: string, visible: boolean) => {
            if (!controlled) {
                setHidden((prev) => {
                    const next = new Set(prev);
                    if (visible) next.delete(layerId);
                    else next.add(layerId);
                    return next;
                });
            }
            onPointLayerVisibilityChange?.(layerId, visible);
        },
        [controlled, onPointLayerVisibilityChange],
    );

    return { layers, toggleLayer };
}
