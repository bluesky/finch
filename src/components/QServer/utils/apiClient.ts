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
    PostItemRemoveResponse} from '../types/apiTypes';

const getQServerKey = () => {
    var key;
    const defaultKey = 'test';
    key = import.meta.env.VITE_QSERVER_API_KEY || defaultKey;
    return key;
}


const getHttpServerUrl = () => {
    const currentWebsiteIP = window.location.hostname;
    const currentWebsitePort = window.location.port;
    const port = ":60610";
    var httpUrl;
    if (import.meta.env.VITE_QSERVER_API_URL) {
        httpUrl = import.meta.env.VITE_QSERVER_API_URL
    } else {
        if (import.meta.env.VITE_PROXY_WS === 'false') {
            httpUrl = "ws://" + currentWebsiteIP + port; //default when ran locally
        } else {
            httpUrl=`ws://${currentWebsiteIP}:${currentWebsitePort}/api/qserver/console` //reverse proxy, does not work with React live dev server
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

const httpServerUrl = getHttpServerUrl();
const qServerKey = getQServerKey();



const getQueue = async (cb:(data:GetQueueResponse)=>void, mock=false) => {
    if (mock) {
        cb(mockGetQueueResponse);
        return;
    }
    try {
        const response = await axios.get(httpServerUrl + '/api/queue/get', 
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
        const response = await axios.get(httpServerUrl + '/api/history/get', 
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
        const response = await axios.get(httpServerUrl + '/api/status', 
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
        const response = await axios.get(httpServerUrl + '/api/plans/allowed',
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
        const response = await axios.get(httpServerUrl + '/api/devices/allowed',
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
        const response = await axios.post(httpServerUrl + '/api/queue/start', 
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

const postQueueItem = async (body:AddQueueItemBody, cb:(data:PostItemAddResponse)=>void, mock=false) => {
    if (mock) {
        cb(mockAddItemSuccessResponse);
        return;
    }
    try {
        const response = await axios.post(httpServerUrl + '/api/queue/item/add', 
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
        const response = await axios.post(httpServerUrl + '/api/queue/item/execute', 
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
        const response = await axios.get(httpServerUrl + '/api/queue/item/get', {
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
        const response = await axios.post(httpServerUrl + '/api/queue/item/remove', 
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
        const response = await axios.post(httpServerUrl + '/api/environment/open',
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





export { getQueue, getStatus, getPlansAllowed, getDevicesAllowed, startRE, postQueueItem, getQueueItem, deleteQueueItem, getQueueHistory, executeItem, openWorkerEnvironment, getQSConsoleUrl };
