export type Point = {
    x: number;
    y: number;
};
export type RelativePoint = {
    x: number;
    y: number;
};
export type Stroke = Point[];
export type RelativeStroke = RelativePoint[];
export declare function useCameraDraw(prefix?: string): {
    isDrawingMode: boolean;
    strokes: Stroke[];
    currentStroke: Point[];
    drawingAreaRef: import('../../../../node_modules/react').RefObject<HTMLDivElement>;
    toggleDrawingMode: () => void;
    eraseAllStrokes: () => void;
    reloadStrokesFromStorage: () => void;
    handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
    handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
    handleMouseUp: () => void;
    createStrokePath: (stroke: Point[]) => string | null;
};
//# sourceMappingURL=useCameraDraw.d.ts.map