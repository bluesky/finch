import { OphydTransportProvider } from '@/api/ophyd/OphydTransportProvider';
import {
    OphydSimProvider,
    createOphydSimTransport,
    beamstopBeamline,
    simDetectorConfig,
    createSimDetectorCameraSocketFactory,
} from '@/lib/ophyd-sim';
import { useMemo } from 'react';
import SignalMonitorPlotPV from '@/components/SignalMonitorPlotPV';
import EndstationDisplay from '@/components/EndstationDisplay/EndstationDisplay';
import SimulatedBeamlineDeviceTable from './SimulatedBeamlineDeviceTable';
import SimulatedBeamlineDetector from './SimulatedBeamlineDetector';
import SimulatedBeamlineShutter from './SimulatedBeamlineShutter';
import { cn } from '@/lib/utils';

/** Shared height for the device table and the beamstop-current plot beside it,
 *  so the two panels line up. Sized to fit the table's fixed rows. */
const PANEL_HEIGHT = 'h-[280px]';
/** Shared height for the endstation graphic and the detector canvas in the top row. */
const IMAGE_HEIGHT = 'h-[340px]';

/** Beamstop-current PV shown in the trend plot. */
const BEAMSTOP_CURRENT = 'bl201-beamstop:current';

type SimulatedBeamlineProps = {
    /** Additional CSS classes applied to the widget's root container. */
    className?: string;
};

/**
 * Self-contained simulated-beamline widget: bundles the Ophyd sim providers with
 * the endstation graphic, simulated detector, beamline device table, and the
 * beamstop-current trend plot — plus the beam-shutter control. Because it carries
 * its own sim transport and camera socket factory it can be dropped in anywhere
 * without external wiring; every panel reads and writes the same simulated
 * beamline, so moves in the table update the graphic, detector, and plot live.
 */
export default function SimulatedBeamline({ className }: SimulatedBeamlineProps) {
    const transport = useMemo(() => createOphydSimTransport(beamstopBeamline), []);
    // Camera frames are driven by the '13SIM1' detector in the same sim, so the
    // energy control in the device table modulates the image live.
    const cameraSocketFactory = useMemo(
        () => createSimDetectorCameraSocketFactory(beamstopBeamline, simDetectorConfig),
        [],
    );

    return (
        <OphydSimProvider sim={beamstopBeamline}>
            <OphydTransportProvider transport={transport} cameraSocketFactory={cameraSocketFactory}>
                <div className={cn('flex flex-col gap-4 p-4', className)}>
                    {/* Top row: endstation graphic beside the simulated detector, both
                     * pinned to the same height. Wraps on narrow widths. Closing the
                     * shutter (5 V) pauses the detector and zeroes the diode current. */}
                    <div className="flex flex-wrap items-start gap-4">
                        <div className="relative">
                            <SimulatedBeamlineShutter />
                            <EndstationDisplay
                                className={`${IMAGE_HEIGHT} w-auto max-w-full rounded`}
                            />
                        </div>
                        <SimulatedBeamlineDetector />
                    </div>
                    {/* Bottom row: device table beside the live beamstop-current trend. */}
                    <div className="flex flex-wrap items-start gap-4">
                        <SimulatedBeamlineDeviceTable className={PANEL_HEIGHT} />
                        <SignalMonitorPlotPV
                            pv={BEAMSTOP_CURRENT}
                            className={`${PANEL_HEIGHT} min-w-96 flex-1`}
                            numVisiblePoints={200}
                            tickTextIntervalSeconds={30}
                        />
                    </div>
                </div>
            </OphydTransportProvider>
        </OphydSimProvider>
    );
}
