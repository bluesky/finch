export type CanvasSizes = 'small' | 'medium' | 'large' | 'automatic';
export type TIFFCanvasProps = {
    /** EPICS PV name for the image array data (e.g. `'13SIM1:image1:ArrayData'`). */
    imageArrayPV?: string;
    /** Map of canvas size keys to EPICS PV names used to read the image dimensions. */
    sizePVs?: {
        [key: string]: string;
    };
    /** Display size of the canvas element. Defaults to `'medium'` (512 × 512). */
    canvasSize?: CanvasSizes;
    /** EPICS PV prefix for the detector (e.g. `'13SIM1'`). Used by overlay features. */
    prefix?: string;
    /** WebSocket URL for the TIFF image stream. Falls back to the application default when omitted. */
    wsUrl?: string;
};
export default function TIFFCanvas(props: TIFFCanvasProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=TIFFCanvas.d.ts.map