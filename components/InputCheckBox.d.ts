type InputCheckboxProps = {
    /** Text label displayed next to the checkbox. Pass false or omit to hide the label. */
    label?: string | boolean;
    /** Called when the checkbox is toggled. Receives the new checked state. */
    cb: (isChecked: boolean) => void;
    /** Controls whether the checkbox is checked. */
    isChecked?: boolean;
    /** Additional Tailwind classes applied to the root container. */
    className?: string;
};
export default function InputCheckbox({ label, cb, isChecked, className, ...props }: InputCheckboxProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=InputCheckBox.d.ts.map