import { UseEndstationDisplayOptions } from './useEndstationDisplay';
type EndstationDisplayProps = UseEndstationDisplayOptions & {
    /** Classes applied to the root container — use this to set the background
     *  color and/or sizing (e.g. `bg-white w-[485px]`). */
    className?: string;
};
/**
 * Layered SVG graphic of the endstation. Stacks the beamline assets and drives
 * the light, shutter, and beamstop layers from live ophyd device state via
 * [useEndstationDisplay]. Purely presentational — all logic lives in the hook.
 */
export default function EndstationDisplay({ className, ...hookOptions }: EndstationDisplayProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=EndstationDisplay.d.ts.map