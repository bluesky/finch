export type ButtonCopyToClipboardProps = {
    /** Text content that will be copied to the clipboard when button is clicked */
    copyText: string;
    /** Optional callback function triggered after successful copy operation */
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    /** Controls the size of the button icon - affects height and maintains square aspect ratio */
    size?: 'small' | 'medium' | 'large';
    /** Additional CSS classes applied to the button container. To override the icon color, pass Tailwind text classes (e.g. `text-orange-500 hover:text-orange-300`). */
    className?: string;
    /** Legacy callback function, use onClick instead */
    cb?: () => void;
};
export default function ButtonCopyToClipboard({ copyText, onClick, cb, size, className, ...props }: ButtonCopyToClipboardProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ButtonCopyToClipboard.d.ts.map