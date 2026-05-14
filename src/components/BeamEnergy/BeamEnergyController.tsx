import { useState } from 'react';

import SelectDropdown from '../SelectDropdown';
import ButtonIconOnly from '../ButtonIconOnly';

import { PlayCircle, HandPalm, Play } from '@phosphor-icons/react';

type MoveMode = 'Set Energy' | 'Jog Energy';
const initialMoveMode: MoveMode = 'Set Energy';
const moveModeList: MoveMode[] = ['Set Energy', 'Jog Energy'];

type BeamEnergyControllerProps = {
    /** Current monochromator angle in degrees, used as the base for jog moves. */
    currentValueDegrees?: number;
    /** Called with the target angle in degrees when the user submits an absolute move. */
    onAbsoluteMove?: (newValueDegrees: number) => void;
    /** Called with a signed delta in degrees when the user submits a jog move. */
    onRelativeMove?: (deltaDegrees: number) => void;
    /** Called when the user clicks the stop button. */
    onStop?: () => void;
    /** When true, disables all controls and dims the controller UI. */
    isLocked?: boolean;
};
export default function BeamEnergyController({
    currentValueDegrees: _currentValueDegrees,
    onAbsoluteMove,
    onRelativeMove,
    onStop,
    isLocked,
}: BeamEnergyControllerProps) {
    const [moveMode, setMoveMode] = useState<MoveMode>(initialMoveMode);
    const [inputValue, setInputValue] = useState<string>('');

    const handleDropdownChange = (value: MoveMode) => {
        setMoveMode(value);
        setInputValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter' || isLocked) return;
        if (moveMode === 'Set Energy') {
            onAbsoluteMove?.(Number(inputValue));
        } else {
            onRelativeMove?.(Number(inputValue));
        }
    };

    return (
        <div className={`${isLocked ? 'opacity-50 hover:cursor-not-allowed' : ''} w-full`}>
            <div
                className={`${isLocked ? 'pointer-events-none' : ''} w-fit m-auto flex justify-center items-center pt-6 space-x-2`}
            >
                <SelectDropdown
                    initialSelectedItem={initialMoveMode}
                    listItems={moveModeList}
                    onValueChange={(item) => handleDropdownChange(item as MoveMode)}
                />
                {moveMode === 'Set Energy' ? (
                    <>
                        <input
                            type="number"
                            disabled={isLocked}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-20 border border-slate-300 rounded-md pl-1 bg-sky-200 shadow-inner h-fit"
                            name="absolute-move-input"
                        />
                        <ButtonIconOnly
                            icon={<PlayCircle size={20} />}
                            onClick={() => onAbsoluteMove?.(Number(inputValue))}
                            disabled={isLocked}
                            className="px-4"
                        />
                        <ButtonIconOnly
                            icon={<HandPalm size={20} />}
                            onClick={() => onStop?.()}
                            disabled={isLocked}
                            isSecondary={true}
                            className="px-4"
                        />
                    </>
                ) : (
                    <>
                        <ButtonIconOnly
                            icon={<Play size={20} className="rotate-180" />}
                            onClick={() => onRelativeMove?.(Number(-inputValue))}
                            disabled={isLocked}
                            className="px-4"
                        />
                        <input
                            type="number"
                            disabled={isLocked}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-20 border border-slate-300 rounded-md pl-1 bg-sky-200 shadow-inner h-fit"
                            name="absolute-move-input"
                        />
                        <ButtonIconOnly
                            icon={<Play size={20} />}
                            onClick={() => onRelativeMove?.(Number(inputValue))}
                            disabled={isLocked}
                            className="px-4"
                        />
                        <ButtonIconOnly
                            icon={<HandPalm size={20} />}
                            onClick={() => onStop?.()}
                            disabled={isLocked}
                            isSecondary={true}
                            className="px-4"
                        />
                    </>
                )}
            </div>
        </div>
    );
}
