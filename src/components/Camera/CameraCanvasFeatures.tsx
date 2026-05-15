import { useMemo } from 'react';
import { phosphorIcons } from '@/assets/icons';
import { SunDim, Sun, PaintBrush, Eraser } from '@phosphor-icons/react';
import { useCameraDraw } from './hooks/useCameraDraw';
import type { Point } from './hooks/useCameraDraw';

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

export default function CameraCanvasFeatures({
    socketStatus,
    isImageLogScale,
    onToggleConnection,
    onToggleLogScale,
    canvasSize = 512,
    prefix,
}: CameraCanvasFeaturesProps) {
    const {
        isDrawingMode,
        strokes,
        currentStroke,
        drawingAreaRef,
        toggleDrawingMode,
        eraseAllStrokes,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        createStrokePath,
    } = useCameraDraw(prefix);

    const renderStroke = (stroke: Point[], index: number) => {
        const pathData = createStrokePath(stroke);
        if (!pathData) return null;

        return (
            <path
                key={index}
                d={pathData}
                stroke="#ff0000"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        );
    };

    const iconFeatures = useMemo(
        () => [
            {
                id: 'connection',
                icon: socketStatus === 'closed' ? phosphorIcons.eyeSlash : phosphorIcons.eye,
                onClick: onToggleConnection,
                title: socketStatus === 'closed' ? 'Connect' : 'Disconnect',
            },
            {
                id: 'logScale',
                icon: isImageLogScale ? <SunDim size={24} /> : <Sun size={24} />,
                onClick: onToggleLogScale,
                title: isImageLogScale ? 'Linear Scale' : 'Log Scale',
            },
            {
                id: 'drawing',
                icon: <PaintBrush size={24} />,
                onClick: toggleDrawingMode,
                title: isDrawingMode ? 'Exit Drawing Mode' : 'Enter Drawing Mode',
                isActive: isDrawingMode,
            },
        ],
        [
            socketStatus,
            isImageLogScale,
            onToggleConnection,
            onToggleLogScale,
            isDrawingMode,
            toggleDrawingMode,
        ],
    );

    return (
        <>
            {/* Erase All Button - shown at the top when drawing mode is active */}
            {isDrawingMode && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
                    <button
                        onClick={eraseAllStrokes}
                        className=" opacity-80 flex items-center gap-2 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded shadow-md transition-colors"
                        title="Erase All Drawings"
                    >
                        <Eraser size={16} />
                        Erase All
                    </button>
                </div>
            )}

            {/* Manual Drawing Overlay */}
            {isDrawingMode && (
                <div
                    ref={drawingAreaRef}
                    className="absolute top-0 left-0 z-20 cursor-crosshair"
                    style={{
                        width: `${canvasSize}px`,
                        height: `${canvasSize}px`,
                        pointerEvents: 'auto',
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <svg
                        width={canvasSize}
                        height={canvasSize}
                        className="absolute top-0 left-0"
                        style={{ pointerEvents: 'none' }}
                    >
                        {/* Render completed strokes */}
                        {strokes.map((stroke, index) => renderStroke(stroke, index))}

                        {/* Render current stroke being drawn */}
                        {currentStroke.length > 1 && renderStroke(currentStroke, -1)}
                    </svg>
                </div>
            )}

            {/* Control Icons */}
            <ul className="absolute z-30 top-2 right-2 flex flex-col gap-2">
                {iconFeatures.map((feature) => (
                    <li
                        key={feature.id}
                        className={`w-6 aspect-square hover:cursor-pointer transition-colors ${
                            feature.isActive
                                ? 'text-blue-500 hover:text-blue-400'
                                : 'text-slate-500 hover:text-slate-400'
                        }`}
                        onClick={feature.onClick}
                        title={feature.title}
                    >
                        {feature.icon}
                    </li>
                ))}
            </ul>
        </>
    );
}
