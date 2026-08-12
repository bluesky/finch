import { describe, it, expect, vi } from 'vitest';
import { createOphydSim } from '../../../lib/ophyd-sim/core/createOphydSim';
import { signal } from '../../../lib/ophyd-sim/devices/signal';
import { motor } from '../../../lib/ophyd-sim/devices/motor';
import { createOphydSimTransport } from '../../../lib/ophyd-sim/transport/createOphydSimTransport';
import type { OphydPVIncomingMessage } from '../../../api/ophyd/transport/types';

describe('createOphydSimTransport', () => {
    it('emits a meta message immediately on subscribe', () => {
        const sim = createOphydSim({
            devices: [signal({ name: 'I0', initialValue: 42, units: 'arb.' })],
        });
        const transport = createOphydSimTransport(sim);

        const received: OphydPVIncomingMessage[] = [];
        transport.onMessage((m) => received.push(m));

        transport.send({ action: 'subscribe', pv: 'I0' });

        // First message must be the meta + initial value (subscribe replays the
        // latest known value synchronously).
        expect(received.length).toBeGreaterThanOrEqual(2);
        expect(received[0]).toMatchObject({
            sub_type: 'meta',
            pv: 'I0',
            value: 42,
            units: 'arb.',
            connected: true,
        });
        expect(received[1]).toMatchObject({ pv: 'I0', value: 42 });
    });

    it('forwards value updates after subscribe', () => {
        const sim = createOphydSim({
            devices: [signal({ name: 'x', initialValue: 0, writeAccess: true })],
        });
        const transport = createOphydSimTransport(sim);

        const received: OphydPVIncomingMessage[] = [];
        transport.onMessage((m) => received.push(m));
        transport.send({ action: 'subscribe', pv: 'x' });
        received.length = 0;

        sim.set('x', 7);
        expect(received[0]).toMatchObject({ pv: 'x', value: 7 });
    });

    it('routes set messages to the simulator', () => {
        const sim = createOphydSim({
            devices: [motor({ name: 'IOC:m1', limits: [-10, 10], velocity: 5 })],
        });
        const transport = createOphydSimTransport(sim);

        transport.send({ action: 'set', pv: 'IOC:m1', value: 3 });
        expect(sim.get('IOC:m1')).toBe(3);
    });

    it('reports open status synchronously when a status listener attaches', () => {
        const sim = createOphydSim({ devices: [] });
        const transport = createOphydSimTransport(sim);

        const listener = vi.fn();
        transport.onStatus(listener);
        expect(listener).toHaveBeenCalledWith('open');
    });

    it('reports closed after close()', () => {
        const sim = createOphydSim({ devices: [] });
        const transport = createOphydSimTransport(sim);
        const listener = vi.fn();
        transport.onStatus(listener);
        listener.mockClear();

        transport.close();
        expect(listener).toHaveBeenCalledWith('closed');
    });

    it('unsubscribe stops further value messages for that PV', () => {
        const sim = createOphydSim({
            devices: [signal({ name: 'x', initialValue: 0, writeAccess: true })],
        });
        const transport = createOphydSimTransport(sim);

        const received: OphydPVIncomingMessage[] = [];
        transport.onMessage((m) => received.push(m));
        transport.send({ action: 'subscribe', pv: 'x' });
        transport.send({ action: 'unsubscribe', pv: 'x' });
        received.length = 0;

        sim.set('x', 1);
        expect(received).toHaveLength(0);
    });
});
