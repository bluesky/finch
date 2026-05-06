export type PaperProps = {
    /** Controls the fixed dimensions of the card. 'full' fills the parent, 'grow' expands to fill available flex space. Defaults to 'full'. */
    size?: 'small' | 'medium' | 'large' | 'full' | 'grow';
    /** Controls the border radius of the card. Defaults to 'medium'. */
    rounded?: 'none' | 'small' | 'medium' | 'large';
    /** Optional heading rendered at the top of the card. */
    title?: string;
    /** Additional CSS classes applied to the root article element. */
    className?: string;
    /** Content rendered inside the card. */
    children?: React.ReactNode;
};
export default function Paper({ size, rounded, title, className, children, ...props }: PaperProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Paper.d.ts.map