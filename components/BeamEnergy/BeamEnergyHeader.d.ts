type BeamEnergyHeaderProps = {
    /** Display title shown below the monochromator icon. */
    title: string;
    /** EPICS PV or device name shown as a subtitle below the title. */
    pv: string;
    /** Whether the controller section is currently visible. */
    showController: boolean;
    /** Whether the plot section is currently visible. */
    showPlot: boolean;
    /** Whether the about/debug section is currently visible. */
    showAbout: boolean;
    /** Whether the widget controls are locked. Affects the lock icon appearance. */
    isLocked: boolean;
    /** Callback to toggle the locked state. */
    handleToggleLock: () => void;
    /** Callback to toggle the controller section visibility. */
    handleToggleController: () => void;
    /** Callback to toggle the plot section visibility. */
    handleTogglePlot: () => void;
    /** Callback to toggle the about/debug section visibility. */
    handleToggleAbout: () => void;
    className?: string;
};
export default function BeamEnergyHeader({ showController, showPlot, showAbout, isLocked, handleToggleLock, handleToggleController, handleTogglePlot, handleToggleAbout, className }: BeamEnergyHeaderProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=BeamEnergyHeader.d.ts.map