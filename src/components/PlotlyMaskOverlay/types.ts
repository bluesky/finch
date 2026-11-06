/**
 * Types of {@link PlotlyMaskOverlay} and its helpers. Coordinates are detector pixels:
 * pixel (row `i`, column `j`) is centred at `(x = j, y = i)`, y pointing down.
 */

import type {
    EllipseGeometry,
    MarkerSymbol,
    Point,
    PolygonGeometry,
    RectGeometry,
} from '@/utils/annotationGeometry';

/** A 2D grid accepted either flat (with a shape) or as nested rows. */
export type GridInput = ArrayLike<number> | number[][];

/** Which URL a load report is about: the base `'image'`, or an `ImageLayer.id`. */
export type OverlayLayerId = 'image' | (string & {});
/** Progress of one URL, as reported by `onLoadStateChange`. */
export type OverlayLoadState =
    | { status: 'loading' }
    /** Decoded. The natural size is the PNG's own, which may be smaller than the frame. */
    | { status: 'loaded'; naturalWidth: number; naturalHeight: number }
    | { status: 'error'; message: string };

/** A segmentation class: which label value it corresponds to, and how it should be drawn. */
export type MaskClass = {
    /** Integer value in `labels` (or `MaskLayer.classId`) that this class represents. `0` is background by convention. */
    id: number;
    /** Name shown in the legend and the hover tooltip. Defaults to `Class {id}`. */
    label?: string;
    /** Hex color. Defaults to an entry from `CLASS_PALETTE` chosen by position. */
    color?: string;
    /**
     * Whether the class is drawn. Defaults to `true`. A legend click calls
     * `onClassVisibilityChange`; pass the new value back here to hide or show the class.
     */
    visible?: boolean;
    /** Per-class opacity, 0–1, multiplied by the mask's `opacity`. Defaults to `1`. */
    opacity?: number;
};

/** A single-class binary mask, as an alternative to a combined label array. */
export type MaskLayer = {
    /** The class this mask belongs to; matched against `MaskClass.id`. */
    classId: number;
    /** Flat row-major array with the image's `height × width` values. Any non-zero entry is set. */
    data: ArrayLike<number>;
};

/** A {@link MaskClass} with every optional field filled in. Produced internally before rasterizing. */
export type ResolvedMaskClass = Required<Omit<MaskClass, 'label'>> & { label: string };

// ---------------------------------------------------------------------------
// Image layers, annotations and drawing
// ---------------------------------------------------------------------------

/**
 * A picture rendered by the application, such as a backend mask PNG or calibrant rings,
 * stretched onto the image frame and drawn above the base image.
 */
export type ImageLayer = {
    /** Stable key, reported by `onLoadStateChange` and named when the layer fails to load. */
    id: string;
    /** The picture: an object or data URL, or an `http(s)` URL loaded without credentials. */
    url: string;
    /** 0–1. Multiplies the PNG's own alpha. Defaults to `1`. */
    opacity?: number;
    /** Defaults to `true`. A hidden layer stays loaded. */
    visible?: boolean;
};

/** Stroke and fill of a vector annotation. Stroke widths are CSS pixels and do not scale with zoom. */
export type AnnotationStyle = {
    /** Outline colour, any CSS colour. Defaults to white. */
    stroke?: string;
    /** Outline width in CSS pixels. Defaults to `1.5`. */
    strokeWidth?: number;
    /** Fill colour as a hex string (`#rgb` or `#rrggbb`). No fill by default. */
    fill?: string;
    /** Fill opacity, 0–1. Defaults to `0.25`. */
    fillOpacity?: number;
    /** Dash pattern in CSS pixels, for example `[4, 3]`. Solid by default. */
    dash?: number[];
};
type AnnotationBase = AnnotationStyle & {
    /** Your own identifier. The component does not read it; callbacks hand it back with the annotation. */
    id?: string | number;
    /** Text shown on the shape. */
    title?: string;
    /** Whether the annotation is drawn. Defaults to `true`. */
    visible?: boolean;
    /**
     * Whether the user may move, resize and erase this shape, overriding
     * `editableAnnotations`. Use `false` for fixed overlays such as a beam centre.
     */
    editable?: boolean;
};
/** An open polyline through `points`, in image pixel coordinates. */
export type LineGeometry = { type: 'line'; points: readonly Point[] };
/** A vector shape in continuous image pixels, drawn above every raster. */
export type Annotation = AnnotationBase &
    (RectGeometry | EllipseGeometry | PolygonGeometry | LineGeometry);

/** Interactive drawing tools. `lasso` is a freehand drag closed on release. */
export type DrawTool = 'rect' | 'ellipse' | 'lasso';
/** What dragging on the image does: zoom into a box, pan, or draw a shape. */
export type DragMode = 'zoom' | 'pan' | DrawTool;
/** Geometry emitted by a completed draw, in continuous image pixels (boxes normalised). */
export type DrawEvent = RectGeometry | EllipseGeometry | PolygonGeometry;

// ---------------------------------------------------------------------------
// Point layers
// ---------------------------------------------------------------------------

/**
 * A read-only set of points drawn as one batched layer, for example fitted control
 * points, detected peaks or a beam centre. Tens of thousands stay cheap to draw and hover.
 */
