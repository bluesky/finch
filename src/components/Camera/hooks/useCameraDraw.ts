import { useState, useRef, useCallback, useEffect } from 'react';

export type Point = {
    x: number;
    y: number;
};

export type RelativePoint = {
    x: number; // 0-1 relative to drawing area width
    y: number; // 0-1 relative to drawing area height
};

export type Stroke = Point[];
export type RelativeStroke = RelativePoint[];

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

    // Convert absolute coordinates to relative coordinates (0-1 range)
    const convertToRelative = useCallback((stroke: Stroke): RelativeStroke => {
        if (!drawingAreaRef.current) return stroke as RelativeStroke;
        
        const rect = drawingAreaRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        if (width <= 0 || height <= 0) return stroke as RelativeStroke;
        
        return stroke.map(point => ({
            x: Math.max(0, Math.min(1, point.x / width)), // Clamp to 0-1 range
            y: Math.max(0, Math.min(1, point.y / height)) // Clamp to 0-1 range
        }));
    }, []);

    // Convert relative coordinates back to absolute coordinates
    const convertToAbsolute = useCallback((relativeStroke: RelativeStroke): Stroke => {
        if (!drawingAreaRef.current) {
            console.log('[useCameraDraw] convertToAbsolute: No drawing area ref');
            return relativeStroke as Stroke;
        }
        
        const rect = drawingAreaRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        console.log('[useCameraDraw] convertToAbsolute: Canvas dimensions:', { width, height });
        
        const absoluteStroke = relativeStroke.map(point => {
            const absolutePoint = {
                x: Math.max(0, Math.min(width, point.x * width)),
                y: Math.max(0, Math.min(height, point.y * height))
            };
            return absolutePoint;
        });
        
        console.log('[useCameraDraw] convertToAbsolute: Sample conversion - relative:', relativeStroke[0], 'absolute:', absoluteStroke[0]);
        return absoluteStroke;
    }, []);

    const loadStrokesFromStorage = useCallback(() => {
        const storageKey = getStorageKey();
        console.log('[useCameraDraw] loadStrokesFromStorage called:', { storageKey, hasDrawingArea: !!drawingAreaRef.current });
        
        if (!storageKey || !drawingAreaRef.current) {
            console.log('[useCameraDraw] Early return - no storage key or drawing area');
            return [];
        }
        
        const rect = drawingAreaRef.current.getBoundingClientRect();
        console.log('[useCameraDraw] Drawing area dimensions:', { width: rect.width, height: rect.height });
        
        try {
            const stored = localStorage.getItem(storageKey);
            console.log('[useCameraDraw] Raw localStorage data:', stored);
            
            if (!stored) {
                console.log('[useCameraDraw] No stored data found');
                return [];
            }
            
            const data: RelativeStroke[] = JSON.parse(stored);
            console.log('[useCameraDraw] Parsed stored data:', data);
            console.log('[useCameraDraw] Number of strokes:', data.length);
            
            // Check if we have invalid relative coordinates (values > 1) and clear them
            const hasInvalidCoords = data.some(stroke => 
                stroke.some(point => point.x > 1 || point.y > 1 || point.x < 0 || point.y < 0)
            );
            
            console.log('[useCameraDraw] Has invalid coordinates:', hasInvalidCoords);
            
            if (hasInvalidCoords) {
                console.warn('[useCameraDraw] Invalid relative coordinates found in localStorage, clearing...');
                localStorage.removeItem(storageKey);
                return [];
            }
            
            // Convert relative coordinates back to absolute coordinates for current canvas size
            const absoluteStrokes = data.map(relativeStroke => {
                const absoluteStroke = convertToAbsolute(relativeStroke);
                console.log('[useCameraDraw] Converted stroke - relative:', relativeStroke.slice(0, 3), 'absolute:', absoluteStroke.slice(0, 3));
                return absoluteStroke;
            });
            
            console.log('[useCameraDraw] Returning', absoluteStrokes.length, 'converted strokes');
            return absoluteStrokes;
        } catch (error) {
            console.warn('[useCameraDraw] Failed to load strokes from localStorage:', error);
            // Clear corrupted data
            try {
                localStorage.removeItem(storageKey);
            } catch (clearError) {
                console.warn('[useCameraDraw] Failed to clear corrupted localStorage:', clearError);
            }
            return [];
        }
    }, [getStorageKey, convertToAbsolute]);

    const saveStrokesToStorage = useCallback((strokesToSave: Stroke[]) => {
        const storageKey = getStorageKey();
        if (!storageKey || !drawingAreaRef.current || strokesToSave.length === 0) return;
        
        try {
            // Convert absolute coordinates to relative coordinates before saving
            const relativeStrokes = strokesToSave.map(stroke => convertToRelative(stroke));
            
            // Validate that all coordinates are in the 0-1 range
            const isValidData = relativeStrokes.every(stroke =>
                stroke.every(point => 
                    point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1 && 
                    !isNaN(point.x) && !isNaN(point.y)
                )
            );
            
            if (!isValidData) {
                console.warn('Invalid relative coordinates detected, not saving to localStorage');
                return;
            }
            
            localStorage.setItem(storageKey, JSON.stringify(relativeStrokes));
            console.log('Saved valid relative coordinates to localStorage:', relativeStrokes);
        } catch (error) {
            console.warn('Failed to save strokes to localStorage:', error);
        }
    }, [getStorageKey, convertToRelative]);

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
    // Also reload when the drawing area size changes
    useEffect(() => {
        console.log('[useCameraDraw] Initial loading effect - prefix:', prefix, 'hasDrawingArea:', !!drawingAreaRef.current);
        
        if (!prefix || !drawingAreaRef.current) {
            console.log('[useCameraDraw] Skipping initial load - missing prefix or drawing area');
            return;
        }
        
        console.log('[useCameraDraw] Loading strokes from storage on mount...');
        const savedStrokes = loadStrokesFromStorage();
        console.log('[useCameraDraw] Initial load complete - setting', savedStrokes.length, 'strokes');
        setStrokes(savedStrokes);
    }, [prefix, loadStrokesFromStorage]);

    // Re-load strokes when drawing area size changes to adjust for new dimensions
    useEffect(() => {
        console.log('[useCameraDraw] Resize observer effect - prefix:', prefix, 'hasDrawingArea:', !!drawingAreaRef.current);
        
        if (!prefix || !drawingAreaRef.current) {
            console.log('[useCameraDraw] Skipping resize observer setup');
            return;
        }

        const resizeObserver = new ResizeObserver((entries) => {
            console.log('[useCameraDraw] Resize observed:', entries[0]?.contentRect);
            // Small delay to ensure the new size is properly set
            setTimeout(() => {
                console.log('[useCameraDraw] Reloading strokes after resize...');
                const savedStrokes = loadStrokesFromStorage();
                console.log('[useCameraDraw] Resize reload complete - setting', savedStrokes.length, 'strokes');
                setStrokes(savedStrokes);
            }, 0);
        });

        resizeObserver.observe(drawingAreaRef.current);

        return () => {
            console.log('[useCameraDraw] Cleaning up resize observer');
            resizeObserver.disconnect();
        };
    }, [prefix, loadStrokesFromStorage]);

    // Additional effect to ensure strokes are loaded when drawing area ref becomes available
    useEffect(() => {
        console.log('[useCameraDraw] Ref availability effect - prefix:', prefix);
        
        if (!prefix) return;

        const checkAndLoadStrokes = () => {
            console.log('[useCameraDraw] Checking and loading strokes - hasDrawingArea:', !!drawingAreaRef.current);
            if (drawingAreaRef.current) {
                console.log('[useCameraDraw] Drawing area available, loading strokes...');
                const savedStrokes = loadStrokesFromStorage();
                console.log('[useCameraDraw] Ref availability load complete - setting', savedStrokes.length, 'strokes');
                setStrokes(savedStrokes);
            } else {
                console.log('[useCameraDraw] Drawing area not yet available');
            }
        };

        // Check immediately
        checkAndLoadStrokes();

        // Also check after a short delay in case the ref isn't ready yet
        const timeoutId = setTimeout(() => {
            console.log('[useCameraDraw] Delayed check after 100ms...');
            checkAndLoadStrokes();
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [prefix, loadStrokesFromStorage]);

    // Load strokes when drawing mode is enabled and ref becomes available
    useEffect(() => {
        console.log('[useCameraDraw] Drawing mode + ref effect - isDrawingMode:', isDrawingMode, 'hasDrawingArea:', !!drawingAreaRef.current, 'prefix:', prefix);
        
        if (isDrawingMode && prefix && drawingAreaRef.current) {
            console.log('[useCameraDraw] Drawing mode is on and ref is available, loading strokes...');
            const savedStrokes = loadStrokesFromStorage();
            console.log('[useCameraDraw] Drawing mode load complete - setting', savedStrokes.length, 'strokes');
            setStrokes(savedStrokes);
        }
    }, [isDrawingMode, prefix, loadStrokesFromStorage]);

    // Save strokes to localStorage whenever strokes change (but only if prefix is provided)
    useEffect(() => {
        if (prefix && strokes.length >= 0) {
            saveStrokesToStorage(strokes);
        }
    }, [strokes, prefix, saveStrokesToStorage]);

    const toggleDrawingMode = useCallback(() => {
        console.log('[useCameraDraw] toggleDrawingMode called');
        setIsDrawingMode(prev => {
            const newMode = !prev;
            console.log('[useCameraDraw] Drawing mode changing from', prev, 'to', newMode);
            
            if (newMode) {
                // When turning on drawing mode, the drawing area ref might not be available yet
                // because the div is conditionally rendered. We'll load strokes after the ref is set.
                console.log('[useCameraDraw] Turning on drawing mode...');
                if (prefix && drawingAreaRef.current) {
                    console.log('[useCameraDraw] Drawing area available immediately, loading strokes');
                    const savedStrokes = loadStrokesFromStorage();
                    console.log('[useCameraDraw] Loaded strokes from storage:', savedStrokes.length, 'strokes');
                    setStrokes(savedStrokes);
                } else {
                    console.log('[useCameraDraw] Drawing area not yet available, will load when ref is set');
                    // The useEffect with delayed loading will handle this case
                }
            } else {
                // When turning off drawing mode, only clear drawing state but preserve strokes and localStorage
                console.log('[useCameraDraw] Turning off drawing mode, clearing drawing state only');
                setCurrentStroke([]);
                setIsDrawing(false);
                // Note: We no longer clear strokes here - they persist in localStorage
            }
            return newMode;
        });
    }, [prefix, loadStrokesFromStorage]);

    const reloadStrokesFromStorage = useCallback(() => {
        if (prefix && drawingAreaRef.current) {
            const savedStrokes = loadStrokesFromStorage();
            setStrokes(savedStrokes);
        }
    }, [prefix, loadStrokesFromStorage]);

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
        reloadStrokesFromStorage,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        createStrokePath
    };
}