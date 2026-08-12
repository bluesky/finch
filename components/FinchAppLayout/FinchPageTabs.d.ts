import { RouteTab } from '../../types/navigationRouterTypes';
export type FinchPageTabsProps = {
    /** Path of the route these tabs belong to, used to build each tab link. */
    basePath: string;
    /** Tab definitions rendered as links, in order. */
    tabs: Pick<RouteTab, 'path' | 'label'>[];
    /** Additional CSS classes applied to the root nav element. */
    className?: string;
    /** Additional CSS classes applied to the active tab link. */
    classNameActiveTab?: string;
    /** Additional CSS classes applied to inactive tab links. */
    classNameInactiveTab?: string;
};
/** Strip of tab links rendered above a page whose route declares `tabs`. */
export default function FinchPageTabs({ basePath, tabs, className, classNameActiveTab, classNameInactiveTab, ...props }: FinchPageTabsProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=FinchPageTabs.d.ts.map