import { cn } from '@/lib/utils';
import { Device } from '@/types/deviceControllerTypes';
import Button from '../Button';
import InputNumber from '../InputNumber';

type HistogramDeviceControllerProps = {
    /** Live device object for the acquire PV, used to read current acquisition state. */
    acquireDevice: Device;
    /** Live device object for the exposure PV, used to relay current exposure */
    exposureDevice: Device;
    /** Callback invoked when the user requests to start acquisition. */
    handleStartAcquisition: () => void;
    /** Callback invoked when the user requests to stop acquisition. */
    handleStopAcquisition: () => void;
    /** Callback invoked when the user enters a value in the exposure field */
    handleSetExposure: (newValue: number) => void;
    /** Additional class names applied to the container element. */
    className?: string;
};
export default function HistogramDeviceController({
    acquireDevice,
    exposureDevice,
    handleSetExposure,
    handleStartAcquisition,
    handleStopAcquisition,
    className,
}: HistogramDeviceControllerProps) {
    //To Do: add acquire state display, start/stop buttons
    //const [ exposureMoveValue, setExposureMoveValue ] = useState<number | null>(null);
    return (
        <div className={cn('flex items-center justify-start gap-4 m-auto', className)}>
            <p className="w-24">{acquireDevice?.value === 1 ? 'Acquiring' : 'Done'}</p>
            <Button onClick={handleStartAcquisition} text="Start Acquire" />
            <Button
                onClick={handleStopAcquisition}
                text="Stop Acquire"
                isSecondary={true}
                className="border-slate-600"
            />
            <InputNumber
                label={`${exposureDevice?.value ?? ''} ${exposureDevice?.units ? exposureDevice.units.slice(0, 3) : 's'}`}
                labelPosition="right"
                className={`w-24`}
                handleEnter={(input) => input !== null && handleSetExposure(input)}
                classNameInput="text-right border border-slate-300 rounded-md bg-sky-200 shadow-inner"
            />
            {/* <input type="number" step="any" value={exposureDevice.value as number ?? ''} onChange={(e) => handleSetExposure(parseFloat(e.target.value))} className="w-24 p-1 border border-gray-300 rounded" placeholder="Exposure"/> */}
        </div>
    );
}
