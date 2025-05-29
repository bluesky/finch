import { default as React } from '../../node_modules/react';
type SidebarProps = {
    /** Children rendered inside sidebar */
    children?: React.ReactNode;
    /** Tailwind ClassNamme */
    color?: `bg-${string}`;
    /** Should this take up full height of the parent? If not then it will take up the VH minus some rems for a header */
    isFullHeight?: boolean;
    /** How wide is the sidebar */
    size?: 'small' | 'medium' | 'large';
    /** Should the shadow on the right be disabled? */
    disableShadow?: boolean;
    /** Display a hamburger icon that allows the sidebar to collapse? */
    collapsible?: boolean;
    /** App Title */
    title?: string;
    /** Tailwind ClassName for the transparent header only used when a title or collapse icon is visible */
    headingBgColor?: `bg-${string}`;
    /** Tailwind ClassNames */
    styles?: string;
};
export default function Sidebar({ children, color, isFullHeight, size, disableShadow, collapsible, title, styles, headingBgColor, ...props }: SidebarProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Sidebar.d.ts.map