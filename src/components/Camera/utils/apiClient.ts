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

export const getDefaultTiffUrl = () => {

    const currentWebsiteIP = window.location.hostname;
    const currentWebsitePort = window.location.port;
    var wsUrl;

    try {
        if (import.meta.env.VITE_TIFF_WS) {
            wsUrl = import.meta.env.VITE_TIFF_WS; //custom
        } else {
            wsUrl=`ws://${currentWebsiteIP}:${currentWebsitePort}/api/tiff` //default reverse proxy
        }
    } catch (e) {
        console.error("Error getting default TIFF URL: ", e);
        return 'ws://localhost:8002/api/tiff'; //fallback for the frontend api
    }

    return wsUrl;
}
