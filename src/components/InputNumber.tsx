import { useState, ChangeEvent } from 'react';
import { cn } from '@/lib/utils';

type InputNumberProps = {
    /** Label displayed beside the input. */
    label?: string;
    /** Side on which the label is rendered relative to the input. Defaults to 'left'. */
    labelPosition?: 'left' | 'right';
    /** Called whenever the input value changes. Receives the parsed number, or null if the field is empty. */
    onChange?: (input: number | null) => void;
    /** Warning text shown below the input when isWarningVisible is true. */
    warningMessage?: string;
    /** When true, renders the warningMessage below the input in red. */
    isWarningVisible?: boolean;
    /** Minimum allowed value. Shows an out-of-bounds message if violated. */
    min?: number;
    /** Maximum allowed value. Shows an out-of-bounds message if violated. */
    max?: number;
    /** Called when the user presses Enter, provided the value is within bounds. Receives the current value or null. */
    handleEnter?: (input: number | null) => void;
    /** Additional CSS classes applied to the root label element. */
    className?: string;
    /** Additional CSS classes applied to the inner input element. */
    classNameInput?: string;
    /** Disables the input when true. */
    disabled?: boolean;
    /** Name attribute for the input element. */
    name?: string;
};

export default function InputNumber({
    label,
    onChange,
    warningMessage,
    isWarningVisible,
    min,
    max,
    handleEnter,
    labelPosition = 'left',
    className,
    classNameInput,
    disabled = false,
    name,
    ...props
}: InputNumberProps) {
    const [value, setValue] = useState<number | null>(null);
    const [isValueInBounds, setIsValueInBounds] = useState(true);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const numericValue = inputValue === '' ? null : parseFloat(inputValue);
        setValue(numericValue);
        if (onChange) onChange(numericValue);
        if (numericValue !== null) {
            setIsValueInBounds(
                (min === undefined || numericValue >= min) &&
                    (max === undefined || numericValue <= max),
            );
        }
    };

    const handleEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (isValueInBounds) {
                if (handleEnter) handleEnter(value);
            }
        }
    };

    return (
        <label
            className={cn(
                `${labelPosition === 'right' && 'flex-row-reverse'} w-full max-w-[60rem] flex justify-between relative`,
                className,
            )}
            {...props}
        >
            {label && <span className="mx-1 font-light w-12">{label}</span>}
            <input
                name={name ? name : 'input-number'}
                type="number"
                value={value === null ? '' : value}
                className={cn(
                    `w-full max-w-96 border pl-2 pr-2 min-h-6 appearance-none bg-white
                        ${isWarningVisible ? 'border-red-500' : 'border-slate-300'}
                        ${disabled && 'hover:cursor-not-allowed'}
                        `,
                    classNameInput,
                )}
                onChange={handleChange}
                onKeyDown={handleEnterKey}
                disabled={disabled}
            />
            {isWarningVisible && (
                <p className="absolute left-0 -bottom-4 text-xs text-red-500">{warningMessage}</p>
            )}
            {!isValueInBounds && (
                <p className="absolute left-0 -bottom-4 text-xs text-red-500">
                    Value out of bounds
                </p>
            )}
        </label>
    );
}
