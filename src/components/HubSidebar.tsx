import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

import { RouteItem } from "@/types/navigationRouterTypes";

export type HubSidebarProps = {
    routes: RouteItem[];
    className?: string;
    activeLinkClassName?: string;
    inactiveLinkClassName?: string;
}
export default function HubSidebar({routes, className, activeLinkClassName, inactiveLinkClassName}: HubSidebarProps) {
    const navStyles = cn('flex flex-col items-center justify-center h-20 aspect-square rounded-lg text-white hover:bg-sky-800 cursor-pointer', inactiveLinkClassName);
    return (
        <aside className={cn("row-span-2 bg-sky-950 flex flex-col py-4 overflow-y-auto", className)}>
            {routes.map((item, index) => 
                <div key={index} className="flex flex-col items-center">
                    <NavLink 
                        to={item.path}
                        className={({isActive}) =>
                            isActive ? cn(navStyles, cn("bg-sky-300 text-black", activeLinkClassName)) : navStyles
                        }
                    >
                        {item.icon}
                        <span className="font-light">{item.label}</span>
                    </NavLink>
                    <div className="h-[1px] w-10/12 border-b border-white/50 my-4"></div>
                </div>
            )}
        </aside>
    )
}