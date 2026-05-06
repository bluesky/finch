type BeamEnergyControllerProps = {
    /** Current monochromator angle in degrees, used as the base for jog moves. */
    currentValueDegrees?: number;
    /** Called with the target angle in degrees when the user submits an absolute move. */
    onAbsoluteMove?: (newValueDegrees: number) => void;
    /** Called with a signed delta in degrees when the user submits a jog move. */
    onRelativeMove?: (deltaDegrees: number) => void;
    /** Called when the user clicks the stop button. */
    onStop?: () => void;
    /** When true, disables all controls and dims the controller UI. */
    isLocked?: boolean;
};
export default function BeamEnergyController({ currentValueDegrees: _currentValueDegrees, onAbsoluteMove, onRelativeMove, onStop, isLocked }: BeamEnergyControllerProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=BeamEnergyController.d.ts.map