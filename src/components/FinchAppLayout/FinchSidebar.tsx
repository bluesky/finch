import { Link } from 'react-router';
import { useActiveRoute } from './hooks/useActiveRoute';
import { toRoutePath } from './utils/pageRoutes';
import { cn } from '@/lib/utils';

import { RouteItem } from '@/types/navigationRouterTypes';

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
export default function FinchSidebar({
    routes,
    className,
    classNameActiveLink,
    classNameInactiveLink,
    ...props
}: FinchSidebarProps) {
    const activeRoute = useActiveRoute(routes);
    const navStyles = cn(
        'flex flex-col items-center justify-center h-20 aspect-square rounded-lg text-white hover:bg-sky-800 cursor-pointer',
        classNameInactiveLink,
    );
    return (
        <aside
            className={cn('row-span-2 bg-sky-950 flex flex-col py-4 overflow-y-auto', className)}
            {...props}
        >
            {routes.map((item, index) => {
                const isActive = item === activeRoute;
                return (
                    <div key={index} className="flex flex-col items-center">
                        <Link
                            to={toRoutePath(item.path)}
                            aria-current={isActive ? 'page' : undefined}
                            className={
                                isActive
                                    ? cn(navStyles, 'bg-sky-300 text-black', classNameActiveLink)
                                    : navStyles
                            }
                        >
                            {item.icon}
                            <span className="font-light text-center">{item.label}</span>
                        </Link>
                        <div className="h-[1px] w-10/12 border-b border-white/50 my-4"></div>
                    </div>
                );
            })}
        </aside>
    );
}
