import { default as React } from '../../../node_modules/react';
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
export default function ScalableContainer({ children, className, initialScale, minScale, maxScale, onScaleReset, sensitivity, onScaleChange }: ScalableContainerProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ScalableContainer.d.ts.map