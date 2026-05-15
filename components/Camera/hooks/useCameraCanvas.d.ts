import { CanvasSizes } from '../CameraCanvas';
export type UseCameraCanvasProps = {
    imageArrayPV?: string;
    sizePVs?: {
        [key: string]: string;
    };
    canvasSize?: CanvasSizes;
    prefix?: string;
    wsUrl?: string;
};
export declare function useCameraCanvas({ imageArrayPV, sizePVs, canvasSize, prefix, wsUrl, }: UseCameraCanvasProps): {
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