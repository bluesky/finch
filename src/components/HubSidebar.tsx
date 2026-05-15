import { NavLink } from 'react-router';
import { cn } from '@/lib/utils';

import { RouteItem } from '@/types/navigationRouterTypes';

export type HubSidebarProps = {
    /** Route definitions used to render the sidebar navigation links. */
    routes: RouteItem[];
    /** Additional CSS classes applied to the root aside element. */
    className?: string;
    /** Additional CSS classes applied to the active navigation link. */
    classNameActiveLink?: string;
    /** Additional CSS classes applied to inactive navigation links. */
    classNameInactiveLink?: string;
};
export default function HubSidebar({
    routes,
    className,
    classNameActiveLink,
    classNameInactiveLink,
    ...props
}: HubSidebarProps) {
    const navStyles = cn(
        'flex flex-col items-center justify-center h-20 aspect-square rounded-lg text-white hover:bg-sky-800 cursor-pointer',
        classNameInactiveLink,
    );
    return (
        <aside
            className={cn('row-span-2 bg-sky-950 flex flex-col py-4 overflow-y-auto', className)}
            {...props}
        >
            {routes.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                    <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                            isActive
                                ? cn(navStyles, cn('bg-sky-300 text-black', classNameActiveLink))
                                : navStyles
                        }
                    >
                        {item.icon}
                        <span className="font-light text-center">{item.label}</span>
                    </NavLink>
                    <div className="h-[1px] w-10/12 border-b border-white/50 my-4"></div>
                </div>
            ))}
        </aside>
    );
}
