export type BeamEnergyOphydProps = {
    /** Ophyd device name for the beam energy signal. Defaults to 'mono_energy'. */
    deviceName?: string;
    /** Display title shown in the widget header. Defaults to 'Beam Energy'. */
    title?: string;
    /** Angular offset in degrees applied when converting mono angle to beam energy. */
    thetaOffsetDeg?: number;
    /** WebSocket server URL. When omitted, uses the application default. */
    wsUrl?: string;
    /** Additional CSS class names to apply to the component. */
    className?: string;
};
export default function BeamEnergyOphyd({ deviceName, title, thetaOffsetDeg: _thetaOffsetDeg, wsUrl, className }: BeamEnergyOphydProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=BeamEnergyOphyd.d.ts.map