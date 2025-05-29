export type WidgetStyleProps = {
    title?: string;
    icon?: JSX.Element;
    expandedHeight?: string;
    defaultHeight?: string;
    maxHeight?: string;
};
type WidgetProps = WidgetStyleProps & {
    children: React.ReactNode;
    minimizeAllWidgets?: boolean;
    expandPanel: (bool: boolean) => void;
};
export default function Widget({ children, title, icon, expandedHeight, defaultHeight, maxHeight, minimizeAllWidgets, expandPanel, }: WidgetProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Widget.d.ts.map