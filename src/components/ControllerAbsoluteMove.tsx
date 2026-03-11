import { useState } from "react";

import { ArrowCircleRight } from "@phosphor-icons/react";
import InputNumber from "./InputNumber";
import { cn } from "@/lib/utils";

export type ControllerAbsoluteMoveProps = {
    handleEnter?: (input: number | null) => void;
    inputLabel?: string;
    inputClassName?: string;
    className?: string;
    locked?: boolean;
}

export default function ControllerAbsoluteMove({handleEnter, inputLabel, inputClassName, className, locked, ...props}: ControllerAbsoluteMoveProps) {
    const [ inputValue, setInputValue ] = useState<number | null>(null);
return (
    <div 
        className={cn(
            "flex items-center space-x-2",
            locked ? "pointer-events-none opacity-50 hover:cursor-not-allowed" : "",
            className
        )}
        {...props}
    >
        <InputNumber disabled={locked} label={inputLabel} labelPosition='right' className={`w-32 ${inputClassName}`} handleEnter={handleEnter} onChange={(input) => setInputValue(input)} inputClassName="text-right"/>
        <ArrowCircleRight size={24} className="hover:text-sky-500 hover:cursor-pointer" onClick={()=>handleEnter && handleEnter(inputValue)}/>
    </div>
)
}