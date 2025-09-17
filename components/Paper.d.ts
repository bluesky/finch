export type PaperProps = {
    size?: 'small' | 'medium' | 'large' | 'full' | 'grow';
    rounded?: 'none' | 'small' | 'medium' | 'large';
    title?: string;
    className?: string;
    children?: React.ReactNode;
};
export default function Paper({ size, rounded, title, className, children }: PaperProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Paper.d.ts.map