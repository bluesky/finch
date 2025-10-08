import { useState } from "react";
import { DetectorInput } from "./types/cameraTypes";
import InputField from "./InputField";
import { tailwindIcons} from '@/assets/icons';
import { Devices } from "@/types/deviceControllerTypes";
type InputGroupProps = {
    settingsGroup: {
        title: string;
        prefix: string | null;
        inputs: DetectorInput[]
    },
    prefix: string,
    cameraSettingsPVs: Devices,
    showTitleBar?: boolean,
    onSubmit: (pv:string, value:string | boolean | number) => void
}
export default function InputGroup({settingsGroup, prefix='13SIM1', cameraSettingsPVs, showTitleBar=true, onSubmit}: InputGroupProps) {
    const [ isExpanded, setIsExpanded ] = useState(true);

    const handleHeadingClick = () => {
        setIsExpanded(!isExpanded);
    }
    return (
        <div className="mb-4">
            <span onClick={handleHeadingClick} className="flex items-end space-x-2 border-b border-b-slate-300 w-fit px-1 hover:cursor-pointer hover:text-slate-600">
                <h3 className="text-xl">{settingsGroup.title}</h3>
                <div>{isExpanded ?  tailwindIcons.chevronUp : tailwindIcons.chevronDown}</div>
            </span>
            <ul className={`${isExpanded ? 'block' : 'hidden'} flex flex-col space-y-4 pl-4 pt-2`}>
                {settingsGroup.inputs.map((input) => 
                    <InputField
                        pv={`${prefix}:${settingsGroup.prefix !== null ? settingsGroup.prefix + ':' : ''}${input.suffix}`} 
                        key={input.suffix} 
                        input={input}
                        cameraSettingsPVs={cameraSettingsPVs}
                        onSubmit={onSubmit}
                    />
                )}
            </ul>
        </div>
    )
}