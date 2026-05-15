import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Tooltip } from 'react-tooltip';

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
export default function InputStringBoxRounded({
    cb = () => {},
    value = '',
    label = '',
    description = '',
    required = false,
    width = '',
    className = '',
    showWarningGlobal = false,
    ...props
}: InputStringBoxRoundedProps) {
    const [inputValue, setInputValue] = useState(value);
    const [showWarning, setShowWarning] = useState(false);
    const sanitizedId = label.replaceAll(' ', '');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        cb(newValue);
        setShowWarning(false); // Reset warning if the user starts typing
    };

    const handleBlur = () => {
        // Show warning if input is required and empty
        if (required && inputValue.trim() === '') {
            setShowWarning(true);
        }
    };

    return (
        <div
            className={cn(
                `${width === '' ? 'w-5/12 max-w-48 min-w-36' : width} border-2 ${showWarning || showWarningGlobal ? 'border-red-500' : 'border-slate-300'} rounded-lg mt-2 h-fit`,
                className,
            )}
            {...props}
        >
            <p
                id={sanitizedId + 'ParamInputTooltip'}
                className={`${showWarning || showWarningGlobal ? 'text-red-500' : 'text-gray-500'} text-sm pl-4 border-b border-dashed border-slate-300`}
            >
                {`${label} ${required ? '(required)' : '(optional)'}`}
            </p>
            <Tooltip
                anchorSelect={'#' + sanitizedId + 'ParamInputTooltip'}
                children={<p className="whitespace-pre-wrap">{description}</p>}
                place="top"
                variant="info"
                style={{ maxWidth: '500px', height: 'fit-content' }}
                delayShow={400}
            />
            <input
                className={`w-full rounded-b-lg outline-none h-8 text-lg pl-2 my-1 text-center ${showWarning ? 'border-red-500' : ''}`}
                type="text"
                value={inputValue}
                onChange={handleChange}
                onBlur={handleBlur}
            />
        </div>
    );
}
