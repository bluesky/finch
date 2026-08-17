import type { UseMutationResult } from '@tanstack/react-query';
import type { QServerRequestOptions } from '../types/common';
import type {
    ExecuteFunctionBody,
    ExecuteFunctionResponse,
    UploadScriptBody,
    UploadScriptResponse,
} from '../types/functionsScripts';
import { useQServerMutation } from './internal/useQServerMutation';
import { QSERVER_MUTATION_INVALIDATIONS } from './invalidation';
import type { FinchMutationOptions, QServerHookError } from './types';

/**
 * Function-execution and script-upload hooks.
 *
 * Both start a background task and resolve with its `task_uid`. Collecting the result needs
 * `useQueueGetTaskResultQuery`, which cannot work from a browser on the current server version — so
 * from a browser these are fire-and-forget, and the outcome has to be observed through status or the
 * console socket.
 *
 * Neither is in `QServerClientLike`, so both reject with `QServerEndpointUnavailableError` against a
 * partial injected client.
 */

/**
 * Call a function in the worker namespace.
 *
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param mutationOptions TanStack options.
 * `mutate({ item: { name, kwargs, item_type: 'function' } })`.
 */
export function useQueueExecuteFunctionMutation<TContext = unknown>(
    requestOptions: QServerRequestOptions = {},
    mutationOptions: FinchMutationOptions<
        ExecuteFunctionResponse,
        ExecuteFunctionBody,
        TContext
    > = {},
): UseMutationResult<ExecuteFunctionResponse, QServerHookError, ExecuteFunctionBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.executeFunction(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueExecuteFunctionMutation,
        requestOptions,
        mutationOptions,
    });
}

/**
 * Execute Python source in the worker namespace.
 *
 * Invalidates the catalogs, since a script can define new plans and devices.
 *
 * @param requestOptions Transport overrides; see `QServerRequestOptions`.
 * @param mutationOptions TanStack options. `mutate({ script, update_re, run_in_background })`.
 */
export function useQueueUploadScriptMutation<TContext = unknown>(
    requestOptions: QServerRequestOptions = {},
    mutationOptions: FinchMutationOptions<UploadScriptResponse, UploadScriptBody, TContext> = {},
): UseMutationResult<UploadScriptResponse, QServerHookError, UploadScriptBody, TContext> {
    return useQServerMutation({
        perform: (client, body, request) => client.uploadScript(body, request),
        invalidates: QSERVER_MUTATION_INVALIDATIONS.useQueueUploadScriptMutation,
        requestOptions,
        mutationOptions,
    });
}