export type PointLayer = {
    /** Stable key, reported in `OverlayPickInfo.point` and used for legend visibility. */
    id: string;
    /** Legend and tooltip text. Layers without a label are left out of the legend. */
    label?: string;
    /**
     * Points in continuous image pixels: a flat `[x0, y0, x1, y1, …]` array (a typed
     * array is fine) or `[x, y]` pairs. Compared by identity, so memoize it. Finding the point
     * under the pointer is linear in the number of points: up to about 200,000 points across all
     * layers stays under 5 ms per frame.
     */
    points: ArrayLike<number> | readonly Point[];
    /** Stroke color. Defaults to white. */
    color?: string;
    /** Marker shape. Defaults to `'x'`. */
    symbol?: MarkerSymbol;
    /** Marker size in CSS pixels. Does not scale with zoom. Defaults to `5`. */
    size?: number;
    /** Stroke width in CSS pixels. Defaults to `1`. */
    strokeWidth?: number;
    /**
     * Whether the layer is drawn. Defaults to `true`. A legend click calls
     * `onPointLayerVisibilityChange`; pass the new value back here to hide or show the layer.
     */
    visible?: boolean;
    /** Whether hover and click report this layer's points. Defaults to `true`. */
    hoverable?: boolean;
};

/** A point of a {@link PointLayer}, as reported in `OverlayPickInfo.point`. */
export type PointPickInfo = {
    /** The `id` of the point's layer. */
    layerId: string;
    /** The `label` of the point's layer. */
    label?: string;
    /** Index of the point within its layer. */
    index: number;
    /** The point's own x in continuous image pixels. */
    x: number;
    /** The point's own y in continuous image pixels. */
    y: number;
};

/** A {@link PointLayer} with its points flattened and every optional field filled in. */
export type ResolvedPointLayer = Required<Omit<PointLayer, 'label' | 'points'>> & {
    label?: string;
    /** Flat `[x0, y0, x1, y1, …]`. */
    xy: ArrayLike<number>;
    count: number;
};

/** The detector pixel under the pointer, as {@link pickPixel} reads it from the image and mask. */
export type PixelPickInfo = {
    /** Column of the detector pixel under the pointer (the nearest pixel centre). */
    x: number;
    /** Row of the detector pixel under the pointer. */
    y: number;
    /** Visible mask class at this pixel, or `null` over background or without a mask. */
    classId: number | null;
    /** Label of that class. */
    label?: string;
    /** The raw value at this pixel, never a display value: from an array image, or `resolveValue`. */
    value?: number;
};

/** Everything under the pointer, reported by `onHover` and `onClick`. Fields are independent. */
export type OverlayPickInfo = PixelPickInfo & {
    /** The nearest hoverable point within a few CSS pixels, if any. */
    point?: PointPickInfo;
    /** The topmost visible annotation at the pointer, if any. */
    annotation?: { annotation: Annotation; index: number };
};

// ---------------------------------------------------------------------------
// Image and mask inputs
// ---------------------------------------------------------------------------

/**
 * Raw detector values, drawn as a heatmap with the real value on hover. Meant for small
 * frames; above one megapixel use `{ type: 'url' }`. Arrays are never resized or resampled.
 */
export type ImageArrayInput = {
    type: 'array';
    /** Colormap of the heatmap. Defaults to `'gray'`. */
    colormap?: string;
    /**
     * Color range `[min, max]` in native units, for example from `HistogramRange`, so a value keeps
     * its color across frames. Defaults to the data extent of each frame.
     */
    domain?: [number, number];
    /** Color on a log10 scale. Pass native values; values ≤ 0 are left blank. Defaults to `false`. */
    logScale?: boolean;
    /** Show a colorbar beside the heatmap. Defaults to `false`. */
    showColorbar?: boolean;
} & (
    | {
          /** Flat row-major values. */
          data: ArrayLike<number>;
          /** `[height, width]` of the flat array. */
          shape: [number, number];
      }
    | {
          /** Nested rows of equal length. The shape is theirs, so `shape` is not allowed. */
          data: number[][];
          shape?: never;
      }
);

/** A display PNG rendered by the application's backend, shown as-is and scaled onto the frame. */
export type ImageUrlInput = {
    type: 'url';
    /** The picture: an object or data URL, or an `http(s)` URL loaded without credentials. Pixels stay sharp when zoomed in. */
    url: string;
    /** `[height, width]` of the detector frame. A smaller PNG is stretched onto it, so coordinates stay in detector pixels. */
    shape: [number, number];
    /**
     * Looks up the raw value at pixel `(x, y)`, for example from Tiled, since a PNG holds only
     * display colors. May be async: hover reports the pixel first and again with its value.
     */
    resolveValue?: (x: number, y: number) => number | undefined | Promise<number | undefined>;
};

/** The base image: raw values or a backend-rendered PNG. It sets the frame everything else uses. */
export type ImageInput = ImageArrayInput | ImageUrlInput;

type StructuredMask = {
    /**
     * Name, color, visibility and opacity of each class. Defaults to the ids found in the mask.
     * Compared by content, so an inline list is fine.
     */
    classes?: MaskClass[];
    /** Opacity of the whole mask, 0–1, multiplied by each class's `opacity`. Defaults to `0.5`. */
    opacity?: number;
};
/** One class id per pixel, `0` background. Flat or nested rows, the image's exact size. */
export type LabelMaskInput = StructuredMask & { type: 'labels'; data: GridInput };
/** One binary mask per class, each the image's `height × width`. Classes may overlap; later layers draw on top. */
export type LayerMaskInput = StructuredMask & { type: 'layers'; layers: MaskLayer[] };

/**
 * A mask Finch draws and understands: classes, legend, and the class under the pointer.
 * Arrays must match the image pixel for pixel and are never resampled. A mask the backend
 * has already rendered as a PNG is a picture, so it goes in `imageLayers` instead.
 */
export type MaskInput = LabelMaskInput | LayerMaskInput;

/** Visible axis ranges in detector pixels, `[from, to]` as Plotly reports them (y reversed). */
export type OverlayViewport = { x: [number, number]; y: [number, number] };
