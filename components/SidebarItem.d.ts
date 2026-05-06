import { default as React } from '../../node_modules/react';
type SidebarItemProps = {
    /** content to be rendered underneath the title */
    children?: React.ReactNode;
    /** title text above children */
    title?: string;
    /** any valid JSX, but SVG works best for color attribute */
    icon?: JSX.Element;
    /** Tailwind ClassNames */
    className?: string;
    /** Tailwind ClassNames */
    classNameIcon?: string;
    /** Tailwind ClassNames */
    classNameTitle?: string;
    /** Tailwind ClassNames */
    classNameChildren?: string;
};
export default function SidebarItem({ children, title, icon, className, classNameIcon, classNameTitle, classNameChildren, ...props }: SidebarItemProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SidebarItem.d.ts.map