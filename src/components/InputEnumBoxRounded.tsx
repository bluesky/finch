import { useState, useEffect, useRef } from 'react';
import { tailwindIcons } from '@/assets/icons';
import { Tooltip } from 'react-tooltip';
import { cn } from '@/lib/utils';

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
export default function InputEnumBoxRounded({
    cb,
    label = '',
    value = '',
    enums = [],
    description = '',
    required = false,
    className = '',
    width = '',
    ...props
}: InputEnumBoxRoundedProps) {
    const availableItems = enums;
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const sanitizedId = label.replaceAll(' ', '');

    const containerRef = useRef<null | HTMLDivElement>(null);

    const handleInputClick = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const handleItemClick = (item: string) => {
        if (item !== value) {
            setDropdownVisible(false);
            cb(item);
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
            setDropdownVisible(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={cn(
                `${width === '' ? 'w-5/12 max-w-48 min-w-36' : width} relative  border-2 border-slate-300 rounded-lg mt-2 h-fit`,
                className,
            )}
            {...props}
        >
            <p
                id={sanitizedId + 'ParamInputTooltip'}
                className="text-sm pl-4 text-gray-500 border-b border-dashed border-slate-300"
            >{`${label} ${required ? '(required)' : '(optional)'}`}</p>
            <Tooltip
                anchorSelect={'#' + sanitizedId + 'ParamInputTooltip'}
                children={<p className="whitespace-pre-wrap">{description}</p>}
                place="top"
                variant="info"
                style={{ maxWidth: '500px', height: 'fit-content' }}
                delayShow={400}
            />
            <div className="flex rounded p-2 hover:cursor-pointer" onClick={handleInputClick}>
                <div className="w-10/12 flex justify-center">
                    <p>{value}</p>
                </div>
                <div className="w-2/12 text-slate-300 flex items-center justify-center">
                    {dropdownVisible ? tailwindIcons.chevronUp : tailwindIcons.chevronDown}
                </div>
            </div>
            {dropdownVisible && (
                <ul className="z-10 absolute w-full bg-white border border-gray-300 rounded mt-1 max-h-40 overflow-auto">
                    {availableItems.map((item) => (
                        <li
                            key={item}
                            onClick={() => handleItemClick(item)}
                            className="p-2 cursor-pointer hover:bg-gray-200"
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
