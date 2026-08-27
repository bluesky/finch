import { useCallback, useEffect, useRef, useState } from 'react';
import {
    isQServerApiError,
    type QServerApiClient,
    type QServerEndpointDescriptor,
    type QServerEndpointInvocation,
} from '@/api/qServer';
import { formatError } from './testQserverUtils';

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
    runMany: (
        endpoints: readonly QServerEndpointDescriptor[],
        input?: QServerEndpointInvocation,
    ) => Promise<void>;
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
export function useEndpointRunner(client: QServerApiClient): EndpointRunner {
    const [states, setStates] = useState<Record<string, EndpointRunState>>({});
    const fallbackIdsRef = useRef(new Set<string>());

    useEffect(() => {
        client.setFallbackCallback((info) => fallbackIdsRef.current.add(info.endpointId));
        return () => client.setFallbackCallback(undefined);
    }, [client]);

    const run = useCallback(
        async (endpoint: QServerEndpointDescriptor, input: QServerEndpointInvocation) => {
            setStates((current) => ({ ...current, [endpoint.id]: { status: 'pending' } }));
            fallbackIdsRef.current.delete(endpoint.id);
            const started = performance.now();

            try {
                const result = await endpoint.call(client, input);
                setStates((current) => ({
                    ...current,
                    [endpoint.id]: {
                        status: 'success',
                        ms: Math.round(performance.now() - started),
                        result,
                        usedFallback: fallbackIdsRef.current.has(endpoint.id),
                    },
                }));
            } catch (error) {
                setStates((current) => ({
                    ...current,
                    [endpoint.id]: {
                        status: 'error',
                        ms: Math.round(performance.now() - started),
                        error: formatError(error),
                        httpStatus: isQServerApiError(error) ? error.status : undefined,
                        validationDetail: isQServerApiError(error)
                            ? error.validationErrors
                                  ?.map((entry) => `${entry.loc.join('.')}: ${entry.msg}`)
                                  .join('; ')
                            : undefined,
                        result: isQServerApiError(error) ? error.responseBody : undefined,
                        usedFallback: fallbackIdsRef.current.has(endpoint.id),
                    },
                }));
            }
        },
        [client],
    );

    const runMany = useCallback(
        async (
            endpoints: readonly QServerEndpointDescriptor[],
            input?: QServerEndpointInvocation,
        ) => {
            // Sequential on purpose: a burst of parallel calls makes timings meaningless and
            // can trip server-side rate limits during manual testing.
            for (const endpoint of endpoints) {
                await run(endpoint, input ?? { payload: endpoint.sampleBody });
            }
        },
        [run],
    );

    const reset = useCallback(() => {
        fallbackIdsRef.current.clear();
        setStates({});
    }, []);

    return { states, run, runMany, reset, exercisedIds: Object.keys(states) };
}
