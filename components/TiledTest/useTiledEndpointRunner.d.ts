import { TiledApiClient, TiledEndpointDescriptor, TiledEndpointInvocation } from '../../api/tiled';
export interface TiledRunState {
    status: 'idle' | 'pending' | 'success' | 'error';
    /** Wall-clock duration of the call, in ms. */
    ms?: number;
    result?: unknown;
    error?: string;
    httpStatus?: number;
    validationDetail?: string;
}
export interface TiledEndpointRunner {
    states: Record<string, TiledRunState>;
    run: (endpoint: TiledEndpointDescriptor, input: TiledEndpointInvocation) => Promise<void>;
    runMany: (endpoints: readonly TiledEndpointDescriptor[], input?: TiledEndpointInvocation) => Promise<void>;
    reset: () => void;
    /** Ids exercised at least once this session, for the coverage footer. */
    exercisedIds: string[];
}
/**
 * Invokes registry endpoints against a client and records the outcome per endpoint.
 *
 * Modelled on `QServerTest/useEndpointRunner.ts`, minus the fallback tracking — Tiled has no
 * payload-bearing GETs, so there is no substitute-call machinery to report on.
 *
 * Results are summarised rather than stored whole where they are bytes: an `ArrayBuffer` or `Blob`
 * in React state would be both useless to look at and, for a large array, enough to make the page
 * unresponsive.
 */
export declare function useTiledEndpointRunner(client: TiledApiClient): TiledEndpointRunner;
//# sourceMappingURL=useTiledEndpointRunner.d.ts.map