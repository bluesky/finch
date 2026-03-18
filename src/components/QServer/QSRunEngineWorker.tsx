import ToggleSlider from './ToggleSlider';
import QItem from "./QItem";

import { startRE } from './utils/apiClient';
import { RunningQueueItem } from './types/apiTypes';

type QSRunEngineWorkerProps = {
    isREToggleOn?: boolean;
    setIsREToggleOn?: (arg: boolean) => void;
    runningItem?: RunningQueueItem | null;
    handleItemClick?: (item: RunningQueueItem) => void;
};
export default function QSRunEngineWorker({ isREToggleOn=false, setIsREToggleOn=()=>{}, runningItem, handleItemClick }: QSRunEngineWorkerProps) {
    //const [ isREToggleOn, setIsREToggleOn ] = useState(false);

    //TO DO : the toggle switch needs to listen to the GET requests for the queue status
    //TO DO: if toggle is in up position, when cliked a popup says "Pause the RE?" If that's clicked then do a POST to /api/re/pause
    //TO DO: if toggle is in down position AND the /api/status shows {"manager_state": "paused"} then clicking toggle sends POST to /api/re/resume
    const toggleSwitch = async () => {
        if (isREToggleOn) {
            //switches from On to Off, calls the Off function
            setIsREToggleOn(false);
       
        } else {
            //switches from Off to On, calls the On function
            setIsREToggleOn(true); //user sees that it moves
            //use setTimeout to ensure that the toggle is seen moving up before moving down during a failure so user knows it was attempted
            setTimeout( async () => {
                const apiCallStatus = await startRE();
                if (apiCallStatus) {
                    
                } else {
                    setIsREToggleOn(false); 
                }
            }, 300);
        }
    };

    const handleRunningItemClick = () => {
        if (handleItemClick && runningItem) {
            handleItemClick(runningItem);
        }
    };

    return (
        <div className="flex justify-center items-center w-full relative">
            <QItem item={runningItem} type={runningItem ? 'current' : 'blank'} handleClick={handleRunningItemClick}/>
            <ToggleSlider isToggleOn={isREToggleOn} handleToggleClick={toggleSwitch}/>
        </div>
    )
}