export type ButtonWithIconProps = {
    /** Callback function triggered when button is clicked */
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    /** Text content displayed inside the button alongside the icon */
    text?: string;
    /** Additional CSS classes applied to the button component */
    styles?: string;
    /** Disables the button and prevents user interaction when true */
    disabled?: boolean;
    /** JSX element displayed as an icon - works best with SVG elements for proper styling  */
    icon: JSX.Element;
    /** Controls whether the icon appears on the left or right side of the text */
    iconPosition?: 'left' | 'right';
    /** Controls the overall size of the button - affects text size, icon size, and padding */
    size?: 'small' | 'medium' | 'large';
    /** Changes button style to transparent background with border and black text when true */
    isSecondary?: boolean;
    /** Additional CSS classes applied to the button container. To override colors, pass Tailwind classes (e.g. `bg-orange-500 hover:bg-orange-600 text-white`). */
    className?: string;
    /** Additional CSS classes applied to the button text element */
    classNameText?: string;
    /** Additional CSS classes applied to the icon element */
    classNameIcon?: string;
    /** Renders the button in a pressed/active state */
    active?: boolean;
    /** Legacy callback function, use onClick instead */
    cb?: () => void;
};
export default function ButtonWithIcon({ cb, onClick, text, disabled, icon, iconPosition, size, isSecondary, active, className, classNameText, classNameIcon, ...props }: ButtonWithIconProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ButtonWithIcon.d.ts.map