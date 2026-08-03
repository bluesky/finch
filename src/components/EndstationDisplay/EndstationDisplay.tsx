import { cn } from '@/lib/utils';
import useEndstationDisplay, { type UseEndstationDisplayOptions } from './useEndstationDisplay';
import baseSvg from './assets/0_base.svg';
import lightBlockedSvg from './assets/1_light_blocked.svg';
import lightUnblockedSvg from './assets/1_light_unblocked.svg';
import shutterSvg from './assets/2_shutter_moveable.svg';
import beamstopSvg from './assets/3_beamstop_moveable.svg';
import monoLightSvg from './assets/4_light_mono_moveable.svg';
import SampleHolder from './SampleHolder';

type EndstationDisplayProps = UseEndstationDisplayOptions & {
    /** Classes applied to the root container — use this to set the background
     *  color and/or sizing (e.g. `bg-white w-[485px]`). */
    className?: string;
};

/** Shared positioning for every full-canvas stacked layer. */
const LAYER_CLASS = 'pointer-events-none absolute inset-0 h-full w-full select-none';

/**
 * Layered SVG graphic of the endstation. Stacks the beamline assets and drives
 * the light, shutter, and beamstop layers from live ophyd device state via
 * [useEndstationDisplay]. Purely presentational — all logic lives in the hook.
 */
export default function EndstationDisplay({ className, ...hookOptions }: EndstationDisplayProps) {
    const { lightLayer, monoVisible, shutterTransform, beamstopTransform } =
        useEndstationDisplay(hookOptions);

    return (
        <div
            className={cn('bg-sky-950 relative w-full overflow-hidden', className)}
            style={{ aspectRatio: '485 / 215' }}
        >
            {/* z0 — static base diagram */}
            <img src={baseSvg} alt="Endstation diagram" className={LAYER_CLASS} />
            {/* z1 — beam, blocked or reaching through */}
            <img
                src={lightLayer === 'blocked' ? lightBlockedSvg : lightUnblockedSvg}
                alt=""
                className={LAYER_CLASS}
            />
            {/* z2 — shutter, slides out of the beam when open */}
            <img
                src={shutterSvg}
                alt=""
                className={cn(LAYER_CLASS, 'transition-transform duration-300')}
                style={{ transform: shutterTransform }}
            />
            {/* z3 — beamstop, tracks its X/Y motor readbacks */}
            <img
                src={beamstopSvg}
                alt=""
                className={cn(LAYER_CLASS, 'transition-transform duration-300')}
                style={{ transform: beamstopTransform }}
            />
            {/* z4 — mono light, only while the beam is unblocked */}
            {monoVisible && <img src={monoLightSvg} alt="" className={LAYER_CLASS} />}
            {/* z5 — sample holder, tracks its X/Y motor readbacks */}
            <SampleHolder />
        </div>
    );
}
