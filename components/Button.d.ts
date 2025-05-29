export type ButtonProps = {
    /** callback function on click */
    cb?: Function;
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
    /** How large is the button */
    size?: 'small' | 'medium' | 'large';
    /** Should the button style default to hollow color with black text? */
    isSecondary?: boolean;
};
export default function Button({ cb, text, bgColor, hoverBgColor, textColor, styles, disabled, size, isSecondary, ...props }: ButtonProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Button.d.ts.map