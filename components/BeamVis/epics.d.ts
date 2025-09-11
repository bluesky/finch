import { ReactNode } from '../../../node_modules/react';
export type EpicsContextType = {
    subscribe: (pv: string, cb: (v: number) => void) => void;
    publish: (pv: string, v: number) => void;
};
export declare const EpicsContext: import('../../../node_modules/react').Context<EpicsContextType>;
export declare const EpicsProvider: ({ children }: {
    children: ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
export declare function useEpics(pv: string): number;
//# sourceMappingURL=epics.d.ts.map