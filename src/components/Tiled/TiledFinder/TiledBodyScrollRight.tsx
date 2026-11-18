import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import './Tiled.css';

type TiledBodyScrollRightProps = {
    children?: React.ReactNode;
};

const TiledBodyScrollRight = forwardRef<HTMLDivElement, TiledBodyScrollRightProps>(
    ({ children, ...props }, ref) => {
        const scrollContainerRef = useRef<HTMLDivElement>(null);

        // Expose internal ref to parent via forwarded ref
        useImperativeHandle(ref, () => scrollContainerRef.current!, []);

        useEffect(() => {
            //when columns load scroll to the right
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
            }
        }, [children]);
        return (
            <div
                className="w-full flex min-h-0 flex-grow border overflow-x-auto scrollbar-always-visible"
                ref={scrollContainerRef}
                {...props}
            >
                {children}
            </div>
        );
    },
);

export default TiledBodyScrollRight;
