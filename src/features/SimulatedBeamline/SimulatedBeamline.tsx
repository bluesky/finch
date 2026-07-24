import { OphydTransportProvider } from '@/api/ophyd/OphydTransportProvider';
import {
    OphydSimProvider,
    createOphydSimTransport,
    beamstopBeamline,
    simDetectorConfig,
    createSimDetectorCameraSocketFactory,
    SHUTTER_OPEN_VALUE,
} from '@/lib/ophyd-sim';
import { useMemo } from 'react';
import useOphydPVSocket from '@/api/ophyd/useOphydPVSocket';
import CameraCanvas from '@/components/Camera/CameraCanvas';
import Shutter from '@/components/Shutter';
import SignalMonitorPlotPV from '@/components/SignalMonitorPlotPV';
import EndstationDisplay from '@/components/EndstationDisplay/EndstationDisplay';
import TableDeviceControllerWithRBV from '@/components/TableDeviceControllerWithRBV';
import { cn } from '@/lib/utils';

/** Shared height for the device table and the beamstop-current plot beside it,
 *  so the two panels line up. Sized to fit the table's fixed rows. */
const PANEL_HEIGHT = 'h-[280px]';
/** Shared height for the endstation graphic and the detector canvas in the top row. */
const IMAGE_HEIGHT = 'h-[340px]';

/** Beamstop-current PV shown in the trend plot. */
const BEAMSTOP_CURRENT = 'bl201-beamstop:current';
/** Shutter analog-output PV (0 V open / 5 V closed) — matches the <Shutter /> default. */
const SHUTTER_PV = 'bl531:LJT4:1:AO0';

/**
 * Beam energy, sample X/Y, and beamstop X/Y — the writable beamline devices,
 * driven through the same sim transport that feeds EndstationDisplay and the
 * camera, so moves made here update those views live.
 */
const BEAMLINE_DEVICES = [
    'bl531_xps2:beamstop_x_mm',
    'bl531_xps2:beamstop_y_mm',
    'bl531:sample_x_mm',
    'bl531:sample_y_mm',
    'bl531:mono_energy_eV',
];
const BEAMLINE_DEVICES_RBV = [
    'bl531_xps2:beamstop_x_mm.RBV',
    'bl531_xps2:beamstop_y_mm.RBV',
    'bl531:sample_x_mm.RBV',
    'bl531:sample_y_mm.RBV',
    'bl531:mono_energy_eV.RBV',
];

function BeamlineDeviceTable() {
    const { devices, handleSetValueRequest, toggleDeviceLock, toggleExpand } =
        useOphydPVSocket(BEAMLINE_DEVICES);

    const { devices: devicesRBV } = useOphydPVSocket(BEAMLINE_DEVICES_RBV);
    return (
        <TableDeviceControllerWithRBV
            devices={devices}
            devicesRBV={devicesRBV}
            handleSetValueRequest={handleSetValueRequest}
            toggleDeviceLock={toggleDeviceLock}
            toggleExpand={toggleExpand}
            collapsibleRelativeMove
            className={PANEL_HEIGHT}
        />
    );
}

/**
 * Simulated detector, paused whenever the beam shutter is not open. Subscribes
 * to the shutter PV and hands `CameraCanvas` a controlled `paused` flag so the
 * stream stops when the shutter closes and resumes when it reopens.
 */
function SimulatedDetector() {
    const deviceList = useMemo(() => [SHUTTER_PV], []);
    const { devices } = useOphydPVSocket(deviceList);
    const shutterOpen = Number(devices[SHUTTER_PV]?.value) === SHUTTER_OPEN_VALUE;
    return (
        <div className="[&_canvas]:h-[340px] [&_canvas]:w-[340px]">
            <CameraCanvas prefix="13SIM1" canvasSize="medium" paused={!shutterOpen} />
        </div>
    );
}

/**
 * Beam-shutter control anchored to the top-left of the beamline cartoon. Because it
 * lives inside the widget's Ophyd sim providers it drives the simulated beamline
 * directly; `absolute` positioning pins it to the top-left of the endstation graphic's
 * `relative` container. Drives bl531:LJT4:1:AO0; closing it (5 V) pauses the detector
 * and zeroes the diode current.
 */
function FloatingShutter() {
    return (
        <Shutter className="absolute left-0 top-0 z-50 w-72 scale-90" classNameContent="py-0.5" />
    );
}

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
                            <FloatingShutter />
                            <EndstationDisplay
                                className={`${IMAGE_HEIGHT} w-auto max-w-full rounded`}
                            />
                        </div>
                        <SimulatedDetector />
                    </div>
                    {/* Bottom row: device table beside the live beamstop-current trend. */}
                    <div className="flex flex-wrap items-start gap-4">
                        <BeamlineDeviceTable />
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
