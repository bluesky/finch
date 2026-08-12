import type { QServerRequestOptions } from '../types/common';
import type {
    ExecuteFunctionBody,
    ExecuteFunctionResponse,
    UploadScriptBody,
    UploadScriptResponse,
} from '../types/functionsScripts';
import { QSERVER_PATHS } from '../types/paths';
import { payloadAs, type QServerEndpointDescriptor } from '../types/registry';

export interface QServerFunctionsScriptsEndpoints {
    /**
     * `POST /api/function/execute` — call a function in the worker namespace.
     *
     * Returns a `task_uid`; collecting the result needs `getTaskResult`, which browsers
     * cannot call on this server version.
     */
    executeFunction(
        body: ExecuteFunctionBody,
        options?: QServerRequestOptions,
    ): Promise<ExecuteFunctionResponse>;
    /** `POST /api/script/upload` — execute Python source in the worker namespace. */
    uploadScript(
        body: UploadScriptBody,
        options?: QServerRequestOptions,
    ): Promise<UploadScriptResponse>;
}

export const functionsScriptsEndpointDescriptors: QServerEndpointDescriptor[] = [
    {
        id: 'function.execute',
        group: 'functionsScripts',
        method: 'POST',
        path: QSERVER_PATHS.functionExecute,
        fn: 'executeFunction',
        summary: 'Execute a function in the worker namespace (returns a task uid).',
        browserSafe: true,
        sampleBody: {
            item: { name: 'function_sleep', kwargs: { time: 1 }, item_type: 'function' },
            run_in_background: false,
        },
        call: (client, input) => client.executeFunction(payloadAs<ExecuteFunctionBody>(input)),
    },
    {
        id: 'script.upload',
        group: 'functionsScripts',
        method: 'POST',
        path: QSERVER_PATHS.scriptUpload,
        fn: 'uploadScript',
        summary: 'Execute Python source in the worker namespace (returns a task uid).',
        browserSafe: true,
        destructive: true,
        sampleBody: { script: 'print("hello from finch")\n', update_lists: false },
        call: (client, input) => client.uploadScript(payloadAs<UploadScriptBody>(input)),
    },
];
