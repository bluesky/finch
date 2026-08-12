import { CameraSocketFactory, CameraSocketLike, CameraSocketMessageEvent } from './types';
/** Payload a frame generator may return. `null` skips the frame. */
export type CameraFramePayload = Blob | ArrayBuffer | null;
export interface SimCameraSocketOptions {
    /**
     * Frames per second to emit. Defaults to 10 — enough for a simulated
     * stream to read as live while keeping the browser's per-frame work low
     * (e.g. on the documentation site).
     */
    fps?: number;
    /** Generated frame width in pixels. Defaults to 512. */
    width?: number;
    /** Generated frame height in pixels. Defaults to 512. */
    height?: number;
    /**
     * Produce one frame. Defaults to a grayscale random-noise JPEG. Override in
     * tests (or to swap in structured imagery) to avoid touching canvas APIs.
     */
    generateFrame?: (size: {
        width: number;
        height: number;
    }) => Promise<CameraFramePayload> | CameraFramePayload;
}
/**
 * A `WebSocket`-shaped fake that stands in for the real camera stream. After an
 * async "connection", it emits binary JPEG frames at `fps`, replicating the
 * server protocol {@link useCameraCanvas} expects: an initial `{ x, y }`
 * dimensions message, JPEG frame blobs, and a `{ logNormalization }` echo in
 * response to `toggleLogNormalization`. The image content (random noise by
 * default) carries no real data — it exists to drive the UI without a backend.
 */
export declare class SimCameraSocket implements CameraSocketLike {
    readyState: number;
    onopen: ((event: Event) => void) | null;
    onmessage: ((event: CameraSocketMessageEvent) => void) | null;
    onerror: ((event: Event) => void) | null;
    onclose: ((event: Event) => void) | null;
    private readonly fps;
    private readonly width;
    private readonly height;
    private readonly generateFrame;
    private timer;
    private logNormalization;
    private emittingFrame;
    constructor(options?: SimCameraSocketOptions);
    private open;
    private startFrames;
    private emitFrame;
    send(data: string): void;
    close(): void;
}
/**
 * Factory that produces {@link SimCameraSocket}s, suitable for the hook's
 * `socketFactory` seam. The `url` is accepted for signature compatibility and
 * ignored — there is no backend to connect to.
 */
export declare function createSimCameraSocketFactory(options?: SimCameraSocketOptions): CameraSocketFactory;
//# sourceMappingURL=SimCameraSocket.d.ts.map