import { useState,  useEffect, } from 'react';

import QItemPopup from "./QItemPopup";
import SidePanel from "./SidePanel";
import MainPanel from "./MainPanel";
import SettingsContainer from "./SettingsContainer";
import QSConsole from "./QSConsole";
import QSAddItem from "./QSAddItem";
import QSList from "./QSList";
import QSRunEngineWorker from "./QSRunEngineWorker";

import { tailwindIcons } from "src/assets/icons";

import { getStatus, openWorkerEnvironment, setQueueServerApiUrl } from "./utils/apiClient";

import { useQueueServer } from "./hooks/useQueueServer";

import { CopiedPlan, PopupItem } from "./types/types";
import { GetStatusResponse, RunningQueueItem } from "./types/apiTypes";

import { cn } from '@/lib/utils';

export type ContainerQServerProps = {
    className?: string;
    url?: string;
}
export default function ContainerQServer({className, url}:ContainerQServerProps) {

    const [ isQItemPopupVisible, setIsQItemPopupVisible ] = useState(false);
    const [ popupItem, setPopupItem ] = useState<PopupItem | null>(null);
    const [ isItemDeleteButtonVisible, setIsItemDeleteButtonVisible ] = useState(true);
    const [ copiedPlan, setCopiedPlan ] = useState<CopiedPlan | null>(null);
    const [ isSidepanelExpanded, setIsSidepanelExpanded ] = useState(false);
    const [ minimizeAllWidgets, setMinimizeAllWidgets ] = useState(false);

    if (url) {
        console.log('setting the url')
        setQueueServerApiUrl(url)
    }
    
    const {
        currentQueue,
        queueHistory,
        isREToggleOn,
        runningItem,
        setIsREToggleOn,
        processConsoleMessage,
        globalMetadata,
        updateGlobalMetadata,
        removeDuplicateMetadata,
        isGlobalMetadataChecked,
        handleGlobalMetadataCheckboxChange
    } = useQueueServer();

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

    const handleSidepanelExpandClick = (isSidepanelExpanded:boolean) => {
        if (isSidepanelExpanded) {
            setIsSidepanelExpanded(false);
            //expand all widgets on the main panel
            setMinimizeAllWidgets(false);
        } else {
            setIsSidepanelExpanded(true);
            //minimize all widgets on the main panel
            setMinimizeAllWidgets(true);
        }
    };

/**
 * Sets the copiedPlan state variable which triggers the plan and parameters to be updated in QSAddItem
 * 
 * @param {string} name - String value representing the name of the plan
 * @param {object} kwargs - Object of format {key1: value1, key2: value2, ...}
 * // The values may be string, array, or objects
 */
    const handleCopyItemClick = (name:string='', kwargs:{[key:string]:any}) => {
        //Copy over the selected item (including kwargs) to QSAddItem
        //Note that 'kwargs' effectively become 'parameters' for the plan object.
        //The backend API calls must use 'kwargs' keyword in JSON requests, the frontend names these as 'parameters' to be more user-friendly.
        var plan = {
            name: name,
            parameters: kwargs //'kwargs' become 'parameters'
        };
        var sanitizedPlan = removeDuplicateMetadata(plan);
        setCopiedPlan(sanitizedPlan);
    };

    useEffect(() => {
        //check if the re worker has opened or not with GET
        const checkWorkerEnvironment = (res:GetStatusResponse) => {
            if (res.worker_environment_exists === false || res.worker_environment_state === 'closed') {
                console.log('RE worker environment closed, attempting to open a new worker environment');
                openWorkerEnvironment();
            }
        }
        getStatus(checkWorkerEnvironment);
    }, [])

    return (
        <main className={cn("max-w-screen-3xl w-full min-w-[52rem] h-full min-h-[50rem] m-auto flex rounded-md relative bg-slate-400 border border-slate-400", className)}>
            {/* ITEM POPUP  */}
            {(isQItemPopupVisible && popupItem!==null) && (
                <QItemPopup 
                    handleQItemPopupClose={handleQItemPopupClose} 
                    popupItem={popupItem} 
                    isItemDeleteButtonVisible={isItemDeleteButtonVisible} 
                    handleCopyItemClick={handleCopyItemClick} 
                    isItemRunning={popupItem === runningItem}
                />
            )} 
            <div className={`${isSidepanelExpanded ? 'w-4/5' : 'w-1/5 '}  flex-shrink-0 transition-all duration-300 ease-in-out bg-slate-200 rounded-md shadow-md drop-shadow h-full`}>
                <SidePanel 
                    queueData={currentQueue?.items || []}
                    queueHistoryData={queueHistory?.items || []} 
                    isREToggleOn={isREToggleOn} 
                    handleSidepanelExpandClick={handleSidepanelExpandClick}
                    isSidepanelExpanded={isSidepanelExpanded}
                >
                    <QSList type="short" queueData={currentQueue?.items || []} handleQItemClick={handleCurrentQItemClick}/>
                    <QSRunEngineWorker runningItem={runningItem} isREToggleOn={isREToggleOn} setIsREToggleOn={setIsREToggleOn} handleItemClick={handleRunEngineItemClick}/>
                    <QSList type="history" queueData={queueHistory?.items || []} handleQItemClick={handleHistoryQItemClick}/>
                </SidePanel>
            </div>

            <div className="flex-grow  rounded-md">
                <MainPanel minimizeAllWidgets={minimizeAllWidgets} expandPanel={handleSidepanelExpandClick}>
                    <QSAddItem 
                        title="Add Item" 
                        icon={tailwindIcons.plus} 
                        expandedHeight="h-5/6" 
                        defaultHeight="h-1/2" 
                        maxHeight="max-h-[50rem]" 
                        copiedPlan={copiedPlan} 
                        isGlobalMetadataChecked={isGlobalMetadataChecked} 
                        globalMetadata={globalMetadata}/> 
                    <QSConsole 
                        title="Console Output" 
                        icon={tailwindIcons.commandLine} 
                        expandedHeight="h-3/4" 
                        defaultHeight="h-1/2" 
                        processConsoleMessage={processConsoleMessage}/> 
                    <SettingsContainer 
                        title="Settings" 
                        icon={tailwindIcons.cog} 
                        expandedHeight="h-1/2" 
                        defaultHeight="h-1/5" 
                        maxHeight="max-h-[30rem]" 
                        isGlobalMetadataChecked={isGlobalMetadataChecked} 
                        handleGlobalMetadataCheckboxChange={handleGlobalMetadataCheckboxChange} 
                        updateGlobalMetadata={updateGlobalMetadata}/>
                </MainPanel>
            </div>
        </main>
    )
}

