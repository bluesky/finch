import { useState } from "react";
import { useQueueServer } from "@/components/QServer/hooks/useQueueServer";
import SidePanel from "@/components/QServer/SidePanel";
import QSList from "@/components/QServer/QSList";
import QItemPopup from "@/components/QServer/QItemPopup";
import QSRunEngineWorker from "@/components/QServer/QSRunEngineWorker";
import { RunningQueueItem } from "@/components/QServer/types/apiTypes";
import { PopupItem } from "@/components/QServer/types/types";
import { cn } from "@/lib/utils";

export type QServerPlanMonitorProps = {
    className?: string;
}
export default function QServerPlanMonitor({ className = '' }: QServerPlanMonitorProps) {
    const [ isSidepanelExpanded, setIsSidepanelExpanded ] = useState(false);
    const [ isQItemPopupVisible, setIsQItemPopupVisible ] = useState(false);
    const [ popupItem, setPopupItem ] = useState<any>(null);
    const [ isItemDeleteButtonVisible, setIsItemDeleteButtonVisible ] = useState(true);

    const handleSidepanelExpandClick = () => {
        setIsSidepanelExpanded(!isSidepanelExpanded);
    };

    const handleCurrentQItemClick = (item:PopupItem) => {
        setPopupItem(item);
        setIsItemDeleteButtonVisible(true);
        setIsQItemPopupVisible(true);
    };

    const handleRunEngineItemClick = (runningItem: RunningQueueItem) => {
        setPopupItem(runningItem );
        setIsItemDeleteButtonVisible(false);
        setIsQItemPopupVisible(true);
    }

    const handleHistoryQItemClick = (item:PopupItem) => {
        setPopupItem(item);
        setIsItemDeleteButtonVisible(false);
        setIsQItemPopupVisible(true);
    }

    const handleQItemPopupClose = () => {
        setIsQItemPopupVisible(false);
        setPopupItem(null);
    };

        const {
            currentQueue,
            queueHistory,
            isREToggleOn,
            runningItem,
            setIsREToggleOn,
            apiStatus
        } = useQueueServer();
    return (
        <>
        
   
            {(isQItemPopupVisible && popupItem!==null) && (
                <QItemPopup 
                    handleQItemPopupClose={handleQItemPopupClose} 
                    popupItem={popupItem} 
                    isItemDeleteButtonVisible={isItemDeleteButtonVisible} 
                    isItemRunning={popupItem === runningItem}
                />
            )} 

            <div className={cn(`${isSidepanelExpanded ? 'w-[30rem]' : 'w-56'}  flex-shrink-0 transition-all duration-300 ease-in-out bg-slate-200 rounded-md shadow-md drop-shadow h-full min-w-56`, className)}>
                <SidePanel 
                    queueData={currentQueue?.items || []}
                    queueHistoryData={queueHistory?.items || []} 
                    isREToggleOn={isREToggleOn} 
                    handleSidepanelExpandClick={handleSidepanelExpandClick}
                    isSidepanelExpanded={isSidepanelExpanded}
                    runEngineState={apiStatus ? apiStatus.re_state : null}
                >
                    <QSList type="short" queueData={currentQueue?.items || []} handleQItemClick={handleCurrentQItemClick}/>
                    <QSRunEngineWorker runningItem={runningItem} isREToggleOn={isREToggleOn} setIsREToggleOn={setIsREToggleOn} handleItemClick={handleRunEngineItemClick}/>
                    <QSList type="history" queueData={queueHistory?.items || []} handleQItemClick={handleHistoryQItemClick}/>
                </SidePanel>
            </div>
        </>

    )
}