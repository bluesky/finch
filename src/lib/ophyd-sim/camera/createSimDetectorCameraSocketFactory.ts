import type { OphydSim } from '../core/types';
import type { DetectorConfig } from '../devices/detector';
import {
    MODE_SUFFIX,
    OPACITY_SUFFIX,
    overlayCenterXSuffix,
    overlayCenterYSuffix,
} from '../devices/detector';
import type { CameraFramePayload } from './SimCameraSocket';
import { SimCameraSocket } from './SimCameraSocket';
import type { CameraSocketFactory } from './types';

export interface SimDetectorCameraOptions {
    /** Frames per second to emit. Defaults to 10 (see `SimCameraSocket`). */
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

/** One image layer to composite, in destination (top-left) pixel coordinates. */
export interface RenderLayer {
    file: string;
    /** `globalAlpha` to draw at (0–1). */
    opacity: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Render one detector frame to a JPEG blob over a black background.
 *
 * `noisy` fills grayscale noise scaled by `opacity` (lower energy → darker
 * noise). `image_file` composites `layers` bottom-first, each drawn at its own
 * `globalAlpha` and destination rect (JPEG has no alpha, so compositing over
 * black is what reads as "darker"). Returns `null` when canvas APIs are
 * unavailable (e.g. jsdom).
 */
export async function renderDetectorFrame(params: {
    width: number;
    height: number;
    mode: 'noisy' | 'image_file';
    /** Noise dimming for the `noisy` path. Defaults to 1. */
    opacity?: number;
    /** Layers to composite for the `image_file` path, bottom-first. */
    layers?: RenderLayer[];
}): Promise<CameraFramePayload> {
    const { width, height, mode, opacity = 1, layers = [] } = params;
    if (typeof OffscreenCanvas === 'undefined') return null;
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext('2d');
    if (!context) return null;

    // Black background so dimming reads as darker.
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    if (mode === 'image_file') {
        for (const layer of layers) {
            const bitmap = await loadImageBitmap(layer.file);
            if (!bitmap) continue;
            context.globalAlpha = layer.opacity;
            context.drawImage(bitmap, layer.x, layer.y, layer.width, layer.height);
        }
        context.globalAlpha = 1;
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
    const overlayPVs = (image.overlays ?? []).map((overlay, i) => ({
        overlay,
        xPV: `${prefix}:${overlayCenterXSuffix(i)}`,
        yPV: `${prefix}:${overlayCenterYSuffix(i)}`,
    }));

    const num = (value: unknown, fallback: number): number =>
        typeof value === 'number' ? value : fallback;

    // Base images to cycle through, one per emitted frame. `files` wins over the
    // single `file`; an empty list means no base layer (overlays only).
    const baseFiles =
        image.files && image.files.length > 0 ? image.files : image.file ? [image.file] : [];

    return (_url: string) => {
        // Per-socket round-robin cursor so each stream advances independently.
        let frameIndex = 0;
        return new SimCameraSocket({
            fps: options.fps,
            width: image.sizeX,
            height: image.sizeY,
            generateFrame: ({ width, height }) => {
                const opacity = num(sim.get(opacityPV), 1);
                const mode = sim.get(modePV) === 'image_file' ? 'image_file' : 'noisy';
                if (mode !== 'image_file') {
                    return renderDetectorFrame({ width, height, mode, opacity });
                }

                // Base image fills the canvas, dimmed by the energy-driven opacity.
                // Cycle to the next base image each frame so the stream animates.
                const layers: RenderLayer[] = [];
                if (baseFiles.length > 0) {
                    const file = baseFiles[frameIndex % baseFiles.length];
                    frameIndex += 1;
                    layers.push({ file, opacity, x: 0, y: 0, width, height });
                }
                // Overlays composite on top at full opacity, centered on their
                // (possibly PV-driven) center coordinate.
                for (const { overlay, xPV, yPV } of overlayPVs) {
                    const centerX = num(sim.get(xPV), overlay.x);
                    const centerY = num(sim.get(yPV), overlay.y);
                    layers.push({
                        file: overlay.file,
                        opacity: 1,
                        x: centerX - overlay.width / 2,
                        y: centerY - overlay.height / 2,
                        width: overlay.width,
                        height: overlay.height,
                    });
                }
                return renderDetectorFrame({ width, height, mode, layers });
            },
        });
    };
}
