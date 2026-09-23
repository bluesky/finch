import { UseMutationResult } from '@tanstack/react-query';
import { QServerRequestOptions } from '../types/common';
import { EnvironmentResponse, EnvironmentUpdateBody, EnvironmentUpdateResponse } from '../types/environment';
import { FinchMutationOptions, QServerHookError } from './types';
/** Worker-environment hooks. All four are mutations — there is no environment read endpoint. */
/**
 * Start the worker environment.
 *
 * Resolves with `success: false` when one already exists. The plan and device catalogs are
 * regenerated as it comes up, which is why this invalidates them.
 *
 * @param mutationOptions TanStack options. Takes no body: call `mutate()`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueueOpenEnvironmentMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<EnvironmentResponse, void, TContext>, requestOptions?: QServerRequestOptions): UseMutationResult<EnvironmentResponse, QServerHookError, void, TContext>;
/**
 * Shut the worker environment down. Refused while a plan is running.
 *
 * @param mutationOptions TanStack options. Takes no body: call `mutate()`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueueCloseEnvironmentMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<EnvironmentResponse, void, TContext>, requestOptions?: QServerRequestOptions): UseMutationResult<EnvironmentResponse, QServerHookError, void, TContext>;
/**
 * Kill the worker environment, even mid-plan.
 *
 * A running plan is finalized as failed and is **not** returned to the queue, so this invalidates
 * the queue as well.
 *
 * @param mutationOptions TanStack options. Takes no body: call `mutate()`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueueDestroyEnvironmentMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<EnvironmentResponse, void, TContext>, requestOptions?: QServerRequestOptions): UseMutationResult<EnvironmentResponse, QServerHookError, void, TContext>;
/**
 * Re-run the startup scripts in the live environment.
 *
 * Not part of `QServerClientLike`, so this rejects with `QServerEndpointUnavailableError` against a
 * partial injected client. With `run_in_background` the response carries a `task_uid`, which cannot
 * be polled from a browser — see `useQueueGetTaskResultQuery`.
 *
 * @param mutationOptions TanStack options. `mutate()` or `mutate({ run_in_background })`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueueUpdateEnvironmentMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<EnvironmentUpdateResponse, EnvironmentUpdateBody | void, TContext>, requestOptions?: QServerRequestOptions): UseMutationResult<EnvironmentUpdateResponse, QServerHookError, EnvironmentUpdateBody | void, TContext>;
//# sourceMappingURL=environmentHooks.d.ts.map