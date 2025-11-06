import { useState } from "react";

import SelectDropdown from "../SelectDropdown";
import ButtonIconOnly from "../ButtonIconOnly";

import { PlayCircle, HandPalm, Play } from '@phosphor-icons/react';

type MoveMode = 'Set Energy' | 'Jog Energy';
const initialMoveMode:MoveMode = "Set Energy";
const moveModeList: MoveMode[] = ['Set Energy', 'Jog Energy'];

type BeamEnergyControllerProps = {
    currentValueDegrees?: number;
    onAbsoluteMove?: (newValueDegrees: number) => void;
    onRelativeMove?: (deltaDegrees: number) => void;
    onStop?: () => void;
    isLocked?: boolean;
}
export default function BeamEnergyController({ currentValueDegrees, onAbsoluteMove, onRelativeMove, onStop, isLocked }: BeamEnergyControllerProps) {
    const [ moveMode, setMoveMode ] = useState<MoveMode>(initialMoveMode);
    const [ inputValue, setInputValue ] = useState<string>("");

    const handleDropdownChange = (value: MoveMode) => {
        setMoveMode(value);
        setInputValue("");
    };

    return (
        <div className={`${isLocked ? "opacity-50 hover:cursor-not-allowed" : ""} w-full`}>
            <div className={`${isLocked ? "pointer-events-none" : ""} w-fit m-auto flex justify-center items-center pt-6 space-x-2`}>
                <SelectDropdown 
                    initialSelectedItem={initialMoveMode}  
                    listItems={moveModeList} 
                    onValueChange={(item) =>handleDropdownChange(item as MoveMode)} 
                />
                {moveMode === 'Set Energy' ? 
                    <>
                        <input
                            type="number"
                            disabled={isLocked}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="w-20 border border-slate-300 rounded-md pl-1 bg-sky-200 shadow-inner h-fit"
                            name="absolute-move-input"
                        />
                        <ButtonIconOnly
                            icon={<PlayCircle size={20}/>}
                            onClick={() => onAbsoluteMove?.(Number(inputValue))}
                            disabled={isLocked}
                            className="px-4"
                        />
                        <ButtonIconOnly
                            icon={<HandPalm size={20}/>}
                            onClick={() => onStop?.()}
                            disabled={isLocked}
                            isSecondary={true}
                            className="px-4"
                        />
                    </>
                    :
                    <>
                        <ButtonIconOnly
                            icon={<Play size={20} className="rotate-180"/>}
                            onClick={() => onRelativeMove?.(Number(-inputValue))}
                            disabled={isLocked}
                            className="px-4"
                        />
                        <input
                            type="number"
                            disabled={isLocked}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="w-20 border border-slate-300 rounded-md pl-1 bg-sky-200 shadow-inner h-fit"
                            name="absolute-move-input"
                        />
                        <ButtonIconOnly
                            icon={<Play size={20}/>}
                            onClick={() => onRelativeMove?.(Number(inputValue))}
                            disabled={isLocked}
                            className="px-4"
                        />
                        <ButtonIconOnly
                            icon={<HandPalm size={20}/>}
                            onClick={() => onStop?.()}
                            disabled={isLocked}
                            isSecondary={true}
                            className="px-4"
                        />
                    </>
                }
            </div>
        </div>
    )
}