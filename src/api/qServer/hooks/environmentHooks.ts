import type { UseMutationResult } from '@tanstack/react-query';
import type { QServerRequestOptions } from '../types/common';
import type {
    EnvironmentResponse,
    EnvironmentUpdateBody,
    EnvironmentUpdateResponse,
} from '../types/environment';
import { useQServerMutation } from './internal/useQServerMutation';
import { QSERVER_MUTATION_INVALIDATIONS } from './invalidation';
import type { FinchMutationOptions, QServerHookError } from './types';

/** Worker-environment hooks. All four are mutations — there is no environment read endpoint. */

/**
 * Start the worker environment.
 *
 * Resolves with `success: false` when one already exists. The plan and device catalogs are
 * regenerated as it comes up, which is why this invalidates them.
 *
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param mutationOptions TanStack options. Takes no body: call `mutate()`.
 */
export function useQueueOpenEnvironmentMutation<TContext = unknown>(
    requestOptions: QServerRequestOptions = {},
    mutationOptions: FinchMutationOptions<EnvironmentResponse, void, TContext> = {},
): UseMutationResult<EnvironmentResponse, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.openEnvironment(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueOpenEnvironmentMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Shut the worker environment down. Refused while a plan is running.
 *
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param mutationOptions TanStack options. Takes no body: call `mutate()`.
 */
export function useQueueCloseEnvironmentMutation<TContext = unknown>(
    requestOptions: QServerRequestOptions = {},
    mutationOptions: FinchMutationOptions<EnvironmentResponse, void, TContext> = {},
): UseMutationResult<EnvironmentResponse, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.closeEnvironment(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueCloseEnvironmentMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Kill the worker environment, even mid-plan.
 *
 * A running plan is finalized as failed and is **not** returned to the queue, so this invalidates
 * the queue as well.
 *
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param mutationOptions TanStack options. Takes no body: call `mutate()`.
 */
export function useQueueDestroyEnvironmentMutation<TContext = unknown>(
    requestOptions: QServerRequestOptions = {},
    mutationOptions: FinchMutationOptions<EnvironmentResponse, void, TContext> = {},
): UseMutationResult<EnvironmentResponse, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.destroyEnvironment(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueDestroyEnvironmentMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Re-run the startup scripts in the live environment.
 *
 * Not part of `QServerClientLike`, so this rejects with `QServerEndpointUnavailableError` against a
 * partial injected client. With `run_in_background` the response carries a `task_uid`, which cannot
 * be polled from a browser — see `useQueueGetTaskResultQuery`.
 *
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param mutationOptions TanStack options. `mutate()` or `mutate({ run_in_background })`.
 */
export function useQueueUpdateEnvironmentMutation<TContext = unknown>(
    requestOptions: QServerRequestOptions = {},
    mutationOptions: FinchMutationOptions<
        EnvironmentUpdateResponse,
        EnvironmentUpdateBody | void,
        TContext
    > = {},
): UseMutationResult<
    EnvironmentUpdateResponse,
    QServerHookError,
    EnvironmentUpdateBody | void,
    TContext
> {
    return useQServerMutation({
        perform: (client, body, request) => client.updateEnvironment(body ?? undefined, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueUpdateEnvironmentMutation,
        requestOptions,
        mutationOptions,
    });
}
