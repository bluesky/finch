import { useEffect, useMemo, useRef, useState } from 'react';
import PlotlyScatter from '@/components/PlotlyScatter';
import useOphydPVSocket from '@/api/ophyd/useOphydPVSocket';
import { beamstopCurrentModel, ENERGY_MIN_EV, ENERGY_MAX_EV } from '@/lib/ophyd-sim';
import { recencyOpacities } from '@/utils/plotGenerators';
import { cn } from '@/lib/utils';

export type EnergyVsCurrentPlotPVProps = {
    /** Writable beam-energy PV (x-axis of the plot). */
    energyPv: string;
    /** Beamstop diode current PV (y-axis of the plot). */
    currentPv: string;
    /** Beamstop X motor readback PV — positions the expected curve. */
    beamstopXRbvPv: string;
    /** Beamstop Y motor readback PV — positions the expected curve. */
    beamstopYRbvPv: string;
    /** Max measured points retained before the oldest is dropped. Defaults to 60. */
    numVisiblePoints?: number;
    /** Interval in ms between measured samples. Defaults to 500. */
    pollingIntervalMs?: number;
    /** Number of points in the theoretical expected curve. Defaults to 100. */
    expectedCurvePoints?: number;
    className?: string;
};

type Pair = { energy: number; current: number };

/**
 * Live "Beam Energy vs Beamstop Current" plot.
 *
 * Overlays two traces, mirroring the reference diagram:
 *  - Measured: live (energy, current) samples accumulating as the user sweeps
 *    energy, kept in a rolling window (markers).
 *  - Expected: the noise-free `beamstopCurrentModel` swept across the energy
 *    range at the *current* beamstop position (dashed line). It re-shapes when
 *    the beamstop moves.
 */
export default function EnergyVsCurrentPlotPV({
    energyPv,
    currentPv,
    beamstopXRbvPv,
    beamstopYRbvPv,
    numVisiblePoints = 60,
    pollingIntervalMs = 500,
    expectedCurvePoints = 100,
    className,
}: EnergyVsCurrentPlotPVProps) {
    const { devices } = useOphydPVSocket([energyPv, currentPv, beamstopXRbvPv, beamstopYRbvPv]);

    const [measured, setMeasured] = useState<Pair[]>([]);

    // Refs so the sampling interval reads the latest values without resetting.
    const energyRef = useRef<number | null>(null);
    const currentRef = useRef<number | null>(null);
    const energyValue = devices[energyPv]?.value;
    const currentValue = devices[currentPv]?.value;
    energyRef.current = typeof energyValue === 'number' ? energyValue : null;
    currentRef.current = typeof currentValue === 'number' ? currentValue : null;

    useEffect(() => {
        const interval = setInterval(() => {
            const energy = energyRef.current;
            const current = currentRef.current;
            if (energy === null || current === null) return;
            setMeasured((prev) => {
                const next = [...prev, { energy, current }];
                if (next.length > numVisiblePoints) next.shift();
                return next;
            });
        }, pollingIntervalMs);
        return () => clearInterval(interval);
    }, [numVisiblePoints, pollingIntervalMs]);

    const beamstopX = devices[beamstopXRbvPv]?.value;
    const beamstopY = devices[beamstopYRbvPv]?.value;

    // Expected curve at the current beamstop position, swept across energy.
    const expected = useMemo(() => {
        const x = typeof beamstopX === 'number' ? beamstopX : 0;
        const y = typeof beamstopY === 'number' ? beamstopY : 0;
        const xs: number[] = [];
        const ys: number[] = [];
        const steps = Math.max(2, expectedCurvePoints);
        for (let i = 0; i < steps; i++) {
            const energyEV = ENERGY_MIN_EV + ((ENERGY_MAX_EV - ENERGY_MIN_EV) * i) / (steps - 1);
            xs.push(energyEV);
            ys.push(beamstopCurrentModel({ x, y, energyEV }));
        }
        return { xs, ys };
    }, [beamstopX, beamstopY, expectedCurvePoints]);

    const data = useMemo(
        () => [
            {
                x: expected.xs,
                y: expected.ys,
                type: 'scatter' as const,
                mode: 'lines' as const,
                name: 'Expected',
                line: { color: '#082f49', dash: 'dash' as const },
            },
            {
                x: measured.map((p) => p.energy),
                y: measured.map((p) => p.current),
                type: 'scatter' as const,
                mode: 'markers' as const,
                name: 'Measured',
                // Fade older samples so the newest reading stands out.
                marker: { color: '#0e7490', size: 7, opacity: recencyOpacities(measured.length) },
            },
        ],
        [expected, measured],
    );

    return (
        <PlotlyScatter
            data={data}
            className={cn('h-96', className)}
            title="Beam Energy vs Beamstop Current"
            xAxisTitle="Beam Energy (eV)"
            yAxisTitle="Beamstop Current (A)"
            xAxisRange={[ENERGY_MIN_EV, ENERGY_MAX_EV]}
        />
    );
}
