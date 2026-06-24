import { RouteItem } from '../types/navigationRouterTypes';
export type FinchMainContentProps = {
    /** Route definitions used to render the matched page component via React Router. */
    routes: RouteItem[];
    /** Additional CSS classes applied to the main outer element. */
    className?: string;
    /** Additional CSS classes applied to the inner element directly rendering the route element. */
    classNameInnerContainer?: string;
};
export default function FinchMainContent({ routes, className, classNameInnerContainer, ...props }: FinchMainContentProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=FinchMainContent.d.ts.map