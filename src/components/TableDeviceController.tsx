import { useEffect, useState } from 'react';

import { Lock, LockOpen } from '@phosphor-icons/react';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from './ui/table';
import ControllerAbsoluteMove from './ControllerAbsoluteMove';
import ControllerRelativeMove from './ControllerRelativeMove';
import { Devices } from '@/types/deviceControllerTypes';
import { cn } from '@/lib/utils';

export type TableDeviceControllerProps = {
    /** Map of device names to their current state objects. Each entry renders as one table row. */
    devices: Devices;
    /** Called when the user submits an absolute or relative move value for a device. */
    handleSetValueRequest: (deviceName: string, value: number) => void;
    /** Called to toggle the locked state for a device, enabling or disabling its move controls. */
    toggleDeviceLock: (deviceName: string, locked: boolean) => void;
    /** Called to toggle the expanded state for a device row, showing or hiding its raw JSON data. */
    toggleExpand: (deviceName: string) => void;
    /** Additional CSS classes applied to the root container. */
    className?: string;
};

export default function TableDeviceController({
    devices,
    handleSetValueRequest,
    toggleDeviceLock,
    toggleExpand,
    className,
    ...props
}: TableDeviceControllerProps) {
    // State to track flashing rows
    const [flashingRows, setFlashingRows] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const updatedFlashingRows: Record<string, boolean> = {};
        const currentTime = Date.now() / 1000; // Current time in seconds

        Object.keys(devices).forEach((deviceName) => {
            const device = devices[deviceName];
            if (device.timestamp && currentTime - device.timestamp <= 0.03) {
                updatedFlashingRows[deviceName] = true;

                // Remove the flash effect after 1 second timeout, this timeout needs to match the animation duration of the tailwind class to avoid flutter effect
                setTimeout(() => {
                    setFlashingRows((prev) => ({
                        ...prev,
                        [deviceName]: false,
                    }));
                }, 500);
            }
        });

        setFlashingRows(updatedFlashingRows);
    }, [devices]);
    return (
        <div
            className={cn('p-4 w-fit h-fit bg-slate-200 rounded-lg shadow-lg', className)}
            {...props}
        >
            <Table className="max-w-[900px] m-auto">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-48 text-sky-900 font-medium">Device Name</TableHead>
                        <TableHead className="text-center pr-8 text-sky-900 font-medium">
                            Current Value
                        </TableHead>
                        <TableHead className="text-left text-sky-900 font-medium">
                            Absolute Move
                        </TableHead>
                        <TableHead className="text-center text-sky-900 font-medium">
                            Relative Move
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Object.keys(devices).map((deviceName) => {
                        const device = devices[deviceName];
                        return (
                            <TableRow
                                key={deviceName}
                                className={`${flashingRows[deviceName] ? 'animate-flash1' : ''} text-black`}
                            >
                                <TableCell
                                    className="hover:cursor-pointer py-5"
                                    onClick={() => toggleExpand(deviceName)}
                                >
                                    <>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleDeviceLock(deviceName, !device.locked);
                                                }}
                                                className="text-sky-700 hover:text-sky-900 shrink-0"
                                            >
                                                {device.locked ? (
                                                    <Lock size={16} weight="fill" />
                                                ) : (
                                                    <LockOpen size={16} />
                                                )}
                                            </button>
                                            <p>{deviceName}</p>
                                        </div>
                                        {device.expanded && (
                                            <pre className="text-xs">
                                                {JSON.stringify(device, null, 2)}
                                            </pre>
                                        )}
                                    </>
                                </TableCell>
                                <TableCell className="text-center text-md text-sky-700 font-medium">
                                    {`${typeof device.value === 'number' ? device.value.toPrecision(4) : device.value} ${device.units ? device.units.slice(0, 3) : 'n/a'}`}
                                </TableCell>
                                <TableCell>
                                    <ControllerAbsoluteMove
                                        handleEnter={(input) =>
                                            input !== null &&
                                            handleSetValueRequest(deviceName, input)
                                        }
                                        inputLabel={device.units && device.units.slice(0, 3)}
                                        classNameInput="bg-sky-200 shadow-inner rounded-md"
                                        locked={device.locked}
                                    />
                                </TableCell>
                                <TableCell>
                                    <ControllerRelativeMove
                                        className="justify-center"
                                        handleEnter={(input) =>
                                            input !== null &&
                                            handleSetValueRequest(deviceName, input)
                                        }
                                        inputLabel={device.units && device.units.slice(0, 3)}
                                        currentValue={
                                            typeof device.value === 'number' ? device.value : null
                                        }
                                        classNameInput="bg-sky-200 shadow-inner rounded-md"
                                        locked={device.locked}
                                    />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
