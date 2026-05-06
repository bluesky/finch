type InputNumberProps = {
    /** Label displayed beside the input. */
    label?: string;
    /** Side on which the label is rendered relative to the input. Defaults to 'left'. */
    labelPosition?: 'left' | 'right';
    /** Called whenever the input value changes. Receives the parsed number, or null if the field is empty. */
    onChange?: (input: number | null) => void;
    /** Warning text shown below the input when isWarningVisible is true. */
    warningMessage?: string;
    /** When true, renders the warningMessage below the input in red. */
    isWarningVisible?: boolean;
    /** Minimum allowed value. Shows an out-of-bounds message if violated. */
    min?: number;
    /** Maximum allowed value. Shows an out-of-bounds message if violated. */
    max?: number;
    /** Called when the user presses Enter, provided the value is within bounds. Receives the current value or null. */
    handleEnter?: (input: number | null) => void;
    /** Additional CSS classes applied to the root label element. */
    className?: string;
    /** Additional CSS classes applied to the inner input element. */
    classNameInput?: string;
    /** Disables the input when true. */
    disabled?: boolean;
    /** Name attribute for the input element. */
    name?: string;
};
export default function InputNumber({ label, onChange, warningMessage, isWarningVisible, min, max, handleEnter, labelPosition, className, classNameInput, disabled, name, ...props }: InputNumberProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=InputNumber.d.ts.map