import axios from 'axios';
import {
    mockEnvironmentOpenResponse, 
    mockGetStatusResponse, 
    mockGetQueueResponse, 
    mockGetDevicesAllowedResponse, 
    mockGetPlansAllowedResponse, 
    mockGetQueueItemResponse, 
    mockDeleteQueueItemResponse, 
    mockGetHistoryResponse, 
    mockAddItemSuccessResponse, 
    mockGetRunsActiveResponse,
    mockExecuteItemResponse } from './qServerMockData';
import {
    AddQueueItemBody, 
    GetQueueResponse, 
    GetHistoryResponse, 
    GetStatusResponse, 
    GetPlansAllowedResponse, 
    GetDevicesAllowedResponse, 
    PostItemAddResponse, 
    ExecuteQueueItemBody, 
    PostItemExecuteResponse, 
    PostEnvironmentOpenResponse, 
    GetQueueItemResponse,
    RemoveQueueItemBody,
    GetRunsActiveResponse,
    PostItemRemoveResponse} from '../types/apiTypes';


const initializeQueueServerKey = () => {
    var key;
    const defaultKey = 'test';
    key = import.meta.env.VITE_QSERVER_API_KEY || defaultKey;
    return key;
}

const initializeQueueServerApiUrl = () => {
    const currentWebsiteIP = window.location.hostname;
    const currentWebsitePort = window.location.port;
    const port = ":60610";
    var httpUrl;
    if (import.meta.env.VITE_QSERVER_API_URL) {
        httpUrl = import.meta.env.VITE_QSERVER_API_URL
    } else {
        if (import.meta.env.VITE_PROXY_WS === 'false') {
            httpUrl = "http://" + currentWebsiteIP + port; //default when ran locally
        } else {
            httpUrl=`http://${currentWebsiteIP}:${currentWebsitePort}/api/qserver` //reverse proxy, does not work with React live dev server
        }
    }
    return httpUrl;
};

const getQSConsoleUrl = () => {
    //if no env variable is set, then assume that the React App is on the same workstation as the fastAPI server
        //having an env variable would be for developers running React on a separate workstation from fastAPI
    const currentWebsiteIP = window.location.hostname;
    const currentWebsitePort = window.location.port;
    const pathname = "/api/v1/qs-console-socket";
    const port = ":8001";
    var wsUrl;

    if (import.meta.env.VITE_QSERVER_WS) {
        wsUrl = import.meta.env.VITE_QSERVER_WS;
    } else {
        if (import.meta.env.VITE_PROXY_WS === 'false') {
            wsUrl = "ws://" + currentWebsiteIP + port + pathname; //default when ran locally
        } else {
            wsUrl=`ws://${currentWebsiteIP}:${currentWebsitePort}/api/qserver/console` //reverse proxy, does not work with React live dev server
        }
    }

    return wsUrl;
};

var queueServerApiUrl = initializeQueueServerApiUrl();
const setQueueServerApiUrl = (url:string) => {
    queueServerApiUrl = url;
}
const qServerKey = initializeQueueServerKey();


const getQueue = async (cb:(data:GetQueueResponse)=>void, mock=false) => {
    if (mock) {
        cb(mockGetQueueResponse);
        return;
    }
    try {
        const response = await axios.get(queueServerApiUrl + '/api/queue/get', 
            {headers : {
                'Authorization' : 'ApiKey ' + qServerKey
            }}
        );
        cb(response.data);
    } catch (error) {
        console.error('Error fetching queue:', error);
    }
};

const getQueueHistory = async (cb:(data:GetHistoryResponse)=>void, mock=false) => {
    if (mock) {
        cb(mockGetHistoryResponse);
        return;
    }
    try {
        const response = await axios.get(queueServerApiUrl + '/api/history/get', 
            {headers : {
                'Authorization' : 'ApiKey ' + qServerKey
            }}
        );
        cb(response.data);
    } catch (error) {
        console.error('Error fetching history:', error);
    }
};

const getStatus = async (cb:(data:GetStatusResponse)=>void, mock = false) => {
    if (mock) {
        cb(mockGetStatusResponse);
        return;
    }
    try {
        const response = await axios.get(queueServerApiUrl + '/api/status', 
            {headers : {
                'Authorization' : 'ApiKey ' + qServerKey
            }}
        );
        cb(response.data);
    } catch (error) {
        console.error('Error fetching status:', error);
    }
};

