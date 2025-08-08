import { useState, ChangeEvent } from "react";
import { cn } from "@/lib/utils"

type InputNumberProps = {
    label?: string;
    labelPosition?: 'left' | 'right';
    onChange?: (input: number | null) => void;
    warningMessage?: string;
    isWarningVisible?: boolean;
    min?:number;
    max?:number;
    handleEnter?: (input: number | null) => void;
    className?: string;
    inputClassName?: string;
    disabled?: boolean;
};

export default function InputNumber({ label, onChange, warningMessage, isWarningVisible, min, max, handleEnter, labelPosition='left', className, inputClassName, disabled=false }: InputNumberProps) {
    const [value, setValue] = useState<number | null>(null);
    const [isValueInBounds, setIsValueInBounds] = useState(true);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const numericValue = inputValue === '' ? null : parseFloat(inputValue);
        setValue(numericValue);
        onChange && onChange(numericValue);
        if (numericValue !== null) {
            setIsValueInBounds((min === undefined || numericValue >= min) && (max === undefined || numericValue <= max));
        }
    };

    const handleEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (isValueInBounds) {
                handleEnter && handleEnter(value);
            }
        }
    }

    return (
        <label className={cn(`${labelPosition === 'right' && 'flex-row-reverse'} w-full max-w-[60rem] flex justify-between relative`, className)}>
            <span className='mx-1 font-light'>{label}</span>
            <input
                type="number" 
                value={value === null ? '' : value}
                className={
                    cn(
                        `w-full max-w-96 border pl-2 min-h-6 appearance-none bg-white
                        ${isWarningVisible ? 'border-red-500' : 'border-slate-300'}
                        ${disabled && 'hover:cursor-not-allowed'}
                        `,
                         inputClassName)}
                onChange={handleChange}
                onKeyDown={handleEnterKey}
                disabled={disabled}
            />
            {isWarningVisible && (
                <p className="absolute left-0 -bottom-4 text-xs text-red-500">{warningMessage}</p>
            )}
            {!isValueInBounds && (
                <p className="absolute left-0 -bottom-4 text-xs text-red-500">Value out of bounds</p>
            )}
        </label>
    );
}