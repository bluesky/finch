import { useState } from 'react';

import InputNumber from './InputNumber';
import { cn } from '@/lib/utils';
import { ArrowCircleRight, ArrowCircleLeft } from '@phosphor-icons/react';
export type ControllerRelativeMoveProps = {
    /** Called when the user clicks a direction arrow. Receives the computed target value (currentValue ± increment), or null if either value is unset. */
    handleEnter?: (input: number | null) => void;
    /** Label displayed alongside the resultant text (e.g. units like "mm"). */
    inputLabel?: string;
    /** Additional CSS classes applied to the inner input element. */
    classNameInput?: string;
    /** Additional CSS classes applied to the resultant value text elements. */
    resultantTextClassName?: string;
    /** Additional CSS classes applied to the root wrapper element. */
    className?: string;
    /** The current device value used as the base for computing the relative move target. */
    currentValue: number | null;
    /** Disables interaction and applies dimmed styling when true. */
    locked?: boolean;
};
export default function ControllerRelativeMove({
    handleEnter,
    inputLabel,
    classNameInput,
    className,
    currentValue,
    resultantTextClassName,
    locked,
    ...props
}: ControllerRelativeMoveProps) {
    const [inputValue, setInputValue] = useState<number | null>(null);
    const resultantAddition =
        currentValue !== null && inputValue !== null ? currentValue + inputValue : null;
    const resultantSubtraction =
        currentValue !== null && inputValue !== null ? currentValue - inputValue : null;

    const subtractionText =
        resultantSubtraction !== null ? `${resultantSubtraction.toPrecision(4)} ${inputLabel}` : '';
    const additionText =
        resultantAddition !== null ? `${resultantAddition.toPrecision(4)} ${inputLabel}` : '';

    return (
        <div
            className={cn(
                'flex items-center space-x-2',
                locked ? 'pointer-events-none opacity-50 hover:cursor-not-allowed' : '',
                className,
            )}
            {...props}
        >
            <p className={cn('font-extralight w-24 text-right', resultantTextClassName)}>
                {subtractionText}
            </p>
            <ArrowCircleLeft
                size={24}
                className="hover:text-sky-500 hover:cursor-pointer"
                onClick={() => handleEnter && handleEnter(resultantSubtraction)}
            />
            <InputNumber
                disabled={locked}
                className={cn(`w-24 text-center`)}
                onChange={(input) => setInputValue(input)}
                classNameInput={cn('text-center', classNameInput)}
            />
            <ArrowCircleRight
                size={24}
                className="hover:text-sky-500 hover:cursor-pointer"
                onClick={() => handleEnter && handleEnter(resultantAddition)}
            />
            <p className={cn('font-extralight w-24 text-left', resultantTextClassName)}>
                {additionText}
            </p>
        </div>
    );
}
