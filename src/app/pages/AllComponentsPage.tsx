import { useMemo, useState } from 'react';
import ComponentViewerExampleReal from '@/features/ComponentViewer/ComponentViewerExampleReal';
import ComponentViewerExampleSim from '@/features/ComponentViewer/ComponentViewerExampleSim';
import { OphydTransportProvider } from '@/api/ophyd/OphydTransportProvider';
import { OphydSimProvider, createOphydSimTransport, hexapodBeamline } from '@/lib/ophyd-sim';
import { Cube, CubeTransparent } from '@phosphor-icons/react';

export default function AllComponentsPage() {
    const [mode, setMode] = useState<'real' | 'sim'>('sim');
    // The sim <Hexapod /> connects through useOphydSocket, so it needs a sim
    // transport in context — otherwise it opens a real WebSocket. Scope the
    // providers to the sim view only, so real mode keeps its live backend.
    const hexapodTransport = useMemo(() => createOphydSimTransport(hexapodBeamline), []);

    return (
        <section className="flex flex-col h-full overflow-auto space-y-8">
            <div className="flex justify-center space-x-24 pt-8">
                <button
                    className="flex flex-col items-center gap-1 cursor-pointer"
                    onClick={() => setMode('sim')}
                >
                    <CubeTransparent
                        size={mode === 'sim' ? 48 : 44}
                        className={mode === 'sim' ? 'text-sky-700' : 'text-slate-400'}
                    />
                    <span
                        className={`text-lg ${mode === 'sim' ? 'text-sky-700 font-semibold' : 'text-slate-400'}`}
                    >
                        Simulated Devices
                    </span>
                </button>
                <button
                    className="flex flex-col items-center gap-1 cursor-pointer"
                    onClick={() => setMode('real')}
                >
                    <Cube
                        size={mode === 'real' ? 48 : 44}
                        className={mode === 'real' ? 'text-sky-700' : 'text-slate-400'}
                    />
                    <span
                        className={`text-lg ${mode === 'real' ? 'text-sky-700 font-semibold' : 'text-slate-400'}`}
                    >
                        Real Beamline Devices
                    </span>
                </button>
            </div>
            {mode === 'real' ? (
                <ComponentViewerExampleReal />
            ) : (
                <OphydSimProvider sim={hexapodBeamline}>
                    <OphydTransportProvider transport={hexapodTransport}>
                        <ComponentViewerExampleSim />
                    </OphydTransportProvider>
                </OphydSimProvider>
            )}
        </section>
    );
}
