export type BeamEnergyProps = {
    /** EPICS PV for the monochromator angle (RBV). Defaults to 'bl531_xps1:mono_angle_deg'. */
    pv?: string;
    /** Display title shown in the widget header. Defaults to 'Beam Energy'. */
    title?: string;
    /** Angular offset in degrees applied when converting mono angle to beam energy. */
    thetaOffsetDeg?: number;
    /** WebSocket server URL. When omitted, uses the application default. */
    wsUrl?: string;
    /** When true, skips the WebSocket connection and drives the display with a simulated device. */
    demo?: boolean;
    /** Additional CSS class names to apply to the component. */
    className?: string;
};
export default function BeamEnergyPV({ pv, title, thetaOffsetDeg, wsUrl, demo, className }: BeamEnergyProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=BeamEnergyPV.d.ts.map