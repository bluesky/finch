export type ButtonProps = {
    /** Callback function triggered when button is clicked */
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    /** Text content displayed inside the button */
    text?: string;
    /** Disables the button and prevents user interaction when true */
    disabled?: boolean;
    /** Controls the size of the button - affects text size and padding */
    size?: 'small' | 'medium' | 'large';
    /** Changes button style to transparent background with border and black text when true */
    isSecondary?: boolean;
    /** Renders the button in a pressed/active state */
    active?: boolean;
    /** Additional CSS classes applied to the button container. To override colors, pass Tailwind classes (e.g. `bg-orange-500 hover:bg-orange-600 text-white`). */
    className?: string;
    /** Additional CSS classes applied to the button text element */
    classNameText?: string;
    /** Legacy callback function, use onClick instead */
    cb?: () => void;
};
export default function Button({ cb, onClick, text, disabled, size, isSecondary, active, className, classNameText, ...props }: ButtonProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Button.d.ts.map