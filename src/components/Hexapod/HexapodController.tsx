import { useState } from 'react';

import hexapodAxisSketch from './assets/hexapodAxisSketch.png';
import { HexapodMovePositionForm, HexapodRBVs } from './types/hexapodTypes';
import { formatCurrentValue } from './utils/hexapodUtils';

import ButtonWithIcon from '../ButtonWithIcon';

import { ArrowFatRight, ArrowsClockwise } from '@phosphor-icons/react';

type HexapodControllerProps = {
    hexapodRBVs: HexapodRBVs;
    onStartClick: (movePositionForm: HexapodMovePositionForm, isRelative: boolean) => void;
};
export default function HexapodController({ hexapodRBVs, onStartClick }: HexapodControllerProps) {
    const [ isMoveRelative, setIsMoveRelative ] = useState(true);
    const [ movePositionForm, setMovePositionForm ] = useState<HexapodMovePositionForm>({
        tx: undefined,
        ty: undefined,
        tz: undefined,
        rx: undefined,
        ry: undefined,
        rz: undefined,
    });

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

    return (
        <div className="flex flex-col items-center">
            <img src={hexapodAxisSketch} alt="Hexapod Axis Sketch" className="w-auto h-48"/>
            <div className="flex">
                <div className="w-1/2">
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
                <div className="w-1/2">
                    <h3 className="text-sky-900 font-medium text-center mb-2"> {isMoveRelative ? 'Relative' : 'Absolute'} Move</h3>
                    <ul>
                        {Object.keys(movePositionForm).map((axis) => (
                            <li key={axis} className="flex h-8 items-center">
                                <p className="w-1/4">{axis.toUpperCase()}</p>
                                <input
                                    type="text"
                                    className="w-20 border border-slate-300 rounded-md pl-1 bg-sky-200 shadow-inner"
                                    value={movePositionForm[axis as keyof HexapodMovePositionForm] ?? ''}
                                    onChange={(e) => handleFormChange(axis as keyof HexapodMovePositionForm, e.target.value)}
                                />
                                <p className="ml-1">{hexapodRBVs[axis as keyof HexapodRBVs].units}</p>
                            </li>
                        ))}
                    </ul>
                    <span className="flex mt-4 gap-2">
                        <ButtonWithIcon icon={<ArrowFatRight size={24}/>} cb={() => onStartClick(movePositionForm, isMoveRelative)} text='START' iconPosition='right' styles='py-1 px-2 h-fit'/>
                        <ButtonWithIcon icon={<ArrowsClockwise size={24}/>} isSecondary={true} text="reset" iconPosition='right' bgColor="bg-white" styles="py-1 px-2 h-fit"/>
                    </span>
                </div>
            </div>
        </div>
    )
}
