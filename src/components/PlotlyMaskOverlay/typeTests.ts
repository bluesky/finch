/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Compile-time assertions for the `image` and `mask` inputs and the component props: each
 * `@ts-expect-error` line is a combination the types must reject. `tsconfig` excludes
 * `src/testing`, so this lives beside the component, as `src/api/tiled/hooks/typeTests.ts` does.
 */
import type { PlotlyMaskOverlayProps } from './PlotlyMaskOverlay';
import type { Annotation, ImageInput, MaskInput } from './types';

const flat = new Float32Array(6);
const rows = [
    [1, 2, 3],
    [4, 5, 6],
];
const lookup = (x: number, y: number) => x + y;

// Accepted.
const a1: ImageInput = { type: 'array', data: flat, shape: [2, 3], showColorbar: true };
const a2: ImageInput = { type: 'array', data: rows, colormap: 'viridis', logScale: true };
const a3: ImageInput = { type: 'url', url: 'scan.png', shape: [2, 3] };
const a4: ImageInput = { type: 'url', url: 'scan.png', shape: [2, 3], resolveValue: lookup };
const m1: MaskInput = { type: 'labels', data: flat, classes: [{ id: 1 }], opacity: 0.6 };
const m2: MaskInput = { type: 'layers', layers: [{ classId: 1, data: flat }] };
const p1: PlotlyMaskOverlayProps = {
    image: a3,
    imageLayers: [{ id: 'mask', url: 'mask.png' }],
    dragMode: 'pan',
    frameKey: 'scan-1|0',
    missingColor: '#ef4444',
};

// Rejected.
// @ts-expect-error a flat array needs its shape
const r1: ImageInput = { type: 'array', data: flat };
// @ts-expect-error nested rows carry their own shape
const r2: ImageInput = { type: 'array', data: rows, shape: [2, 3] };
// @ts-expect-error a PNG needs the detector frame
const r3: ImageInput = { type: 'url', url: 'scan.png' };
// @ts-expect-error log scale applies to raw values, not to a rendered PNG
const r4: ImageInput = { type: 'url', url: 'scan.png', shape: [2, 3], logScale: true };
// @ts-expect-error pictures are always drawn with sharp pixels
const r5: ImageInput = { type: 'url', url: 'scan.png', shape: [2, 3], smoothing: true };
// @ts-expect-error a mask PNG is a picture: it goes in `imageLayers`
const r6: MaskInput = { type: 'url', url: 'mask.png' };
// @ts-expect-error one mask source at a time
const r7: MaskInput = { type: 'labels', data: flat, layers: [] };
// @ts-expect-error unknown source
const r8: ImageInput = { type: 'png', url: 'scan.png' };
// @ts-expect-error an array image has its own values; `resolveValue` is for a PNG
const r9: ImageInput = { type: 'array', data: rows, resolveValue: lookup };
// @ts-expect-error a PNG has no colorbar
const r10: ImageInput = { type: 'url', url: 'scan.png', shape: [2, 3], showColorbar: true };
// @ts-expect-error the image is required
const r11: PlotlyMaskOverlayProps = { imageLayers: [] };
// @ts-expect-error a single point is a one-point `pointLayers` entry, not an annotation
const r12: Annotation = { type: 'marker', points: [[1, 1]] };
// @ts-expect-error drawing is chosen through `dragMode`
const r13: PlotlyMaskOverlayProps = { image: a3, drawTool: 'rect' };
// @ts-expect-error Plotly's layout is Finch's; the one setting offered is `missingColor`
const r14: PlotlyMaskOverlayProps = { image: a3, layout: { plot_bgcolor: '#000' } };
// @ts-expect-error a frame is named by a string or number, not an object
const r15: PlotlyMaskOverlayProps = { image: a3, frameKey: { scan: 1 } };

// Keeps the accepted examples referenced under `noUnusedLocals`.
void [a1, a2, a3, a4, m1, m2, p1];
