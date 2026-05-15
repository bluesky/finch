import { DetectorInput } from './types/cameraTypes';
import { Devices } from '../../types/deviceControllerTypes';
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
export default function InputField({ onSubmit, pv, input, cameraSettingsPVs, }: InputFieldProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=InputField.d.ts.map