import { useEffect, useState } from 'react';

import { Lock, LockOpen } from '@phosphor-icons/react';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from './ui/table';
import ControllerAbsoluteMove from './ControllerAbsoluteMove';
import ControllerRelativeMove from './ControllerRelativeMove';
import SelectDropdown from './SelectDropdown';
import { Devices, Device } from '@/types/deviceControllerTypes';
import { cn } from '@/lib/utils';

const ABSOLUTE_MOVE = 'Absolute Move';
const RELATIVE_MOVE = 'Relative Move';
type MoveMode = typeof ABSOLUTE_MOVE | typeof RELATIVE_MOVE;

export type TableDeviceControllerWithRBVProps = {
    /** Map of device names to their current state objects. Each entry renders as one table row. */
    devices: Devices;
    devicesRBV: Devices;
    /** Called when the user submits an absolute or relative move value for a device. */
    handleSetValueRequest: (deviceName: string, value: number) => void;
    /** Called to toggle the locked state for a device, enabling or disabling its move controls. */
    toggleDeviceLock: (deviceName: string, locked: boolean) => void;
    /** Called to toggle the expanded state for a device row, showing or hiding its raw JSON data. */
    toggleExpand: (deviceName: string) => void;
    /**
     * When true, the absolute- and relative-move controls share a single "Move"
     * column whose header is a dropdown for switching between the two, so the
     * relative-move UI never reserves empty space. Defaults to false, which
     * renders Absolute Move and Relative Move as two always-visible columns.
     */
    collapsibleRelativeMove?: boolean;
    /** Additional CSS classes applied to the root container. */
    className?: string;
};

export default function TableDeviceControllerWithRBV({
    devices,
    devicesRBV,
    handleSetValueRequest,
    toggleDeviceLock,
    toggleExpand,
    collapsibleRelativeMove = false,
    className,
    ...props
}: TableDeviceControllerWithRBVProps) {
    // State to track flashing rows
    const [flashingRows, setFlashingRows] = useState<Record<string, boolean>>({});
    // In collapsible mode, which move control the single "Move" column shows.
    const [moveMode, setMoveMode] = useState<MoveMode>(ABSOLUTE_MOVE);

    const getFormattedValue = (device: Device) => {
        //Returns the formatted valiues of devices RBV, If it exists in device RBV
        // Otherwise, just returns that devices formatted value.
        if (device.pv + '.RBV' in devicesRBV) {
            const readbackDevice = devicesRBV[device.pv + '.RBV'];
            return `${typeof readbackDevice.value === 'number' ? readbackDevice.value.toPrecision(4) : readbackDevice.value} ${readbackDevice.units ? readbackDevice.units.slice(0, 3) : 'n/a'}`;
        } else {
            return `${typeof device.value === 'number' ? device.value.toPrecision(4) : device.value} ${device.units ? device.units.slice(0, 3) : 'n/a'}`;
        }
    };
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

    const renderAbsoluteMove = (deviceName: string, device: Device) => (
        <ControllerAbsoluteMove
            handleEnter={(input) => input !== null && handleSetValueRequest(deviceName, input)}
            inputLabel={device.units && device.units.slice(0, 3)}
            classNameInput="bg-sky-200 shadow-inner rounded-md"
            locked={device.locked}
        />
    );

    const renderRelativeMove = (deviceName: string, device: Device) => (
        <ControllerRelativeMove
            className="justify-center"
            handleEnter={(input) => input !== null && handleSetValueRequest(deviceName, input)}
            inputLabel={device.units && device.units.slice(0, 3)}
            currentValue={typeof device.value === 'number' ? device.value : null}
            classNameInput="bg-sky-200 shadow-inner rounded-md"
            resultantTextClassName="hidden"
            locked={device.locked}
        />
    );

    return (
        <div
            className={cn(
                'p-4 w-fit h-fit overflow-auto bg-slate-200 rounded-lg shadow-lg',
                className,
            )}
            {...props}
        >
            <Table className="max-w-[900px] m-auto">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-48 text-sky-900 font-medium">Device Name</TableHead>
                        <TableHead className="text-center pr-8 text-sky-900 font-medium">
                            Current Value
                        </TableHead>
                        {collapsibleRelativeMove ? (
                            // Single move column: the header dropdown swaps the cell
                            // controls between absolute and relative, so the unused
                            // mode never takes up space.
                            <TableHead className="text-left text-sky-900 font-medium">
                                <SelectDropdown
                                    listItems={[ABSOLUTE_MOVE, RELATIVE_MOVE]}
                                    initialSelectedItem={moveMode}
                                    onValueChange={(value) => setMoveMode(value as MoveMode)}
                                    triggerClassName="ml-0 mr-auto"
                                />
                            </TableHead>
                        ) : (
                            <>
                                <TableHead className="text-left text-sky-900 font-medium">
                                    {ABSOLUTE_MOVE}
                                </TableHead>
                                <TableHead className="text-center text-sky-900 font-medium">
                                    {RELATIVE_MOVE}
                                </TableHead>
                            </>
                        )}
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
                                    {getFormattedValue(device)}
                                </TableCell>
                                {collapsibleRelativeMove ? (
                                    <TableCell>
                                        {moveMode === ABSOLUTE_MOVE
                                            ? renderAbsoluteMove(deviceName, device)
                                            : renderRelativeMove(deviceName, device)}
                                    </TableCell>
                                ) : (
                                    <>
                                        <TableCell>
                                            {renderAbsoluteMove(deviceName, device)}
                                        </TableCell>
                                        <TableCell>
                                            {renderRelativeMove(deviceName, device)}
                                        </TableCell>
                                    </>
                                )}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