const getPlansAllowed = async (cb:(data:GetPlansAllowedResponse)=>void, mock = false) => {
    if (mock) {
        cb(mockGetPlansAllowedResponse);
        return;
    }
    try {
        const response = await axios.get(queueServerApiUrl + '/api/plans/allowed',
            {headers : {
                'Authorization' : 'ApiKey ' + qServerKey
            }}
        );
        cb(response.data);
    } catch (error) {
        console.error('Error fetching plans allowed:', error);
    }
}

const getDevicesAllowed = async (cb:(data:GetDevicesAllowedResponse)=>void, mock = false) => {
    if (mock) {
        cb(mockGetDevicesAllowedResponse);
        return;
    }
    try {
        const response = await axios.get(queueServerApiUrl + '/api/devices/allowed',
            {headers : {
                'Authorization' : 'ApiKey ' + qServerKey
            }}
        );
        cb(response.data);
    } catch (error) {
        console.error('Error fetching devices allowed:', error);
    }
};

const startRE = async () => {
    //returns true if no errors encountered
    try {
        const response = await axios.post(queueServerApiUrl + '/api/queue/start', 
            {},
            {headers : {
                'Authorization' : 'ApiKey ' + qServerKey
            }});

            if (response.data.success === true) { 
                return true;
            } else {
                return false;
            }
    } catch (error) {
        console.error('Error starting RE:', error);
        return false;
    }
};

const pauseRE = async () => {
    //returns true if no errors encountered
    try {
        const response = await axios.post(queueServerApiUrl + '/api/re/pause', 
            {},
            {headers : {
                'Authorization' : 'ApiKey ' + qServerKey
            }});

            if (response.data.success === true) { 
                return true;
            } else {
                return false;
            }
    } catch (error) {
        console.error('Error pausing RE:', error);
        return false;
    }
};

const resumeRE = async () => {
    //returns true if no errors encountered
    try {
        const response = await axios.post(queueServerApiUrl + '/api/re/resume', 
            {},
            {headers : {
                'Authorization' : 'ApiKey ' + qServerKey
            }});

            if (response.data.success === true) { 
                return true;
            } else {
                return false;
            }
    } catch (error) {
        console.error('Error resuming RE:', error);
        return false;
    }
};

const abortRE = async () => {
    //returns true if no errors encountered
    try {
        const response = await axios.post(queueServerApiUrl + '/api/re/abort', 
            {},
            {headers : {
                'Authorization' : 'ApiKey ' + qServerKey
            }});

            if (response.data.success === true) { 
                return true;
            } else {
                return false;
            }
    } catch (error) {
        console.error('Error aborting RE:', error);
        return false;
    }
};

const postQueueItem = async (body:AddQueueItemBody, cb:(data:PostItemAddResponse)=>void, mock=false) => {
    if (mock) {
        cb(mockAddItemSuccessResponse);
        return;
    }
    try {
        const response = await axios.post(queueServerApiUrl + '/api/queue/item/add', 
        body,
        {headers : {
            'Authorization' : 'ApiKey ' + qServerKey
        }});
        //console.log(response.data);
        cb(response.data);
        return 'success';
    } catch (error) {
        console.error('Error submitting plan', error);
        return 'failed';
    }
};

const executeItem = async (body:ExecuteQueueItemBody, cb:(data:PostItemExecuteResponse)=>void, mock=false) => {
    if (mock) {
        cb(mockExecuteItemResponse);
        return;
    }
    try {
        const response = await axios.post(queueServerApiUrl + '/api/queue/item/execute', 
        body,
        {headers : {
            'Authorization' : 'ApiKey ' + qServerKey
        }});
        //console.log(response.data);
        cb(response.data);
        return 'success';
    } catch (error) {
        console.error('Error executing plan', error);
        return 'failed';
    }
}

const getQueueItem = async (uid='', cb:(data:GetQueueItemResponse)=>void, mock=false) => {
    if (mock) {
        cb(mockGetQueueItemResponse);
        return;
    }
    try {
        const response = await axios.get(queueServerApiUrl + '/api/queue/item/get', {
            params: {uid: uid},
            headers : {
                'uid' : uid,
                'Authorization' : 'ApiKey ' + qServerKey
            }
        },
        );
        cb(response.data);
    } catch (error) {
        console.error('Error fetching queue item:', error);
    }
};

