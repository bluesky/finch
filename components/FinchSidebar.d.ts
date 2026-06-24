import { RouteItem } from '../types/navigationRouterTypes';
export type FinchSidebarProps = {
    /** Route definitions used to render the sidebar navigation links. */
    routes: RouteItem[];
    /** Additional CSS classes applied to the root aside element. */
    className?: string;
    /** Additional CSS classes applied to the active navigation link. */
    classNameActiveLink?: string;
    /** Additional CSS classes applied to inactive navigation links. */
    classNameInactiveLink?: string;
};
export default function FinchSidebar({ routes, className, classNameActiveLink, classNameInactiveLink, ...props }: FinchSidebarProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=FinchSidebar.d.ts.map