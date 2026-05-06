import { HexapodMovePositionForm, HexapodRBVs } from '../types/hexapodTypes';
import { Device } from '../../../types/deviceControllerTypes';
interface UseHexapodProps {
    wsUrl?: string;
    prefix?: string;
    /** When true, skips the WebSocket connection and simulates a connected hexapod at all-zero positions. */
    demo?: boolean;
}
/**
 * Custom hook for managing hexapod device control and state.
 * Provides UI state management, device communication, and movement control functions.
 *
 * @param props - Configuration options for the hexapod hook
 * @param props.wsUrl - Optional WebSocket URL for device communication
 * @param props.prefix - Optional device prefix for PV names (e.g., 'hexapod1:')
 * @param props.demo - When true, simulates a connected hexapod held at all-zero positions,
 *   moving only on explicit commands at 1 mm/s with 5 updates/second.
 * @returns Object containing hexapod state, control functions, and device data
 */
export default function useHexapod(props?: UseHexapodProps): {
    showController: boolean;
    showPlot: boolean;
    showAbout: boolean;
    isLocked: boolean;
    onClickLock: () => void;
    onClickController: () => void;
    onClickPlot: () => void;
    onClickAbout: () => void;
    handleStartClick: (movePositionForm: HexapodMovePositionForm, isRelative: boolean) => void;
    hexapodPVs: {
        readTx: string;
        readTy: string;
        readTz: string;
        readRx: string;
        readRy: string;
        readRz: string;
        setTx: string;
        setTy: string;
        setTz: string;
        setRx: string;
        setRy: string;
        setRz: string;
        executeAll: string;
        inPosition: string;
        stop: string;
        moveType: string;
    };
    hexapod: {
        readTx: Device;
        readTy: Device;
        readTz: Device;
        readRx: Device;
        readRy: Device;
        readRz: Device;
        setTx: Device;
        setTy: Device;
        setTz: Device;
        setRx: Device;
        setRy: Device;
        setRz: Device;
        executeAll: Device;
        inPosition: Device;
        stop: Device;
        moveType: Device;
    };
    handleStopClick: () => void;
    hexapodRBVs: HexapodRBVs;
    toggleDeviceLock: (deviceName: string) => void;
};
export {};
//# sourceMappingURL=useHexapod.d.ts.map