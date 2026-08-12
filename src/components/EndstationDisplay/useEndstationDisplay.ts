import { useMemo } from 'react';
import useOphydPVSocket from '@/api/ophyd/useOphydPVSocket';

/** Intrinsic viewBox of every layer SVG. Offsets in SVG units convert to
 *  percentage transforms against these so motion scales with the rendered
 *  container width. */
const VIEW_W = 485;
const VIEW_H = 215;

/** Constant upward nudge (SVG units) applied to the shutter's resting position. */
const SHUTTER_BASE_Y = -16;

/** Constant nudge (SVG units) that seats the beamstop marker on the beam at the
 *  scenario's resting motor position. Without it the beamstop's authored spot is
 *  pulled up-left by the default motor offset and the beam overshoots it. */
const BEAMSTOP_BASE_X = -5;
const BEAMSTOP_BASE_Y = 3;

/** Which beam graphic to show: blocked stops short of the sample, unblocked
 *  reaches through. */
export type LightLayer = 'blocked' | 'unblocked';

export type UseEndstationDisplayOptions = {
    /** Shutter analog-output PV. Defaults to the `beamstopBeamline` shutter. */
    shutterPV?: string;
    /** PV value that means the shutter is open (beam passes). Defaults to 0. */
    shutterOpenValue?: number;
    /** Beamstop X readback PV (mm). Defaults to the `beamstopBeamline` motor. */
    beamstopXPV?: string;
    /** Beamstop Y readback PV (mm). Defaults to the `beamstopBeamline` motor. */
    beamstopYPV?: string;
    /** SVG units the beamstop layer travels per mm of motor motion. Calibrate
     *  visually; defaults to 2. */
    pxPerMm?: number;
    /** SVG units the shutter layer slides out of the beam when open. Calibrate
     *  visually; defaults to 24. */
    shutterOpenOffset?: number;
};

export type EndstationDisplayState = {
    /** Beam graphic to render for layer 1. */
    lightLayer: LightLayer;
    /** Whether the mono-light layer (layer 4) is visible — only when unblocked. */
    monoVisible: boolean;
    /** CSS `transform` for the shutter layer. */
    shutterTransform: string;
    /** CSS `transform` for the beamstop layer. */
    beamstopTransform: string;
};

/** Convert an (x, y) offset in SVG units to a percentage `translate()` so the
 *  layer moves proportionally regardless of the rendered size. */
function svgTranslate(xSvg: number, ySvg: number): string {
    const xPct = (xSvg / VIEW_W) * 100;
    const yPct = (ySvg / VIEW_H) * 100;
    return `translate(${xPct}%, ${yPct}%)`;
}

/**
 * Derive the visual state of the endstation from live ophyd device values.
 *
 * Subscribes to the shutter and beamstop readback PVs and maps them to the
 * layer state consumed by EndstationDisplay. All logic lives here; the
 * component only renders. Mirrors the value-parsing pattern in
 * [src/components/Shutter.tsx].
 */
export default function useEndstationDisplay({
    shutterPV = 'bl531:LJT4:1:AO0',
    shutterOpenValue = 0,
    beamstopXPV = 'bl531_xps2:beamstop_x_mm.RBV',
    beamstopYPV = 'bl531_xps2:beamstop_y_mm.RBV',
    pxPerMm = 2,
    shutterOpenOffset = 24,
}: UseEndstationDisplayOptions = {}): EndstationDisplayState {
    const deviceList = useMemo(
        () => [shutterPV, beamstopXPV, beamstopYPV],
        [shutterPV, beamstopXPV, beamstopYPV],
    );
    const { devices } = useOphydPVSocket(deviceList);

    const isOpen = useMemo(() => {
        const value = parseFloat(devices[shutterPV]?.value as string);
        return value === shutterOpenValue;
    }, [devices, shutterPV, shutterOpenValue]);

    const beamstopTransform = useMemo(() => {
        const xMm = parseFloat(devices[beamstopXPV]?.value as string) || 0;
        const yMm = parseFloat(devices[beamstopYPV]?.value as string) || 0;
        // Positive X mm slides right; positive Y mm slides up (negative SVG y).
        // The base nudge seats the resting position on the beam.
        return svgTranslate(BEAMSTOP_BASE_X + xMm * pxPerMm, BEAMSTOP_BASE_Y - yMm * pxPerMm);
    }, [devices, beamstopXPV, beamstopYPV, pxPerMm]);

    // Sit the shutter a little above its authored position, then slide it down
    // and out of the beam when open.
    const shutterTransform = useMemo(
        () => svgTranslate(0, SHUTTER_BASE_Y + (isOpen ? shutterOpenOffset : 0)),
        [isOpen, shutterOpenOffset],
    );

    return {
        lightLayer: isOpen ? 'unblocked' : 'blocked',
        monoVisible: isOpen,
        shutterTransform,
        beamstopTransform,
    };
}
