import { describe, it, expect, vi } from 'vitest';
import { createOphydSim } from '../../../lib/ophyd-sim/core/createOphydSim';
import { signal } from '../../../lib/ophyd-sim/devices/signal';

describe('signal', () => {
    it('seeds a static initial value', () => {
        const sim = createOphydSim({
            devices: [signal({ name: 'ring_current', initialValue: 400, units: 'mA' })],
        });

        expect(sim.get('ring_current')).toBe(400);
        expect(sim.metadata('ring_current')?.units).toBe('mA');
    });

    it('recomputes a derived signal when a dependency changes', () => {
        const sim = createOphydSim({
            devices: [
                signal({ name: 'x', initialValue: 0, writeAccess: true }),
                signal({
                    name: 'I0',
                    dependsOn: ['x'],
                    value: ({ get }) => get.number('x') * 2,
                }),
            ],
        });

        expect(sim.get('I0')).toBe(0);

        sim.set('x', 5);
        expect(sim.get('I0')).toBe(10);

        sim.set('x', -3);
        expect(sim.get('I0')).toBe(-6);
    });

    it('notifies subscribers of a derived signal when its dependency changes', () => {
        const sim = createOphydSim({
            devices: [
                signal({ name: 'x', initialValue: 0, writeAccess: true }),
                signal({
                    name: 'y',
                    dependsOn: ['x'],
                    value: ({ get }) => get.number('x') + 1,
                }),
            ],
        });

        const listener = vi.fn();
        sim.subscribe('y', listener);
        listener.mockClear();

        sim.set('x', 10);
        expect(listener).toHaveBeenCalledWith(expect.objectContaining({ name: 'y', value: 11 }));
    });
});
