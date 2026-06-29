import { describe, it, expect, vi } from 'vitest';
import { createFallbackTransport } from '../../api/ophyd/transport/createFallbackTransport';
import type { OphydTransportStatus, Unsubscribe } from '../../api/ophyd/transport/types';

/**
 * A controllable fake transport for exercising the fallback wrapper. Records
 * everything sent to it and lets the test drive its message/status channels.
 */
function makeFakeTransport() {
    const messageListeners = new Set<(m: unknown) => void>();
    const statusListeners = new Set<(s: OphydTransportStatus) => void>();
    let status: OphydTransportStatus = 'connecting';
    const sent: unknown[] = [];
    let closed = false;

    return {
        sent,
        get closed() {
            return closed;
        },
        emitMessage(m: unknown) {
            for (const l of messageListeners) l(m);
        },
        emitStatus(s: OphydTransportStatus) {
            status = s;
            for (const l of statusListeners) l(s);
        },
        transport: {
            send(m: unknown) {
                sent.push(m);
            },
            onMessage(listener: (m: unknown) => void): Unsubscribe {
                messageListeners.add(listener);
                return () => messageListeners.delete(listener);
            },
            onStatus(listener: (s: OphydTransportStatus) => void): Unsubscribe {
                statusListeners.add(listener);
                listener(status);
                return () => statusListeners.delete(listener);
            },
            close() {
                closed = true;
            },
        },
    };
}

describe('createFallbackTransport', () => {
    it('switches to the fallback on primary error and replays active subscriptions', () => {
        const primary = makeFakeTransport();
        const fallback = makeFakeTransport();

        const wrapper = createFallbackTransport(
            primary.transport,
            () => fallback.transport,
        );

        const received: unknown[] = [];
        wrapper.onMessage((m) => received.push(m));

        // Subscribe through the wrapper; the primary should receive it.
        wrapper.send({ action: 'subscribe', pv: 'IOC:m1' } as never);
        expect(primary.sent).toEqual([{ action: 'subscribe', pv: 'IOC:m1' }]);

        // Primary fails -> wrapper switches to fallback and replays the subscribe.
        primary.emitStatus('error');
        expect(primary.closed).toBe(true);
        expect(fallback.sent).toEqual([{ action: 'subscribe', pv: 'IOC:m1' }]);

        // Messages from the fallback reach the original listener...
        fallback.emitMessage({ pv: 'IOC:m1', value: 42 });
        expect(received).toContainEqual({ pv: 'IOC:m1', value: 42 });

        // ...and subsequent sends route to the fallback.
        wrapper.send({ action: 'set', pv: 'IOC:m1', value: 1 } as never);
        expect(fallback.sent).toContainEqual({ action: 'set', pv: 'IOC:m1', value: 1 });
    });

    it('never forwards the primary terminal status to consumers', () => {
        const primary = makeFakeTransport();
        const fallback = makeFakeTransport();
        const wrapper = createFallbackTransport(primary.transport, () => fallback.transport);

        const statuses: OphydTransportStatus[] = [];
        wrapper.onStatus((s) => statuses.push(s));

        primary.emitStatus('error');
        expect(statuses).not.toContain('error');

        // The fallback's status supersedes from the switch onward.
        fallback.emitStatus('open');
        expect(statuses).toContain('open');
    });

    it('does not replay subscriptions that were unsubscribed before the switch', () => {
        const primary = makeFakeTransport();
        const fallback = makeFakeTransport();
        const wrapper = createFallbackTransport(primary.transport, () => fallback.transport);

        wrapper.send({ action: 'subscribe', pv: 'IOC:m1' } as never);
        wrapper.send({ action: 'unsubscribe', pv: 'IOC:m1' } as never);

        primary.emitStatus('closed');
        expect(fallback.sent).toEqual([]);
    });

    it('does not switch when the user closes the wrapper', () => {
        const primary = makeFakeTransport();
        const makeFallback = vi.fn(() => makeFakeTransport().transport);
        const wrapper = createFallbackTransport(primary.transport, makeFallback);

        wrapper.close();
        expect(primary.closed).toBe(true);

        // A close-driven 'closed' from the primary must not trigger a fallback.
        primary.emitStatus('closed');
        expect(makeFallback).not.toHaveBeenCalled();
    });
});
