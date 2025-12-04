import { cn } from "@/lib/utils";
import QSParameterInput from "../QServer/QSParameterInput";
import { ParameterInputDict, AllowedDevices } from "../QServer/types/types";
import { Plan } from "../QServer/types/apiTypes";
import { Dispatch, SetStateAction } from "react";
type ExperimentPlanSettingsFormProps = {
    allowedPlans: Record<string, Plan>;
    allowedDevices: AllowedDevices;
    activePlan: string | null;
    parameters: ParameterInputDict | null;
    resetInputsTrigger: boolean;
    setParameters:  Dispatch<SetStateAction<ParameterInputDict | null>>;
    updateBodyKwargs: (newKwargs: {[key: string]: any}) => void;
    formItemClassName?: string;
    formClassName?: string;
    globalMetadata?: { [key: string]: string };
};
export default function ExperimentPlanSettingsForm({
    allowedDevices,
    parameters,
    resetInputsTrigger,
    setParameters,
    updateBodyKwargs,
    formItemClassName,
    formClassName,
    globalMetadata
}: ExperimentPlanSettingsFormProps) {
    return (
        <>
               <h2 className="text-xl font-bold mb-4 w-fit">Experiment Plan Settings</h2>
                <div className={cn("bg-white flex flex-col space-y-4 min-w-0 flex-shrink-0", formClassName)}>
                    {parameters && Object.keys(parameters).map((param) => 
                        <QSParameterInput 
                            key={param} 
                            param={parameters[param]} 
                            parameter={parameters[param]}
                            parameters={parameters} 
                            parameterName={parameters[param].name}
                            updateBodyKwargs={updateBodyKwargs} 
                            setParameters={setParameters} 
                            allowedDevices={allowedDevices} 
                            resetInputsTrigger={resetInputsTrigger} 
                            copiedPlan={null} 
                            isGlobalMetadataChecked={false} 
                            globalMetadata={globalMetadata}
                            className={cn("w-96 max-w-96 min-w-96", formItemClassName)}
                        />)}
                </div>
        </>
    )
}