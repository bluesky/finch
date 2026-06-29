import { OphydTransportProvider } from '@/api/ophyd/OphydTransportProvider';
import {
    OphydSimProvider,
    createOphydSimTransport,
    beamstopBeamline,
    simDetectorConfig,
    createSimDetectorCameraSocketFactory,
} from '@/lib/ophyd-sim';
import { useMemo } from 'react';
import Beamstop from '@/features/Beamstop';
import CameraCanvas from '@/components/Camera/CameraCanvas';

function TestPageBody() {
    return (
        <div className="flex flex-col items-center justify-start gap-6 py-4">
            <Beamstop
                stackVertical={false}
                enableBestOption={true}
                beamstopXTitle="Beamstop - X"
                beamstopYTitle="Beamstop - Y"
                beamstopEnergyTitle="Beam Energy"
                beamstopCurrentName="bl201-beamstop:current"
                beamstopXName="bl531_xps2:beamstop_x_mm"
                beamstopYName="bl531_xps2:beamstop_y_mm"
                beamstopEnergyName="bl531:mono_energy_eV"
            />
            {/* No socketFactory prop — the sim factory is supplied via context below. */}
            <CameraCanvas prefix="13SIM1" canvasSize="medium" />
        </div>
    );
}

export default function TestPage() {
    const transport = useMemo(() => createOphydSimTransport(beamstopBeamline), []);
    // Camera frames are driven by the '13SIM1' detector in the same sim, so the
    // Beamstop energy control modulates the image opacity live.
    const cameraSocketFactory = useMemo(
        () => createSimDetectorCameraSocketFactory(beamstopBeamline, simDetectorConfig),
        [],
    );
    return (
        <OphydSimProvider sim={beamstopBeamline}>
            <OphydTransportProvider transport={transport} cameraSocketFactory={cameraSocketFactory}>
                <TestPageBody />
            </OphydTransportProvider>
        </OphydSimProvider>
    );
}
