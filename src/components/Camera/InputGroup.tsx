import { useState } from 'react';
import { DetectorInput } from './types/cameraTypes';
import InputField from './InputField';
import { tailwindIcons } from '@/assets/icons';
import { Devices } from '@/types/deviceControllerTypes';
type InputGroupProps = {
    /** Settings group descriptor containing a display title, an optional PV sub-prefix, and a list of detector inputs. */
    settingsGroup: {
        title: string;
        prefix: string | null;
        inputs: DetectorInput[];
    };
    /** EPICS PV prefix prepended (with the group sub-prefix) when constructing full PV names for each input. */
    prefix: string;
    /** Map of full PV names to live device objects forwarded to each `InputField`. */
    cameraSettingsPVs: Devices;
    /** Callback invoked when the user submits a new value for any PV in the group. */
    onSubmit: (pv: string, value: string | boolean | number) => void;
};
export default function InputGroup({
    settingsGroup,
    prefix = '13SIM1',
    cameraSettingsPVs,
    onSubmit,
}: InputGroupProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const handleHeadingClick = () => {
        setIsExpanded(!isExpanded);
    };
    return (
        <div className="mb-4">
            <span
                onClick={handleHeadingClick}
                className="flex items-end space-x-2 border-b border-b-slate-300 w-fit px-1 hover:cursor-pointer hover:text-slate-600"
            >
                <h3 className="text-xl">{settingsGroup.title}</h3>
                <div>{isExpanded ? tailwindIcons.chevronUp : tailwindIcons.chevronDown}</div>
            </span>
            <ul className={`${isExpanded ? 'block' : 'hidden'} flex flex-col space-y-4 pl-4 pt-2`}>
                {settingsGroup.inputs.map((input) => (
                    <InputField
                        pv={`${prefix}:${settingsGroup.prefix !== null ? settingsGroup.prefix + ':' : ''}${input.suffix}`}
                        key={input.suffix}
                        input={input}
                        cameraSettingsPVs={cameraSettingsPVs}
                        onSubmit={onSubmit}
                    />
                ))}
            </ul>
        </div>
    );
}
