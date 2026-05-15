import { Lock, LockOpen, ArrowsInSimple } from '@phosphor-icons/react';

import { Device } from '@/types/deviceControllerTypes';
import ControllerAbsoluteMove from './ControllerAbsoluteMove';
import ControllerRelativeMove from './ControllerRelativeMove';

type DeviceControllerBoxSimpleProps = {
    /** The device being controlled. */
    device: Device;
    /** Called when the user submits a new absolute or relative target value. Receives the device name and target value. */
    handleSetValueRequest: (deviceName: string, value: number) => void;
    /** Called when the user clicks the lock/unlock icon. Receives the device name. */
    handleLockClick: (deviceName: string) => void;
    /** Called when the user clicks the minimize icon to collapse this card. Receives the device name. */
    handleMinimizeClick: (deviceName: string) => void;
};

export default function DeviceControllerBoxSimple({
    device,
    handleSetValueRequest,
    handleLockClick,
    handleMinimizeClick,
    ...props
}: DeviceControllerBoxSimpleProps) {
    if (!device) return;
    const backgroundColorClass = device.locked ? 'bg-slate-400' : 'bg-slate-100';
    return (
        <article
            className={`w-96 border border-slate-300 rounded-xl flex flex-col ${backgroundColorClass} ${device.locked && 'opacity-60'}`}
            {...props}
        >
            <div className="flex justify-between px-2 py-2 flex-shrink-0">
                {device.locked ? (
                    <Lock
                        size={24}
                        className="text-slate-900 hover:text-green-500 hover:cursor-pointer"
                        onClick={() => handleLockClick(device.name)}
                    />
                ) : (
                    <LockOpen
                        size={24}
                        className="text-slate-500 hover:text-red-500 hover:cursor-pointer"
                        onClick={() => handleLockClick(device.name)}
                    />
                )}
                <ArrowsInSimple
                    size={24}
                    className="text-slate-500"
                    onClick={() => handleMinimizeClick(device.name)}
                />
            </div>
            <div className="flex justify-center items-center">
                <p className="text-xl pb-2">{device.name}</p>
            </div>
            <div className="flex justify-center items-center ">
                <p className="text-xl">{`${typeof device.value === 'number' ? device.value.toPrecision(4) : device.value} ${device.units?.slice(0, 3)}`}</p>
            </div>
            <div className="flex flex-col justify-center items-center py-8 ">
                <p>Relative Move</p>
                <ControllerRelativeMove
                    className="justify-center"
                    handleEnter={(input) =>
                        input !== null && handleSetValueRequest(device.name, input)
                    }
                    inputLabel={device.units && device.units.slice(0, 3)}
                    currentValue={typeof device.value === 'number' ? device.value : null}
                    locked={device.locked}
                />
            </div>
            <div className="flex justify-center items-center py-8 ">
                <p className="mr-4">Set Position</p>
                <ControllerAbsoluteMove
                    handleEnter={(input) =>
                        input !== null && handleSetValueRequest(device.name, input)
                    }
                    inputLabel={device.units && device.units.slice(0, 3)}
                    locked={device.locked}
                />
            </div>
        </article>
    );
}
