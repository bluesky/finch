import { useMemo } from 'react';
import {
    OphydSimProvider,
    createOphydSim,
    createOphydSimTransport,
    motor,
    signal,
    gaussian,
    randomNoise,
    useSimSignal,
} from '@/lib/ophyd-sim';
import { OphydTransportProvider } from '@/api/ophyd/OphydTransportProvider';
import useOphydPVSocket from '@/api/ophyd/useOphydPVSocket';
import DeviceControllerBox from '@/components/DeviceControllerBox';
import TableDeviceControllerWithRBV from '@/components/TableDeviceControllerWithRBV';

/**
 * Live, self-contained demo embedded in the "Ophyd Sim" documentation page.
 *
 * It builds its own simulator (two motors plus a diode signal that peaks when
 * `demo:m1` is near 2 mm) and mounts the same two providers the rest of finch
 * uses — so the motor-controller components below are driven entirely in the
 * browser, no IOC or WebSocket backend required. Moving a motor animates its
 * readback and, for `demo:m1`, updates the derived diode reading live.
 */
const demoSim = createOphydSim({
    devices: [
        motor({ name: 'demo:m1', initialPosition: 0, velocity: 2, limits: [-10, 10], units: 'mm' }),
        motor({
            name: 'demo:m2',
            initialPosition: -3,
            velocity: 4,
            limits: [-10, 10],
            units: 'mm',
        }),
        // Diode current, peaked when demo:m1 is near 2 mm, with measurement noise.
        signal({
            name: 'demo:I0',
            units: 'arb.',
            periodMs: 100,
            dependsOn: ['demo:m1.RBV'],
            value: ({ get, random }) =>
                1000 * gaussian({ x: get.number('demo:m1.RBV'), center: 2, sigma: 0.5 }) +
                randomNoise({ random, sigma: 5 }),
        }),
    ],
});

const SETPOINTS = ['demo:m1', 'demo:m2'];
const READBACKS = ['demo:m1.RBV', 'demo:m2.RBV'];

/** Small readout of the derived diode signal, updated straight from the sim. */
function DiodeReadout() {
    const value = useSimSignal('demo:I0');
    return (
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            Derived diode <code>demo:I0</code>:{' '}
            <strong>{typeof value === 'number' ? value.toFixed(1) : '—'}</strong> arb. — climbs as{' '}
            <code>demo:m1</code> approaches 2&nbsp;mm.
        </p>
    );
}

function DemoContent() {
    const { devices, handleSetValueRequest, toggleDeviceLock, toggleExpand } =
        useOphydPVSocket(SETPOINTS);
    const { devices: devicesRBV } = useOphydPVSocket(READBACKS);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '640px' }}>
            <div>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                    Motor controller — <code>demo:m1</code> (DeviceControllerBox)
                </p>
                <DeviceControllerBox
                    device={devices['demo:m1']}
                    deviceRBV={devicesRBV['demo:m1.RBV']}
                    handleSetValueRequest={handleSetValueRequest}
                    handleLockClick={toggleDeviceLock}
                />
                <div style={{ marginTop: '0.5rem' }}>
                    <DiodeReadout />
                </div>
            </div>
            <div>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                    Motor table — <code>demo:m1</code> + <code>demo:m2</code>{' '}
                    (TableDeviceControllerWithRBV)
                </p>
                <TableDeviceControllerWithRBV
                    devices={devices}
                    devicesRBV={devicesRBV}
                    handleSetValueRequest={handleSetValueRequest}
                    toggleDeviceLock={toggleDeviceLock}
                    toggleExpand={toggleExpand}
                    collapsibleRelativeMove
                />
            </div>
        </div>
    );
}

export default function OphydSimDemo() {
    const transport = useMemo(() => createOphydSimTransport(demoSim), []);
    return (
        <OphydSimProvider sim={demoSim}>
            <OphydTransportProvider transport={transport}>
                <DemoContent />
            </OphydTransportProvider>
        </OphydSimProvider>
    );
}
