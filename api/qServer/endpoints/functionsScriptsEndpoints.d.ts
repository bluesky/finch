import { QServerRequestOptions } from '../types/common';
import { ExecuteFunctionBody, ExecuteFunctionResponse, UploadScriptBody, UploadScriptResponse } from '../types/functionsScripts';
import { QServerEndpointDescriptor } from '../types/registry';
export interface QServerFunctionsScriptsEndpoints {
    /**
     * `POST /api/function/execute` — call a function in the worker namespace.
     *
     * Returns a `task_uid`; collecting the result needs `getTaskResult`, which browsers
     * cannot call on this server version.
     */
    executeFunction(body: ExecuteFunctionBody, options?: QServerRequestOptions): Promise<ExecuteFunctionResponse>;
    /** `POST /api/script/upload` — execute Python source in the worker namespace. */
    uploadScript(body: UploadScriptBody, options?: QServerRequestOptions): Promise<UploadScriptResponse>;
}
export declare const functionsScriptsEndpointDescriptors: QServerEndpointDescriptor[];
//# sourceMappingURL=functionsScriptsEndpoints.d.ts.map