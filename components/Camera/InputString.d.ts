type InputStringProps = {
    /** Display label shown to the left of the text input. */
    label?: string;
    /** Callback invoked with the current string value when the user presses Enter. */
    onSubmit?: (input: string) => void;
    /** When `true`, prevents interaction and renders the input in a disabled style. */
    isDisabled?: boolean;
};
export default function InputString({ label, onSubmit, isDisabled, }: InputStringProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=InputString.d.ts.map