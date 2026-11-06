/**
 * Sample data for the PlotlyMaskOverlay stories.
 *
 * A synthetic fluorescence-microscopy field, 120 x 80 pixels: a few cells with bright nuclei
 * and some small debris on a dim, noisy background. Every mask has the image's dimensions.
 * Pixel (row i, column j) is centred at (x = j, y = i).
 */
import type { RgbaBuffer } from '../utils/maskRaster';
import type { MaskClass } from '../components/PlotlyMaskOverlay/types';

export const W = 120;
export const H = 80;
export const SHAPE: [number, number] = [H, W];

type Cell = {
    x: number;
    y: number;
    rx: number;
    ry: number;
    angle: number;
    nx: number;
    ny: number;
    nr: number;
};

/** Cell bodies (ellipses) with their nuclei (circles inside them). */
export const CELLS: Cell[] = [
    { x: 24, y: 22, rx: 14, ry: 9, angle: 20, nx: 26, ny: 22, nr: 4.5 },
    { x: 58, y: 48, rx: 12, ry: 11, angle: 0, nx: 55, ny: 46, nr: 5 },
    { x: 92, y: 26, rx: 15, ry: 8, angle: -30, nx: 94, ny: 25, nr: 4 },
    { x: 26, y: 60, rx: 10, ry: 8, angle: 60, nx: 27, ny: 61, nr: 3.5 },
    { x: 96, y: 62, rx: 11, ry: 9, angle: 10, nx: 98, ny: 63, nr: 4 },
];

/** Small bright debris particles. */
const DEBRIS: [number, number][] = [
    [70, 12],
    [44, 34],
    [110, 46],
    [8, 40],
    [76, 72],
];

/** 0 outside, 1 at the edge, larger inside: the ellipse's normalised distance turned around. */
function cellDistance(c: Cell, x: number, y: number) {
    const t = (c.angle * Math.PI) / 180;
    const u = (x - c.x) * Math.cos(t) + (y - c.y) * Math.sin(t);
    const v = -(x - c.x) * Math.sin(t) + (y - c.y) * Math.cos(t);
    return (u / c.rx) ** 2 + (v / c.ry) ** 2;
}
const nucleusDistance = (c: Cell, x: number, y: number) =>
    ((x - c.nx) ** 2 + (y - c.ny) ** 2) / c.nr ** 2;
const debrisDistance = (x: number, y: number) =>
    Math.min(...DEBRIS.map(([dx, dy]) => (x - dx) ** 2 + (y - dy) ** 2));

const inCell = (x: number, y: number) => CELLS.some((c) => cellDistance(c, x, y) < 1);
const inNucleus = (x: number, y: number) => CELLS.some((c) => nucleusDistance(c, x, y) < 1);
const inDebris = (x: number, y: number) => debrisDistance(x, y) <= 2.25;

const soft = (d: number) => 1 / (1 + Math.exp(-(1 - d) * 8));

function mapPixels<T extends Float32Array | Uint8Array>(
    out: T,
    fn: (x: number, y: number) => number,
): T {
    for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) out[y * W + x] = fn(x, y);
    return out;
}

/** Fluorescence intensity: dim background, cell bodies, bright nuclei and debris. */
function sampleImage(): Float32Array {
    let seed = 7;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    return mapPixels(new Float32Array(W * H), (x, y) => {
        let v = 30 + 15 * rand();
        for (const c of CELLS) {
            v += 180 * soft(cellDistance(c, x, y));
            v += 420 * soft(nucleusDistance(c, x, y));
        }
        v += 600 * Math.exp(-debrisDistance(x, y) / 1.5);
        return v;
    });
}

export const IMAGE = sampleImage();

/** The image with a dead sensor region (NaN): a block at the top right and a dead column. */
export const IMAGE_WITH_NAN = (() => {
    const out = Float32Array.from(IMAGE);
    for (let y = 0; y < H; y += 1) {
        for (let x = 0; x < W; x += 1) {
            if ((x >= 104 && x < 116 && y >= 2 && y < 12) || x === 76) out[y * W + x] = NaN;
        }
    }
    return out;
})();

/** One label per pixel: 1 cell body, 2 nucleus, 3 debris, 0 background. Labels cannot overlap. */
export const LABELS = mapPixels(new Uint8Array(W * H), (x, y) => {
    if (inDebris(x, y)) return 3;
    if (inNucleus(x, y)) return 2;
    if (inCell(x, y)) return 1;
    return 0;
});

/** One 0/1 mask per class. The cell mask includes the nucleus, so the two overlap. */
export const MASK_LAYERS = [
    { classId: 1, data: mapPixels(new Uint8Array(W * H), (x, y) => (inCell(x, y) ? 1 : 0)) },
    { classId: 2, data: mapPixels(new Uint8Array(W * H), (x, y) => (inNucleus(x, y) ? 1 : 0)) },
    { classId: 3, data: mapPixels(new Uint8Array(W * H), (x, y) => (inDebris(x, y) ? 1 : 0)) },
];

export const CLASSES: MaskClass[] = [
    { id: 1, label: 'Cell', color: '#22c55e' },
    { id: 2, label: 'Nucleus', color: '#3b82f6' },
    { id: 3, label: 'Debris', color: '#eab308' },
];

