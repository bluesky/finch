import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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

export default function SelectDropdown({
    listItems,
    placeholder,
    onValueChange,
    initialSelectedItem,
    triggerClassName,
    contentClassName,
    ...props
}: SelectDropdownProps) {
    return (
        <Select defaultValue={initialSelectedItem} onValueChange={onValueChange} {...props}>
            <SelectTrigger
                className={cn(
                    'border-0 text-sky-900 font-medium text-center h-fit text-md p-0 w-fit m-auto',
                    triggerClassName,
                )}
            >
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className={cn('bg-white', contentClassName)}>
                <SelectGroup>
                    {listItems.map((item) => {
                        return (
                            <SelectItem
                                key={item}
                                value={item}
                                className="hover:cursor-pointer text-sky-600"
                            >
                                {item}
                            </SelectItem>
                        );
                    })}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
