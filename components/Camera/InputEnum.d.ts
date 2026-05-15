type InputEnumProps = {
    /** Display label shown to the left of the dropdown. */
    label?: string;
    /** List of string options to display in the dropdown. */
    enums?: string[];
    /** Callback invoked with the selected string when the user picks an option. */
    onSubmit?: (input: string) => void;
    /** When `true`, prevents interaction and renders the control in a disabled style. */
    isDisabled?: boolean;
};
export default function InputEnum({ label, enums, onSubmit, isDisabled, }: InputEnumProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=InputEnum.d.ts.map