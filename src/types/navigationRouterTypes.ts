/** Defines a single navigable route entry in the application router. */
export type RouteItem = {
    /** The URL path for this route (e.g. `"/dashboard"`). */
    path: string;
    /** Human-readable label shown in navigation UI. */
    label: string;
    /** The React component rendered when this route is active. */
    element: React.ReactNode;
    /** Optional icon displayed alongside the route label in navigation. */
    icon?: React.ReactNode;
    /** When `true`, the page background is rendered as transparent against the main content color and sets text color to white, when 'false' it is rendered with white background and default text color*/
    isBackgroundTransparent?: boolean;
    /** Additional CSS classes applied to the inner container of the route element. */
    classNameContainer?: string;
};
