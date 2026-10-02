/**
 * Color parsing, colormap sampling and categorical palettes.
 *
 * `ColormapDef.stops` in `components/ColormapPicker/colormaps.ts` is a CSS gradient
 * string, which is all a swatch needs but not enough to color a pixel. The lookup
 * tables here are built by parsing those same strings, so a rendered image and the
 * swatch in the picker can never drift apart.
 */

import { COLORMAPS, type ColormapDef } from '@/components/ColormapPicker/colormaps';

/** Number of entries in a colormap lookup table. */
const LUT_SIZE = 256;

/** Fallback when a hex string cannot be parsed. Magenta, so mistakes are visible rather than silent. */
const FALLBACK_RGB: [number, number, number] = [255, 0, 255];

/** Hex form of {@link FALLBACK_RGB}, used when a palette is empty. */
const FALLBACK_HEX = '#ff00ff';

/**
 * Parses a hex color into `[r, g, b]` components in the range 0–255.
 *
 * Accepts `#rgb`, `#rrggbb`, and the same without the leading `#`. Returns
 * magenta for anything unparseable rather than throwing, so a bad color in a
 * class list degrades to a visible wrong color instead of a blank canvas.
 */
export function hexToRgb(hex: string): [number, number, number] {
    const raw = hex.trim().replace(/^#/, '');
    if (raw.length === 3) {
        const r = Number.parseInt(raw[0] + raw[0], 16);
        const g = Number.parseInt(raw[1] + raw[1], 16);
        const b = Number.parseInt(raw[2] + raw[2], 16);
        if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return FALLBACK_RGB;
        return [r, g, b];
    }
    if (raw.length === 6) {
        const r = Number.parseInt(raw.slice(0, 2), 16);
        const g = Number.parseInt(raw.slice(2, 4), 16);
        const b = Number.parseInt(raw.slice(4, 6), 16);
        if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return FALLBACK_RGB;
        return [r, g, b];
    }
    return FALLBACK_RGB;
}

/** Converts a hex color to an `rgba()` string with the given alpha (0–1). */
export function withAlpha(hex: string, alpha: number): string {
    const [r, g, b] = hexToRgb(hex);
    const a = Math.max(0, Math.min(1, alpha));
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Splits a `ColormapDef.stops` string into its hex colors.
 *
 * Stops may carry CSS position tokens (`'#1f77b4 10%,#ff7f0e 10% 20%'`, as `tab10`
 * does); positions are discarded and the colors are spaced evenly. That is a
 * deliberate simplification — hard-stop categorical maps are handled by
 * `CLASS_PALETTE`, not by sampling a gradient.
 */
function parseStops(stops: string): [number, number, number][] {
    const colors = stops
        .split(',')
        .map((part) => part.trim().split(/\s+/)[0])
        .filter((token) => token.length > 0)
        .map(hexToRgb);
    return colors.length > 0 ? colors : [FALLBACK_RGB];
}

/**
 * LUT cache, keyed first on the colormap list (by identity) and then on the id.
 * Keying on the list means a caller passing its own list that reuses an id such
 * as `'gray'` gets its own LUT and cannot poison the default one. A `WeakMap`
 * lets a discarded custom list be garbage-collected along with its LUTs.
 */
const lutCache = new WeakMap<ColormapDef[], Map<string, Uint8ClampedArray>>();

/**
 * Builds a 256-entry RGB lookup table for a colormap, as a flat `Uint8ClampedArray`
 * of length 768 (`[r0, g0, b0, r1, g1, b1, ...]`).
 *
 * `colormap` is an id from `colormaps` (e.g. `'viridis'`, `'gray'`). Unknown ids
 * fall back to black-to-white. Results are cached per `colormaps` list, so pass a
 * stable (module-level) list to benefit from the cache.
 */
export function colormapLut(
    colormap: string,
    colormaps: ColormapDef[] = COLORMAPS,
): Uint8ClampedArray {
    let listCache = lutCache.get(colormaps);
    if (!listCache) {
        listCache = new Map();
        lutCache.set(colormaps, listCache);
    }
    const cached = listCache.get(colormap);
    if (cached) return cached;

    const def =
        colormaps.find((c) => c.id === colormap) ??
        colormaps.find((c) => c.id.toLowerCase() === colormap.toLowerCase());
    const controlPoints = def ? parseStops(def.stops) : parseStops('#000000,#ffffff');

    const lut = new Uint8ClampedArray(LUT_SIZE * 3);
    const segments = controlPoints.length - 1;
    for (let i = 0; i < LUT_SIZE; i += 1) {
        const t = i / (LUT_SIZE - 1);
        if (segments <= 0) {
            lut[i * 3] = controlPoints[0][0];
            lut[i * 3 + 1] = controlPoints[0][1];
            lut[i * 3 + 2] = controlPoints[0][2];
            continue;
        }
        const scaled = t * segments;
        const lower = Math.min(segments - 1, Math.floor(scaled));
        const frac = scaled - lower;
        const a = controlPoints[lower];
        const b = controlPoints[lower + 1];
        lut[i * 3] = a[0] + (b[0] - a[0]) * frac;
        lut[i * 3 + 1] = a[1] + (b[1] - a[1]) * frac;
        lut[i * 3 + 2] = a[2] + (b[2] - a[2]) * frac;
    }

    listCache.set(colormap, lut);
    return lut;
}

/** Samples a colormap at `t` (0–1), returning `[r, g, b]` in the range 0–255. */
export function sampleColormap(colormap: string, t: number): [number, number, number] {
    const lut = colormapLut(colormap);
    const clamped = Math.max(0, Math.min(1, Number.isFinite(t) ? t : 0));
    const idx = Math.round(clamped * (LUT_SIZE - 1)) * 3;
    return [lut[idx], lut[idx + 1], lut[idx + 2]];
}

/**
 * Default categorical palette for mask classes — matplotlib's `tab20`.
 *
 * Twenty visually distinct colors, alternating a saturated and a light variant of
 * each hue, so adjacent class ids stay distinguishable.
 */
export const CLASS_PALETTE: string[] = [
    '#1f77b4',
    '#aec7e8',
    '#ff7f0e',
    '#ffbb78',
    '#2ca02c',
    '#98df8a',
    '#d62728',
    '#ff9896',
    '#9467bd',
    '#c5b0d5',
    '#8c564b',
    '#c49c94',
    '#e377c2',
    '#f7b6d2',
    '#7f7f7f',
    '#c7c7c7',
    '#bcbd22',
    '#dbdb8d',
    '#17becf',
    '#9edae5',
];

/**
 * Colorblind-safe categorical palette — the Okabe–Ito eight followed by Paul Tol's
 * muted set.
 *
 * Okabe–Ito's black is replaced with a mid grey so a class stays visible when drawn
 * over a dark image.
 */
export const CLASS_PALETTE_COLORBLIND: string[] = [
    '#e69f00',
    '#56b4e9',
    '#009e73',
    '#f0e442',
    '#0072b2',
    '#d55e00',
    '#cc79a7',
    '#999999',
    '#332288',
    '#88ccee',
    '#44aa99',
    '#aa4499',
];

/**
 * Picks the first palette color not already in `usedColors`.
 *
 * When every color is taken, cycles back through the palette using `fallbackIndex`
 * so repeated calls keep producing different colors instead of all collapsing onto
 * the same one.
 */
export function pickNextColor(
    usedColors: Iterable<string>,
    fallbackIndex: number,
    palette: string[] = CLASS_PALETTE,
): string {
    if (palette.length === 0) return FALLBACK_HEX;
    const used = new Set<string>();
    for (const c of usedColors) used.add(c.toLowerCase());
    const available = palette.find((c) => !used.has(c.toLowerCase()));
    return available ?? palette[Math.abs(fallbackIndex) % palette.length];
}
