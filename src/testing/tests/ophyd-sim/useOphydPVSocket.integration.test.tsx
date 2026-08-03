import { describe, it, expect } from 'vitest';
import { render, act, screen } from '@testing-library/react';
import { createOphydSim } from '../../../lib/ophyd-sim/core/createOphydSim';
import { motor } from '../../../lib/ophyd-sim/devices/motor';
import { createOphydSimTransport } from '../../../lib/ophyd-sim/transport/createOphydSimTransport';
import { OphydTransportProvider } from '../../../api/ophyd/OphydTransportProvider';
import useOphydPVSocket from '../../../api/ophyd/useOphydPVSocket';

function MotorReadout({ label }: { label: string }) {
    const { devices } = useOphydPVSocket(['IOC:m1.RBV']);
    const value = devices['IOC:m1.RBV']?.value;
    return (
        <div>
            <span data-testid={`${label}-rbv`}>{String(value)}</span>
        </div>
    );
}

function MotorControl({ initialTarget }: { initialTarget: number }) {
    const { devices, handleSetValueRequest } = useOphydPVSocket(['IOC:m1', 'IOC:m1.RBV']);
    return (
        <div>
            <span data-testid="control-rbv">{String(devices['IOC:m1.RBV']?.value)}</span>
            <button onClick={() => handleSetValueRequest('IOC:m1', initialTarget)}>move</button>
        </div>
    );
}

describe('useOphydPVSocket + ophyd-sim integration', () => {
    it('two hooks subscribed to the same PV observe the same motion', async () => {
        const sim = createOphydSim({
            devices: [motor({ name: 'IOC:m1', velocity: 1, limits: [-10, 10] })],
        });
        const transport = createOphydSimTransport(sim);

        render(
            <OphydTransportProvider transport={transport}>
                <MotorControl initialTarget={3} />
                <MotorReadout label="readout" />
            </OphydTransportProvider>,
        );

        // Both consumers start at 0.
        expect(screen.getByTestId('control-rbv').textContent).toBe('0');
        expect(screen.getByTestId('readout-rbv').textContent).toBe('0');

        // Trigger a move via one hook.
        act(() => {
            screen.getByText('move').click();
        });

        // Advance the simulator past the time it needs to reach the target.
        act(() => {
            sim.advance(5000);
            sim.advance(16);
        });

        expect(Number(screen.getByTestId('control-rbv').textContent)).toBeCloseTo(3, 4);
        expect(Number(screen.getByTestId('readout-rbv').textContent)).toBeCloseTo(3, 4);
    });
});
