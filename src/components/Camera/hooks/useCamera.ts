// import { useState, useRef, useEffect, useMemo } from "react";
// //import { closeWebSocket, getPVWSUrl } from "../../../utilities/connectionHelper";
// import useOphydSocket from "@/hooks/useOphydSocket";
// import { DetectorSetting } from "../types/cameraTypes";
// import dayjs from "dayjs";

// /**
//  * Custom hook for generating Camera PV State variables and web socket connections.
//  * This function automatically concatenates a prefix into required settings PVs
//  * and a single control PV used to start/stop acquiring. Websockets are opened to connect these PVs, and a React
//  * state object is returned for the control PV and settings PVs which can be used to
//  * view live updates when rendered to the dom. The websockets handle live udpates to the React State objects.
//  *
//  * @param {string} prefix - Required PV prefix used for concatenating suffixes for settings. ex) '13SIM1'
//  * @param {Array} settings - Optional array of setting suffixes. Defaults to ADSimDetector
//  * @param {boolean} enableControlPanel - Optional boolean. True = connect acquire PV to web socket, False = do nothing
//  * @param {boolean} enableSettings - Optional boolean. True = connect settings PVs to web socket, False = do nothing
//  *
//  * @returns {Object} An object containing state variables, WebSocket connections, and control functions for camera operations:
//  * - **cameraControlPV**: A React state object representing the control PV state, including properties like `value`, `lastUpdate`, `pv`, and `isConnected`.
//  * - **cameraSettingsPVs**: A React state object containing the settings PVs as keys, each with properties like `value`, `lastUpdate`, `pv`, and `isConnected`.
//  * - **connectionControl**: A React ref for the WebSocket connection managing the control PV.
//  * - **connectionSettings**: A React ref for the WebSocket connection managing the settings PVs.
//  * - **onSubmitControl**: Function to send a write request to the control PV WebSocket with a specified `pv` and `newValue`.
//  * - **onSubmitSettings**: Function to send a write request to the settings PVs WebSocket with a specified `pv` and `newValue`.
//  * - **startAcquire**: Function to start acquiring images by writing a `1` to the control PV.
//  * - **stopAcquire**: Function to stop acquiring images by writing a `0` to the control PV.
//  */
// type CameraHookProps = {
//     prefix?: string;
//     settings: DetectorSetting[];
//     enableControlPanel?: boolean;
//     enableSettings?: boolean;
// }
// export const useCamera = ({prefix='', settings, enableControlPanel=true, enableSettings=true}: CameraHookProps) => {
//     const wsUrl = useMemo(()=>'ws://localhost:8000/ophydSocket', []);
//     const deviceNameList = useMemo(()=>['IOC:m1', 'IOC:m2', 'IOC:m3'], []);
//     const { devices, handleSetValueRequest, toggleDeviceLock, toggleExpand } = useOphydSocket(wsUrl, deviceNameList);

//     const [ cameraControlPV, setCameraControlPV ] = useState({});
//     const [ cameraSettingsPVs, setCameraSettingsPVs ] = useState<{}>({});

//     const connectionControl = useRef(null);
//     const connectionSettings = useRef(null);

//     //helper function to return prefix with no whitespace or trailing ':'
//     const sanitizeInputPrefix = (prefix:string) => {
//         var santizedPrefix = '';
//         if (prefix.trim().slice(-1) === ':') {
//             santizedPrefix = prefix.trim().substring(0, prefix.length -1)
//         } else {
//             santizedPrefix = prefix.trim();
//         }
//         return santizedPrefix;
//     };

//     //creates and returns a string for the acquire suffix
//     const createControlPVString = (prefix='') => {
//         if (prefix === '' && enableControlPanel) {
//             console.log('Error in concatenating a camera control PV, received empty prefix string');
//             return '';
//         }
//         let acquireSuffix = 'cam1:Acquire'; //the suffix responsible for acquiring images, has a value of 1 or 0
//         var controlPV = `${sanitizeInputPrefix(prefix)}:${acquireSuffix}`;
//         return controlPV;
//     };

//     const controlPVString = createControlPVString(prefix);

//     //creates object structure for state var
//     const initializeControlPVState = (pv='') => {
//         if (typeof pv !== 'string' || pv.length === 0) {
//             console.log('Error in initializing cameraControlPV, expected a valid PV and received: ' + pv);
//             return;
//         }
//         var tempObject = {
//             value: null,
//             lastUpdate: null,
//             pv: pv,
//             isConnected: null
//         };
//         setCameraControlPV(tempObject);
//     };

//     //creates and returns an array of PVs for the settings
//     const createSettingsPVArray = (settings:DetectorSetting[], prefix:string) => {
//         //settings is an array of objects, grouped by setting type
//         //ex) a single pv suffix is at settings[0].inputs[0].suffix

//         var sanitizedPrefix = sanitizeInputPrefix(prefix);

