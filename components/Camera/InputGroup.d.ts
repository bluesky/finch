import { DetectorInput } from './types/cameraTypes';
import { Devices } from '../../types/deviceControllerTypes';
type InputGroupProps = {
    settingsGroup: {
        title: string;
        prefix: string | null;
        inputs: DetectorInput[];
    };
    prefix: string;
    cameraSettingsPVs: Devices;
    showTitleBar?: boolean;
    onSubmit: (pv: string, value: string | boolean | number) => void;
};
export default function InputGroup({ settingsGroup, prefix, cameraSettingsPVs, showTitleBar, onSubmit }: InputGroupProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=InputGroup.d.ts.map