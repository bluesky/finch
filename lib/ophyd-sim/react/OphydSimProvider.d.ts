import { ReactNode } from '../../../../node_modules/react';
import { OphydSim } from '../core/types';
export interface OphydSimProviderProps {
    /**
     * The simulator instance. Must be stable across renders — wrap creation
     * in useMemo or define at module scope to avoid resetting on each render.
     */
    sim: OphydSim;
    children: ReactNode;
}
export declare function OphydSimProvider({ sim, children }: OphydSimProviderProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=OphydSimProvider.d.ts.map