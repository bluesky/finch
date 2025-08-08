import { useState } from "react";
import { cn } from "@/lib/utils";
import { Lock, LockOpen, QuestionMark } from "@phosphor-icons/react";
import { Device } from "@/types/deviceControllerTypes";
import ControllerAbsoluteMove from "./ControllerAbsoluteMove";
import ControllerRelativeMove from "./ControllerRelativeMove";
import InputNumber from "./InputNumber";
import Button from "./Button";
import { controllerIcons } from "@/assets/icons";

export type DeviceControllerBoxProps = {
    device: Device;
    deviceRBV?: Device;
    handleSetValueRequest: (deviceName: string, value: number) => void;
    handleLockClick: (deviceName: string) => void;
    svgIcon?: React.ReactNode;
    className?: string;
    title?: string;
}

export default function DeviceControllerBox({ device, deviceRBV, handleSetValueRequest, handleLockClick, svgIcon, className, title}: DeviceControllerBoxProps) {
    if (!device) return;
    const backgroundColorClass = device.locked ? 'bg-slate-400' : 'bg-slate-100';
    const [ absoluteMoveValue, setAbsoluteMoveValue ] = useState<number | null>(null);
    const [ relativeMoveIncrement, setRelativeMoveIncrement ] = useState<number | null>(null);
    const [ isExpanded, setIsExpanded ] = useState(false);

    const currentValue = (deviceRBV ? deviceRBV.value : device.value) as number;
    const deviceName = deviceRBV ? deviceRBV.name : device.name;
    const formattedCurrentValue = `${typeof currentValue === 'number' ? currentValue.toPrecision(4) : currentValue} ${device.units?.slice(0,3)}`;
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
    }
    return (
        <article className={cn(`w-96 border border-slate-300 rounded-xl flex flex-col relative ${backgroundColorClass} ${device.locked && 'opacity-60'}`, className)}>
            {/*Row -Icons */}
            <div className="flex justify-between px-2 py-2 flex-shrink-0">
                <div 
                    className="h-12 aspect-square bg-white rounded-full hover:cursor-pointer border border-slate-500 flex justify-center items-center text-slate-500 hover:text-slate-800"
                    onClick={()=>handleLockClick(device.name)}
                >
                    {device.locked 
                        ? 
                            <Lock 
                                size={24} 
                                className="" 
                                
                            /> 
                        : 
                            <LockOpen 
                                size={24} 
                                className="" 
                               
                            />
                    }
                </div>
                <div className="aspect-square h-20 text-slate-600">
                    {svgIcon && svgIcon}
                </div>
                <div 
                    className="h-12 aspect-square bg-white rounded-full border border-slate-500 flex justify-center items-center hover:cursor-pointer text-slate-500 hover:text-slate-900"
                    onClick={handleQuestionMarkClick}
                >
                    <QuestionMark size={24} className=""  />
                </div>
            </div>
            {/* Row - Device Name */}
            <div className="flex justify-center items-center">
                <p className="text-3xl text-slate-800 overflow-hidden overflow-ellipsis px-4">{title ? title : device.name}</p>
            </div>
            {/* Row - Current Device Value */}
            <div className="flex justify-center items-center ">
                <p className="text-5xl py-2 text-black">{formattedCurrentValue}</p>
            </div>
            {/* Row - Absolute move */}
            <div className="flex justify-center items-center py-2 space-x-4">
                <InputNumber 
                    label={device.units && device.units.slice(0,3)}
                    labelPosition='right' 
                    className={`w-28`} 
                    handleEnter={(input)=>input!==null && handleSetValueRequest(device.name, input)}  
                    onChange={(input) => setAbsoluteMoveValue(input)} 
                    inputClassName="text-right"
                    disabled={device.locked}
                />
                <Button 
                    text="set" 
                    cb={()=>absoluteMoveValue!==null && handleSetValueRequest(device.name, absoluteMoveValue)} 
                    size="medium"
                    styles="px-6"
                    disabled={device.locked}
                />

            </div>
            {/* Row - Relative Move */}
            <div className="bg-[#A4CEF8] py-4 flex justify-center rounded-b-xl space-x-6">
                <div 
                    className={`h-16 aspect-square text-white hover:text-slate-100  ${device.locked ? 'hover:cursor-not-allowed': 'hover:cursor-pointer'}`}
                    onClick={!device.locked ? handleDecrementClick : ()=>{}}
                >
                    {controllerIcons.leftArrowMinus}
                </div>
                <div className="flex flex-col items-center relative">
                    <p className="absolute top-0 -left-3  z-10 text-slate-700">-+</p>
                    <InputNumber 
                        onChange={(input) => setRelativeMoveIncrement(input)}
                        inputClassName={`w-20`}
                        disabled={device.locked}
                    />
                    <p className="text-slate-700">{formattedCurrentValue}</p>
                </div>
                <div 
                    className={`h-16 aspect-square text-white hover:text-slate-100  ${device.locked ? 'hover:cursor-not-allowed': 'hover:cursor-pointer'}`}
                    onClick = {!device.locked ? handleIncrementClick : ()=>{}}
                >
                    {controllerIcons.rightArrowPlus}
                </div>
            </div>

            {/* Popup (Absolute Positioned) on Question Click */}
            {
                isExpanded &&
                <div className="absolute top-0 left-0 w-full h-full z-30 bg-slate-100 flex flex-col p-2 rounded-xl">
                    <div className="flex justify-between w-full flex-shrink-0">
                        <p className=" h-full flex items-center ml-8 text-slate-600 text-lg text-clip">{device.name} | {formattedCurrentValue}</p>
                        <div 
                            className="flex-shrink-0 h-12 aspect-square bg-white rounded-full border border-slate-500 flex justify-center items-center hover:cursor-pointer text-slate-500 hover:text-slate-900"
                            onClick={handleQuestionMarkClick}
                        >
                            <QuestionMark size={24} className=""  />
                        </div>
                    </div>
                    <div className="flex-grow w-full overflow-auto mt-4 pl-8">
                        <pre className="text-xs">{JSON.stringify(device, null, 2)}</pre>
                    </div>                 
                </div>
            }
        </article>
    )
}