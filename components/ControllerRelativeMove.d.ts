export type ControllerRelativeMoveProps = {
    /** Called when the user clicks a direction arrow. Receives the computed target value (currentValue ± increment), or null if either value is unset. */
    handleEnter?: (input: number | null) => void;
    /** Label displayed alongside the resultant text (e.g. units like "mm"). */
    inputLabel?: string;
    /** Additional CSS classes applied to the inner input element. */
    classNameInput?: string;
    /** Additional CSS classes applied to the resultant value text elements. */
    resultantTextClassName?: string;
    /** Additional CSS classes applied to the root wrapper element. */
    className?: string;
    /** The current device value used as the base for computing the relative move target. */
    currentValue: number | null;
    /** Disables interaction and applies dimmed styling when true. */
    locked?: boolean;
};
export default function ControllerRelativeMove({ handleEnter, inputLabel, classNameInput, className, currentValue, resultantTextClassName, locked, ...props }: ControllerRelativeMoveProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ControllerRelativeMove.d.ts.map