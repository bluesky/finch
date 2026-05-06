import { HexapodRBVs } from '../types/hexapodTypes';
export declare function createDevicePVList(prefix: string, suffixes: string[]): string[];
export declare const generateHexapodPVList: (prefix: string) => string[];
export declare const generateHexapodPVs: (prefix: string) => {
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
export declare const formatCurrentValue: (pv: HexapodRBVs[keyof HexapodRBVs]) => string;
//# sourceMappingURL=hexapodUtils.d.ts.map