//         var pvArray:string[] = [];
//         settings.forEach((group) => {
//             group.inputs.forEach((input) => {
//                 //console.log(group.prefix)
//                 let pv = `${sanitizedPrefix}:${group.prefix !== null ? group.prefix + ':' : ''}${input.suffix}`
//                 pvArray.push(pv);
//             })
//         })
//         return pvArray;
//     };

//     const initializeCameraSettingsPVState = (pvArray:string[]) => {
//         //creates the object structure
//         var tempSettingsObject:{[key:string]: any} = {};
//         pvArray.forEach((pv) => {
//             tempSettingsObject[pv] = {
//                 value: null,
//                 lastUpdate: null,
//                 pv: pv,
//                 isConnected: null
//             }
//         })
//         setCameraSettingsPVs(tempSettingsObject);
//     };

//     const subscribeControlPV = (connection) => {
//         var pv = createControlPVString(prefix);
//         connection.current.send(JSON.stringify({type: "subscribe", pvs: [pv]}));
//     };

//     const subscribeSettingsPVs = (connection) => {
//         var pvArray = createSettingsPVArray(settings, prefix);
//         connection.current.send(JSON.stringify({type: "subscribe", pvs: pvArray}));
//     }

//     const updateControlPV = (e) => {
//         if (e.type === 'update') {
//             const exampleSuccessMessage = {
//                 "pv": "13SIM1:cam1:Acquire",
//                 "readonly": true, //true when readonly, false when you can write to PV
//                 "type": "update",
//                 "vtype": "VEnum",
//                 "labels": [
//                   "Done",
//                   "Acquire"
//                 ],
//                 "severity": "NONE",
//                 "value": 0,
//                 "text": "Done",
//                 "seconds": 1729007432,
//                 "nanos": 348829000
//               };

//             const exampleFailedConnectionMessage = {
//                 "pv": "13SIM1:cam1:Acquireddd",
//                 "readonly": true,
//                 "type": "update",
//                 "seconds": 1729016308,
//                 "nanos": 775234300
//             };
//             //set state of pv
//             setCameraControlPV((prevState) => {
//                 var stateCopy = JSON.parse(JSON.stringify(prevState));
//                 var pv = e.pv;
//                 if (pv !== prevState.pv) {
//                     console.log('Received pv update in camera control websocket that does not match pv');
//                     return prevState;
//                 }
//                 if ("value" in e) {
//                     //the PV is connected
//                     stateCopy.isConnected = true;
//                 } else {
//                     //the PV is not connected
//                     stateCopy.isConnected = false;
//                 }
//                 stateCopy.lastUpdate = dayjs().format('hh:MM:ss A');

//                 //copy over all values from e into stateCopy
//                 stateCopy = {...stateCopy, ...e};
//                 return stateCopy;
//             });
//         }
//     };

//     const updateSettingsPVs = (e) => {
//         //these examples are for PVWS, need to redo for Ophyd Socket
//         const exampleSuccessMessage = {
//             "pv": "13SIM1:cam1:Acquire",
//             "readonly": true, //true when readonly, false when you can write to PV
//             "type": "update",
//             "vtype": "VEnum",
//             "labels": [
//               "Done",
//               "Acquire"
//             ],
//             "severity": "NONE",
//             "value": 0,
//             "text": "Done",
//             "seconds": 1729007432,
//             "nanos": 348829000
//           };

//         const exampleFailedConnectionMessage = {
//             "pv": "13SIM1:cam1:Acquireddd",
//             "readonly": true,
//             "type": "update",
//             "seconds": 1729016308,
//             "nanos": 775234300
//         };
//         if (e.type === 'update') {
//             //set state and update pv value
//             setCameraSettingsPVs((prevState) => {
//                 var stateCopy = JSON.parse(JSON.stringify(prevState));
//                 var pv = e.pv;
//                 if (pv in stateCopy) {
//                     if ("value" in e) {
//                         //the PV is connected
//                         stateCopy[pv].isConnected = true;
//                     } else {
//                         //the PV is not connected
//                         stateCopy[pv].isConnected = false;
//                     }
//                     stateCopy[pv].lastUpdate = dayjs().format('hh:MM:ss A');

//                     //copy over all values from e into stateCopy
//                     stateCopy[pv] = {...stateCopy[pv], ...e};
//                 } else {
//                     //pv does not match any pv in settings
//                     console.log('received pv of ' + pv +' from websocket, does not match any pvs in camera settings');
//                 }

//                 return stateCopy;
//             });
//         }
//     };

