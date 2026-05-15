import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Lock, Question } from '@phosphor-icons/react';
import { Device } from '@/types/deviceControllerTypes';
import InputNumber from './InputNumber';
import Button from './Button';
import { controllerIcons } from '@/assets/icons';

export type DeviceControllerBoxProps = {
    /** The primary device being controlled. */
    device: Device;
    /** Optional readback device whose value is displayed as the current position. Falls back to `device` if not provided. */
    deviceRBV?: Device;
    /** Called when the user requests a move to a new absolute value. Receives the device name and target value. */
    handleSetValueRequest: (deviceName: string, value: number) => void;
    /** Called when the user clicks the lock/unlock button. Receives the device name. */
    handleLockClick: (deviceName: string) => void;
    /** Optional SVG icon rendered in the header area of the card. */
    svgIcon?: React.ReactNode;
    /** Additional CSS classes to apply to the root article element. */
    className?: string;
    /** Display title shown instead of the device name when provided. */
    title?: string;
};

export default function DeviceControllerBox({
    device,
    deviceRBV,
    handleSetValueRequest,
    handleLockClick,
    svgIcon,
    className,
    title,
    ...props
}: DeviceControllerBoxProps) {
    //const backgroundColorClass = device.locked ? 'bg-slate-400 opacity-60' : 'bg-slate-200';
    const [absoluteMoveValue, setAbsoluteMoveValue] = useState<number | null>(null);
    const [relativeMoveIncrement, setRelativeMoveIncrement] = useState<number | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const currentValue = (deviceRBV ? deviceRBV.value : device.value) as number;
    const formattedCurrentValue = `${typeof currentValue === 'number' ? currentValue.toPrecision(4) : currentValue} ${device.units?.slice(0, 3)}`;
    const handleIncrementClick = () => {
        if (relativeMoveIncrement !== null && typeof device.value === 'number') {
            handleSetValueRequest(device.name, relativeMoveIncrement + currentValue);
        }
    };
    const handleDecrementClick = () => {
        if (relativeMoveIncrement !== null && typeof device.value === 'number') {
            handleSetValueRequest(device.name, currentValue - relativeMoveIncrement);
        }
    };

    const handleQuestionMarkClick = () => {
        setIsExpanded(!isExpanded);
    };

    if (!device) return;

    return (
        <article
            className={cn(
                `w-96 h-fit border border-slate-300 shadow-lg rounded-lg flex flex-col relative bg-slate-200 text-slate-900`,
                className,
            )}
            {...props}
        >
            {/*Row -Icons */}
            <div className="flex justify-between px-2 py-2 flex-shrink-0">
                {/* <div 
                    className="h-10 aspect-square  flex justify-center items-center text-slate-500 hover:text-slate-800"
                    >
                </div> */}
                <Lock
                    size={24}
                    className={
                        device.locked
                            ? 'text-slate-900 hover:cursor-pointer hover:text-slate-700'
                            : 'text-slate-500 hover:text-slate-700 hover:cursor-pointer'
                    }
                    onClick={() => handleLockClick(device.name)}
                />
                {svgIcon && (
                    <div className="aspect-square h-20 text-slate-600 flex justify-center items-center">
                        {svgIcon}
                    </div>
                )}
                <Question
                    size={24}
                    className="text-slate-500 hover:text-slate-700 hover:cursor-pointer"
                    onClick={handleQuestionMarkClick}
                />
                {/* <div 
                    className="h-10 aspect-square  flex justify-center items-center hover:cursor-pointer text-slate-500 hover:text-slate-900"
                    >
                </div> */}
            </div>
            {/* Row - Device Name */}
            <div className="flex justify-center items-center">
                <p className="text-3xl text-slate-800 overflow-hidden overflow-ellipsis px-4">
                    {title ? title : device.name}
                </p>
            </div>
            {/* Row - Current Device Value */}
            <div className="flex justify-center items-center ">
                <p className="text-5xl py-2 text-black">{formattedCurrentValue}</p>
            </div>
            {/* Row - Absolute move */}
            <div
                className={`${device.locked ? 'opacity-60' : ''} flex justify-around items-center py-2`}
            >
                <p className="text-slate-800 text-xs font-extralight w-1/3 text-right">Absolute</p>
                <InputNumber
                    // label={device.units && device.units.slice(0,3)}
                    // labelPosition='right'
                    className={`w-20`}
                    handleEnter={(input) =>
                        input !== null && handleSetValueRequest(device.name, input)
                    }
                    onChange={(input) => setAbsoluteMoveValue(input)}
                    classNameInput="text-right border border-slate-300 rounded-md bg-sky-200 shadow-inner"
                    disabled={device.locked}
                />
                <span className="w-1/3">
                    <Button
                        text="set"
                        cb={() =>
                            absoluteMoveValue !== null &&
                            handleSetValueRequest(device.name, absoluteMoveValue)
                        }
                        size="medium"
                        className="px-6 py-1"
                        disabled={device.locked}
                    />
                </span>
            </div>
            {/* Row - Relative Move */}
            <div
                className={`${device.locked ? 'opacity-60' : ''} py-4 flex justify-center space-x-4`}
            >
                <div
                    className={`h-16 aspect-square text-white hover:text-slate-100  ${device.locked ? 'hover:cursor-not-allowed' : 'hover:cursor-pointer'}`}
                    onClick={!device.locked ? handleDecrementClick : () => {}}
                >
                    {controllerIcons.leftArrowMinus}
                </div>
                <div className="flex flex-col items-center justify-center relative">
                    <InputNumber
                        onChange={(input) => setRelativeMoveIncrement(input)}
                        classNameInput={`w-20 border border-slate-300 rounded-md bg-sky-200 shadow-inner`}
                        disabled={device.locked}
                    />
                    <p className="text-slate-800 text-xs text-center font-extralight">Relative</p>
                </div>
                <div
                    className={`h-16 aspect-square text-white hover:text-slate-100 ${device.locked ? 'hover:cursor-not-allowed' : 'hover:cursor-pointer'}`}
                    onClick={!device.locked ? handleIncrementClick : () => {}}
                >
                    {controllerIcons.rightArrowPlus}
                </div>
            </div>

            {/* Popup (Absolute Positioned) on Question Click */}
            {isExpanded && (
                <div className="absolute top-0 left-0 w-full h-full z-30 bg-slate-100 flex flex-col p-2 rounded-xl">
                    <div className="flex justify-between w-full flex-shrink-0">
                        <p className=" h-full flex items-center ml-8 text-slate-600 text-lg text-clip">
                            {device.name} | {formattedCurrentValue}
                        </p>
                        <Question
                            size={24}
                            className="text-slate-900 hover:text-slate-700 hover:cursor-pointer"
                            onClick={handleQuestionMarkClick}
                        />
                    </div>
                    <div className="flex-grow w-full overflow-auto mt-4 pl-8">
                        <pre className="text-xs">{JSON.stringify(device, null, 2)}</pre>
                    </div>
                </div>
            )}
        </article>
    );
}
