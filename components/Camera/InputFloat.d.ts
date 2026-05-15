type InputFloatProps = {
    /** Display label shown to the left of the number input. */
    label?: string;
    /** Callback invoked with the parsed float value when the user presses Enter. */
    onSubmit?: (value: number) => void;
    /** When `true`, prevents interaction and renders the input in a disabled style. */
    isDisabled?: boolean;
};
export default function InputFloat({ label, onSubmit, isDisabled, }: InputFloatProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=InputFloat.d.ts.map