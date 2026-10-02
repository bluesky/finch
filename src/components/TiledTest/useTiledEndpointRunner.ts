import { useCallback, useState } from 'react';
import {
    isTiledApiError,
    type TiledApiClient,
    type TiledEndpointDescriptor,
    type TiledEndpointInvocation,
} from '@/api/tiled';

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
    runMany: (
        endpoints: readonly TiledEndpointDescriptor[],
        input?: TiledEndpointInvocation,
    ) => Promise<void>;
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
export function useTiledEndpointRunner(client: TiledApiClient): TiledEndpointRunner {
    const [states, setStates] = useState<Record<string, TiledRunState>>({});

    const run = useCallback(
        async (endpoint: TiledEndpointDescriptor, input: TiledEndpointInvocation) => {
            setStates((current) => ({ ...current, [endpoint.id]: { status: 'pending' } }));
            const started = performance.now();

            try {
                const result = await endpoint.call(client, input);
                setStates((current) => ({
                    ...current,
                    [endpoint.id]: {
                        status: 'success',
                        ms: Math.round(performance.now() - started),
                        result: summarize(result),
                    },
                }));
            } catch (error) {
                setStates((current) => ({
                    ...current,
                    [endpoint.id]: {
                        status: 'error',
                        ms: Math.round(performance.now() - started),
                        error: error instanceof Error ? error.message : String(error),
                        httpStatus: isTiledApiError(error) ? error.status : undefined,
                        validationDetail: isTiledApiError(error)
                            ? error.validationErrors
                                  ?.map((entry) => `${entry.loc.join('.')}: ${entry.msg}`)
                                  .join('; ')
                            : undefined,
                        result: isTiledApiError(error) ? error.responseBody : undefined,
                    },
                }));
            }
        },
        [client],
    );

    const runMany = useCallback(
        async (endpoints: readonly TiledEndpointDescriptor[], input?: TiledEndpointInvocation) => {
            // Sequential on purpose: a burst of parallel calls makes timings meaningless and can
            // trip server-side rate limits during manual testing.
            for (const endpoint of endpoints) {
                await run(endpoint, {
                    ...input,
                    // The caller supplies the shared path; each endpoint still contributes its own
                    // sample body unless the caller overrode it. Without this, `search.distinct`
                    // would sweep with no facets requested and come back all nulls — a result that
                    // looks like a broken endpoint but is the server correctly answering "you asked
                    // for nothing".
                    payload: input?.payload ?? endpoint.sampleBody,
                });
            }
        },
        [run],
    );

    const reset = useCallback(() => setStates({}), []);

    return { states, run, runMany, reset, exercisedIds: Object.keys(states) };
}

/** Replace a binary payload with a description of it; pass anything else through. */
function summarize(result: unknown): unknown {
    if (result instanceof ArrayBuffer) {
        return `«ArrayBuffer, ${result.byteLength.toLocaleString()} bytes»`;
    }
    if (typeof Blob !== 'undefined' && result instanceof Blob) {
        return `«Blob, ${result.size.toLocaleString()} bytes, ${result.type || 'no type'}»`;
    }
    return result;
}
