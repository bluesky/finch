type InputIntegerProps = {
    /** Display label shown to the left of the text input. */
    label?: string;
    /** Callback invoked with the parsed integer value when the user presses Enter. */
    onSubmit?: (value: number) => void;
    /** When `true`, prevents interaction and renders the input in a disabled style. */
    isDisabled?: boolean;
};
export default function InputInteger({ label, onSubmit, isDisabled, }: InputIntegerProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=InputInteger.d.ts.map