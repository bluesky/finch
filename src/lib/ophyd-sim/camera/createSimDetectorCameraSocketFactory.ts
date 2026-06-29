import type { OphydSim } from '../core/types';
import type { DetectorConfig } from '../devices/detector';
import { MODE_SUFFIX, OPACITY_SUFFIX } from '../devices/detector';
import type { CameraFramePayload } from './SimCameraSocket';
import { SimCameraSocket } from './SimCameraSocket';
import type { CameraSocketFactory } from './types';

export interface SimDetectorCameraOptions {
    /** Frames per second to emit. Defaults to 30. */
    fps?: number;
}

/** Lazily load and cache an image as an ImageBitmap (keyed per URL). */
const bitmapCache = new Map<string, Promise<ImageBitmap | null>>();

function loadImageBitmap(url: string): Promise<ImageBitmap | null> {
    let pending = bitmapCache.get(url);
    if (!pending) {
        pending = (async () => {
            try {
                const response = await fetch(url);
                const blob = await response.blob();
                return await createImageBitmap(blob);
            } catch (err) {
                console.error('[ophyd-sim] failed to load detector image', url, err);
                return null;
            }
        })();
        bitmapCache.set(url, pending);
    }
    return pending;
}

/**
 * Render one detector frame to a JPEG blob, dimmed by `opacity`.
 *
 * `noisy` scales each grayscale sample by `opacity` (lower energy → darker
 * noise). `image_file` draws the cached bitmap at `globalAlpha = opacity` over a
 * black background (JPEG has no alpha, so compositing over black is what reads
 * as "darker"). Returns `null` when canvas APIs are unavailable (e.g. jsdom).
 */
export async function renderDetectorFrame(params: {
    width: number;
    height: number;
    mode: 'noisy' | 'image_file';
    opacity: number;
    file?: string;
}): Promise<CameraFramePayload> {
    const { width, height, mode, opacity, file } = params;
    if (typeof OffscreenCanvas === 'undefined') return null;
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext('2d');
    if (!context) return null;

    // Black background so dimming reads as darker.
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    if (mode === 'image_file' && file) {
        const bitmap = await loadImageBitmap(file);
        if (bitmap) {
            context.globalAlpha = opacity;
            context.drawImage(bitmap, 0, 0, width, height);
            context.globalAlpha = 1;
        }
    } else {
        const frame = context.createImageData(width, height);
        const data = frame.data;
        for (let i = 0; i < data.length; i += 4) {
            const v = Math.floor(Math.random() * 256 * opacity);
            data[i] = v; // R
            data[i + 1] = v; // G
            data[i + 2] = v; // B
            data[i + 3] = 255; // A
        }
        context.putImageData(frame, 0, 0);
    }

    return canvas.convertToBlob({ type: 'image/jpeg', quality: 0.6 });
}

/**
 * Build a camera socket factory whose frames are driven by a detector in a live
 * `OphydSim`. Each frame reads the detector's current `image1:Opacity` (set by
 * modulating devices such as beam energy) and `image1:Mode`, so changing those
 * PVs visibly changes the stream.
 */
export function createSimDetectorCameraSocketFactory(
    sim: OphydSim,
    config: DetectorConfig,
    options: SimDetectorCameraOptions = {},
): CameraSocketFactory {
    const { prefix, image } = config;
    const opacityPV = `${prefix}:${OPACITY_SUFFIX}`;
    const modePV = `${prefix}:${MODE_SUFFIX}`;

    return (_url: string) =>
        new SimCameraSocket({
            fps: options.fps,
            width: image.sizeX,
            height: image.sizeY,
            generateFrame: ({ width, height }) => {
                const rawOpacity = sim.get(opacityPV);
                const opacity = typeof rawOpacity === 'number' ? rawOpacity : 1;
                const rawMode = sim.get(modePV);
                const mode = rawMode === 'image_file' ? 'image_file' : 'noisy';
                return renderDetectorFrame({ width, height, mode, opacity, file: image.file });
            },
        });
}
