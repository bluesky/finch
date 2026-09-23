import { QServerSim } from '../core/QServerSim';
export declare const QServerSimContext: import('../../../../node_modules/react').Context<import('../core/QServerSim').QServerSimulator | null>;
/** The simulator from the nearest provider. Throws when there isn't one. */
export declare function useQServerSim(): QServerSim;
/** The simulator, or `null` when running against a real server. */
export declare function useQServerSimOptional(): QServerSim | null;
//# sourceMappingURL=QServerSimContext.d.ts.map