import { default as React } from '../../node_modules/react';
export type WidgetProps = {
    /** Content to be displayed below the header */
    children?: React.ReactNode;
    /** The title of the widget */
    title?: string;
    /** An icon that can be any valid jsx (SVG, PNG, etc) */
    icon?: JSX.Element;
    /** Tailwind ClassName only applied when expand icon is not active*/
    defaultHeight?: string;
    /** Tailwind ClassName */
    minHeight?: string;
    /** Tailwind ClassName */
    maxHeight?: string;
    /** Tailwind ClassName */
    minWidth?: string;
    /** Tailwind ClassName */
    width?: string;
    /** Tailwind ClassName */
    maxWidth?: string;
    /** Tailwind ClassName applied only when user clicks expand icon */
    expandedWidth?: string;
    /** Additional Tailwind ClassName styles applied only to the content */
    contentStyles?: string;
};
export default function Widget({ children, title, icon, defaultHeight, minHeight, maxHeight, minWidth, width, maxWidth, expandedWidth, contentStyles, ...props }: WidgetProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Widget.d.ts.map