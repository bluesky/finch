import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { AdminResponse, KernelInterruptBody, ManagerStopBody, TestServerSleepBody } from '../types/admin';
import { GetWithBodyOptions, QServerRequestOptions } from '../types/common';
import { QServerQueryKeyFor } from './queryKeys';
import { FinchMutationOptions, FinchQueryOptions, QServerHookError } from './types';
/**
 * Administrative hooks.
 *
 * All four are destructive or diagnostic, and none is in `QServerClientLike` — they reject with
 * `QServerEndpointUnavailableError` against a partial injected client.
 */
/**
 * Send a KeyboardInterrupt to the IPython kernel.
 *
 * @param mutationOptions TanStack options. `mutate()` or
 * `mutate({ interrupt_task, interrupt_plan })`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueueInterruptKernelMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<AdminResponse, KernelInterruptBody | void, TContext>, requestOptions?: QServerRequestOptions): UseMutationResult<AdminResponse, QServerHookError, KernelInterruptBody | void, TContext>;
/**
 * Shut RE Manager down.
 *
 * Every subsequent request will fail until the manager is restarted out of band.
 *
 * @param mutationOptions TanStack options. `mutate({ option: 'safe_on' })` (the default) refuses
 * while the queue is running; `'safe_off'` does not.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueueStopManagerMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<AdminResponse, ManagerStopBody | void, TContext>, requestOptions?: QServerRequestOptions): UseMutationResult<AdminResponse, QServerHookError, ManagerStopBody | void, TContext>;
/**
 * Kill RE Manager to exercise recovery. A test endpoint — do not ship UI that calls it.
 *
 * @param mutationOptions TanStack options. Takes no body: call `mutate()`.
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueueTestKillManagerMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<AdminResponse, void, TContext>, requestOptions?: QServerRequestOptions): UseMutationResult<AdminResponse, QServerHookError, void, TContext>;
/**
 * Ask the server to sleep before responding — for exercising timeouts and loading states.
 *
 * Defaults to `retry: false` and `staleTime: Infinity`, since retrying or refetching a deliberate
 * delay is never what you want.
 *
 * @param body `{ time }` in seconds. Part of the query key.
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 */
export declare function useQueueTestServerSleepQuery<TData = AdminResponse>(body?: TestServerSleepBody, queryOptions?: FinchQueryOptions<AdminResponse, TData, QServerQueryKeyFor<'testServerSleep'>>, requestOptions?: GetWithBodyOptions<AdminResponse>): UseQueryResult<TData, QServerHookError>;
//# sourceMappingURL=adminHooks.d.ts.map