// ---------------------------------------------------------------------------
// Pictures a microscope's software might render and pass as URLs, built once, at the
// image's full size, the first time a story needs them. They use one green hue in tones,
// so they look nothing like the per-class colours Finch draws for a mask.
// ---------------------------------------------------------------------------

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const GREEN = [20, 200, 90];
const PALE = [210, 255, 225];

/** One hue in tones: black, then green, then pale green for the brightest signal. */
function greenTone(v: number): [number, number, number] {
    const t = clamp01(v) ** 0.8;
    const [from, to, k] = t < 0.7 ? [[0, 0, 0], GREEN, t / 0.7] : [GREEN, PALE, (t - 0.7) / 0.3];
    return [0, 1, 2].map((i) => Math.round(from[i] + (to[i] - from[i]) * k)) as [
        number,
        number,
        number,
    ];
}

function rgbaBuffer(): RgbaBuffer {
    return { data: new Uint8ClampedArray(W * H * 4), width: W, height: H };
}

/**
 * The raw intensities as a green fluorescence picture, so the picture shows exactly the
 * values hover reports: background black, cytoplasm mid green, nuclei and debris palest.
 */
function renderFluorescence(tone = greenTone): RgbaBuffer {
    let lo = Infinity;
    let hi = -Infinity;
    for (const v of IMAGE) {
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
    }
    const out = rgbaBuffer();
    IMAGE.forEach((v, i) => out.data.set([...tone((v - lo) / (hi - lo)), 255], i * 4));
    return out;
}

/** Black to white, for a picture that reads as just the image, with no colour of its own. */
const grayTone = (v: number): [number, number, number] => {
    const g = Math.round(255 * clamp01(v) ** 0.8);
    return [g, g, g];
};

/** Fixed puncta per cell, as offsets in cell radii, so the picture is the same every time. */
const PUNCTA: [number, number][] = [
    [0.55, 0.1],
    [-0.5, 0.35],
    [0.2, -0.6],
    [-0.25, -0.45],
    [0.7, -0.3],
];

/** A second channel alone: small bright puncta inside each cell, transparent elsewhere. */
function renderPuncta(): RgbaBuffer {
    const out = rgbaBuffer();
    for (let y = 0; y < H; y += 1) {
        for (let x = 0; x < W; x += 1) {
            let signal = 0;
            for (const c of CELLS) {
                const t = (c.angle * Math.PI) / 180;
                for (const [u, v] of PUNCTA) {
                    const px = c.x + u * c.rx * Math.cos(t) - v * c.ry * Math.sin(t);
                    const py = c.y + u * c.rx * Math.sin(t) + v * c.ry * Math.cos(t);
                    signal += Math.exp(-((x - px) ** 2 + (y - py) ** 2) / 1.2);
                }
            }
            // The palest tones of the same hue, so the puncta read as the brightest signal.
            if (signal > 0.05) {
                const alpha = Math.round(255 * clamp01(signal) ** 0.8);
                out.data.set([...greenTone(0.85 + 0.15 * clamp01(signal)), alpha], (y * W + x) * 4);
            }
        }
    }
    return out;
}

/**
 * The segmentation as a picture: one-pixel white outlines of cells and nuclei, on the inner
 * side of each boundary. Debris is left out.
 */
function renderMaskOutline(): RgbaBuffer {
    const out = rgbaBuffer();
    const at = (x: number, y: number) => {
        if (x < 0 || y < 0 || x >= W || y >= H) return 0;
        const l = LABELS[y * W + x];
        return l === 1 || l === 2 ? l : 0;
    };
    for (let y = 0; y < H; y += 1) {
        for (let x = 0; x < W; x += 1) {
            const l = at(x, y);
            // A cell next to background, or a nucleus next to its cell.
            if (
                l !== 0 &&
                [at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)].some((n) => n < l)
            ) {
                out.data.set([255, 255, 255, 200], (y * W + x) * 4);
            }
        }
    }
    return out;
}

function toDataUrl({ data, width, height }: RgbaBuffer): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d')!.putImageData(new ImageData(data, width, height), 0, 0);
    return canvas.toDataURL('image/png');
}

let urls: { image: string; grayImage: string; puncta: string; mask: string } | null = null;

/**
 * Data URLs of the image (green, and in greyscale), the puncta channel and the segmentation
 * outline.
 */
export function renderedUrls() {
    urls ??= {
        image: toDataUrl(renderFluorescence()),
        grayImage: toDataUrl(renderFluorescence(grayTone)),
        puncta: toDataUrl(renderPuncta()),
        mask: toDataUrl(renderMaskOutline()),
    };
    return urls;
}

// ---------------------------------------------------------------------------
// Point sets, for the point layer story.
// ---------------------------------------------------------------------------

/** `count` points spread over the frame, the same every time, as a flat `[x0, y0, …]` array. */
export function randomPoints(count: number, seed = 11): Float32Array {
    let s = seed;
    const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const out = new Float32Array(count * 2);
    for (let i = 0; i < count; i += 1) {
        out[2 * i] = rand() * (W - 1);
        out[2 * i + 1] = rand() * (H - 1);
    }
    return out;
}
