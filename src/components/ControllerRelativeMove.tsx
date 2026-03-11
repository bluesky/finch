import { useState} from "react";

import InputNumber from "./InputNumber";
import { cn } from "@/lib/utils";
import { ArrowCircleRight, ArrowCircleLeft } from "@phosphor-icons/react";
export type ControllerRelativeMoveProps = {
    handleEnter?: (input: number | null) => void;
    inputLabel?: string;
    inputClassName?: string;
    resultantTextClassName?: string;
    className?: string;
    currentValue: number | null;
    locked?: boolean;
}
export default function ControllerRelativeMove({handleEnter, inputLabel, inputClassName, className, currentValue, resultantTextClassName, locked, ...props}: ControllerRelativeMoveProps) {
    const [ inputValue, setInputValue ] = useState<number | null>(null);
    const resultantAddition = currentValue !== null && inputValue !== null ? currentValue + inputValue : null;
    const resultantSubtraction = currentValue !== null && inputValue !== null ? currentValue - inputValue : null;

    const subtractionText = resultantSubtraction !== null ? `${resultantSubtraction.toPrecision(4)} ${inputLabel}` : '';
    const additionText = resultantAddition !== null ? `${resultantAddition.toPrecision(4)} ${inputLabel}` : '';

    return (
        <div 
            className={cn(
                "flex items-center space-x-2",
                locked ? "pointer-events-none opacity-50 hover:cursor-not-allowed" : "", 
                className
            )}
            {...props}
        >
            <p className={cn("font-extralight w-24 text-right", resultantTextClassName)}>{subtractionText}</p>
            <ArrowCircleLeft size={24} className="hover:text-sky-500 hover:cursor-pointer" onClick={()=>handleEnter && handleEnter(resultantSubtraction)} />
            <InputNumber className={`w-24 text-center ${inputClassName}`} onChange={(input) => setInputValue(input)} inputClassName="text-center"/>
            <ArrowCircleRight size={24} className="hover:text-sky-500 hover:cursor-pointer" onClick={()=>handleEnter && handleEnter(resultantAddition)}/>
            <p className={cn("font-extralight w-24 text-left", resultantTextClassName)}>{additionText}</p>
        </div>
    )
}


