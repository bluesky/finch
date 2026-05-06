type ButtonIconOnlyProps = {
    /** JSX element displayed as the button content - typically an SVG icon */
    icon: React.ReactNode;
    /** Additional CSS classes applied to the button container. To override colors, pass Tailwind classes (e.g. `bg-orange-500 hover:bg-orange-600`). */
    className?: string;
    /** Additional CSS classes applied to the icon element */
    classNameIcon?: string;
    /** Callback function triggered when button is clicked */
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    /** Disables the button and prevents user interaction when true */
    disabled?: boolean;
    /** Changes button style to white background with border instead of primary blue when true */
    isSecondary?: boolean;
    /** Renders the button in a pressed/active state */
    active?: boolean;
};
export default function ButtonIconOnly({ icon, className, classNameIcon, onClick, disabled, isSecondary, active, ...props }: ButtonIconOnlyProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ButtonIconOnly.d.ts.map