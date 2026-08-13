import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type { GetWithBodyOptions, QServerRequestOptions } from '../types/common';
import type {
    ConsoleOutputBody,
    ConsoleOutputUpdateBody,
    GetConsoleOutputResponse,
    GetConsoleOutputUidResponse,
    GetConsoleOutputUpdateResponse,
} from '../types/console';
import { useQServerMutation } from './internal/useQServerMutation';
import { useQServerQuery } from './internal/useQServerQuery';
import { QSERVER_MUTATION_INVALIDATIONS } from './invalidation';
import { qServerQueryKeys, type QServerQueryKeyFor } from './queryKeys';
import type {
    QServerHookError,
    QServerMutationHookOptions,
    QServerQueryHookOptions,
} from './types';
import { useQServerClient } from './useQServerClient';

/**
 * Console-output hooks — the polling counterparts to the console websocket.
 *
 * For live output prefer `useQServerConsoleSocket`: it pushes each line as it is emitted, whereas
 * these have to be polled. Console caches are intentionally in no invalidation bundle, since console
 * output is append-only and no mutation makes an existing read wrong.
 */

export interface UseGetConsoleOutputQueryOptions<
    TData = GetConsoleOutputResponse,
> extends QServerQueryHookOptions<
    GetConsoleOutputResponse,
    TData,
    QServerQueryKeyFor<'consoleOutput'>,
    GetWithBodyOptions<GetConsoleOutputResponse>
> {
    /** `{ nlines }`. Part of the query key. Dropped by browsers, which cannot send a GET body. */
    payload?: ConsoleOutputBody;
}

/** The last `nlines` of console text as one string. */
export function useGetConsoleOutputQuery<TData = GetConsoleOutputResponse>(
    options: UseGetConsoleOutputQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { payload, request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.consoleOutput(scope, payload),
        fetch: (client, mergedRequest) => client.getConsoleOutput(payload, mergedRequest),
        request,
        query,
    });
}

export type UseGetConsoleOutputUIDQueryOptions<TData = GetConsoleOutputUidResponse> =
    QServerQueryHookOptions<
        GetConsoleOutputUidResponse,
        TData,
        QServerQueryKeyFor<'consoleOutputUid'>,
        QServerRequestOptions
    >;

/** Uid of the most recent console message — cheap to poll as a change detector. */
export function useGetConsoleOutputUIDQuery<TData = GetConsoleOutputUidResponse>(
    options: UseGetConsoleOutputUIDQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.consoleOutputUid(scope),
        fetch: (client, mergedRequest) => client.getConsoleOutputUID(mergedRequest),
        request,
        query,
    });
}

export interface UseGetConsoleOutputUpdateQueryOptions<
    TData = GetConsoleOutputUpdateResponse,
> extends QServerQueryHookOptions<
    GetConsoleOutputUpdateResponse,
    TData,
    QServerQueryKeyFor<'consoleOutputUpdate'>,
    GetWithBodyOptions<GetConsoleOutputUpdateResponse>
> {
    /** `{ last_msg_uid }`. Part of the query key. */
    payload?: ConsoleOutputUpdateBody;
}

/**
 * Messages newer than `last_msg_uid`.
 *
 * The endpoint requires a request body, so **in a browser** the client falls back to
 * `getConsoleOutput` + `getConsoleOutputUID`, which cannot deliver incrementally — it returns the
 * current buffer as a single message. Use `useQServerConsoleSocket` for genuine live output.
 */
export function useGetConsoleOutputUpdateQuery<TData = GetConsoleOutputUpdateResponse>(
    options: UseGetConsoleOutputUpdateQueryOptions<TData> = {},
): UseQueryResult<TData, QServerHookError> {
    const { scope } = useQServerClient();
    const { payload, request, query } = options;

    return useQServerQuery({
        queryKey: qServerQueryKeys.consoleOutputUpdate(scope, payload),
        fetch: (client, mergedRequest) => client.getConsoleOutputUpdate(payload, mergedRequest),
        request,
        query,
    });
}

export type UseStreamConsoleOutputMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    string,
    void,
    TContext
>;

/**
 * Open the console text stream.
 *
 * A **mutation**, not a query, because the response only ends when the server closes the stream — as
 * a query it would sit pending forever and look broken. Always bound it:
 *
 * ```ts
 * const stream = useStreamConsoleOutputMutation({
 *     request: { axiosConfig: { timeout: 5000 } },
 * });
 * ```
 *
 * Not in `QServerClientLike`, so it rejects with `QServerEndpointUnavailableError` against a partial
 * injected client. Prefer `useQServerConsoleSocket` for anything long-lived.
 */
export function useStreamConsoleOutputMutation<TContext = unknown>(
    options: UseStreamConsoleOutputMutationOptions<TContext> = {},
): UseMutationResult<string, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.streamConsoleOutput(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useStreamConsoleOutputMutation,
        ...options,
    });
}
