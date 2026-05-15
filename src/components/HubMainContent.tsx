import { Routes, Route } from 'react-router';
import { cn } from '@/lib/utils';

import { RouteItem } from '@/types/navigationRouterTypes';

export type HubMainContentProps = {
    /** Route definitions used to render the matched page component via React Router. */
    routes: RouteItem[];
    /** Additional CSS classes applied to the main outer element. */
    className?: string;
    /** Additional CSS classes applied to the inner element directly rendering the route element. */
    classNameInnerContainer?: string;
};
export default function HubMainContent({
    routes,
    className,
    classNameInnerContainer,
    ...props
}: HubMainContentProps) {
    return (
        <main className={cn('bg-sky-900 h-full w-full p-8 overflow-y-auto', className)} {...props}>
            <Routes>
                {routes.map((route) => (
                    <Route
                        key={route.path}
                        path={route.path}
                        element={
                            <section
                                className={cn(
                                    `${route.isBackgroundTransparent ? 'bg-transparent text-white' : 'bg-white'} w-full h-full rounded-md`,
                                    cn(classNameInnerContainer, route.classNameContainer),
                                )}
                            >
                                {route.element}
                            </section>
                        }
                    />
                ))}
            </Routes>
        </main>
    );
}
