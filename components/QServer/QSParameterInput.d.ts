import { ParameterInput, ParameterInputDict, CopiedPlan, AllowedDevices, GlobalMetadata } from './types/types';
type QSParameterInputProps = {
    allowedDevices: AllowedDevices;
    param: ParameterInput;
    parameter: ParameterInput;
    parameterName: string;
    updateBodyKwargs?: (arg0: ParameterInputDict) => void;
    parameters: ParameterInputDict;
    setParameters: React.Dispatch<React.SetStateAction<ParameterInputDict | null>>;
    resetInputsTrigger: boolean;
    copiedPlan: CopiedPlan | null;
    isGlobalMetadataChecked?: boolean;
    globalMetadata: GlobalMetadata;
};
export default function QSParameterInput({ allowedDevices, parameter, parameterName, updateBodyKwargs, setParameters, resetInputsTrigger, copiedPlan, isGlobalMetadataChecked, globalMetadata }: QSParameterInputProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=QSParameterInput.d.ts.map