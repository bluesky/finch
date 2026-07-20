import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useOphydApiUrls } from '@/utils/apiUtils';
import { ophydSocketCameraPath } from '@/api/ophyd/socketPaths';
import { useCameraSocketFactory } from '@/api/ophyd/OphydTransportProvider';
import { CanvasSizes } from '../CameraCanvas';
import { getErrorMessage } from '@/utils/errorHandling';
import type { CameraSocketLike } from '@/lib/ophyd-sim';

export type UseCameraCanvasProps = {
    imageArrayPV?: string;
    sizePVs?: { [key: string]: string };
    canvasSize?: CanvasSizes;
    prefix?: string;
    wsUrl?: string;
    /** Begin acquisition automatically on mount instead of waiting for the Acquire button. */
    autoStart?: boolean;
    /**
     * Externally control acquisition. When provided, the stream starts on `false`
     * and pauses on `true` — each time the value changes. Leave undefined to keep
     * acquisition fully manual (Acquire / Pause buttons).
     */
    paused?: boolean;
};

export function useCameraCanvas({
    imageArrayPV = '',
    sizePVs = {},
    canvasSize = 'medium',
    prefix = '',
    wsUrl,
    autoStart = false,
    paused,
}: UseCameraCanvasProps) {
    const socketFactory = useCameraSocketFactory();
    const canvasRef = useRef<null | HTMLCanvasElement>(null);
    const [fps, setFps] = useState<string>('0');
    const [socketStatus, setSocketStatus] = useState('closed');
    const [isImageLogScale, setIsImageLogScale] = useState(true);
    const [socketError, setSocketError] = useState<null | string>(null);
    const ws = useRef<null | CameraSocketLike>(null);
    const frameCount = useRef<null | number>(null);
    const startTime = useRef<null | Date>(null);
    const configWsUrl = useOphydApiUrls().getWsUrl(ophydSocketCameraPath);
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

    const defaultImageSuffix = 'image1:ArrayData';
    const defaultImagePV = '13SIM1:image1:ArrayData';

    const defaultSizeSuffixes = useMemo(
        () => ({
            startX: 'cam1:MinX',
            startY: 'cam1:MinY',
            sizeX: 'cam1:SizeX',
            sizeY: 'cam1:SizeY',
            colorMode: 'cam1:ColorMode',
            dataType: 'cam1:DataType',
        }),
        [],
    );

    const defaultSizePVs = useMemo(
        () => ({
            startX: '13SIM1:cam1:MinX',
            startY: '13SIM1:cam1:MinY',
            sizeX: '13SIM1:cam1:SizeX',
            sizeY: '13SIM1:cam1:SizeY',
            colorMode: '13SIM1:cam1:ColorMode',
            dataType: '13SIM1:cam1:DataType',
        }),
        [],
    );

    const getImageArrayPV = useCallback(() => {
        // Return imageArrayPV if it was specified
        if (imageArrayPV.length > 0) {
            return imageArrayPV;
        } else {
            // Return a concatenated PV based on the prefix (if provided) and a default Image suffix
            if (prefix.length > 0) {
                const concatenatedPV = prefix + ':' + defaultImageSuffix;
                return concatenatedPV;
            } else {
                // Return a default image PV when there are no inputs
                return defaultImagePV;
            }
        }
    }, [imageArrayPV, prefix]);

    const doesObjectStructureMatch = useCallback(
        (
            obj1: { [key: string]: string | string[] },
            obj2: { [key: string]: string | string[] },
        ) => {
            if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
            if (Object.keys(obj1).length !== Object.keys(obj2).length) return false;
            try {
                for (const key in obj1) {
                    const val1 = obj1[key];
                    const val2 = obj2[key];
                    if (typeof val1 !== typeof val2) return false;
                    if (typeof val1 === 'string' && (val1.length < 1 || val2.length < 1))
                        return false;
                }
            } catch {
                return false;
            }
            // all tests passed
            return true;
        },
        [],
    );

    const getSizePVs = useCallback(() => {
        // Return sizePVs if it was specified & contains all necessary keys matching the default
        if (doesObjectStructureMatch(sizePVs, defaultSizePVs)) {
            return sizePVs;
        } else {
            // Return object with concatenated values with user provided prefix and default suffixes
            if (prefix.length > 0) {
                const tempSizePVs: { [key: string]: string } = {};
                for (const key in defaultSizeSuffixes) {
                    const concatenatedPV =
                        prefix + ':' + defaultSizeSuffixes[key as keyof typeof defaultSizeSuffixes];
                    tempSizePVs[key] = concatenatedPV;
                }
                return tempSizePVs;
            } else {
                // Return default size PVs for ADSimDetector when no inputs provided
                return defaultSizePVs;
            }
        }
    }, [sizePVs, prefix, doesObjectStructureMatch, defaultSizeSuffixes, defaultSizePVs]);

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
            ws.current = socketFactory(url);
        } catch (error) {
            //This catch block only handles synchronous errors thrown during the WebSocket constructor call (invalid url, protocol), most other errors will be in the ws.onerror callback
            console.log({ error });
            setSocketError('Error creating WebSocket: ' + getErrorMessage(error));
            return;
        }

        ws.current.onopen = (_event) => {
            if (ws.current === null) return;
            setSocketStatus('Open');
            setSocketError(null);
            frameCount.current = 0;
            startTime.current = new Date();
            // send message to websocket containing the pvs for the image and pixel size
            const wsMessage = { imageArray_PV: getImageArrayPV(), ...getSizePVs() };
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
                    console.log('Error decoding/displaying camera frame: ' + getErrorMessage(e));
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
        };
    }, [resolvedWsUrl, getImageArrayPV, getSizePVs, canvasSize, socketFactory]);

    useEffect(() => {
        // By default the stream starts paused — the user begins acquisition via
        // the Acquire button (startWebSocket). We only register the unmount
        // cleanup so a socket opened during this mount is torn down on unmount.
        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []); // Empty dependency array — cleanup only; acquisition is user-driven

    // Optionally begin acquisition on mount. Guarded so it fires once and does
    // not reconnect if startWebSocket's identity changes.
    const hasAutoStarted = useRef(false);
    useEffect(() => {
        if (autoStart && !hasAutoStarted.current) {
            hasAutoStarted.current = true;
            startWebSocket();
        }
    }, [autoStart, startWebSocket]);

    // Externally-controlled acquisition. Act only on an actual change of `paused`
    // so unrelated re-renders (or startWebSocket identity changes) don't churn the
    // socket, and manual Acquire/Pause between changes still works.
    const prevPaused = useRef<boolean | undefined>(undefined);
    useEffect(() => {
        if (paused === undefined || prevPaused.current === paused) return;
        prevPaused.current = paused;
        if (paused) {
            closeWebSocket();
        } else {
            startWebSocket();
        }
    }, [paused, startWebSocket, closeWebSocket]);

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
