import { useMemo } from 'react';
import { phosphorIcons } from "@/assets/icons";
import { SunDim, Sun, PaintBrush } from '@phosphor-icons/react';
import { useCameraDraw } from './hooks/useCameraDraw';

export type TestCameraCanvasFeaturesProps = {
    socketStatus: string;
    isImageLogScale: boolean;
    onToggleConnection: () => void;
    onToggleLogScale: () => void;
    canvasSize?: number;
};

export default function TestCameraCanvasFeatures({
    socketStatus,
    isImageLogScale,
    onToggleConnection,
    onToggleLogScale,
    canvasSize = 512
}: TestCameraCanvasFeaturesProps) {
    const {
        isDrawingMode,
        strokes,
        currentStroke,
        drawingAreaRef,
        toggleDrawingMode,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        createStrokePath
    } = useCameraDraw();

    const renderStroke = (stroke: any[], index: number) => {
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

    const iconFeatures = useMemo(() => [
        {
            id: 'connection',
            icon: socketStatus === 'closed' ? phosphorIcons.eyeSlash : phosphorIcons.eye,
            onClick: onToggleConnection,
            title: socketStatus === 'closed' ? 'Connect' : 'Disconnect'
        },
        {
            id: 'logScale',
            icon: isImageLogScale ? <SunDim size={24}/> : <Sun size={24}/>,
            onClick: onToggleLogScale,
            title: isImageLogScale ? 'Linear Scale' : 'Log Scale'
        },
        {
            id: 'drawing',
            icon: <PaintBrush size={24}/>,
            onClick: toggleDrawingMode,
            title: isDrawingMode ? 'Exit Drawing Mode' : 'Enter Drawing Mode',
            isActive: isDrawingMode
        }
    ], [socketStatus, isImageLogScale, onToggleConnection, onToggleLogScale, isDrawingMode]);

    return (
        <>
            {/* Manual Drawing Overlay */}
            {isDrawingMode && (
                <div 
                    ref={drawingAreaRef}
                    className="absolute top-0 left-0 z-20 cursor-crosshair"
                    style={{ 
                        width: `${canvasSize}px`, 
                        height: `${canvasSize}px`,
                        pointerEvents: 'auto'
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