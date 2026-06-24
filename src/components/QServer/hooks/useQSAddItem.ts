import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    usePlansAllowedQuery,
    useDevicesAllowedQuery,
    useAddQueueItemMutation,
    useExecuteQueueItemMutation,
} from '@/api/qServer/hooks';
import { CopiedPlan, ParameterInputDict } from '../types/types';
import {
    Plan,
    Device,
    PostItemAddResponse,
    ExecuteQueueItemBody,
    AddQueueItemBody,
} from '@/api/qServer/types';

const sampleBody = {
    item: {
        name: '',
        kwargs: {},
        item_type: 'plan' as const,
    },
    pos: 'back',
};

interface UseQSAddItemProps {
    copiedPlan?: CopiedPlan | null;
    isGlobalMetadataChecked?: boolean;
    globalMetadata?: { [key: string]: unknown };
}

export function useQSAddItem({
    copiedPlan = null,
    isGlobalMetadataChecked = false,
    globalMetadata = {},
}: UseQSAddItemProps = {}) {
    // State variables
    const plansQuery = usePlansAllowedQuery();
    const devicesQuery = useDevicesAllowedQuery();
    const addMutation = useAddQueueItemMutation();
    const executeMutation = useExecuteQueueItemMutation();

    const allowedPlans = useMemo(() => {
        if (!plansQuery.data?.plans_allowed) return {};
        return Object.keys(plansQuery.data.plans_allowed)
            .sort()
            .reduce((acc: Record<string, Plan>, key) => {
                acc[key] = plansQuery.data!.plans_allowed[key];
                return acc;
            }, {});
    }, [plansQuery.data]);

    const allowedDevices = useMemo(() => {
        if (!devicesQuery.data?.devices_allowed) return {};
        return Object.keys(devicesQuery.data.devices_allowed)
            .sort()
            .reduce((acc: Record<string, Device>, key) => {
                acc[key] = devicesQuery.data!.devices_allowed[key];
                return acc;
            }, {});
    }, [devicesQuery.data]);

    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [isSubmissionPopupOpen, setIsSubmissionPopupOpen] = useState<boolean>(false);
    const [submissionResponse, setSubmissionResponse] = useState<PostItemAddResponse>(
        {} as PostItemAddResponse,
    );
    const [activePlan, setActivePlan] = useState<string | null>(null);
    const [parameters, setParameters] = useState<ParameterInputDict | null>(null);
    const [body, setBody] = useState<AddQueueItemBody>(sampleBody);
    const [positionInput, setPositionInput] = useState<string>('back');
    const [resetInputsTrigger, setResetInputsTrigger] = useState<boolean>(false);

    // Plan and parameter management
    const updateBodyKwargs = useCallback(
        (parameters: ParameterInputDict) => {
            const parametersCopy = JSON.parse(JSON.stringify(parameters));

            if (isGlobalMetadataChecked) {
                if (globalMetadata) {
                    if (!('md' in parametersCopy)) {
                        parametersCopy.md = {};
                    }
                    parametersCopy.md.value = { ...globalMetadata, ...parametersCopy.md.value };
                }
            }

            setBody((state) => {
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
        },
        [isGlobalMetadataChecked, globalMetadata],
    );

    const initializeParameters = useCallback(
        (plan = '', parameters?: Record<string, unknown>) => {
            const tempParameters: ParameterInputDict = {};
            const multiSelectParamList = ['detectors'];
            const requiredParamList = [
                'detectors',
                'detector',
                'motor',
                'target_field',
                'signal',
                'npts',
                'x_motor',
                'start',
                'stop',
            ];

            for (const param of allowedPlans[plan].parameters) {
                const defaultValue = multiSelectParamList.includes(param.name) ? [] : '';
                const isRequiredByDefinition =
                    param.description && param.description.toLowerCase().trim().startsWith('req');
                tempParameters[param.name] = {
                    ...param,
                    value: defaultValue,
                    required:
                        requiredParamList.includes(param.name) || isRequiredByDefinition === true,
                };
            }

            if (parameters !== undefined) {
                for (const key in parameters) {
                    tempParameters[key].value = parameters[key] as string | string[];
                }
            }

            setParameters(tempParameters);
            updateBodyKwargs(tempParameters);
        },
        [allowedPlans, updateBodyKwargs],
    );

    const handlePlanSelect = (plan: string) => {
        if (activePlan !== plan) {
            setActivePlan(plan);
            initializeParameters(plan);
            updateBodyName(plan);
            setResetInputsTrigger((prev) => !prev);
        }
    };

    const updateBodyName = (name: string) => {
        setBody((state) => {
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
        setSubmissionResponse(response as PostItemAddResponse);
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
            addMutation.mutate(body, { onSuccess: handleSubmissionResponse });
        }
    };

    const executePlan = (body: ExecuteQueueItemBody) => {
        const allRequiredParametersFilled = checkRequiredParameters();
        if (allRequiredParametersFilled) {
            executeMutation.mutate({ item: body.item }, { onSuccess: handleSubmissionResponse });
        }
    };

    const closeSubmissionPopup = (clearInputs = true) => {
        setIsSubmissionPopupOpen(false);
        if (clearInputs) setActivePlan(null);
    };

    const handleParameterRefreshClick = (activePlan: string | null) => {
        if (typeof activePlan === 'string') {
            initializeParameters(activePlan);
            setResetInputsTrigger((prev) => !prev);
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

        setBody((state) => {
            const stateCopy = state;
            stateCopy.pos = sanitizedVal;
            return stateCopy;
        });
        setPositionInput(val);
    };

    // Effects
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
