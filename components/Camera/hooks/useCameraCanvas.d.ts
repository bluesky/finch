import { CanvasSizes } from '../CameraCanvas';
export type UseCameraCanvasProps = {
    imageArrayPV?: string;
    sizePVs?: {
        [key: string]: string;
    };
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
export declare function useCameraCanvas({ imageArrayPV, sizePVs, canvasSize, prefix, wsUrl, autoStart, paused, }: UseCameraCanvasProps): {
    canvasRef: import('../../../../node_modules/react').MutableRefObject<HTMLCanvasElement | null>;
    fps: string;
    socketStatus: string;
    socketError: string | null;
    isImageLogScale: boolean;
    sizeDict: {
        [key: string]: number;
    };
    startWebSocket: () => void;
    closeWebSocket: () => void;
    toggleLogScale: () => void;
};
//# sourceMappingURL=useCameraCanvas.d.ts.map