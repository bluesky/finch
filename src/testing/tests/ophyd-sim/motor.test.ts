import { describe, it, expect } from 'vitest';
import { createOphydSim } from '../../../lib/ophyd-sim/core/createOphydSim';
import { motor } from '../../../lib/ophyd-sim/devices/motor';

describe('motor', () => {
    it('clamps setpoint writes into the configured limits', () => {
        const sim = createOphydSim({
            devices: [motor({ name: 'IOC:m1', limits: [-1, 1], velocity: 10 })],
        });

        sim.set('IOC:m1', 100);
        expect(sim.get('IOC:m1')).toBe(1);

        sim.set('IOC:m1', -100);
        expect(sim.get('IOC:m1')).toBe(-1);
    });

    it('seeds readback and moving flag from initialPosition', () => {
        const sim = createOphydSim({
            devices: [motor({ name: 'IOC:m1', initialPosition: 3 })],
        });

        expect(sim.get('IOC:m1')).toBe(3);
        expect(sim.get('IOC:m1.RBV')).toBe(3);
        expect(sim.get('IOC:m1.MOVN')).toBe(0);
    });

    it('advances readback toward setpoint and clears the moving flag at target', () => {
        const sim = createOphydSim({
            devices: [
                motor({
                    name: 'IOC:m1',
                    initialPosition: 0,
                    velocity: 1, // 1 unit / second
                    limits: [-10, 10],
                }),
            ],
        });

        sim.set('IOC:m1', 5);

        // 1s @ 1 unit/s → readback should reach 1, moving flag set.
        sim.advance(1000);
        expect(sim.get('IOC:m1.RBV')).toBeCloseTo(1, 4);
        expect(sim.get('IOC:m1.MOVN')).toBe(1);

        // 4 more seconds → readback should land at the setpoint.
        sim.advance(4000);
        expect(sim.get('IOC:m1.RBV')).toBeCloseTo(5, 4);

        // One more tick to settle: readback equals setpoint, MOVN clears.
        sim.advance(16);
        expect(sim.get('IOC:m1.RBV')).toBe(5);
        expect(sim.get('IOC:m1.MOVN')).toBe(0);
    });

    it('reverses direction when setpoint moves past current readback', () => {
        const sim = createOphydSim({
            devices: [motor({ name: 'IOC:m1', initialPosition: 0, velocity: 1 })],
        });

        sim.set('IOC:m1', 5);
        sim.advance(2000); // readback ≈ 2
        sim.set('IOC:m1', -3);
        sim.advance(1000);
        // Was around 2, now moving toward -3 at 1 unit/s → ~ 1 after 1s
        expect(sim.get('IOC:m1.RBV')).toBeLessThan(2);
    });
});
