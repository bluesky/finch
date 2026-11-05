/**
 * Conversion between Finch's image-pixel geometry and Plotly's shape and trace
 * dictionaries. DOM-free, so it can run anywhere, including on a backend contract
 * test. Coordinates pass through unchanged: both sides use continuous image pixels
 * with y down when the Plotly y axis is reversed.
 */

import { flattenPoints, pointsToPath, type MarkerSymbol, type Point } from './annotationGeometry';
import { withAlpha } from './colorUtils';
import type {
    Annotation,
    AnnotationStyle,
    DrawEvent,
    LineGeometry,
    PointLayer,
} from '@/components/PlotlyMaskOverlay/types';

/** The subset of a Plotly layout shape this module reads and writes. Other keys pass through. */
export type PlotlyShapeDict = {
    type?: 'rect' | 'circle' | 'path' | 'line' | string;
    x0?: number;
    y0?: number;
    x1?: number;
    y1?: number;
    path?: string;
    xref?: string;
    yref?: string;
    name?: string;
    editable?: boolean;
    opacity?: number;
    fillcolor?: string;
    line?: { color?: string; width?: number; dash?: string };
    [key: string]: unknown;
};

/** Plotly dash string from a Finch dash array, for example `[4, 3]` → `'4px,3px'`. */
function plotlyDash(dash: number[] | undefined): string | undefined {
    if (!dash || dash.length === 0) return undefined;
    return dash.map((d) => `${d}px`).join(',');
}

/** Shape styling in Plotly form: stroke, width, dash, and fill with its opacity (default 0.25). */
export function plotlyStyle(style: AnnotationStyle | undefined): Partial<PlotlyShapeDict> {
    const out: Partial<PlotlyShapeDict> = {
        line: {
            color: style?.stroke ?? '#ffffff',
            width: style?.strokeWidth ?? 1.5,
            ...(plotlyDash(style?.dash) && { dash: plotlyDash(style?.dash) }),
        },
    };
    if (style?.fill) out.fillcolor = withAlpha(style.fill, style.fillOpacity ?? 0.25);
    return out;
}

/**
 * A Plotly layout shape for a Finch geometry or annotation. Rectangles map to
 * `rect`, ellipses to `circle` (Plotly's bounding-box ellipse), polygons to a closed
 * `path` with holes as extra subpaths, two-point lines to `line` and longer lines to
 * an open `path`. Returns `null` for anything else.
 */
export function geometryToPlotlyShape(
    g: DrawEvent | Annotation,
    style?: AnnotationStyle,
): PlotlyShapeDict | null {
    const base: PlotlyShapeDict = {
        xref: 'x',
        yref: 'y',
        ...plotlyStyle(style ?? (g as AnnotationStyle)),
    };
    switch (g.type) {
        case 'rect':
            return { ...base, type: 'rect', x0: g.x0, y0: g.y0, x1: g.x1, y1: g.y1 };
        case 'ellipse':
            return { ...base, type: 'circle', x0: g.x0, y0: g.y0, x1: g.x1, y1: g.y1 };
        case 'polygon':
            // `fillrule` marks a closed, filled path (holes cut by even-odd), as Plotly's own
            // `drawclosedpath` emits it; backends that rasterise paths may rely on it.
            return {
                ...base,
                type: 'path',
                path: pointsToPath(g.points, true, g.holes ?? []),
                fillrule: 'evenodd',
            };
        case 'line': {
            if (g.points.length === 2) {
                const [[x0, y0], [x1, y1]] = g.points;
                return { ...base, type: 'line', x0, y0, x1, y1 };
            }
            return { ...base, type: 'path', path: pointsToPath(g.points, false) };
        }
        default:
            return null;
    }
}

const NUMBER = /-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;

/**
 * Parses an SVG path made of `M`, `L`, `H`, `V` and `Z` commands (absolute or
 * relative) into rings. Curves are not supported and make the whole path invalid.
 */
