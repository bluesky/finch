import { OphydSim } from '../core/types';
import { DetectorConfig } from '../devices/detector';
import { CameraFramePayload } from './SimCameraSocket';
import { CameraSocketFactory } from './types';
export interface SimDetectorCameraOptions {
    /** Frames per second to emit. Defaults to 10 (see `SimCameraSocket`). */
    fps?: number;
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
export declare function renderDetectorFrame(params: {
    width: number;
    height: number;
    mode: 'noisy' | 'image_file';
    /** Noise dimming for the `noisy` path. Defaults to 1. */
    opacity?: number;
    /** Layers to composite for the `image_file` path, bottom-first. */
    layers?: RenderLayer[];
}): Promise<CameraFramePayload>;
/**
 * Build a camera socket factory whose frames are driven by a detector in a live
 * `OphydSim`. Each frame reads the detector's current `image1:Opacity` (set by
 * modulating devices such as beam energy) and `image1:Mode`, so changing those
 * PVs visibly changes the stream.
 */
export declare function createSimDetectorCameraSocketFactory(sim: OphydSim, config: DetectorConfig, options?: SimDetectorCameraOptions): CameraSocketFactory;
//# sourceMappingURL=createSimDetectorCameraSocketFactory.d.ts.map