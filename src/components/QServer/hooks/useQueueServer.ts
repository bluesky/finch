// hooks/useQueueServer.js
import { useState, useEffect, useRef } from 'react';
import { getQueue, getQueueHistory, getQueueItem, getStatus } from "../utils/apiClient";
import { GetHistoryResponse, GetQueueResponse, GetStatusResponse, RunningQueueItem } from '../types/apiTypes';
import { GlobalMetadata, PlanInput } from '../types/types';

export const useQueueServer = () => {
    const [ currentQueue, setCurrentQueue ] = useState<GetQueueResponse | null>(null);
    const [ queueHistory, setQueueHistory ] = useState<GetHistoryResponse | null>(null);
    const [runningItem, setRunningItem] = useState<RunningQueueItem | null>(null);
    const [isREToggleOn, setIsREToggleOn] = useState(false);
    const runEngineToggleRef = useRef(isREToggleOn);
    const [ globalMetadata, setGlobalMetadata ] = useState<GlobalMetadata>({});
    const [ isGlobalMetadataChecked, setIsGlobalMetadataChecked ] = useState(true);
    const [ apiStatus, setApiStatus ] = useState<GetStatusResponse | null>(null);


    //setup polling interval for getting regular updates from the http server
    var pollingInterval:number;
    const oneSecond = 1000; //1 second in milliseconds
    const twoSeconds = 2000; //2 seconds in milliseconds
    const tenSeconds = 10000; //10 seconds in milliseconds
    const thirtySeconds = 30000; //30 seconds in milliseconds

    pollingInterval = import.meta.env.VITE_QSERVER_POLLING_INTERVAL ? parseInt(import.meta.env.VITE_QSERVER_POLLING_INTERVAL) : twoSeconds;

    const handleQueueDataResponse = (res: GetQueueResponse) => {
        try {
            if (res.success === true) {
                setCurrentQueue((prevState) => {
                    //only update state if the queue uid changed to prevent unneeded dom updates
                    if (prevState && prevState.plan_queue_uid === res.plan_queue_uid) {
                        return prevState;
                    } else {
                        return res;
                    }
                });

/*                 if (JSON.stringify(res.items) !== JSON.stringify(queueDataRef.current)) {
                    setQueueData(res.items);
                } */
               setRunningItem((prevState) => {
                const isItemRunning = Object.keys(res.running_item).length > 0;
                //no running item before, and nothing running now:
                if (prevState === null && !isItemRunning ) {
                    //still not active item
                    return prevState;
                }

                //no running item before, but there is now:
                if (prevState === null && isItemRunning && 'item_uid' in res.running_item) {
                    return res.running_item;
                }

                //item running before, different item running now:
                if ((isItemRunning && 'item_uid' in res.running_item) && (prevState !== null) && (prevState.item_uid !== res.running_item.item_uid)) {
                    return res.running_item;
                }

                //item running before, no item running now:
                if (!isItemRunning && prevState !== null) {
                    return null;
                }
                return prevState;
               })
                setIsREToggleOn(Object.keys(res.running_item).length > 0);
            }
        } catch(error) {
            console.log({error});
        }
    };

    const handleQueueHistoryResponse = (res: GetHistoryResponse) => {
        if (res.success === true) {
            setQueueHistory((prevState) => {
                //only update the state if the plan history uid changed
                if (prevState && prevState.plan_history_uid === res.plan_history_uid) {
                    return prevState;
                } else {
                    return res;
                }
            });

        } else {
            console.log('Error retrieving queue history: ', res);
        }
    };

    const handleApiStatusResponse = (res: GetStatusResponse | null) => {
        if (res) {
            setApiStatus(res);
        }
    };

    const processConsoleMessage = (msg:string) => {
        //using the console log to trigger get requests has some issues with stale state, even with useRef
        //This can be further evaluated, but we should potentially get rid of the ref for the toggle button which had issues.
        //The get/status api endpoint seems to not provide the most recent running status when called immediately after the console triggers it
        //console.log({msg});
        //function processess each Queue Server console message to trigger immediate state and UI updates
        if (msg.startsWith("Processing the next queue item")) {
            getQueue(handleQueueDataResponse);
            getQueueHistory(handleQueueHistoryResponse);
        }

        if (msg.startsWith("Starting the plan")) {
            //update RE worker
            getQueue(handleQueueDataResponse);
            getQueueHistory(handleQueueHistoryResponse);
        }

        if (msg.startsWith("Starting queue processing")) {
            getQueue(handleQueueDataResponse);
        }

        if (msg.startsWith("Item added: success=True")) {
            getQueue(handleQueueDataResponse);
        }

        if (msg.startsWith("Clearing the queue")) {
            getQueue(handleQueueDataResponse);
        }

        if (msg.startsWith("Queue is empty")) {
            //message will occur if RE worker turned on with no available queue items
            //TO DO - fix this because it's not turning the toggle switch to 'off'
            setTimeout(()=> getQueue(handleQueueDataResponse), 500 ); //call the server some time after failure occurs
        }

        if (msg.startsWith("The plan failed")) {
            //get request on queue items
            //qserver takes some time to place the item back into the queue
            setTimeout(()=> getQueue(handleQueueDataResponse), 500 ); //call the server some time after failure occurs
            setTimeout(()=> getQueueHistory(handleQueueHistoryResponse), 500 );
        }

        if (msg.startsWith("Removing item from the queue")) {
            //get request on queue items
            //qserver takes some time to place the item back into the queue
            setTimeout(()=> getQueue(handleQueueDataResponse), 500 ); //call the server some time after failure occurs
        }
    };

    const updateGlobalMetadata = (dict:GlobalMetadata) => {
        setGlobalMetadata(dict);
    };

    const removeDuplicateMetadata = (plan: PlanInput) => {
        //removes any duplicate between copied plan and global md
        //prevents user from seeing duplicated key/value in md parameter input

        if ('md' in plan.parameters) {
            for (const key in globalMetadata) {
                //console.log({key});
                if (key in plan.parameters.md) {
                    delete plan.parameters.md[key];
                }
            }
        }
        return plan;
    };

    const handleGlobalMetadataCheckboxChange = (isChecked: boolean) => {
        setIsGlobalMetadataChecked(isChecked);
    };

    useEffect(() => {
        getQueue(handleQueueDataResponse);
        getQueueHistory(handleQueueHistoryResponse);

        const queueInterval = setInterval(() => getQueue(handleQueueDataResponse), pollingInterval);
        const historyInterval = setInterval(() => getQueueHistory(handleQueueHistoryResponse), pollingInterval);
        const statusInterval = setInterval(() => getStatus(handleApiStatusResponse), pollingInterval);

        return () => {
            clearInterval(queueInterval);
            clearInterval(historyInterval);
            clearInterval(statusInterval);
        };
    }, [pollingInterval]);

    return {
        currentQueue,
        queueHistory,
        isREToggleOn,
        runningItem,
        runEngineToggleRef,
        setIsREToggleOn,
        handleQueueDataResponse,
        handleQueueHistoryResponse,
        processConsoleMessage,
        globalMetadata,
        updateGlobalMetadata,
        removeDuplicateMetadata,
        isGlobalMetadataChecked,
        handleGlobalMetadataCheckboxChange,
        apiStatus
    };
};
