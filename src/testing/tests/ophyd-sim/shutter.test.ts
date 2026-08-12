import { describe, it, expect } from 'vitest';
import { createOphydSim } from '../../../lib/ophyd-sim/core/createOphydSim';
import { signal } from '../../../lib/ophyd-sim/devices/signal';
import {
    shutter,
    SHUTTER_OPEN_VALUE,
    SHUTTER_CLOSED_VALUE,
} from '../../../lib/ophyd-sim/devices/shutter';

const PV = 'bl531:LJT4:1:AO0';

describe('shutter', () => {
    it('seeds a writable analog PV, open by default', () => {
        const sim = createOphydSim({ devices: [shutter({ name: PV })] });

        expect(sim.get(PV)).toBe(SHUTTER_OPEN_VALUE);
        expect(sim.metadata(PV)?.write_access).toBe(true);
        expect(sim.metadata(PV)?.units).toBe('V');
    });

    it('seeds the closed value when initial is "closed"', () => {
        const sim = createOphydSim({ devices: [shutter({ name: PV, initial: 'closed' })] });

        expect(sim.get(PV)).toBe(SHUTTER_CLOSED_VALUE);
    });

    it('honors custom open/closed values', () => {
        const sim = createOphydSim({
            devices: [shutter({ name: PV, openValue: 1, closedValue: 10, initial: 'closed' })],
        });

        expect(sim.get(PV)).toBe(10);
    });

    it('gates a downstream signal off unless the shutter is open', () => {
        const sim = createOphydSim({
            devices: [
                shutter({ name: PV, initial: 'open' }),
                signal({
                    name: 'diode',
                    dependsOn: [PV],
                    // Beam reaches the diode only at the open value.
                    value: ({ get }) => (get.number(PV) === SHUTTER_OPEN_VALUE ? 100 : 0),
                }),
            ],
        });

        expect(sim.get('diode')).toBe(100);

        sim.set(PV, SHUTTER_CLOSED_VALUE);
        expect(sim.get('diode')).toBe(0);

        sim.set(PV, SHUTTER_OPEN_VALUE);
        expect(sim.get('diode')).toBe(100);
    });
});