export function parsePlotlyPath(path: string): { rings: Point[][]; closed: boolean[] } | null {
    const rings: Point[][] = [];
    const closed: boolean[] = [];
    let ring: Point[] | null = null;
    let cx = 0;
    let cy = 0;
    let startX = 0;
    let startY = 0;
    // Only SVG path command letters start a command, so an exponent such as `1e3` stays a number.
    const commands = path.match(/[MLHVZCSQTA][^MLHVZCSQTA]*/gi);
    if (!commands) return null;
    for (const chunk of commands) {
        const cmd = chunk[0];
        const nums = (chunk.slice(1).match(NUMBER) ?? []).map(Number);
        const rel = cmd === cmd.toLowerCase();
        switch (cmd.toUpperCase()) {
            case 'M': {
                for (let i = 0; i + 1 < nums.length; i += 2) {
                    cx = rel ? cx + nums[i] : nums[i];
                    cy = rel ? cy + nums[i + 1] : nums[i + 1];
                    if (i === 0) {
                        ring = [[cx, cy]];
                        rings.push(ring);
                        closed.push(false);
                        startX = cx;
                        startY = cy;
                    } else {
                        ring!.push([cx, cy]);
                    }
                }
                break;
            }
            case 'L':
                if (!ring) return null;
                for (let i = 0; i + 1 < nums.length; i += 2) {
                    cx = rel ? cx + nums[i] : nums[i];
                    cy = rel ? cy + nums[i + 1] : nums[i + 1];
                    ring.push([cx, cy]);
                }
                break;
            case 'H':
                if (!ring) return null;
                for (const n of nums) {
                    cx = rel ? cx + n : n;
                    ring.push([cx, cy]);
                }
                break;
            case 'V':
                if (!ring) return null;
                for (const n of nums) {
                    cy = rel ? cy + n : n;
                    ring.push([cx, cy]);
                }
                break;
            case 'Z':
                if (!ring) return null;
                closed[closed.length - 1] = true;
                cx = startX;
                cy = startY;
                break;
            default:
                return null;
        }
    }
    return rings.length ? { rings, closed } : null;
}

/**
 * Finch geometry for a Plotly layout shape, the inverse of
 * {@link geometryToPlotlyShape}. Returns `null` for shapes it cannot represent,
 * such as curved paths.
 */
export function plotlyShapeToGeometry(s: PlotlyShapeDict): DrawEvent | LineGeometry | null {
    const num = (v: unknown) => (typeof v === 'number' ? v : Number(v));
    switch (s.type) {
        case 'rect':
            return { type: 'rect', x0: num(s.x0), y0: num(s.y0), x1: num(s.x1), y1: num(s.y1) };
        case 'circle':
            return { type: 'ellipse', x0: num(s.x0), y0: num(s.y0), x1: num(s.x1), y1: num(s.y1) };
        case 'line':
            return {
                type: 'line',
                points: [
                    [num(s.x0), num(s.y0)],
                    [num(s.x1), num(s.y1)],
                ],
            };
        case 'path': {
            if (typeof s.path !== 'string') return null;
            const parsed = parsePlotlyPath(s.path);
            if (!parsed) return null;
            const [outer, ...holes] = parsed.rings;
            if (!parsed.closed[0]) return { type: 'line', points: outer };
            return holes.length
                ? { type: 'polygon', points: outer, holes }
                : { type: 'polygon', points: outer };
        }
        default:
            return null;
    }
}

/** Plotly marker symbol for each Finch marker. Thin and open symbols take their color from the line. */
export const PLOTLY_MARKER_SYMBOL: Record<MarkerSymbol, string> = {
    x: 'x-thin',
    cross: 'cross-thin',
    circle: 'circle-open',
    square: 'square-open',
};

/** Points above which {@link markersToScatterTrace} switches to WebGL by default. */
export const SCATTER_GL_THRESHOLD = 5000;

/**
 * A Plotly scatter trace for a point layer: markers only, named after the layer so
 * it shows in the legend, with `scattergl` above {@link SCATTER_GL_THRESHOLD} points
 * unless `gl` says otherwise. Coordinates are copied into plain arrays.
 */
export function markersToScatterTrace(
    layer: Pick<
        PointLayer,
        'id' | 'label' | 'points' | 'color' | 'symbol' | 'size' | 'strokeWidth'
    >,
    { gl }: { gl?: boolean } = {},
): Record<string, unknown> {
    const xy = flattenPoints(layer.points);
    const count = Math.floor(xy.length / 2);
    const x = new Array<number>(count);
    const y = new Array<number>(count);
    for (let i = 0; i < count; i += 1) {
        x[i] = xy[i * 2];
        y[i] = xy[i * 2 + 1];
    }
    const color = layer.color ?? '#ffffff';
    return {
        type: (gl ?? count > SCATTER_GL_THRESHOLD) ? 'scattergl' : 'scatter',
        mode: 'markers',
        name: layer.label ?? layer.id,
        x,
        y,
        marker: {
            symbol: PLOTLY_MARKER_SYMBOL[layer.symbol ?? 'x'],
            size: layer.size ?? 5,
            color,
            line: { color, width: layer.strokeWidth ?? 1 },
        },
        hoverinfo: 'name+x+y',
    };
}
