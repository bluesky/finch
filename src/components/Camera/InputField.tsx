import { type } from './utils/cameraDeviceData';
import InputEnum from './InputEnum';
import InputFloat from './InputFloat';
import InputInteger from './InputInteger';
import InputString from './InputString';

import { DetectorInput } from './types/cameraTypes';
import { Devices } from '@/types/deviceControllerTypes';

type InputFieldProps = {
    /** Callback invoked with the full PV name and new value when the user submits a change. */
    onSubmit: (pv: string, value: string | number | boolean) => void;
    /** Full EPICS PV name for this input (e.g. `'13SIM1:cam1:AcquireTime'`). */
    pv: string;
    /** Descriptor for the input field: suffix, display label, type, and optional min/max/enums. */
    input: DetectorInput;
    /** Map of full PV names to live device objects used to determine connection state and current value. */
    cameraSettingsPVs: Devices;
};
export default function InputField({
    onSubmit = () => {},
    pv = '',
    input = { suffix: 'Example', label: 'Example', type: 'integer', min: 0, max: 5 },
    cameraSettingsPVs,
}: InputFieldProps) {
    //create custom wrapper around submit function so we can correctly pass in the pv.
    //pv is determined in this component but not passed to children as a direct prop
    //This decouples the child component from needing the PV

    const isPVConnected = pv in cameraSettingsPVs ? cameraSettingsPVs[pv].connected : false;

    const handleSubmitWithPV = (newValue: string | number | boolean) => {
        if (
            isPVConnected &&
            'enum_strs' in cameraSettingsPVs[pv] &&
            cameraSettingsPVs[pv].enum_strs &&
            typeof cameraSettingsPVs[pv].value === 'number'
        ) {
            onSubmit(pv, cameraSettingsPVs[pv].enum_strs.indexOf(newValue as string));
        }
        onSubmit(pv, newValue); //needs a new function for handling enums
    };

    const renderInput = () => {
        switch (input.type) {
            case type.integer:
                return (
                    <InputInteger
                        label={input.label}
                        onSubmit={handleSubmitWithPV}
                        isDisabled={!isPVConnected}
                    />
                );
            case type.float:
                return (
                    <InputFloat
                        label={input.label}
                        onSubmit={handleSubmitWithPV}
                        isDisabled={!isPVConnected}
                    />
                );
            case type.string:
                return (
                    <InputString
                        label={input.label}
                        onSubmit={handleSubmitWithPV}
                        isDisabled={!isPVConnected}
                    />
                );
            case type.enum:
                return (
                    <InputEnum
                        label={input.label}
                        enums={input.enums}
                        onSubmit={handleSubmitWithPV}
                        isDisabled={!isPVConnected}
                    />
                );
            default:
                console.log(
                    'Error in InputField, received a type of: ' +
                        input.type +
                        ' which does not match any available input types.',
                );
                return <p>Input type error</p>;
        }
    };

    let currentValueText = '';
    //handle conversion of enum value (which is a number) to a corresponding human readable string (stored in the enum_strs property from pyepics).
    if (
        isPVConnected &&
        'enum_strs' in cameraSettingsPVs[pv] &&
        cameraSettingsPVs[pv].enum_strs &&
        typeof cameraSettingsPVs[pv].value === 'number'
    ) {
        currentValueText = cameraSettingsPVs[pv].enum_strs[cameraSettingsPVs[pv].value];
    } else {
        if (isPVConnected) {
            currentValueText = cameraSettingsPVs[pv].value as string;
        } else {
            currentValueText = 'Not Connected';
        }
    }

    return (
        <li className="flex">
            {renderInput()}
            <p
                className={`${isPVConnected ? 'text-sky-800' : 'text-red-400'} ml-6 overflow-auto text-nowrap`}
            >
                {currentValueText}
            </p>
        </li>
    );
}
