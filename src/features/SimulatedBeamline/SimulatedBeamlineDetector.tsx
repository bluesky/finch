import { useMemo } from 'react';
import useOphydPVSocket from '@/api/ophyd/useOphydPVSocket';
import CameraCanvas from '@/components/Camera/CameraCanvas';
import { SHUTTER_OPEN_VALUE } from '@/lib/ophyd-sim';

/** Shutter analog-output PV (0 V open / 5 V closed) — matches the <Shutter /> default. */
const SHUTTER_PV = 'bl531:LJT4:1:AO0';

/**
 * Simulated detector, paused whenever the beam shutter is not open. Subscribes
 * to the shutter PV and hands `CameraCanvas` a controlled `paused` flag so the
 * stream stops when the shutter closes and resumes when it reopens.
 */
export default function SimulatedBeamlineDetector() {
    const deviceList = useMemo(() => [SHUTTER_PV], []);
    const { devices } = useOphydPVSocket(deviceList);
    const shutterOpen = Number(devices[SHUTTER_PV]?.value) === SHUTTER_OPEN_VALUE;
    return (
        <div className="[&_canvas]:h-[340px] [&_canvas]:w-[340px]">
            <CameraCanvas prefix="13SIM1" canvasSize="medium" paused={!shutterOpen} />
        </div>
    );
}
