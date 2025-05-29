import { default as React } from '../../node_modules/react';
type SidebarItemProps = {
    /** content to be rendered underneath the title */
    children?: React.ReactNode;
    /** title text above children */
    title?: string;
    /** any valid JSX, but SVG works best for color attribute */
    icon?: JSX.Element;
    /** Tailwind ClassName for height, the width auto matches the height */
    iconHeight?: `h-${string}`;
    /** Tailwind ClassName */
    titleColor?: `text-${string}`;
    /** Tailwind ClassNames */
    containerStyles?: string;
    /** Tailwind ClassNames */
    iconStyles?: string;
    /** Tailwind ClassNames */
    titleStyles?: string;
    /** Tailwind ClassNames */
    childrenStyles?: string;
};
export default function SidebarItem({ children, title, icon, iconHeight, titleColor, containerStyles, iconStyles, titleStyles, childrenStyles, ...props }: SidebarItemProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SidebarItem.d.ts.map