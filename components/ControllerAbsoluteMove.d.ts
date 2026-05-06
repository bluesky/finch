export type ControllerAbsoluteMoveProps = {
    /** Called when the user submits a value via the arrow button or Enter key. Receives the current input value, or null if empty. */
    handleEnter?: (input: number | null) => void;
    /** Label displayed next to the input (e.g. units like "mm"). */
    inputLabel?: string;
    /** Additional CSS classes applied to the inner input element. */
    classNameInput?: string;
    /** Additional CSS classes applied to the root wrapper element. */
    className?: string;
    /** Disables interaction and applies dimmed styling when true. */
    locked?: boolean;
};
export default function ControllerAbsoluteMove({ handleEnter, inputLabel, classNameInput, className, locked, ...props }: ControllerAbsoluteMoveProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ControllerAbsoluteMove.d.ts.map