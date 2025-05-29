export type CanvasSizes = 'small' | 'medium' | 'large' | 'automatic';
export type CameraCanvasProps = {
    imageArrayPV?: string;
    sizePVs?: {
        [key: string]: string;
    };
    canvasSize?: CanvasSizes;
    prefix?: string;
};
export default function CameraCanvas({ imageArrayPV, sizePVs, canvasSize, prefix }: CameraCanvasProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=CameraCanvas.d.ts.map