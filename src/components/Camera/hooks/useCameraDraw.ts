import { useState, useRef, useCallback } from 'react';

export type Point = {
    x: number;
    y: number;
};

export type Stroke = Point[];

export function useCameraDraw() {
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
    const drawingAreaRef = useRef<HTMLDivElement>(null);

    const toggleDrawingMode = useCallback(() => {
        setIsDrawingMode(prev => {
            if (prev) {
                // When turning off drawing mode, clear all strokes
                setStrokes([]);
                setCurrentStroke([]);
                setIsDrawing(false);
            }
            return !prev;
        });
    }, []);

    const getMousePosition = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!drawingAreaRef.current) return null;
        const rect = drawingAreaRef.current.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawingMode) return;
        const point = getMousePosition(e);
        if (point) {
            setIsDrawing(true);
            setCurrentStroke([point]);
        }
    }, [isDrawingMode, getMousePosition]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawing || !isDrawingMode) return;
        const point = getMousePosition(e);
        if (point) {
            setCurrentStroke(prev => [...prev, point]);
        }
    }, [isDrawing, isDrawingMode, getMousePosition]);

    const handleMouseUp = useCallback(() => {
        if (isDrawing && currentStroke.length > 0) {
            setStrokes(prev => [...prev, currentStroke]);
            setCurrentStroke([]);
        }
        setIsDrawing(false);
    }, [isDrawing, currentStroke]);

    const createStrokePath = useCallback((stroke: Point[]) => {
        if (stroke.length < 2) return null;
        
        let pathData = `M ${stroke[0].x} ${stroke[0].y}`;
        for (let i = 1; i < stroke.length; i++) {
            pathData += ` L ${stroke[i].x} ${stroke[i].y}`;
        }
        
        return pathData;
    }, []);

    return {
        isDrawingMode,
        strokes,
        currentStroke,
        drawingAreaRef,
        toggleDrawingMode,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        createStrokePath
    };
}