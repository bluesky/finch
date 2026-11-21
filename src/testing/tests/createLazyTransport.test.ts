import { describe, expect, it, vi } from 'vitest';
import { createLazyTransport } from '../../api/ophyd/transport/createLazyTransport';
import type { OphydTransportStatus, Unsubscribe } from '../../api/ophyd/transport/types';

/** A fake transport that records what is sent and lets the test drive its channels. */
function makeFakeTransport() {
    const messageListeners = new Set<(m: unknown) => void>();
    const statusListeners = new Set<(s: OphydTransportStatus) => void>();
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
                listener('connecting');
                return () => statusListeners.delete(listener);
            },
            close() {
                closed = true;
            },
        },
    };
}

describe('createLazyTransport', () => {
    it('does not build the transport until something is sent', () => {
        const fake = makeFakeTransport();
        const create = vi.fn(() => fake.transport);
        const lazy = createLazyTransport(create);

        lazy.onMessage(() => {});
        lazy.onStatus(() => {});
        expect(create).not.toHaveBeenCalled();

        lazy.send({ action: 'subscribe', device: 'izero' });
        lazy.send({ action: 'subscribe', device: 'tey_signal' });
        expect(create).toHaveBeenCalledTimes(1);
        expect(fake.sent).toEqual([
            { action: 'subscribe', device: 'izero' },
            { action: 'subscribe', device: 'tey_signal' },
        ]);
    });

    it('forwards messages and status to listeners registered before it was built', () => {
        const fake = makeFakeTransport();
        const lazy = createLazyTransport(() => fake.transport);
        const messages: unknown[] = [];
        const statuses: OphydTransportStatus[] = [];
        lazy.onMessage((m) => messages.push(m));
        lazy.onStatus((s) => statuses.push(s));

        lazy.send({ action: 'subscribe', device: 'izero' });
        fake.emitStatus('open');
        fake.emitMessage({ device: 'izero', value: 2 });

        expect(messages).toEqual([{ device: 'izero', value: 2 }]);
        expect(statuses).toEqual(['connecting', 'connecting', 'open']);
    });

    it('stops listening once a listener unsubscribes', () => {
        const fake = makeFakeTransport();
        const lazy = createLazyTransport(() => fake.transport);
        const messages: unknown[] = [];
        const stop = lazy.onMessage((m) => messages.push(m));

        lazy.send({ action: 'subscribe', device: 'izero' });
        stop();
        fake.emitMessage({ device: 'izero', value: 2 });
        expect(messages).toEqual([]);
    });

    it('closes the built transport and ignores later sends', () => {
        const fake = makeFakeTransport();
        const create = vi.fn(() => fake.transport);
        const lazy = createLazyTransport(create);

        lazy.close();
        lazy.send({ action: 'subscribe', device: 'izero' });
        expect(create).not.toHaveBeenCalled();

        const other = makeFakeTransport();
        const built = createLazyTransport(() => other.transport);
        built.send({ action: 'subscribe', device: 'izero' });
        built.close();
        expect(other.closed).toBe(true);
    });
});
