import { QServerApiClient, QServerEndpointDescriptor, QServerEndpointInvocation } from '../../api/qServer';
export interface EndpointRunState {
    status: 'idle' | 'pending' | 'success' | 'error';
    /** Wall-clock duration of the call, in ms. */
    ms?: number;
    result?: unknown;
    error?: string;
    httpStatus?: number;
    validationDetail?: string;
    /** True when a browser fallback answered instead of the endpoint itself. */
    usedFallback?: boolean;
}
export interface EndpointRunner {
    states: Record<string, EndpointRunState>;
    run: (endpoint: QServerEndpointDescriptor, input: QServerEndpointInvocation) => Promise<void>;
    runMany: (endpoints: readonly QServerEndpointDescriptor[], input?: QServerEndpointInvocation) => Promise<void>;
    reset: () => void;
    /** Ids exercised at least once this session, for the coverage footer. */
    exercisedIds: string[];
}
/**
 * Invokes registry endpoints against a client and records the outcome per endpoint.
 *
 * Fallback usage is observed through the client's `onFallback` callback rather than guessed
 * from the response, so the UI can state plainly when a result came from a substitute.
 */
export declare function useEndpointRunner(client: QServerApiClient): EndpointRunner;
//# sourceMappingURL=useEndpointRunner.d.ts.map