import { NavLink } from 'react-router';
import { toTabPath } from './utils/pageRoutes';
import { cn } from '@/lib/utils';

import { RouteTab } from '@/types/navigationRouterTypes';

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

const tabStyles = 'self-end px-4 py-3 text-sm font-medium border-b-2 transition-colors';

/** Strip of tab links rendered above a page whose route declares `tabs`. */
export default function FinchPageTabs({
    basePath,
    tabs,
    className,
    classNameActiveTab,
    classNameInactiveTab,
    ...props
}: FinchPageTabsProps) {
    return (
        <nav
            className={cn(
                'flex gap-1 px-7 h-12 items-stretch shrink-0 bg-black/[0.14] border-b border-white/10',
                className,
            )}
            {...props}
        >
            {tabs.map((tab) => (
                <NavLink
                    key={tab.path}
                    to={toTabPath({ basePath, tab })}
                    end
                    className={({ isActive }) =>
                        cn(
                            tabStyles,
                            isActive
                                ? 'text-white border-sky-300'
                                : 'text-white/60 border-transparent hover:text-white/80',
                            isActive ? classNameActiveTab : classNameInactiveTab,
                        )
                    }
                >
                    {tab.label}
                </NavLink>
            ))}
        </nav>
    );
}
