import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { getDefaultCameraUrl } from '../utils/apiClient';
import { CanvasSizes } from '../CameraCanvas';

export type UseTIFFCanvasProps = {
    imageArrayPV?: string;
    sizePVs?: {[key:string]: string};
    canvasSize?: CanvasSizes;
    prefix?: string;
    wsUrl?: string;
};

export function useTIFFCanvas({
    imageArrayPV = '',
    sizePVs = {},
    canvasSize = 'medium',
    prefix = '13PIL1',
    wsUrl='ws://localhost:8002/tiff-socket'
}: UseTIFFCanvasProps) {
    const canvasRef = useRef<null | HTMLCanvasElement>(null);
    const [fps, setFps] = useState<string>('0');
    const [socketStatus, setSocketStatus] = useState('closed');
    const [isImageLogScale, setIsImageLogScale] = useState(true);
    const ws = useRef<null | WebSocket>(null);
    const frameCount = useRef<null | number>(null);
    const startTime = useRef<null | Date>(null);
    const isInitialized = useRef(false);

    const sizeDict: {[key:string]: number} = useMemo(() => ({
        small: 256,
        medium: 512,
        large: 1024,
        automatic: 512
    }), []);

    const toggleLogScale = useCallback(() => {
        const newLogScale = !isImageLogScale;
        // Send a message to the WebSocket server to toggle log normalization
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({ toggleLogNormalization: newLogScale });
            ws.current.send(message);
        }
    }, [isImageLogScale]);

    const closeWebSocket = useCallback(() => {
        if (ws.current) {
            try {
                ws.current.close();
            } catch (error) {
                console.log({error});
                return;
            }
        }
        setSocketStatus('closed');
        frameCount.current = 0;
        setFps('0');
    }, []);

    const startWebSocket = useCallback(() => {
        if (canvasRef.current === null) return;
        if (ws.current !== null) {
            ws.current.close();
        }
       
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        let isFrameReady = false;
        let nextFrame: null | ImageBitmap = null;
    
        try {
            var url = wsUrl ? wsUrl : getDefaultCameraUrl();
            ws.current = new WebSocket(url);
        } catch (error) {
            console.log({error});
            return;
        }

        ws.current.onopen = (event) => {
            if (ws.current === null) return;
            setSocketStatus('Open');
            frameCount.current = 0;
            startTime.current = new Date();
            // send message to websocket containing the pvs for the image and pixel size          
            let wsMessage = {prefix: prefix};
            ws.current.send(JSON.stringify(wsMessage));
        };
    
        ws.current.onmessage = async function (event) {
            if (canvasRef.current === null) return;
            if (typeof event.data === "string") {
                const message = JSON.parse(event.data);
                if ('logNormalization' in message) {
                    setIsImageLogScale(message['logNormalization']);
                    return;
                }
                if (canvasSize === 'automatic') {
                    // Resize canvas when size is set to automatic and ws sends string msg of dim changes
                    const dimensions = JSON.parse(event.data);
                    canvasRef.current.width = dimensions.x;
                    canvasRef.current.height = dimensions.y;
                }
            } else {
                // Handle binary image data
                try {
                    const blob = new Blob([event.data], { type: 'image/jpeg' });
                    const imageBitmap = await createImageBitmap(blob);
                    nextFrame = imageBitmap;
                    isFrameReady = true;  // Mark frame as ready
                    if (startTime.current !== null && frameCount.current !== null) {
                        let currentTime = new Date();
                        var totalDurationSeconds = startTime.current && currentTime.getTime()/1000 - startTime.current.getTime()/1000;
                        if (totalDurationSeconds > 5) {
                            // reset the total duration so we can get an accurate fps.
                            startTime.current = new Date();
                            frameCount.current = 0;
                            totalDurationSeconds = startTime.current && currentTime.getTime()/1000 - startTime.current.getTime()/1000;
                        }
                        setFps(((frameCount.current + 1) / totalDurationSeconds).toPrecision(3));
                        frameCount.current = frameCount.current + 1;
                    }
                } catch (e) {
                    console.log('Error decoding/displaying camera frame: ' + e);
                }
            }
        };
    
        // Rendering loop with requestAnimationFrame
        const render = () => {
            if (isFrameReady && context && nextFrame) {
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(nextFrame, 0, 0, canvas.width, canvas.height);
                isFrameReady = false;
            }
            requestAnimationFrame(render);
        };
    
        requestAnimationFrame(render);  // Start the rendering loop

        ws.current.onerror = (error) => {
            console.log("WebSocket Error:", error);
            setSocketStatus('closed');
        };

        ws.current.onclose = () => {
            setSocketStatus('closed');
            frameCount.current = 0;
            console.log("Camera Web Socket closed");
        };
    }, [wsUrl, canvasSize]);

    useEffect(() => {
        if (!isInitialized.current) {
            isInitialized.current = true;
            if (socketStatus === 'closed') {
                startWebSocket();
            }
        }
        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []); // Empty dependency array for initialization only

    return {
        canvasRef,
        fps,
        socketStatus,
        isImageLogScale,
        sizeDict,
        startWebSocket,
        closeWebSocket,
        toggleLogScale
    };
}