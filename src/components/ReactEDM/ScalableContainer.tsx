import { useState, useRef, useCallback } from "react";
import React from "react";
import { cn } from "@/lib/utils";

interface ScalableContainerProps {
  children: React.ReactNode;
  className?: string;
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  onScaleReset?: number;
  sensitivity?: number;
  onScaleChange?: (scale: number) => void;
}

export default function ScalableContainer({
  children,
  className,
  initialScale = 0.85,
  minScale = 0.3,
  maxScale = 3.0,
  onScaleReset = 0.85,
  sensitivity = 200,
  onScaleChange
}: ScalableContainerProps) {
  const [scale, setScale] = useState(initialScale);
  const [isResizing, setIsResizing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false); // Add this flag
  const containerRef = useRef<HTMLDivElement>(null);
  const startDataRef = useRef<{
    startX: number;
    startY: number;
    startScale: number;
  } | null>(null);

  // Only update scale from initialScale on first mount or when not actively scaling
  React.useEffect(() => {
    if (!hasInitialized) {
      setScale(initialScale);
      setHasInitialized(true);
    } else if (!isResizing) {
      // Only update if we're not currently resizing
      setScale(initialScale);
    }
  }, [initialScale, hasInitialized, isResizing]);

  // Call onScaleChange whenever scale changes, but debounce it slightly
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      onScaleChange?.(scale);
    }, 50); // Small delay to prevent rapid updates

    return () => clearTimeout(timeoutId);
  }, [scale, onScaleChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    startDataRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startScale: scale
    };
  }, [scale]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !startDataRef.current) return;

    const { startX, startY, startScale } = startDataRef.current;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    const delta = Math.max(deltaX, deltaY);
    const scaleFactor = 1 + (delta / sensitivity);
    const newScale = Math.max(minScale, Math.min(maxScale, startScale * scaleFactor));

    setScale(newScale);
  }, [isResizing, minScale, maxScale, sensitivity]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    startDataRef.current = null;
  }, []);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setScale(onScaleReset);
  };

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className={cn("relative", className, {
        'select-none': isResizing
      })}
      style={{
        '--component-scale': scale,
        fontSize: `${scale}em`
      } as React.CSSProperties}
    >
      {children}

      <div
        className={`absolute bottom-0 right-0 w-4 h-4 bg-gray-400 cursor-se-resize transition-opacity ${
          isResizing ? 'opacity-100 bg-gray-600' : 'opacity-50 hover:opacity-100'
        }`}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        style={{
          clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
          userSelect: 'none'
        }}
      />
    </div>
  );
}