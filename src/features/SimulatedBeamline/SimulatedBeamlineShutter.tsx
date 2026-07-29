import Shutter from '@/components/Shutter';

/**
 * Beam-shutter control anchored to the top-left of the beamline cartoon. Because it
 * lives inside the widget's Ophyd sim providers it drives the simulated beamline
 * directly; `absolute` positioning pins it to the top-left of the endstation graphic's
 * `relative` container. Drives bl531:LJT4:1:AO0; closing it (5 V) pauses the detector
 * and zeroes the diode current.
 */
export default function SimulatedBeamlineShutter() {
    return (
        <Shutter className="absolute left-0 top-0 z-50 w-72 scale-90" classNameContent="py-0.5" />
    );
}
