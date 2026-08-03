import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import useOphydPVSocket from '@/api/ophyd/useOphydPVSocket';
import sampleHolderSvg from './assets/5_sample_holder.svg';

/** Intrinsic viewBox of the endstation canvas. X/Y offsets in SVG units convert
 *  to percentage transforms against these so motion scales with the rendered
 *  container width rather than the small graphic's own size. Matches the
 *  constants in [useEndstationDisplay]. */
const VIEW_W = 485;
const VIEW_H = 215;

/** Placement of the sample-holder graphic (a small standalone SVG, not a
 *  full-canvas layer) as percentages of the container. Its authored 33×29
 *  viewBox maps to ~6.8% width; left/top seat it on the beam between the mono
 *  and the beamstop. Nudge these to reposition the resting spot. */
const SAMPLE_HOLDER_STYLE = { left: '53.2%', top: '50%', width: '6.8%' } as const;

export type SampleHolderProps = {
    /** Sample X readback PV (mm). Defaults to the `beamstopBeamline` motor. */
    sampleXPV?: string;
    /** Sample Y readback PV (mm). Defaults to the `beamstopBeamline` motor. */
    sampleYPV?: string;
    /** SVG units the holder travels per mm of motor motion. Calibrate visually;
     *  defaults to 2. */
    pxPerMm?: number;
};

/** Convert an (x, y) offset in SVG units to a percentage `translate()` relative
 *  to the full canvas. Applied to a full-size wrapper so the percentages track
 *  the container, not the small graphic inside it. */
function svgTranslate(xSvg: number, ySvg: number): string {
    const xPct = (xSvg / VIEW_W) * 100;
    const yPct = (ySvg / VIEW_H) * 100;
    return `translate(${xPct}%, ${yPct}%)`;
}

/**
 * Sample-holder graphic that tracks its X/Y motor readbacks. Subscribes to the
 * sample stage PVs and slides the holder proportionally across the endstation
 * canvas. Mirrors the beamstop tracking in [useEndstationDisplay]; render it as
 * a stacked layer inside [EndstationDisplay].
 */
export default function SampleHolder({
    sampleXPV = 'bl531:sample_x_mm.RBV',
    sampleYPV = 'bl531:sample_y_mm.RBV',
    pxPerMm = 2,
}: SampleHolderProps = {}) {
    const deviceList = useMemo(() => [sampleXPV, sampleYPV], [sampleXPV, sampleYPV]);
    const { devices } = useOphydPVSocket(deviceList);

    const transform = useMemo(() => {
        const xMm = parseFloat(devices[sampleXPV]?.value as string) || 0;
        const yMm = parseFloat(devices[sampleYPV]?.value as string) || 0;
        // Positive X mm slides right; positive Y mm slides up (negative SVG y).
        return svgTranslate(xMm * pxPerMm, -yMm * pxPerMm);
    }, [devices, sampleXPV, sampleYPV, pxPerMm]);

    return (
        <div
            className={cn(
                'pointer-events-none absolute inset-0 h-full w-full select-none',
                'transition-transform duration-300',
            )}
            style={{ transform }}
        >
            <img
                src={sampleHolderSvg}
                alt="Sample holder"
                className="absolute"
                style={SAMPLE_HOLDER_STYLE}
            />
        </div>
    );
}
