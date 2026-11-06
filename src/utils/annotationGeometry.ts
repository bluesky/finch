/**
 * DOM-free helpers for vector annotations drawn over images. Coordinates are continuous
 * detector pixels, y down: pixel (row `i`, column `j`) is centred at `(x = j, y = i)`, as in
 * PlotlyHeatmap, so a backend array index is a point at that integer.
 */
/** A point in continuous detector pixels: `[x, y]`, y down, pixel centres at integers. */
export type Point = readonly [number, number];
/** Axis-aligned rectangle given by two opposite corners. */
export type RectGeometry = { type: 'rect'; x0: number; y0: number; x1: number; y1: number };
/** Axis-aligned ellipse given by its bounding box. */
export type EllipseGeometry = { type: 'ellipse'; x0: number; y0: number; x1: number; y1: number };
/** Filled polygon through `points`, closed back to the first point. */
export type PolygonGeometry = { type: 'polygon'; points: readonly Point[] };

/** Orders a box's corners so `x0 <= x1` and `y0 <= y1`. */
export function normalizeBox<T extends { x0: number; y0: number; x1: number; y1: number }>(
    box: T,
): T {
    return {
        ...box,
        x0: Math.min(box.x0, box.x1),
        x1: Math.max(box.x0, box.x1),
        y0: Math.min(box.y0, box.y1),
        y1: Math.max(box.y0, box.y1),
    };
}

/** SVG path data for a polyline, or a polygon when `close` is set. */
export function pointsToPath(points: readonly Point[], close: boolean): string {
    if (points.length === 0) return '';
    return `M${points.map(([x, y]) => `${x},${y}`).join('L')}${close ? 'Z' : ''}`;
}

/** Marker shapes a point layer can use. */
export type MarkerSymbol = 'x' | 'cross' | 'circle' | 'square';

/**
 * Flattens `[x, y]` pairs to `[x0, y0, x1, y1, …]`. Flat input, including typed
 * arrays, is returned as is without copying.
 */
export function flattenPoints(points: ArrayLike<number> | readonly Point[]): ArrayLike<number> {
    const first = (points as readonly Point[])[0];
    if (!Array.isArray(first)) return points as ArrayLike<number>;
    const pairs = points as readonly Point[];
    const out = new Float64Array(pairs.length * 2);
    for (let i = 0; i < pairs.length; i += 1) {
        out[i * 2] = pairs[i][0];
        out[i * 2 + 1] = pairs[i][1];
    }
    return out;
}

/** Even-odd point-in-polygon test. */
function insideRing(ring: readonly Point[], x: number, y: number): boolean {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
        const [xi, yi] = ring[i];
        const [xj, yj] = ring[j];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
}

/** Distance from `(x, y)` to the segment `a`–`b`. */
function segmentDistance(a: Point, b: Point, x: number, y: number): number {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / len2));
    return Math.hypot(x - (a[0] + t * dx), y - (a[1] + t * dy));
}

/** Any shape {@link hitTestGeometry} understands. */
export type HitTestGeometry =
    | RectGeometry
    | EllipseGeometry
    | PolygonGeometry
    | { type: 'line'; points: readonly Point[] };

/**
 * Whether image coordinate `(x, y)` hits a geometry. Filled shapes hit inside their
 * area (polygons by even-odd); lines hit within `tolerance` image pixels
 * of a segment.
 */
export function hitTestGeometry(
    g: HitTestGeometry,
    x: number,
    y: number,
    tolerance: number,
): boolean {
    switch (g.type) {
        case 'rect': {
            const b = normalizeBox(g);
            return (
                x >= b.x0 - tolerance &&
                x <= b.x1 + tolerance &&
                y >= b.y0 - tolerance &&
                y <= b.y1 + tolerance
            );
        }
        case 'ellipse': {
            const b = normalizeBox(g);
            const rx = (b.x1 - b.x0) / 2 + tolerance;
            const ry = (b.y1 - b.y0) / 2 + tolerance;
            if (rx <= 0 || ry <= 0) return false;
            const nx = (x - (b.x0 + b.x1) / 2) / rx;
            const ny = (y - (b.y0 + b.y1) / 2) / ry;
            return nx * nx + ny * ny <= 1;
        }
        case 'polygon':
            return insideRing(g.points, x, y);
        case 'line':
            for (let i = 1; i < g.points.length; i += 1) {
                if (segmentDistance(g.points[i - 1], g.points[i], x, y) <= tolerance) return true;
            }
            return false;
        default:
            return false;
    }
}
