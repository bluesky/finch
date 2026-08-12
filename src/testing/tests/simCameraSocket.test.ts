import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    SimCameraSocket,
    type CameraFramePayload,
    type CameraSocketMessageEvent,
} from '../../lib/ophyd-sim';

/**
 * Drive the sim socket with a synchronous stub frame generator so frame
 * delivery is deterministic under fake timers — the real generator depends on
 * `OffscreenCanvas`, which jsdom lacks.
 */
function makeSocket(overrides = {}) {
    const frame = new ArrayBuffer(8);
    const generateFrame = vi.fn((): CameraFramePayload => frame);
    const socket = new SimCameraSocket({ fps: 10, generateFrame, ...overrides });
    return { socket, frame, generateFrame };
}

describe('SimCameraSocket', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('opens asynchronously and emits an initial dimensions message', async () => {
        const { socket } = makeSocket({ width: 320, height: 240 });
        const onopen = vi.fn();
        const messages: CameraSocketMessageEvent['data'][] = [];
        socket.onopen = onopen;
        socket.onmessage = (e) => messages.push(e.data);

        // Nothing fires until the deferred "connect" timer runs.
        expect(onopen).not.toHaveBeenCalled();

        await vi.advanceTimersByTimeAsync(0);

        expect(onopen).toHaveBeenCalledTimes(1);
        expect(socket.readyState).toBe(1); // OPEN
        expect(messages).toContainEqual(JSON.stringify({ x: 320, y: 240 }));
    });

    it('emits frames at the configured fps once open', async () => {
        const { socket, frame, generateFrame } = makeSocket(); // fps: 10 -> 100ms
        const frames: CameraSocketMessageEvent['data'][] = [];
        socket.onmessage = (e) => {
            if (e.data instanceof ArrayBuffer) frames.push(e.data);
        };

        await vi.advanceTimersByTimeAsync(0); // open
        expect(frames).toHaveLength(0);

        await vi.advanceTimersByTimeAsync(350); // ~3 frame intervals
        expect(generateFrame).toHaveBeenCalled();
        expect(frames.length).toBeGreaterThanOrEqual(3);
        expect(frames[0]).toBe(frame);
    });

    it('echoes logNormalization in response to toggleLogNormalization', async () => {
        const { socket } = makeSocket();
        const messages: string[] = [];
        socket.onmessage = (e) => {
            if (typeof e.data === 'string') messages.push(e.data);
        };

        await vi.advanceTimersByTimeAsync(0); // open

        socket.send(JSON.stringify({ toggleLogNormalization: false }));
        expect(messages).toContainEqual(JSON.stringify({ logNormalization: false }));
    });

    it('stops emitting frames and fires onclose after close', async () => {
        const { socket } = makeSocket();
        const onclose = vi.fn();
        let frameCount = 0;
        socket.onclose = onclose;
        socket.onmessage = (e) => {
            if (e.data instanceof ArrayBuffer) frameCount += 1;
        };

        await vi.advanceTimersByTimeAsync(0); // open
        await vi.advanceTimersByTimeAsync(250);
        const beforeClose = frameCount;
        expect(beforeClose).toBeGreaterThan(0);

        socket.close();
        expect(onclose).toHaveBeenCalledTimes(1);
        expect(socket.readyState).toBe(3); // CLOSED

        await vi.advanceTimersByTimeAsync(500);
        expect(frameCount).toBe(beforeClose); // no frames after close
    });

    it('ignores sends and frame ticks before the socket opens', () => {
        const { socket } = makeSocket();
        const messages: unknown[] = [];
        socket.onmessage = (e) => messages.push(e.data);

        // Still CONNECTING — send is a no-op, nothing emitted.
        socket.send(JSON.stringify({ toggleLogNormalization: true }));
        expect(messages).toHaveLength(0);
        expect(socket.readyState).toBe(0); // CONNECTING
    });
});
