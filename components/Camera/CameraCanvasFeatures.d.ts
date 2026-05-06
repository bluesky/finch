export type CameraCanvasFeaturesProps = {
    /** Current WebSocket connection state (e.g. `'open'` or `'closed'`). */
    socketStatus: string;
    /** Whether the image is currently displayed on a logarithmic intensity scale. */
    isImageLogScale: boolean;
    /** Callback to toggle the WebSocket connection on or off. */
    onToggleConnection: () => void;
    /** Callback to toggle between linear and logarithmic image scaling. */
    onToggleLogScale: () => void;
    /** Pixel dimension of the canvas, used to size the SVG drawing overlay. Defaults to 512. */
    canvasSize?: number;
    /** EPICS PV prefix for the detector. Forwarded to the drawing hook for annotation persistence. */
    prefix?: string;
};
export default function CameraCanvasFeatures({ socketStatus, isImageLogScale, onToggleConnection, onToggleLogScale, canvasSize, prefix }: CameraCanvasFeaturesProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=CameraCanvasFeatures.d.ts.map