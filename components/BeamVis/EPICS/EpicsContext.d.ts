import { default as React } from '../../../../node_modules/react';
export type EpicsApi = {
    subscribe: (pv: string, cb: (v: number) => void) => void;
    publish: (pv: string, v: number) => void;
};
export declare const EpicsContext: React.Context<EpicsApi>;
export declare function useEpics(): EpicsApi;
export declare function usePV(pv: string): number;
//# sourceMappingURL=EpicsContext.d.ts.map