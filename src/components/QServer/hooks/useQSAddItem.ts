import { useState, useEffect, useCallback } from 'react';
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
    globalMetadata?: {[key: string]: unknown};
}

export function useQSAddItem({
    copiedPlan = null,
    isGlobalMetadataChecked = false,
    globalMetadata = {}
}: UseQSAddItemProps = {}) {
    // State variables
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [isSubmissionPopupOpen, setIsSubmissionPopupOpen] = useState<boolean>(false);
    const [submissionResponse, setSubmissionResponse] = useState<PostItemAddResponse >({} as PostItemAddResponse);
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
    const updateBodyKwargs = useCallback((parameters: ParameterInputDict) => {
        const parametersCopy = JSON.parse(JSON.stringify(parameters));

        if (isGlobalMetadataChecked) {
            if (globalMetadata) {
                if (!('md' in parametersCopy)) {
                    parametersCopy.md = {};
                }
                parametersCopy.md.value = {...globalMetadata, ...parametersCopy.md.value};
            }
        }

        setBody(state => {
            const stateCopy = JSON.parse(JSON.stringify(state));
            const newKwargs: Record<string, unknown> = {};

            for (const key in parametersCopy) {
                const val = parametersCopy[key].value;
                if (val === '' || (Array.isArray(val) && val.length === 0)) {
                    // value is empty, do not add to kwargs
                } else {
                    newKwargs[key] = parametersCopy[key].value;
                }
            }

            stateCopy.item.kwargs = newKwargs;
            return stateCopy;
        });
    }, [isGlobalMetadataChecked, globalMetadata]);

    const initializeParameters = useCallback((plan = '', parameters?: Record<string, unknown>) => {
        const tempParameters: {[key: string]: ParameterInput} = {};
        const multiSelectParamList = ['detectors'];
        const requiredParamList = ['detectors', 'detector', 'motor', 'target_field', 'signal', 'npts', 'x_motor', 'start', 'stop'];

        for (const param of allowedPlans[plan].parameters) {
            const defaultValue = multiSelectParamList.includes(param.name) ? [] : '';
            const isRequiredByDefinition = (param.description && param.description.toLowerCase().trim().startsWith("req"));
            tempParameters[param.name] = {...param, value: defaultValue, required: requiredParamList.includes(param.name) || isRequiredByDefinition === true};
        }

        if (parameters !== undefined) {
            for (const key in parameters) {
                tempParameters[key].value = parameters[key] as string | string[];
            }
        }

        setParameters(tempParameters);
        updateBodyKwargs(tempParameters);
    }, [allowedPlans, updateBodyKwargs]);

    const handlePlanSelect = (plan: string) => {
        if (activePlan !== plan) {
            setActivePlan(plan);
            initializeParameters(plan);
            updateBodyName(plan);
            setResetInputsTrigger(prev => !prev);
        }
    };

    const updateBodyName = (name: string) => {
        setBody(state => {
            const stateCopy = state;
            stateCopy.item.name = name;
            return stateCopy;
        });
    };

    const checkRequiredParameters = () => {
        let allRequiredParametersFilled = true;
        for (const key in parameters) {
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
        setSubmissionResponse(response as unknown as Record<string, unknown>);
        if (response.success === true) {
            //close the popup after 5 seconds
            setTimeout(() => {
                setIsSubmissionPopupOpen(false);
                setActivePlan(null);
            }, 5000);
        }
    };

    const submitPlan = (body: AddQueueItemBody) => {
        const allRequiredParametersFilled = checkRequiredParameters();
        if (allRequiredParametersFilled) {
            postQueueItem(body, handleSubmissionResponse);
        }
    };

    const executePlan = (body: ExecuteQueueItemBody) => {
        const allRequiredParametersFilled = checkRequiredParameters();
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
        let sanitizedVal: string;

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
            const stateCopy = state;
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
            initializeParameters(copiedPlan.name, copiedPlan.parameters as Record<string, unknown>);
            updateBodyName(copiedPlan.name);
        }
    }, [copiedPlan, initializeParameters]);

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
