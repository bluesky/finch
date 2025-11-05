import { useState } from 'react';

import hexapodAxisSketch from './assets/hexapodAxisSketch.png';
import { HexapodMovePositionForm, HexapodRBVs } from './types/hexapodTypes';
import { formatCurrentValue } from './utils/hexapodUtils';

import ButtonWithIcon from '../ButtonWithIcon';
import SelectDropdown from '../SelectDropdown';

import { ArrowFatRight, ArrowsClockwise, Pause, Trash } from '@phosphor-icons/react';

type MoveMode = 'Relative Move' | 'Absolute Move' | 'Jog';
const defaultMovePositionForm: HexapodMovePositionForm = {
    tx: undefined,
    ty: undefined,
    tz: undefined,
    rx: undefined,
    ry: undefined,
    rz: undefined,
};
type HexapodControllerProps = {
    hexapodRBVs: HexapodRBVs;
    onStartClick: (movePositionForm: HexapodMovePositionForm, isRelative: boolean) => void;
    onStopClick: () => void;
    isLocked?: boolean;
};
export default function HexapodController({ hexapodRBVs, onStartClick, onStopClick, isLocked }: HexapodControllerProps) {
    const [ moveMode, setMoveMode ] = useState<MoveMode>('Relative Move');
    const [ movePositionForm, setMovePositionForm ] = useState<HexapodMovePositionForm>(defaultMovePositionForm);

    const handleFormChange = (axis: keyof HexapodMovePositionForm, input: string) => {
        setMovePositionForm((prev) => {
            if (input === '' || input === '-' || /^-?\d*\.?\d*$/.test(input)) {
                return {
                    ...prev,
                    [axis]: input ? input : undefined,
                };
            } else {
                return prev;
            }
        });
    };

    const handleClearForm = () => {
        setMovePositionForm(defaultMovePositionForm);
    };

    const handleDropdownChange = (value: MoveMode) => {
        setMoveMode(value);
        handleClearForm();
    };

    const handleEnterKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, axis: keyof HexapodMovePositionForm) => {
        if (e.key === 'Enter' && moveMode === 'Jog' && !isLocked) {
            const inputValue = movePositionForm[axis];
            if (inputValue !== undefined && String(inputValue) !== "-") {
                const jogPositionForm: HexapodMovePositionForm = {
                    tx: 0,
                    ty: 0,
                    tz: 0,
                    rx: 0,
                    ry: 0,
                    rz: 0,
                };
                jogPositionForm[axis] = inputValue;
                onStartClick(jogPositionForm, true);
            }
        }
    };

    return (
        <div className="flex flex-col items-center w-fit">
            <img src={hexapodAxisSketch} alt="Hexapod Axis Sketch" className="w-auto h-48"/>
            <div className="flex w-fit">
                <div className="w-1/2 mx-4">
                    <h3 className="text-sky-900 font-medium text-center mb-2">Current Position</h3>
                    <ul>
                        {Object.keys(hexapodRBVs).map((axis) => (
                            <li key={axis} className="flex h-8">
                                <p className="w-1/4">{axis.toUpperCase()}</p>
                                <p className="w-3/4 text-sky-700">{hexapodRBVs[axis as keyof HexapodRBVs].connected ? formatCurrentValue(hexapodRBVs[axis as keyof HexapodRBVs]) : 'N/A'}</p>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className={`${isLocked && "hover:cursor-not-allowed opacity-50"} w-1/2 mx-4`}>
                    <span className={`${isLocked && "pointer-events-none"} flex items-center justify-center gap-1`}>
                        <SelectDropdown
                            listItems={['Relative Move', 'Absolute Move', 'Jog']}
                            initialSelectedItem='Relative Move'
                            onValueChange={(item) => handleDropdownChange(item as MoveMode)}
                        />
                        <Trash size={16} className="text-slate-500 hover:text-red-400 hover:cursor-pointer" onClick={handleClearForm} />
                    </span>
                    <ul className={`${isLocked && "pointer-events-none"} border-l border-l-slate-400 pl-4`}>
                        {Object.keys(movePositionForm).map((axis) => (
                            <li key={axis} className="flex h-8 items-center">
                                <p className="w-1/4">{axis.toUpperCase()}</p>
                                <input
                                    type="text"
                                    className="w-20 border border-slate-300 rounded-md pl-1 bg-sky-200 shadow-inner"
                                    value={movePositionForm[axis as keyof HexapodMovePositionForm] ?? ''}
                                    onChange={(e) => handleFormChange(axis as keyof HexapodMovePositionForm, e.target.value)}
                                    onKeyDown={(e) => handleEnterKeyPress(e, axis as keyof HexapodMovePositionForm)}
                                />
                                <p className="ml-1">{hexapodRBVs[axis as keyof HexapodRBVs].units}</p>
                            </li>
                        ))}
                    </ul>
                    <span className={`${isLocked && "pointer-events-none"} flex mt-3 w-52 justify-around h-8`}>
                        {
                            moveMode === 'Jog' ?
                            <p className="text-xs text-slate-700 text-wrap pl-2">Hint: Press the 'Enter' key in a cell to jog the selected axis</p>
                            :
                            <>
                                <ButtonWithIcon icon={<ArrowFatRight size={20}/>} cb={() => onStartClick(movePositionForm, (moveMode!== 'Absolute Move'))} size="small" text='START' iconPosition='right' styles='py-1 px-2 h-fit'/>
                                <ButtonWithIcon icon={<Pause size={20}/>} cb={onStopClick} isSecondary={true} size="small" text="STOP" iconPosition='right' styles="py-1 px-2 h-fit bg-white/50 border-slate-400"/>
                            </>
                        }
                    </span>
                </div>
            </div>
        </div>
    )
}
