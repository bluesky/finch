import { useState, useEffect, useRef } from 'react';

import QItemPopup from './QItemPopup';
import SidePanel from './SidePanel';
import MainPanel from './MainPanel';
import SettingsContainer from './SettingsContainer';
import QSConsole from './QSConsole';
import QSAddItem from './QSAddItem';
import QSList from './QSList';
import QSRunEngineWorker from './QSRunEngineWorker';

import { tailwindIcons } from 'src/assets/icons';

import { useStatusQuery, useOpenEnvironmentMutation } from '@/api/qServer/hooks';

import { useQueueServer } from './hooks/useQueueServer';

import { CopiedPlan, PopupItem } from './types/types';
import { ArbitraryKwargs, RunningQueueItem } from '@/api/qServer/types';

import { cn } from '@/lib/utils';

export type QueueServerProps = {
    className?: string;
};
export default function QueueServer({ className }: QueueServerProps) {
    const [isQItemPopupVisible, setIsQItemPopupVisible] = useState(false);
    const [popupItem, setPopupItem] = useState<PopupItem | null>(null);
    const [isItemDeleteButtonVisible, setIsItemDeleteButtonVisible] = useState(true);
    const [copiedPlan, setCopiedPlan] = useState<CopiedPlan | null>(null);
    const [isSidepanelExpanded, setIsSidepanelExpanded] = useState(false);
    const [minimizeAllWidgets, setMinimizeAllWidgets] = useState(false);

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
        handleGlobalMetadataCheckboxChange,
        apiStatus,
    } = useQueueServer();

    const handleCurrentQItemClick = (item: PopupItem) => {
        setPopupItem(item);
        setIsItemDeleteButtonVisible(true);
        setIsQItemPopupVisible(true);
    };

    const handleRunEngineItemClick = (runningItem: RunningQueueItem) => {
        setPopupItem(runningItem);
        setIsItemDeleteButtonVisible(false);
        setIsQItemPopupVisible(true);
    };

    const handleHistoryQItemClick = (item: PopupItem) => {
        setPopupItem(item);
        setIsItemDeleteButtonVisible(false);
        setIsQItemPopupVisible(true);
    };

    const handleQItemPopupClose = () => {
        setIsQItemPopupVisible(false);
        setPopupItem(null);
    };

    const handleSidepanelExpandClick = (isSidepanelExpanded: boolean) => {
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
    const handleCopyItemClick = (name: string = '', kwargs: ArbitraryKwargs) => {
        //Copy over the selected item (including kwargs) to QSAddItem
        //Note that 'kwargs' effectively become 'parameters' for the plan object.
        //The backend API calls must use 'kwargs' keyword in JSON requests, the frontend names these as 'parameters' to be more user-friendly.
        const plan = {
            name: name,
            parameters: kwargs, //'kwargs' become 'parameters'
        };
        const sanitizedPlan = removeDuplicateMetadata(plan);
        setCopiedPlan(sanitizedPlan);
    };

    const { data: initialStatus } = useStatusQuery();
    const openEnvironmentMutation = useOpenEnvironmentMutation();
    const hasCheckedEnvironment = useRef(false);

    useEffect(() => {
        if (initialStatus && !hasCheckedEnvironment.current) {
            hasCheckedEnvironment.current = true;
            if (
                initialStatus.worker_environment_exists === false ||
                initialStatus.worker_environment_state === 'closed'
            ) {
                console.log(
                    'RE worker environment closed, attempting to open a new worker environment',
                );
                openEnvironmentMutation.mutate();
            }
        }
    }, [initialStatus, openEnvironmentMutation]);

    return (
        <main
            className={cn(
                'max-w-screen-3xl w-full min-w-[72rem] h-full min-h-[50rem] m-auto flex rounded-md relative bg-slate-400 border border-slate-400 text-slate-900',
                className,
            )}
        >
            {/* ITEM POPUP  */}
            {isQItemPopupVisible && popupItem !== null && (
                <QItemPopup
                    handleQItemPopupClose={handleQItemPopupClose}
                    popupItem={popupItem}
                    isItemDeleteButtonVisible={isItemDeleteButtonVisible}
                    handleCopyItemClick={handleCopyItemClick}
                    isItemRunning={popupItem.item_uid === runningItem?.item_uid}
                />
            )}
            <div
                className={`${isSidepanelExpanded ? 'w-4/5' : 'w-1/5 '}  flex-shrink-0 transition-all duration-300 ease-in-out bg-slate-200 rounded-md shadow-md drop-shadow h-full min-w-56`}
            >
                <SidePanel
                    queueData={currentQueue?.items || []}
                    queueHistoryData={queueHistory?.items || []}
                    handleSidepanelExpandClick={handleSidepanelExpandClick}
                    isSidepanelExpanded={isSidepanelExpanded}
                    runEngineState={apiStatus ? apiStatus.re_state : null}
                >
                    <QSList
                        type="short"
                        queueData={(currentQueue?.items as PopupItem[]) || []}
                        handleQItemClick={handleCurrentQItemClick}
                    />
                    <QSRunEngineWorker
                        runningItem={runningItem}
                        isREToggleOn={isREToggleOn}
                        setIsREToggleOn={setIsREToggleOn}
                        handleItemClick={handleRunEngineItemClick}
                    />
                    <QSList
                        type="history"
                        queueData={queueHistory?.items || []}
                        handleQItemClick={handleHistoryQItemClick}
                    />
                </SidePanel>
            </div>

            <div className="flex-grow  rounded-md">
                <MainPanel
                    minimizeAllWidgets={minimizeAllWidgets}
                    expandPanel={handleSidepanelExpandClick}
                >
                    <QSAddItem
                        title="Add Item"
                        icon={tailwindIcons.plus}
                        expandedHeight="h-5/6"
                        defaultHeight="h-1/2"
                        maxHeight="max-h-[50rem]"
                        copiedPlan={copiedPlan}
                        isGlobalMetadataChecked={isGlobalMetadataChecked}
                        globalMetadata={globalMetadata}
                    />
                    <QSConsole
                        title="Console Output"
                        icon={tailwindIcons.commandLine}
                        expandedHeight="h-full"
                        defaultHeight="h-1/2"
                        processConsoleMessage={processConsoleMessage}
                    />
                    <SettingsContainer
                        title="Settings"
                        icon={tailwindIcons.cog}
                        expandedHeight="h-1/2"
                        defaultHeight="h-1/5"
                        maxHeight="max-h-[30rem]"
                        isGlobalMetadataChecked={isGlobalMetadataChecked}
                        handleGlobalMetadataCheckboxChange={handleGlobalMetadataCheckboxChange}
                        updateGlobalMetadata={updateGlobalMetadata}
                    />
                </MainPanel>
            </div>
        </main>
    );
}
