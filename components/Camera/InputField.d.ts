import { DetectorInput } from './types/cameraTypes';
import { Devices } from '../../types/deviceControllerTypes';
type InputFieldProps = {
    onSubmit: (pv: string, value: string | number | boolean) => void;
    pv: string;
    input: DetectorInput;
    cameraSettingsPVs: Devices;
};
export default function InputField({ onSubmit, pv, input, cameraSettingsPVs }: InputFieldProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=InputField.d.ts.map