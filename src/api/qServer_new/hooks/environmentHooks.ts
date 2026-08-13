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

export type UseOpenEnvironmentMutationOptions<TContext = unknown> = QServerMutationHookOptions<
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
export function useOpenEnvironmentMutation<TContext = unknown>(
    options: UseOpenEnvironmentMutationOptions<TContext> = {},
): UseMutationResult<EnvironmentResponse, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.openEnvironment(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useOpenEnvironmentMutation,
        ...options,
    });
}

export type UseCloseEnvironmentMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    EnvironmentResponse,
    void,
    TContext
>;

/** Shut the worker environment down. Refused while a plan is running. */
export function useCloseEnvironmentMutation<TContext = unknown>(
    options: UseCloseEnvironmentMutationOptions<TContext> = {},
): UseMutationResult<EnvironmentResponse, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.closeEnvironment(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useCloseEnvironmentMutation,
        ...options,
    });
}

export type UseDestroyEnvironmentMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    EnvironmentResponse,
    void,
    TContext
>;

/**
 * Kill the worker environment, even mid-plan.
 *
 * A running plan is finalized as failed and is **not** returned to the queue, so this invalidates
 * the queue as well.
 */
export function useDestroyEnvironmentMutation<TContext = unknown>(
    options: UseDestroyEnvironmentMutationOptions<TContext> = {},
): UseMutationResult<EnvironmentResponse, QServerHookError, void, TContext> {
    return useQServerMutation({
        perform: (client, _variables, request) => client.destroyEnvironment(request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useDestroyEnvironmentMutation,
        ...options,
    });
}

export type UseUpdateEnvironmentMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    EnvironmentUpdateResponse,
    EnvironmentUpdateBody | void,
    TContext
>;

/**
 * Re-run the startup scripts in the live environment.
 *
 * Not part of `QServerClientLike`, so this rejects with `QServerEndpointUnavailableError` against a
 * partial injected client. With `run_in_background` the response carries a `task_uid`, which cannot
 * be polled from a browser — see `useGetTaskResultQuery`.
 */
export function useUpdateEnvironmentMutation<TContext = unknown>(
    options: UseUpdateEnvironmentMutationOptions<TContext> = {},
): UseMutationResult<
    EnvironmentUpdateResponse,
    QServerHookError,
    EnvironmentUpdateBody | void,
    TContext
> {
    return useQServerMutation({
        perform: (client, body, request) => client.updateEnvironment(body ?? undefined, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useUpdateEnvironmentMutation,
        ...options,
    });
}
