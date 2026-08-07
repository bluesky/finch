import { useMemo } from 'react';
import { OphydSimProvider, createOphydSimTransport, beamstopBeamline } from '@/lib/ophyd-sim';
import { OphydTransportProvider } from '@/api/ophyd/OphydTransportProvider';
import useOphydPVSocket from '@/api/ophyd/useOphydPVSocket';
import EndstationDisplay from '@/components/EndstationDisplay/EndstationDisplay';
import TableDeviceControllerWithRBV from '@/components/TableDeviceControllerWithRBV';
import Shutter from '@/components/Shutter';

/** Writable motors whose readbacks the endstation graphic tracks. */
const MOVERS = [
    'bl531_xps2:beamstop_x_mm',
    'bl531_xps2:beamstop_y_mm',
    'bl531:sample_x_mm',
    'bl531:sample_y_mm',
];
const MOVERS_RBV = MOVERS.map((pv) => `${pv}.RBV`);

/** Live controls that drive the graphic: shutter + beamstop/sample X-Y motors. */
function EndstationControls() {
    const { devices, handleSetValueRequest, toggleDeviceLock, toggleExpand } =
        useOphydPVSocket(MOVERS);
    const { devices: devicesRBV } = useOphydPVSocket(MOVERS_RBV);
    return (
        <div className="flex w-full max-w-[600px] flex-col gap-4">
            {/* Shutter open/closed blocks or passes the beam in the graphic above. */}
            <Shutter className="w-full" />
            {/* Moving the beamstop or sample motors slides the matching marker. */}
            <TableDeviceControllerWithRBV
                devices={devices}
                devicesRBV={devicesRBV}
                handleSetValueRequest={handleSetValueRequest}
                toggleDeviceLock={toggleDeviceLock}
                toggleExpand={toggleExpand}
                collapsibleRelativeMove
            />
        </div>
    );
}

/**
 * The endstation / beamstop graphic (`EndstationDisplay`) plus the live controls
 * that drive it, wired to the `beamstopBeamline` sim and self-contained for
 * embedding at the top of the "Ophyd Sim" documentation page. The graphic and
 * controls share one sim, so opening the shutter or moving the beamstop / sample
 * motors updates the layered SVG live — no backend required.
 */
export default function EndstationDisplayDemo() {
    const transport = useMemo(() => createOphydSimTransport(beamstopBeamline), []);
    return (
        <OphydSimProvider sim={beamstopBeamline}>
            <OphydTransportProvider transport={transport}>
                <div className="flex flex-col items-center gap-4">
                    <EndstationDisplay className="w-full max-w-[600px] rounded" />
                    <EndstationControls />
                </div>
            </OphydTransportProvider>
        </OphydSimProvider>
    );
}
