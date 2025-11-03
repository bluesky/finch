import { HexapodRBVs } from "../types/hexapodTypes";

//default prefix for Symetrie Hexapod
const defaultPrefix = "Sym:Hex01";

//default suffixes for the Symetrie Hexapod
const readTx = 's_uto_tx_RBV';
const readTy = 's_uto_ty_RBV';
const readTz = 's_uto_tz_RBV';
const readRx = 's_uto_rx_RBV';
const readRy = 's_uto_ry_RBV';
const readRz = 's_uto_rz_RBV';

//The setpoints are 'goals' for the hexapod to move to during the next move command
//Setting these does not move the hexapod until the executeAll PV is set
const setTx = 'MOVE_PTP:Tx';
const setTy = 'MOVE_PTP:Ty';
const setTz = 'MOVE_PTP:Tz';
const setRx = 'MOVE_PTP:Rx';
const setRy = 'MOVE_PTP:Ry';
const setRz = 'MOVE_PTP:Rz';

//when MOVE_PTP is set to 1, the hexapod will move to all set positions
const executeAll = "MOVE_PTP"; 
//when InPosition is 1, the hexapod is in its set position or stopped
const inPosition = "s_hexa:InPosition_RBV"; 
//when set to 1, the hexapod will immediately stop all motion
const stop = "STOP";
//0 for absolute, 1 for relative
const moveType="MOVE_PTP:MoveType";

const getSanitizedPrefix = (prefix: string) => {
    let sanitizedPrefix = defaultPrefix;
    if (prefix.length > 1) {
        //strip off any trailing colon if present
        if (prefix.endsWith(':')) {
            sanitizedPrefix = prefix.slice(0, -1);
        } else {
            sanitizedPrefix = prefix;
        }
    }
    return sanitizedPrefix;
};

//Generates a list of PVs for a device given a prefix and a list of suffixes
export function createDevicePVList(prefix: string, suffixes: string[]): string[] {
    let sanitizedPrefix = getSanitizedPrefix(prefix);
    return suffixes.map(suffix => `${sanitizedPrefix}:${suffix}`);
};


//for instantiation through useOphydSocket
export const generateHexapodPVList = (prefix: string) => createDevicePVList(prefix, [
    readTx,
    readTy,
    readTz,
    readRx,
    readRy,
    readRz,
    setTx,
    setTy,
    setTz,
    setRx,
    setRy,
    setRz,
    executeAll,
    inPosition,
    stop,
    moveType
]);

export const generateHexapodPVs = (prefix: string) => {
    let sanitizedPrefix = getSanitizedPrefix(prefix);
    return {
        readTx: `${sanitizedPrefix}:${readTx}`,
        readTy: `${sanitizedPrefix}:${readTy}`,
        readTz: `${sanitizedPrefix}:${readTz}`,
        readRx: `${sanitizedPrefix}:${readRx}`,
        readRy: `${sanitizedPrefix}:${readRy}`,
        readRz: `${sanitizedPrefix}:${readRz}`,
        setTx: `${sanitizedPrefix}:${setTx}`,
        setTy: `${sanitizedPrefix}:${setTy}`,
        setTz: `${sanitizedPrefix}:${setTz}`,
        setRx: `${sanitizedPrefix}:${setRx}`,
        setRy: `${sanitizedPrefix}:${setRy}`,
        setRz: `${sanitizedPrefix}:${setRz}`,
        executeAll: `${sanitizedPrefix}:${executeAll}`,
        inPosition: `${sanitizedPrefix}:${inPosition}`,
        stop: `${sanitizedPrefix}:${stop}`,
        moveType: `${sanitizedPrefix}:${moveType}`
    }
};


export const formatCurrentValue = (pv: HexapodRBVs[keyof HexapodRBVs]) => {
    return typeof pv.value === 'number' ? pv.value.toFixed(3) : 'N/A';
};