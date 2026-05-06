import { default as React } from '../../node_modules/react';
type SidebarProps = {
    /** Children rendered inside sidebar */
    children?: React.ReactNode;
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
    /** Additional ClassNames applied to the heading element */
    classNameHeading?: string;
    /** Additional ClassNames applied to the root element */
    className?: string;
    /** Additional ClassNames applied to the title element */
    classNameTitle?: string;
};
export default function Sidebar({ children, isFullHeight, size, disableShadow, collapsible, title, className, classNameHeading, classNameTitle, ...props }: SidebarProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Sidebar.d.ts.map