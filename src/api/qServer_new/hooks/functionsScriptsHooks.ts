import type { UseMutationResult } from '@tanstack/react-query';
import type {
    ExecuteFunctionBody,
    ExecuteFunctionResponse,
    UploadScriptBody,
    UploadScriptResponse,
} from '../types/functionsScripts';
import { useQServerMutation } from './internal/useQServerMutation';
import { QSERVER_MUTATION_INVALIDATIONS } from './invalidation';
import type { QServerHookError, QServerMutationHookOptions } from './types';

/**
 * Function-execution and script-upload hooks.
 *
 * Both start a background task and resolve with its `task_uid`. Collecting the result needs
 * `useGetTaskResultQuery`, which cannot work from a browser on the current server version — so from
 * a browser these are fire-and-forget, and the outcome has to be observed through status or the
 * console socket.
 *
 * Neither is in `QServerClientLike`, so both reject with `QServerEndpointUnavailableError` against a
 * partial injected client.
 */

export type UseExecuteFunctionMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    ExecuteFunctionResponse,
    ExecuteFunctionBody,
    TContext
>;

/** Call a function in the worker namespace: `{ item: { name, kwargs, item_type: 'function' } }`. */
export function useExecuteFunctionMutation<TContext = unknown>(
    options: UseExecuteFunctionMutationOptions<TContext> = {},
): UseMutationResult<ExecuteFunctionResponse, QServerHookError, ExecuteFunctionBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.executeFunction(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useExecuteFunctionMutation,
        ...options,
    });
}

export type UseUploadScriptMutationOptions<TContext = unknown> = QServerMutationHookOptions<
    UploadScriptResponse,
    UploadScriptBody,
    TContext
>;

/**
 * Execute Python source in the worker namespace.
 *
 * Invalidates the catalogs, since a script can define new plans and devices.
 */
export function useUploadScriptMutation<TContext = unknown>(
    options: UseUploadScriptMutationOptions<TContext> = {},
): UseMutationResult<UploadScriptResponse, QServerHookError, UploadScriptBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.uploadScript(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useUploadScriptMutation,
        ...options,
    });
}
