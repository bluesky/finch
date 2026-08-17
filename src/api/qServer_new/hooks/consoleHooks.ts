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
import type { FinchMutationOptions, FinchQueryOptions, QServerHookError } from './types';
import { useQServerQueryScope } from './useQServerClient';

/**
 * Console-output hooks — the polling counterparts to the console websocket.
 *
 * For live output prefer `useQServerConsoleSocket`: it pushes each line as it is emitted, whereas
 * these have to be polled. Console caches are intentionally in no invalidation bundle, since console
 * output is append-only and no mutation makes an existing read wrong.
 */

/**
 * The last `nlines` of console text as one string.
 *
 * @param payload `{ nlines }`. Part of the query key. Dropped by browsers, which cannot send a GET
 * body.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useQueueGetConsoleOutputQuery<TData = GetConsoleOutputResponse>(
    payload?: ConsoleOutputBody,
    requestOptions: GetWithBodyOptions<GetConsoleOutputResponse> = {},
    queryOptions: FinchQueryOptions<
        GetConsoleOutputResponse,
        TData,
        QServerQueryKeyFor<'consoleOutput'>
    > = {},
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.consoleOutput(scope, payload),
        fetch: (client, request) => client.getConsoleOutput(payload, request),
        requestOptions,
        queryOptions,
    });
}

/**
 * Uid of the most recent console message — cheap to poll as a change detector.
 *
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useQueueGetConsoleOutputUIDQuery<TData = GetConsoleOutputUidResponse>(
    requestOptions: QServerRequestOptions = {},
    queryOptions: FinchQueryOptions<
        GetConsoleOutputUidResponse,
        TData,
        QServerQueryKeyFor<'consoleOutputUid'>
    > = {},
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.consoleOutputUid(scope),
        fetch: (client, request) => client.getConsoleOutputUID(request),
        requestOptions,
        queryOptions,
    });
}

/**
 * Messages newer than `last_msg_uid`.
 *
 * The endpoint requires a request body, so **in a browser** the client falls back to
 * `getConsoleOutput` + `getConsoleOutputUID`, which cannot deliver incrementally — it returns the
 * current buffer as a single message. Use `useQServerConsoleSocket` for genuine live output.
 *
 * @param payload `{ last_msg_uid }`. Part of the query key.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 */
export function useQueueGetConsoleOutputUpdateQuery<TData = GetConsoleOutputUpdateResponse>(
    payload?: ConsoleOutputUpdateBody,
    requestOptions: GetWithBodyOptions<GetConsoleOutputUpdateResponse> = {},
    queryOptions: FinchQueryOptions<
        GetConsoleOutputUpdateResponse,
        TData,
        QServerQueryKeyFor<'consoleOutputUpdate'>
    > = {},
): UseQueryResult<TData, QServerHookError> {
    const scope = useQServerQueryScope(requestOptions);

    return useQServerQuery({
        queryKey: qServerQueryKeys.consoleOutputUpdate(scope, payload),
        fetch: (client, request) => client.getConsoleOutputUpdate(payload, request),
        requestOptions,
        queryOptions,
    });
}

/**
 * Open the console text stream.
 *
 * A **mutation**, not a query, because the response only ends when the server closes the stream — as
 * a query it would sit pending forever and look broken. Always bound it:
 *
 * ```ts
 * const stream = useQueueStreamConsoleOutputMutation({ axiosConfig: { timeout: 5000 } });
 * ```
 *
 * Not in `QServerClientLike`, so it rejects with `QServerEndpointUnavailableError` against a partial
 * injected client. Prefer `useQServerConsoleSocket` for anything long-lived.
 *
 * @param requestOptions Transport overrides. Pass a `signal` or an `axiosConfig.timeout` here — this
 * request does not end on its own.
 * @param mutationOptions TanStack options. Takes no body: call `mutate()`.
 */
export function useQueueStreamConsoleOutputMutation<TContext = unknown>(
    requestOptions: QServerRequestOptions = {},
    mutationOptions: FinchMutationOptions<string, void, TContext> = {},
): UseMutationResult<string, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.streamConsoleOutput(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueStreamConsoleOutputMutation,
        requestOptions,
        mutationOptions,
    });
}
