export type UIViewProps = {
    className?: string;
    fileName: string;
    scale?: number;
    onScaleChange?: (scale: number) => void;
    [key: string]: any;
};
export default function UIView({ className, fileName, scale, // Default scale
onScaleChange, ...args }: UIViewProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=UIView.d.ts.map