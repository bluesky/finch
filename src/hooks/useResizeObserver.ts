import { useEffect, useState, useRef } from 'react';

//custom hook that exposes the width and height of an HTML element as state variables
//dimensions.width and dimensions.height
//This is useful when a child component accepts a width and height variable to set the size in pixels
export default function useResizeObserver() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            if (entries[0]) {
                const { width, height } = entries[0].contentRect;
                setDimensions({ width, height });
            }
        });
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        return () => resizeObserver.disconnect();
    }, []);

    return {
        containerRef,
        dimensions,
    };
}
