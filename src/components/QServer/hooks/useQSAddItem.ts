import { useState, useEffect } from 'react';
import { getDevicesAllowed, getPlansAllowed, postQueueItem, executeItem } from '../utils/apiClient';
import { AllowedDevices, CopiedPlan } from '../types/types';
import { Plan, Parameter, Device, PostItemAddResponse, ExecuteQueueItemBody } from '../types/apiTypes';
import { AddQueueItemBody, GetDevicesAllowedResponse, GetPlansAllowedResponse } from '../types/apiTypes';

interface ParameterInput extends Parameter {
    value: string | string[];
    required: boolean;
}

interface ParameterInputDict {
    [key: string]: ParameterInput;
}

const sampleBody = {
    item: {
        'name': '',
        'kwargs': {},
        'item_type': 'plan' as const
    },
    pos: 'back'
};

interface UseQSAddItemProps {
    copiedPlan?: CopiedPlan | null;
    isGlobalMetadataChecked?: boolean;
    globalMetadata?: {[key: string]: any};
}

export function useQSAddItem({
    copiedPlan = null,
    isGlobalMetadataChecked = false,
    globalMetadata = {}
}: UseQSAddItemProps = {}) {
    // State variables
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [isSubmissionPopupOpen, setIsSubmissionPopupOpen] = useState<boolean>(false);
    const [submissionResponse, setSubmissionResponse] = useState<Record<string, any>>({});
    const [allowedPlans, setAllowedPlans] = useState<Record<string, Plan>>({});
    const [allowedDevices, setAllowedDevices] = useState<AllowedDevices>({});
    const [activePlan, setActivePlan] = useState<string | null>(null);
    const [parameters, setParameters] = useState<ParameterInputDict | null>(null);
    const [body, setBody] = useState<AddQueueItemBody>(sampleBody);
    const [positionInput, setPositionInput] = useState<string>('back');
    const [resetInputsTrigger, setResetInputsTrigger] = useState<boolean>(false);

    // API response handlers
    const handlePlanResponse = (data: GetPlansAllowedResponse) => {
        if ('success' in data) {
            if (data.success === true) {
                if ('plans_allowed' in data) {
                    const sortedPlans = Object.keys(data.plans_allowed)
                        .sort()
                        .reduce((acc: {[key:string]: Plan}, key) => {
                            acc[key] = data.plans_allowed[key];
                            return acc;
                        }, {});
                    setAllowedPlans(sortedPlans);
                } else {
                    console.log('No plans_allowed key found in response object from allowed plans');
                }
            } else {
                console.error('GET request to allowed plans returned success:false');
            }
        } 
    };

    const handleDeviceResponse = (data: GetDevicesAllowedResponse) => {
        if ('success' in data) {
            if (data.success === true) {
                if ('devices_allowed' in data) {
                    const sortedDevices = Object.keys(data.devices_allowed)
                        .sort()
                        .reduce((acc: {[key:string]: Device}, key) => {
                            acc[key] = data.devices_allowed[key];
                            return acc;
                        }, {});
                    setAllowedDevices(sortedDevices);
                } else {
                    console.log('No devices_allowed key found in response object from allowed devices');
                }
            } else {
                console.log('GET request to allowed devices returned success:false');
            }
        }
    };

    // Plan and parameter management
    const handlePlanSelect = (plan: string) => {
        if (activePlan !== plan) {
            setActivePlan(plan);
            initializeParameters(plan);
            updateBodyName(plan);
            setResetInputsTrigger(prev => !prev);
        }
    };

    const initializeParameters = (plan = '', parameters?: {[key:string]: any}) => {
        var tempParameters: {[key: string]: ParameterInput} = {};
        const multiSelectParamList = ['detectors'];
        const requiredParamList = ['detectors', 'detector', 'motor', 'target_field', 'signal', 'npts', 'x_motor', 'start', 'stop', 'x_range'];
        
        for (var param of allowedPlans[plan].parameters) {
            let defaultValue = multiSelectParamList.includes(param.name) ? [] : '';
            let isRequiredByDefinition = (param.description && param.description.toLowerCase().trim().startsWith("req"));
            tempParameters[param.name] = {...param, value: defaultValue, required: requiredParamList.includes(param.name) || isRequiredByDefinition === true};
        }
        
        if (parameters !== undefined) {
            for (var key in parameters) {
                tempParameters[key].value = parameters[key];
            }
        }
        
        setParameters(tempParameters);
        updateBodyKwargs(tempParameters);
    };

    const updateBodyKwargs = (parameters: ParameterInputDict) => {
        var parametersCopy = JSON.parse(JSON.stringify(parameters));
        
        if (isGlobalMetadataChecked) {
            if (globalMetadata) {
                if (!('md' in parametersCopy)) {
                    parametersCopy.md = {};
                }
                parametersCopy.md.value = {...globalMetadata, ...parametersCopy.md.value};
            }
        }

        setBody(state => {
            var stateCopy = JSON.parse(JSON.stringify(state));
            var newKwargs: {[key:string]: any} = {};
            
            for (var key in parametersCopy) {
                let val = parametersCopy[key].value;
                if (val === '' || (Array.isArray(val) && val.length === 0)) {
                    // value is empty, do not add to kwargs
                } else {
                    newKwargs[key] = parametersCopy[key].value;
                }
            }
            
            stateCopy.item.kwargs = newKwargs;
            return stateCopy;
        });
    };

    const updateBodyName = (name: string) => {
        setBody(state => {
            var stateCopy = state;
            stateCopy.item.name = name;
            return stateCopy;
        });
    };

    const checkRequiredParameters = () => {
        var allRequiredParametersFilled = true;
        for (var key in parameters) {
            if (parameters[key].required && parameters[key].value.length === 0) {
                allRequiredParametersFilled = false;
                break;
            }
        }
        return allRequiredParametersFilled;
    };

    // Submission handlers
    const handleSubmissionResponse = (response: PostItemAddResponse) => {
        setIsSubmissionPopupOpen(true);
        setSubmissionResponse(response);
    };

    const submitPlan = (body: AddQueueItemBody) => {
        let allRequiredParametersFilled = checkRequiredParameters();
        if (allRequiredParametersFilled) {
            postQueueItem(body, handleSubmissionResponse);
        }
    };

    const executePlan = (body: ExecuteQueueItemBody) => {
        let allRequiredParametersFilled = checkRequiredParameters();
        if (allRequiredParametersFilled) {
            const executeBody = {
                item: body.item
            };
            executeItem(executeBody, handleSubmissionResponse);
        }
    };

    const closeSubmissionPopup = (clearInputs = true) => {
        setIsSubmissionPopupOpen(false);
        if (clearInputs) setActivePlan(null);
    };

    const handleParameterRefreshClick = (activePlan: string | null) => {
        if (typeof activePlan === 'string') {
            initializeParameters(activePlan);
            setResetInputsTrigger(prev => !prev);
        }
    };

    const handleExpandClick = () => {
        setIsExpanded(!isExpanded);
        setIsSubmissionPopupOpen(false);
    };

    const handlePositionInputChange = (val: string) => {
        var sanitizedVal: string;
        
        if (typeof val === 'string' && !isNaN(parseInt(val))) {
            sanitizedVal = val.trim();
        } else {
            if (val === 'front') {
                sanitizedVal = 'front';
            } else {
                sanitizedVal = 'back';
            }
        }

        setBody(state => {
            var stateCopy = state;
            stateCopy.pos = sanitizedVal;
            return stateCopy;
        });
        setPositionInput(val);
    };

    // Effects
    useEffect(() => {
        getDevicesAllowed(handleDeviceResponse);
        getPlansAllowed(handlePlanResponse);
    }, []);

    useEffect(() => {
        if (copiedPlan !== null) {
            setIsExpanded(true);
            setActivePlan(copiedPlan.name);
            initializeParameters(copiedPlan.name, copiedPlan.parameters);
            updateBodyName(copiedPlan.name);
        }
    }, [copiedPlan]);

    // Return all state and handlers that the component needs
    return {
        // State
        isExpanded,
        isSubmissionPopupOpen,
        submissionResponse,
        allowedPlans,
        allowedDevices,
        activePlan,
        parameters,
        body,
        positionInput,
        resetInputsTrigger,
        
        // State setters
        setActivePlan,
        setParameters,
        
        // Handlers
        handlePlanSelect,
        handleSubmissionResponse,
        submitPlan,
        executePlan,
        closeSubmissionPopup,
        handleParameterRefreshClick,
        handleExpandClick,
        handlePositionInputChange,
        updateBodyKwargs,
        checkRequiredParameters,
    };
}
