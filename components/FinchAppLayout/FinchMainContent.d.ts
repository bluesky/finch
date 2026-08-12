import { RouteItem } from '../../types/navigationRouterTypes';
export type FinchMainContentProps = {
    /** Route definitions used to render the matched page component via React Router. */
    routes: RouteItem[];
    /** Additional CSS classes applied to the main outer element. */
    className?: string;
    /** Additional CSS classes applied to the scrolling element that holds the page padding. */
    classNameScrollContainer?: string;
    /** Additional CSS classes applied to the inner element directly rendering the route element. */
    classNameInnerContainer?: string;
    /** Additional CSS classes applied to the page tab strip. */
    classNamePageTabs?: string;
    /** Additional CSS classes applied to the active page tab. */
    classNamePageTabsActive?: string;
    /** Additional CSS classes applied to inactive page tabs. */
    classNamePageTabsInactive?: string;
};
export default function FinchMainContent({ routes, className, classNameScrollContainer, classNameInnerContainer, classNamePageTabs, classNamePageTabsActive, classNamePageTabsInactive, ...props }: FinchMainContentProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=FinchMainContent.d.ts.map