type InputEnumBoxRoundedProps = {
    /** Called when the user selects a new option. Receives the selected string value. */
    cb: (input: string) => void;
    /** Label displayed above the dropdown, also used as the tooltip anchor. */
    label?: string;
    /** Currently selected value shown in the dropdown. */
    value: string;
    /** List of options available in the dropdown. */
    enums: string[];
    /** Tooltip description shown on hover over the label. */
    description?: string;
    /** When true, appends "(required)" to the label. */
    required?: boolean;
    /** Additional Tailwind classes applied to the root container. */
    className?: string;
    /** Tailwind width class applied to the root container (e.g. "w-48"). Defaults to a responsive width. */
    width?: string;
};
export default function InputEnumBoxRounded({ cb, label, value, enums, description, required, className, width, ...props }: InputEnumBoxRoundedProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=InputEnumBoxRounded.d.ts.map