const deleteQueueItem = async (body:RemoveQueueItemBody, cb:(data:PostItemRemoveResponse)=>void, mock=false) => {
    if (mock) {
        cb(mockDeleteQueueItemResponse);
        return; 
    }
    try {
        const response = await axios.post(queueServerApiUrl + '/api/queue/item/remove', 
        body,
        {headers : {
            'Authorization' : 'ApiKey ' + qServerKey
        }});
        //console.log(response.data);
        cb(response.data);
    return 'success';
    } catch (error) {
        console.error('Error deleting item from queue', error);
        return 'failed';
    }
};

const openWorkerEnvironment = async (cb:(data:PostEnvironmentOpenResponse)=>void=()=>{}, mock=false) => {
    if (mock) {
        cb(mockEnvironmentOpenResponse);
        return;
    }
    try {
        const response = await axios.post(queueServerApiUrl + '/api/environment/open',
        {}, 
        {headers : {
            'Authorization' : 'ApiKey ' + qServerKey
        }});
        cb(response.data);
        if (response.data.success === true || response.data.msg === "RE Worker environment already exists.") {
            return true; //if env is already open, it will return {success: false, msg:"RE Worker environment already exists."}
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error opening RE Worker Environment:', error);
        return false;
    }
};

const getRunsActive = async (cb:(data:GetRunsActiveResponse)=>void, mock=false) => {
    if (mock) {
        cb(mockGetRunsActiveResponse);
        return;
    }
    try {
        const response = await axios.get(queueServerApiUrl + '/api/re/runs/active', {
            headers : {
                'Authorization' : 'ApiKey ' + qServerKey
            }
        });
        cb(response.data);
    } catch (error) {
        console.error('Error fetching active runs:', error);
    }
};

// Promise-based versions of the API functions
const getRunsActivePromise = async (mock = false): Promise<GetRunsActiveResponse> => {
    if (mock) {
        return mockGetRunsActiveResponse;
    }
    try {
        const response = await axios.get(queueServerApiUrl + '/api/re/runs/active', {
            headers: {
                'Authorization': 'ApiKey ' + qServerKey
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching active runs:', error);
        throw error;
    }
};

const executeItemPromise = async (body: ExecuteQueueItemBody, mock = false): Promise<PostItemExecuteResponse> => {
    if (mock) {
        return mockExecuteItemResponse;
    }
    try {
        const response = await axios.post(queueServerApiUrl + '/api/queue/item/execute', 
            body,
            {
                headers: {
                    'Authorization': 'ApiKey ' + qServerKey
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error executing plan', error);
        throw error;
    }
};

const getQueueHistoryPromise = async (mock = false): Promise<GetHistoryResponse> => {
    if (mock) {
        return mockGetHistoryResponse;
    }
    try {
        const response = await axios.get(queueServerApiUrl + '/api/history/get', {
            headers: {
                'Authorization': 'ApiKey ' + qServerKey
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching history:', error);
        throw error;
    }
};

const getStatusPromise = async (mock = false): Promise<GetStatusResponse> => {
    if (mock) {
        return mockGetStatusResponse;
    }
    try {
        const response = await axios.get(queueServerApiUrl + '/api/status', {
            headers: {
                'Authorization': 'ApiKey ' + qServerKey
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching status:', error);
        throw error;
    }
};

const getPlansAllowedPromise = async (mock = false): Promise<GetPlansAllowedResponse> => {
    if (mock) {
        return mockGetPlansAllowedResponse;
    }
    try {
        const response = await axios.get(queueServerApiUrl + '/api/plans/allowed', {
            headers: {
                'Authorization': 'ApiKey ' + qServerKey
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching plans allowed:', error);
        throw error;
    }
};

const getQueuePromise = async (mock = false): Promise<GetQueueResponse> => {
    if (mock) {
        return mockGetQueueResponse;
    }
    try {
        const response = await axios.get(queueServerApiUrl + '/api/queue/get', {
            headers: {
                'Authorization': 'ApiKey ' + qServerKey
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching queue:', error);
        throw error;
    }
};


export {
    setQueueServerApiUrl, 
    getQueue, 
    getStatus, 
    getPlansAllowed, 
    getDevicesAllowed, 
    startRE, 
    pauseRE,
    resumeRE,
    abortRE,
    postQueueItem, 
    getQueueItem, 
    deleteQueueItem, 
    getQueueHistory, 
    executeItem, 
    openWorkerEnvironment, 
    getQSConsoleUrl, 
    getRunsActive,
    getRunsActivePromise,
    executeItemPromise,
    getQueueHistoryPromise,
    getStatusPromise,
    getPlansAllowedPromise,
    getQueuePromise
};
