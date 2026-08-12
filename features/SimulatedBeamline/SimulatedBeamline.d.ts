type SimulatedBeamlineProps = {
    /** Additional CSS classes applied to the widget's root container. */
    className?: string;
};
/**
 * Self-contained simulated-beamline widget: bundles the Ophyd sim providers with
 * the endstation graphic, simulated detector, beamline device table, and the
 * beamstop-current trend plot — plus the beam-shutter control. Because it carries
 * its own sim transport and camera socket factory it can be dropped in anywhere
 * without external wiring; every panel reads and writes the same simulated
 * beamline, so moves in the table update the graphic, detector, and plot live.
 */
export default function SimulatedBeamline({ className }: SimulatedBeamlineProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SimulatedBeamline.d.ts.map