export const getDefaultCameraUrl = () => {

    //ws.current = new WebSocket('ws://localhost:8000/pvws/pv');
    //ws.current = new WebSocket('ws://localhost/api/camera');

    const currentWebsiteIP = window.location.hostname;
    const currentWebsitePort = window.location.port;
    var wsUrl;

    try {
        if (import.meta.env.VITE_CAMERA_WS) {
            wsUrl = import.meta.env.VITE_CAMERA_WS; //custom
        } else {
            wsUrl=`ws://${currentWebsiteIP}:${currentWebsitePort}/api/camera` //default reverse proxy
        }
    } catch (e) {
        console.error("Error getting default camera URL: ", e);
        return 'ws://localhost:8000/api/camera'; //fallback
    }

    return wsUrl;
};
