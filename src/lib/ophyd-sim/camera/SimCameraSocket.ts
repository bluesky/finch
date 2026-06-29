import type { CameraSocketFactory, CameraSocketLike, CameraSocketMessageEvent } from './types';

/** Payload a frame generator may return. `null` skips the frame. */
export type CameraFramePayload = Blob | ArrayBuffer | null;

export interface SimCameraSocketOptions {
    /** Frames per second to emit. Defaults to 30. */
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

const OPEN = 1;
const CLOSED = 3;

/**
 * Draw uncorrelated grayscale noise and JPEG-encode it, mirroring what the real
 * Python camera server puts on the wire (the frontend only ever sees JPEG
 * frames). Returns `null` when `OffscreenCanvas` is unavailable so callers can
 * simply skip the frame rather than crash.
 */
async function generateNoiseJpeg({
    width,
    height,
}: {
    width: number;
    height: number;
}): Promise<CameraFramePayload> {
    if (typeof OffscreenCanvas === 'undefined') return null;
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext('2d');
    if (!context) return null;

    const image = context.createImageData(width, height);
    const data = image.data;
    for (let i = 0; i < data.length; i += 4) {
        const v = Math.floor(Math.random() * 256);
        data[i] = v; // R
        data[i + 1] = v; // G
        data[i + 2] = v; // B
        data[i + 3] = 255; // A
    }
    context.putImageData(image, 0, 0);
    return canvas.convertToBlob({ type: 'image/jpeg', quality: 0.6 });
}

/**
 * A `WebSocket`-shaped fake that stands in for the real camera stream. After an
 * async "connection", it emits binary JPEG frames at `fps`, replicating the
 * server protocol {@link useCameraCanvas} expects: an initial `{ x, y }`
 * dimensions message, JPEG frame blobs, and a `{ logNormalization }` echo in
 * response to `toggleLogNormalization`. The image content (random noise by
 * default) carries no real data — it exists to drive the UI without a backend.
 */
export class SimCameraSocket implements CameraSocketLike {
    readyState = 0; // CONNECTING

    onopen: ((event: Event) => void) | null = null;
    onmessage: ((event: CameraSocketMessageEvent) => void) | null = null;
    onerror: ((event: Event) => void) | null = null;
    onclose: ((event: Event) => void) | null = null;

    private readonly fps: number;
    private readonly width: number;
    private readonly height: number;
    private readonly generateFrame: NonNullable<SimCameraSocketOptions['generateFrame']>;
    private timer: ReturnType<typeof setInterval> | null = null;
    private logNormalization = true;
    private emittingFrame = false;

    constructor(options: SimCameraSocketOptions = {}) {
        this.fps = options.fps ?? 30;
        this.width = options.width ?? 512;
        this.height = options.height ?? 512;
        this.generateFrame = options.generateFrame ?? generateNoiseJpeg;
        // Defer "open" like a real socket so listeners assigned after
        // construction still fire.
        setTimeout(() => this.open(), 0);
    }

    private open(): void {
        if (this.readyState === CLOSED) return;
        this.readyState = OPEN;
        this.onopen?.(new Event('open'));
        // Seed canvas dimensions for consumers using `canvasSize: 'automatic'`.
        this.onmessage?.({ data: JSON.stringify({ x: this.width, y: this.height }) });
        this.startFrames();
    }

    private startFrames(): void {
        const intervalMs = Math.max(1, Math.round(1000 / this.fps));
        this.timer = setInterval(() => {
            void this.emitFrame();
        }, intervalMs);
    }

    private async emitFrame(): Promise<void> {
        // Skip if a prior frame is still encoding so slow envs don't pile up work.
        if (this.emittingFrame || this.readyState !== OPEN) return;
        this.emittingFrame = true;
        try {
            const frame = await this.generateFrame({ width: this.width, height: this.height });
            if (frame && this.readyState === OPEN) {
                this.onmessage?.({ data: frame });
            }
        } finally {
            this.emittingFrame = false;
        }
    }

    send(data: string): void {
        if (this.readyState !== OPEN) return;
        let message: unknown;
        try {
            message = JSON.parse(data);
        } catch {
            return; // Ignore non-JSON control messages.
        }
        if (message && typeof message === 'object' && 'toggleLogNormalization' in message) {
            this.logNormalization = Boolean(
                (message as { toggleLogNormalization: unknown }).toggleLogNormalization,
            );
            this.onmessage?.({
                data: JSON.stringify({ logNormalization: this.logNormalization }),
            });
        }
        // The initial config message (image/size PV names) needs no response —
        // the sim renders fixed-size noise regardless.
    }

    close(): void {
        if (this.readyState === CLOSED) return;
        this.readyState = CLOSED;
        if (this.timer !== null) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.onclose?.(new Event('close'));
    }
}

/**
 * Factory that produces {@link SimCameraSocket}s, suitable for the hook's
 * `socketFactory` seam. The `url` is accepted for signature compatibility and
 * ignored — there is no backend to connect to.
 */
export function createSimCameraSocketFactory(
    options: SimCameraSocketOptions = {},
): CameraSocketFactory {
    return (_url: string) => new SimCameraSocket(options);
}
