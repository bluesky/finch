import { useState, useRef, useCallback, useEffect } from 'react';

export type Point = {
    x: number;
    y: number;
};

export type Stroke = Point[];

export function useCameraDraw(prefix?: string) {
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
    const drawingAreaRef = useRef<HTMLDivElement>(null);

    // localStorage helper functions
    const getStorageKey = useCallback(() => {
        console.log('prefix in getStorageKey:', prefix);
        return prefix ? `camera-strokes-${prefix}` : null;
    }, [prefix]);

    const loadStrokesFromStorage = useCallback(() => {
        const storageKey = getStorageKey();
        if (!storageKey) return [];
        
        try {
            const stored = localStorage.getItem(storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Failed to load strokes from localStorage:', error);
            return [];
        }
    }, [getStorageKey]);

    const saveStrokesToStorage = useCallback((strokesToSave: Stroke[]) => {
        const storageKey = getStorageKey();
        if (!storageKey) return;
        
        try {
            localStorage.setItem(storageKey, JSON.stringify(strokesToSave));
        } catch (error) {
            console.warn('Failed to save strokes to localStorage:', error);
        }
    }, [getStorageKey]);

    const clearStrokesFromStorage = useCallback(() => {
        const storageKey = getStorageKey();
        if (!storageKey) return;
        
        try {
            localStorage.removeItem(storageKey);
        } catch (error) {
            console.warn('Failed to clear strokes from localStorage:', error);
        }
    }, [getStorageKey]);

    // Load strokes from localStorage on mount if prefix is provided
    useEffect(() => {
        if (prefix) {
            const savedStrokes = loadStrokesFromStorage();
            setStrokes(savedStrokes);
        }
    }, [prefix, loadStrokesFromStorage]);

    // Save strokes to localStorage whenever strokes change (but only if prefix is provided)
    useEffect(() => {
        if (prefix && strokes.length >= 0) {
            saveStrokesToStorage(strokes);
        }
    }, [strokes, prefix, saveStrokesToStorage]);

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

    const eraseAllStrokes = useCallback(() => {
        setStrokes([]);
        setCurrentStroke([]);
        setIsDrawing(false);
        // Clear from localStorage if prefix is provided
        if (prefix) {
            clearStrokesFromStorage();
        }
    }, [prefix, clearStrokesFromStorage]);

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
        eraseAllStrokes,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        createStrokePath
    };
}