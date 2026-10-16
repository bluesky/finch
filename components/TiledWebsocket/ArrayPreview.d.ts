/**
 * Draws a 1-D or 2-D numeric payload as a greyscale image, scaled to its own min and max.
 *
 * This is the "draw from the callback, don't keep history" pattern for detector data. Only the
 * newest frame is ever held, and it is painted straight to a canvas.
 */
export default function ArrayPreview({ payload }: {
    payload: unknown;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ArrayPreview.d.ts.map