//     /**
//      * Generic function for subscribing to a WebSocket.
//      * This function establishes a WebSocket connection and attaches event listeners
//      * for handling 'open' and 'message' events.
//      *
//      * @param {React.MutableRefObject<WebSocket|null>} connection - A React ref object to store the WebSocket connection.
//      * @param {string} wsUrl - The WebSocket URL to connect to.
//      * @param {Function} [cbOpen=()=>{}] - Optional callback function to be executed when the WebSocket connection is opened.
//      * @param {Function} [cbMessage=()=>{}] - Optional callback function to handle incoming WebSocket messages.
//      *
//      * @returns {void} This function does not return anything.
//      */
//     const connectWebSocket = (connection=false, wsUrl='', cbOpen=()=>{}, cbMessage=()=>{}, wsTitle='') => {
//         if (connection === false || wsUrl === '') {
//             console.log('Connection/url not provided to websocket connection function, exiting');
//             return;
//         }
//         closeWebSocket(connection);

//         try {
//             var socket = new WebSocket(wsUrl);
//         } catch (error) {
//             console.log('Unable to establish websocket connection ' + wsTitle + ' at ' + wsUrl);
//             console.log(error);
//             return;
//         }

//         socket.addEventListener("open", event => {
//             console.log("Opened " + wsTitle + " websocket: " + wsUrl);
//             connection.current = socket;
//             //onWebSocketOpen(connection, socket, wsUrl, cbOpen);
//             cbOpen(connection);
//         });

//         socket.addEventListener("message", event => {
//             //console.log("Websocket " + wsTitle + " message at: " + dayjs().format('hh:mm:ss a'));
//             var eventData = JSON.parse(event.data);
//             //console.log({eventData});
//             cbMessage(eventData);
//         });

//         socket.addEventListener("close", event => {
//             console.log("Closed websocket" + wsTitle + "at: " + dayjs().format('hh:mm:ss a'))
//         });

//         socket.addEventListener("error", event => {
//             console.log("Websocket Error:", event)
//         });
//     };

//     /**
//      * A function that sends a message to PVWS to write a pv value.
//      *
//      * @param {React.MutableRefObject<WebSocket|null>} connection - A React ref object to store the WebSocket connection.
//      * @param {string} pv - The pv to write the new value to
//      * @param {string} newValue - The new value to assign to the pv
//      * @param {Function} [cb=()=>{}] - Optional callback function to be executed after the Websocket message is sent.
//      *
//      * @returns {boolean} This function returns a boolean based on success of sending the message
//      */
//     const writePV = (connection=false, pv='', newValue='', cb=()=>{}) => {
//         console.log('writePV')
//         if (connection === false || connection.current === null) {
//             console.log('Cannot send write pv message over websocket, connection not initialized');
//             return false;
//         } else {
//             if (pv !== '' && newValue !== '') {
//                 try {
//                     connection.current.send(JSON.stringify({type: "write", pv: pv, value: newValue})); //PVWS api formatting
//                     cb();
//                     return true;
//                 } catch (e) {
//                     console.log('Error writing to pv: ' + e);
//                     return false;
//                 }
//             } else {
//                 console.log('Cannot send write pv message over websocket: pv and/or newValue are empty strings');
//                 return false;
//             }
//         }
//     };

//     const onSubmitSettings = (pv='', newValue='', cb=()=>{}) => {
//         writePV(connectionSettings, pv, newValue, cb);
//     };

//     const onSubmitControl = (pv='', newValue='', cb=()=>{}) => {
//         writePV(connectionControl, pv, newValue, cb);
//     };

//     /**
//      * A function that writes 1 to the area Detector Acquire PV to start acquiring images
//      *
//      * @returns {void} This function does not return a function
//      */
//     const startAcquire = () => {
//         writePV(connectionControl, controlPVString, 1); //value of 1 starts acquiring
//     };

//     /**
//      * A function that writes 0 to the area Detector Acquire PV to stop acquiring images
//      *
//      * @returns {void} This function does not return a function
//      */
//     const stopAcquire = () => {
//         writePV(connectionControl, controlPVString, 0); //value of 0 stops acquiring
//     };

//     useEffect(() => {
//         if (enableControlPanel && prefix !== '') {
//             //create blank controlPV
//             initializeControlPVState(createControlPVString(prefix));
//             //create a websocket connection for acquire pv only
//             connectWebSocket(connectionControl, wsUrl, subscribeControlPV, updateControlPV, 'Camera Control');
//         }

//         if (enableSettings === true && settings.length !== 0 && prefix !== '') {
//             //create blank cameraSettingsPVs
//             var settingsPVArray = createSettingsPVArray(settings, prefix);
//             initializeCameraSettingsPVState(settingsPVArray);
//             //create a websocket connection for all camera settings
//             connectWebSocket(connectionSettings, wsUrl, subscribeSettingsPVs, updateSettingsPVs, 'Camera Settings');
//         }
//     }, []);

//     return {
//         cameraControlPV,
//         cameraSettingsPVs,
//         connectionControl,
//         connectionSettings,
//         onSubmitControl,
//         onSubmitSettings,
//         startAcquire,
//         stopAcquire
//     }
// }
