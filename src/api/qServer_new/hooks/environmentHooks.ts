import type { UseMutationResult } from '@tanstack/react-query';
import type {
    EnvironmentResponse,
    EnvironmentUpdateBody,
    EnvironmentUpdateResponse,
} from '../types/environment';
import { useQServerMutation } from './internal/useQServerMutation';
import { QSERVER_MUTATION_INVALIDATIONS } from './invalidation';
import type { QServerHookError, QServerMutationHookOptions } from './types';

/** Worker-environment hooks. All four are mutations — there is no environment read endpoint. */

export type UseQueueOpenEnvironmentMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    EnvironmentResponse,
    void,
    TContext
>;

/**
 * Start the worker environment.
 *
 * Resolves with `success: false` when one already exists. The plan and device catalogs are
 * regenerated as it comes up, which is why this invalidates them.
 */
export function useQueueOpenEnvironmentMutation<TContext = unknown>(
    options: UseQueueOpenEnvironmentMutationOptions<TContext> = {},
): UseMutationResult<EnvironmentResponse, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.openEnvironment(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueOpenEnvironmentMutation,
        ...options,
    });
}

export type UseQueueCloseEnvironmentMutationOptions<TContext = unknown> =
    QServerMutationHookOptions<EnvironmentResponse, void, TContext>;

/** Shut the worker environment down. Refused while a plan is running. */
export function useQueueCloseEnvironmentMutation<TContext = unknown>(
    options: UseQueueCloseEnvironmentMutationOptions<TContext> = {},
): UseMutationResult<EnvironmentResponse, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.closeEnvironment(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueCloseEnvironmentMutation,
        ...options,
    });
}

export type UseQueueDestroyEnvironmentMutationOptions<TContext = unknown> =
    QServerMutationHookOptions<EnvironmentResponse, void, TContext>;

/**
 * Kill the worker environment, even mid-plan.
 *
 * A running plan is finalized as failed and is **not** returned to the queue, so this invalidates
 * the queue as well.
 */
export function useQueueDestroyEnvironmentMutation<TContext = unknown>(
    options: UseQueueDestroyEnvironmentMutationOptions<TContext> = {},
): UseMutationResult<EnvironmentResponse, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.destroyEnvironment(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueDestroyEnvironmentMutation,
        ...options,
    });
}

export type UseQueueUpdateEnvironmentMutationOptions<TContext = unknown> =
    QServerMutationHookOptions<EnvironmentUpdateResponse, EnvironmentUpdateBody | void, TContext>;

/**
 * Re-run the startup scripts in the live environment.
 *
 * Not part of `QServerClientLike`, so this rejects with `QServerEndpointUnavailableError` against a
 * partial injected client. With `run_in_background` the response carries a `task_uid`, which cannot
 * be polled from a browser — see `useQueueGetTaskResultQuery`.
 */
export function useQueueUpdateEnvironmentMutation<TContext = unknown>(
    options: UseQueueUpdateEnvironmentMutationOptions<TContext> = {},
): UseMutationResult<
    EnvironmentUpdateResponse,
    QServerHookError,
    EnvironmentUpdateBody | void,
    TContext
> {
    return useQServerMutation({
        perform: (client, body, request) => client.updateEnvironment(body ?? undefined, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueUpdateEnvironmentMutation,
        ...options,
    });
}
