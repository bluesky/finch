type HexapodHeaderProps = {
    /** Device PV prefix shown as the widget title. Defaults to 'SYM:HEX01'. */
    prefix?: string;
    /** Whether the controller panel is currently visible. */
    showController: boolean;
    /** Whether the plot panel is currently visible. */
    showPlot: boolean;
    /** Whether the about panel is currently visible. */
    showAbout: boolean;
    /** Whether the widget controls are locked. Affects the lock icon appearance. */
    isLocked: boolean;
    /** Callback to toggle the locked state. */
    onClickLock?: () => void;
    /** Callback to toggle the controller panel visibility. */
    onClickController?: () => void;
    /** Callback to toggle the plot panel visibility. */
    onClickPlot?: () => void;
    /** Callback to toggle the about panel visibility. */
    onClickAbout?: () => void;
};
export default function HexapodHeader({ prefix, showController, showPlot, showAbout, isLocked, onClickLock, onClickController, onClickPlot, onClickAbout, }: HexapodHeaderProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=HexapodHeader.d.ts.map