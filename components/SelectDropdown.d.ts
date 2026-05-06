type SelectDropdownProps = {
    /** Array of string options rendered as selectable items. */
    listItems: string[];
    /** Placeholder text shown in the trigger when no item is selected. */
    placeholder?: string;
    /** Callback fired with the selected value when the user picks an item. */
    onValueChange?: (value: string) => void;
    /** The value of the item selected by default on first render. */
    initialSelectedItem?: string;
    /** Additional CSS classes applied to the select trigger button. */
    triggerClassName?: string;
    /** Additional CSS classes applied to the dropdown content panel. */
    contentClassName?: string;
};
export default function SelectDropdown({ listItems, placeholder, onValueChange, initialSelectedItem, triggerClassName, contentClassName, ...props }: SelectDropdownProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SelectDropdown.d.ts.map