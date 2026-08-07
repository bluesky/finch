import { useMemo } from 'react';
import { OphydSimProvider, createOphydSimTransport, beamstopBeamline } from '@/lib/ophyd-sim';
import { OphydTransportProvider } from '@/api/ophyd/OphydTransportProvider';
import EndstationDisplay from '@/components/EndstationDisplay/EndstationDisplay';

/**
 * The endstation / beamstop graphic (`EndstationDisplay`) wired to the
 * `beamstopBeamline` sim, self-contained for embedding at the top of the
 * "Ophyd Sim" documentation page. The layered SVG shows the beam, shutter, and
 * beamstop marker driven by live sim state — no backend required.
 */
export default function EndstationDisplayDemo() {
    const transport = useMemo(() => createOphydSimTransport(beamstopBeamline), []);
    return (
        <OphydSimProvider sim={beamstopBeamline}>
            <OphydTransportProvider transport={transport}>
                <EndstationDisplay className="w-full max-w-[600px] rounded" />
            </OphydTransportProvider>
        </OphydSimProvider>
    );
}
