import { RunningQueueItem } from '../../api/qServer/types';
type QSRunEngineWorkerProps = {
    isREToggleOn?: boolean;
    setIsREToggleOn?: (arg: boolean) => void;
    runningItem: RunningQueueItem | null;
    handleItemClick?: (item: RunningQueueItem) => void;
};
export default function QSRunEngineWorker({ isREToggleOn, setIsREToggleOn, runningItem, handleItemClick }: QSRunEngineWorkerProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=QSRunEngineWorker.d.ts.map