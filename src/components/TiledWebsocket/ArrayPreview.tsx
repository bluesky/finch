import { useEffect, useMemo, useRef } from 'react';

/**
 * Draws a 1-D or 2-D numeric payload as a greyscale image, scaled to its own min and max.
 *
 * This is the "draw from the callback, don't keep history" pattern for detector data. Only the
 * newest frame is ever held, and it is painted straight to a canvas.
 */
export default function ArrayPreview({ payload }: { payload: unknown }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const grid = useMemo(() => toGrid(payload), [payload]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !grid) return;
        const rows = grid.length;
        const cols = grid[0].length;
        canvas.width = cols;
        canvas.height = rows;
        const context = canvas.getContext('2d');
        if (!context) return;

        let min = Infinity;
        let max = -Infinity;
        for (const row of grid) {
            for (const value of row) {
                if (value < min) min = value;
                if (value > max) max = value;
            }
        }
        const span = max - min || 1;
        const image = context.createImageData(cols, rows);
        grid.forEach((row, y) =>
            row.forEach((value, x) => {
                const level = Math.round(((value - min) / span) * 255);
                const index = (y * cols + x) * 4;
                image.data[index] = level;
                image.data[index + 1] = level;
                image.data[index + 2] = level;
                image.data[index + 3] = 255;
            }),
        );
        context.putImageData(image, 0, 0);
    }, [grid]);

    if (!grid) {
        return (
            <p className="text-xs text-slate-500">
                No preview: the payload is not a 1-D or 2-D array of numbers.
            </p>
        );
    }
    // Square pixels, fitted into 384×192 CSS px, so a one-row patch shows as a strip, not a block.
    const rows = grid.length;
    const cols = grid[0].length;
    const scale = Math.min(384 / cols, 192 / rows, 12);
    return (
        <canvas
            ref={canvasRef}
            data-testid="array-preview"
            style={{ width: Math.max(1, cols * scale), height: Math.max(1, rows * scale) }}
            className="max-w-full rounded border border-slate-300 bg-black [image-rendering:pixelated]"
        />
    );
}

function toGrid(payload: unknown): number[][] | null {
    if (!Array.isArray(payload) || payload.length === 0) return null;
    const rows = Array.isArray(payload[0]) ? (payload as unknown[][]) : [payload];
    const width = rows[0].length;
    if (width === 0) return null;
    for (const row of rows) {
        if (!Array.isArray(row) || row.length !== width) return null;
        if (!row.every((value) => typeof value === 'number')) return null;
    }
    return rows as number[][];
}
