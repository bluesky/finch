import { HexapodMovePositionForm, HexapodRBVs } from './types/hexapodTypes';
type HexapodControllerProps = {
    /** Current readback values for all six axes, used to populate the Current Position column. */
    hexapodRBVs: HexapodRBVs;
    /** Callback invoked when a move is requested. Receives the form values and whether the move is relative. */
    onStartClick: (movePositionForm: HexapodMovePositionForm, isRelative: boolean) => void;
    /** Callback invoked when the STOP button is clicked to halt any in-progress motion. */
    onStopClick: () => void;
    /** When true, disables all form inputs and prevents move commands. */
    isLocked?: boolean;
};
export default function HexapodController({ hexapodRBVs, onStartClick, onStopClick, isLocked, }: HexapodControllerProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=HexapodController.d.ts.map