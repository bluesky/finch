type RouteBase = {
    /** The URL path for this route (e.g. `"/dashboard"`). The leading slash is optional and repeated slashes collapse. Must be static; dynamic segments like `:id` are not supported, since the sidebar links straight to this path. */
    path: string;
    /** Human-readable label shown in navigation UI. */
    label: string;
    /** Optional icon displayed alongside the route label in navigation. */
    icon?: React.ReactNode;
    /** When `true`, the page background is rendered as transparent against the main content color and sets text color to white, when 'false' it is rendered with white background and default text color*/
    isBackgroundTransparent?: boolean;
    /** Additional CSS classes applied to the inner container of the route element. */
    classNameContainer?: string;
    /** Whether this route's label is shown in the header. Defaults to `true`, except on `/`. */
    showPageTitle?: boolean;
};

/**
 * Defines a single navigable route entry in the application router.
 *
 * A route renders either a single `element` or a strip of `tabs`, never both.
 */
export type RouteItem = RouteBase &
    (
        | {
              /** The React component rendered when this route is active. */
              element: React.ReactNode;
              tabs?: never;
          }
        | {
              element?: never;
              /** Tabs rendered in a strip above the page. Each tab becomes a nested route. On the root route `"/"` they sit under a reserved `-` segment, so `"live"` lands at `/-/live`. */
              tabs: RouteTab[];
          }
    );

/** A single tab belonging to a route that declares `tabs`. */
export type RouteTab = {
    /** Path appended to the parent route path (e.g. `"live"` or `"/live"` under `"/explorer"`). Leading and trailing slashes are optional and repeated ones collapse, but the path cannot be empty. */
    path: string;
    /** Label shown on the tab. */
    label: string;
    /** The React component rendered when this tab is active. */
    element: React.ReactNode;
    /** When `true`, this tab's background is transparent against the main content color and its text is white. Falls back to the parent route's setting. */
    isBackgroundTransparent?: boolean;
    /** Additional CSS classes applied to the inner container of this tab's element. Merged on top of the parent route's. */
    classNameContainer?: string;
};
