import HubHeader from "@/components/HubHeader";
import HubMainContent from "@/components/HubMainContent";
import HubSidebar from "@/components/HubSidebar";
import { cn } from "@/lib/utils";

import { RouteItem } from "@/types/navigationRouterTypes";

export type HubAppLayoutProps = {
    routes: RouteItem[];
    headerTitle?: string;
    headerTitleClassName?: string;
    headerLogoUrl?: string;
    mainContentClassName?: string;
    headerClassName?: string;
    sidebarClassName?: string;
    sidebarActiveLinkClassName?: string;
    sidebarInactiveLinkClassName?: string;
    className?: string;
    }
export default function HubAppLayout ( {
    routes,
    headerTitle,
    headerLogoUrl,
    mainContentClassName, 
    headerClassName,
    headerTitleClassName,
    sidebarClassName,
    sidebarActiveLinkClassName,
    sidebarInactiveLinkClassName,
    className
  }: HubAppLayoutProps) {

return (
    <div className={cn("grid grid-cols-[6rem_1fr] grid-rows-[auto_1fr] h-screen w-screen", className)}>
        <HubSidebar 
            routes={routes}
            className={sidebarClassName} 
            activeLinkClassName={sidebarActiveLinkClassName}
            inactiveLinkClassName={sidebarInactiveLinkClassName}
        />
        <HubHeader 
            title={headerTitle} 
            logoUrl={headerLogoUrl}
            className={headerClassName}
            titleClassName={headerTitleClassName}
        />
        <HubMainContent 
            routes={routes}
            className={cn("h-[calc(100vh-4rem)]", mainContentClassName)} 
        />
    </div>
)
  }
