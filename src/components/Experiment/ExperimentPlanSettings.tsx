import QSAddItem from "../QServer/QSAddItem";
import QSParameterInput from "../QServer/QSParameterInput";
import { useQSAddItem } from "../QServer/hooks/useQSAddItem";

export default function ExperimentPlanSettings() {
    const {
        submissionResponse,
        allowedDevices,
        parameters,
        resetInputsTrigger,
        setParameters,
        submitPlan,
        executePlan,
        handleParameterRefreshClick,
        updateBodyKwargs,
        checkRequiredParameters,
    } = useQSAddItem();

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Experiment Plan Settings</h2>
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
                            isGlobalMetadataChecked={undefined}
                            globalMetadata={undefined} />)}
        </div>
    );
}