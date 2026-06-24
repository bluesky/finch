import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useOphydApiUrls } from '@/utils/apiUtils';
import { ophydSocketTIFFPath } from '@/api/ophyd/socketPaths';
import { CanvasSizes } from '../CameraCanvas';
import { getErrorMessage } from '@/utils/errorHandling';

export type UseTIFFCanvasProps = {
    imageArrayPV?: string;
    sizePVs?: { [key: string]: string };
    canvasSize?: CanvasSizes;
    prefix?: string;
    wsUrl?: string;
};

export function useTIFFCanvas({
    canvasSize = 'medium',
    prefix = '13PIL1',
    wsUrl,
}: UseTIFFCanvasProps) {
    const canvasRef = useRef<null | HTMLCanvasElement>(null);
    const [fps, setFps] = useState<string>('0');
    const [socketStatus, setSocketStatus] = useState('closed');
    const [socketError, setSocketError] = useState<null | string>(null);
    const [isImageLogScale, setIsImageLogScale] = useState(true);
    const ws = useRef<null | WebSocket>(null);
    const frameCount = useRef<null | number>(null);
    const startTime = useRef<null | Date>(null);
    const isInitialized = useRef(false);
    const configWsUrl = useOphydApiUrls().getWsUrl(ophydSocketTIFFPath);
    const resolvedWsUrl = wsUrl ?? configWsUrl;

    const sizeDict: { [key: string]: number } = useMemo(
        () => ({
            small: 256,
            medium: 512,
            large: 1024,
            automatic: 512,
        }),
        [],
    );

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
                console.log({ error });
                return;
            }
        }
        setSocketStatus('closed');
        setSocketError(null);
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
            const url = resolvedWsUrl;
            console.log({ url });
            ws.current = new WebSocket(url);
        } catch (error) {
            console.log({ error });
            return;
        }

        ws.current.onopen = (_event) => {
            if (ws.current === null) return;
            setSocketStatus('Open');
            setSocketError(null);
            frameCount.current = 0;
            startTime.current = new Date();
            // send message to websocket containing the pvs for the image and pixel size
            const wsMessage = { prefix: prefix };
            ws.current.send(JSON.stringify(wsMessage));
        };

        ws.current.onmessage = async function (event) {
            if (canvasRef.current === null) return;
            if (typeof event.data === 'string') {
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
                    isFrameReady = true; // Mark frame as ready
                    if (startTime.current !== null && frameCount.current !== null) {
                        const currentTime = new Date();
                        let totalDurationSeconds =
                            startTime.current &&
                            currentTime.getTime() / 1000 - startTime.current.getTime() / 1000;
                        if (totalDurationSeconds > 5) {
                            // reset the total duration so we can get an accurate fps.
                            startTime.current = new Date();
                            frameCount.current = 0;
                            totalDurationSeconds =
                                startTime.current &&
                                currentTime.getTime() / 1000 - startTime.current.getTime() / 1000;
                        }
                        setFps(((frameCount.current + 1) / totalDurationSeconds).toPrecision(3));
                        frameCount.current = frameCount.current + 1;
                    }
                } catch (e) {
                    console.log('Error decoding/displaying camera frame: ' + e);
                    setSocketError('Error decoding/displaying camera frame: ' + getErrorMessage(e));
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

        requestAnimationFrame(render); // Start the rendering loop

        ws.current.onerror = (error) => {
            if (error instanceof Event) {
                const target = error.target as WebSocket;
                console.log('WebSocket Error on URL:', target.url, { error });
                setSocketError('WebSocket Error: Unable to connect to ' + target.url);
            } else {
                console.log('WebSocket Error:', { error });
                setSocketError('WebSocket Error: ' + getErrorMessage(error));
            }
            setSocketStatus('closed');
        };

        ws.current.onclose = () => {
            setSocketStatus('closed');
            frameCount.current = 0;
            console.log('Camera Web Socket closed');
        };
    }, [resolvedWsUrl, canvasSize, prefix]);

    useEffect(() => {
        if (!isInitialized.current) {
            isInitialized.current = true;
            startWebSocket();
        }
        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); //we only want this to run on mount/unmount, not when a user forces a re-render by stopping the websocket or toggling log scale

    return {
        canvasRef,
        fps,
        socketStatus,
        socketError,
        isImageLogScale,
        sizeDict,
        startWebSocket,
        closeWebSocket,
        toggleLogScale,
    };
}
