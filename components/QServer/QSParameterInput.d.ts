import { ParameterInput, ParameterInputDict, CopiedPlan, AllowedDevices } from './types/types';
type QSParameterInputProps = {
    cb?: (arg0: any) => void;
    allowedDevices: AllowedDevices;
    param: ParameterInput;
    parameter: ParameterInput;
    parameterName: string;
    updateBodyKwargs?: (arg0: ParameterInputDict) => void;
    parameters: ParameterInputDict;
    setParameters: React.Dispatch<React.SetStateAction<ParameterInputDict | null>>;
    styles?: string;
    resetInputsTrigger: boolean;
    copiedPlan: CopiedPlan | null;
    isGlobalMetadataChecked?: boolean;
    globalMetadata: any;
};
export default function QSParameterInput({ cb, allowedDevices, parameter, parameterName, updateBodyKwargs, setParameters, styles, resetInputsTrigger, copiedPlan, isGlobalMetadataChecked, globalMetadata }: QSParameterInputProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=QSParameterInput.d.ts.map