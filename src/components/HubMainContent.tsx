import { Routes, Route } from "react-router";
import { cn } from "@/lib/utils";

import { RouteItem } from "@/types/navigationRouterTypes";

export type HubMainContentProps = {
    /** Route definitions used to render the matched page component via React Router. */
    routes: RouteItem[];
    /** Additional CSS classes applied to the root main element. */
    className?: string;
}
export default function HubMainContent({routes, className, ...props}: HubMainContentProps) {
    return (
        <main className={cn("bg-sky-900 h-full w-full p-8 overflow-y-auto", className)} {...props}>
            <Routes>
                {routes.map((route) => (
                    <Route
                        key={route.path}
                        path={route.path}
                        element={route.element}
                    />
                ))}
            </Routes>
        </main>
    )
}