import { useState } from 'react';

import { ArrowCircleRight } from '@phosphor-icons/react';
import InputNumber from './InputNumber';
import { cn } from '@/lib/utils';

export type ControllerAbsoluteMoveProps = {
    /** Called when the user submits a value via the arrow button or Enter key. Receives the current input value, or null if empty. */
    handleEnter?: (input: number | null) => void;
    /** Label displayed next to the input (e.g. units like "mm"). */
    inputLabel?: string;
    /** Additional CSS classes applied to the inner input element. */
    classNameInput?: string;
    /** Additional CSS classes applied to the root wrapper element. */
    className?: string;
    /** Disables interaction and applies dimmed styling when true. */
    locked?: boolean;
};

export default function ControllerAbsoluteMove({
    handleEnter,
    inputLabel,
    classNameInput,
    className,
    locked,
    ...props
}: ControllerAbsoluteMoveProps) {
    const [inputValue, setInputValue] = useState<number | null>(null);
    return (
        <div
            className={cn(
                'flex items-center space-x-2',
                locked ? 'pointer-events-none opacity-50 hover:cursor-not-allowed' : '',
                className,
            )}
            {...props}
        >
            <InputNumber
                disabled={locked}
                label={inputLabel}
                labelPosition="right"
                className={cn(`w-32`)}
                handleEnter={handleEnter}
                onChange={(input) => setInputValue(input)}
                classNameInput={cn('text-right', classNameInput)}
            />
            <ArrowCircleRight
                size={24}
                className="hover:text-sky-500 hover:cursor-pointer"
                onClick={() => handleEnter && handleEnter(inputValue)}
            />
        </div>
    );
}
