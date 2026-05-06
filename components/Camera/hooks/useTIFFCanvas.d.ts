import { CanvasSizes } from '../CameraCanvas';
export type UseTIFFCanvasProps = {
    imageArrayPV?: string;
    sizePVs?: {
        [key: string]: string;
    };
    canvasSize?: CanvasSizes;
    prefix?: string;
    wsUrl?: string;
};
export declare function useTIFFCanvas({ canvasSize, prefix, wsUrl }: UseTIFFCanvasProps): {
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
//# sourceMappingURL=useTIFFCanvas.d.ts.map