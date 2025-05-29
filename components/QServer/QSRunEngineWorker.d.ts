import { RunningQueueItem } from './types/apiTypes';
type QSRunEngineWorkerProps = {
    isREToggleOn?: boolean;
    setIsREToggleOn?: (arg: boolean) => void;
    runningItem?: RunningQueueItem | null;
};
export default function QSRunEngineWorker({ isREToggleOn, setIsREToggleOn, runningItem }: QSRunEngineWorkerProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=QSRunEngineWorker.d.ts.map