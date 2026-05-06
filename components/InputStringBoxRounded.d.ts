type InputStringBoxRoundedProps = {
    /** Called on every keystroke with the current input string. */
    cb: (input: string) => void;
    /** Label displayed above the input, also used as the tooltip anchor. */
    label?: string;
    /** Initial value of the input. */
    value: string;
    /** Tooltip description shown on hover over the label. */
    description?: string;
    /** When true, appends "(required)" to the label and shows a warning border on blur if empty. */
    required?: boolean;
    /** Additional Tailwind classes applied to the root container. */
    className?: string;
    /** Tailwind width class applied to the root container (e.g. "w-48"). Defaults to a responsive width. */
    width?: string;
    /** When true, forces the warning border and label color to show regardless of local validation state. */
    showWarningGlobal?: boolean;
};
export default function InputStringBoxRounded({ cb, value, label, description, required, width, className, showWarningGlobal, ...props }: InputStringBoxRoundedProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=InputStringBoxRounded.d.ts.map