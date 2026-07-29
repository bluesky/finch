/**
 * The minimal slice of the browser `WebSocket` API that {@link useCameraCanvas}
 * actually consumes. A simulator only has to implement this surface — not the
 * full `WebSocket` interface — to stand in for the real camera stream.
 *
 * The real `WebSocket` is structurally wider than this (its `onmessage` carries
 * a full `MessageEvent`), so the default factory casts it to this shape; see
 * `defaultCameraSocketFactory` in the hook.
 */
export interface CameraSocketMessageEvent {
    /** JSON string for control messages, or a binary JPEG frame. */
    data: string | ArrayBuffer | Blob;
}

export interface CameraSocketLike {
    /** Mirrors `WebSocket.readyState` (`1` === OPEN). */
    readyState: number;
    onopen: ((event: Event) => void) | null;
    onmessage: ((event: CameraSocketMessageEvent) => void) | null;
    onerror: ((event: Event) => void) | null;
    onclose: ((event: Event) => void) | null;
    /** Outgoing control messages are always JSON strings. */
    send(data: string): void;
    close(): void;
}

/**
 * Constructs a camera socket for a given URL. The hook defaults to one that
 * wraps the real `WebSocket`; pass a sim factory to render mock frames instead.
 */
export type CameraSocketFactory = (url: string) => CameraSocketLike;
