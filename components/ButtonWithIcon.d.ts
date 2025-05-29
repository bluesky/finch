export type ButtonWithIconProps = {
    /** callback function on click */
    cb?: () => void;
    /** text inside button */
    text?: string;
    /** Tailwind ClassName */
    bgColor?: `bg-${string}`;
    /** Tailwind ClassName */
    hoverBgColor?: `hover:bg-${string}`;
    /** Tailwind ClassName */
    textColor?: `text-${string}`;
    /** Extra Tailwind ClassNames applied to button component */
    styles?: string;
    /** Boolean that prevents the user from clicking or causing hover effects when true */
    disabled?: boolean;
    /** any valid JSX element, best used with SVG to allow text color property to apply  */
    icon: JSX.Element;
    /** Is the icon on the left or right of the text? */
    iconPosition?: 'left' | 'right';
    /** How large is the button */
    size?: 'small' | 'medium' | 'large';
    /** Should the button style default to hollow color with black text? */
    isSecondary?: boolean;
};
export default function ButtonWithIcon({ cb, text, bgColor, hoverBgColor, textColor, styles, disabled, icon, iconPosition, size, isSecondary, ...props }: ButtonWithIconProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ButtonWithIcon.d.ts.map