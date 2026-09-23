import { APIKeyRequestParams, AccessAndRefreshTokens, AddQueueItemBatchBody, AddQueueItemBody, AdminResponse, ClearHistoryResponse, ConsoleOutputBody, ConsoleOutputUpdateBody, CurrentApiKeyInfoResponse, EnvironmentResponse, EnvironmentUpdateBody, EnvironmentUpdateResponse, ExecuteFunctionBody, ExecuteFunctionResponse, ExecuteQueueItemBody, GetConfigResponse, GetConsoleOutputResponse, GetConsoleOutputUidResponse, GetConsoleOutputUpdateResponse, GetDevicesAllowedResponse, GetDevicesExistingResponse, GetHistoryResponse, GetLockInfoResponse, GetPermissionsResponse, GetPlansAllowedResponse, GetPlansExistingResponse, GetQueueItemBody, GetQueueItemResponse, GetQueueResponse, GetReMetadataResponse, GetRunsBody, GetRunsResponse, GetStatusResponse, GetTaskResultResponse, GetTaskStatusResponse, GetWithBodyOptions, KernelInterruptBody, LockBody, LockResponse, LogoutResponse, ManagerStopBody, MoveQueueItemBatchBody, MoveQueueItemBody, NewApiKeyResponse, PermissionsResponse, PingResponse, PlansDevicesBody, PostItemAddResponse, PostItemBatchResponse, PostItemExecuteResponse, PostItemRemoveResponse, PostItemUpdateResponse, PrincipalListResponse, PrincipalResponse, QServerPayload, QServerRequestOptions, QServerSuccessResponse, QueueAutostartBody, QueueClearResponse, QueueModeSetBody, QueueStartResponse, ReControlResponse, RePauseBody, ReResumeBody, ReloadPermissionsBody, RemoveQueueItemBatchBody, RemoveQueueItemBody, ScopesResponse, SessionRefreshBody, SetPermissionsBody, TaskBody, TestServerSleepBody, UnlockBody, UpdateQueueItemBody, UploadScriptBody, UploadScriptResponse, UploadSpreadsheetInput, UploadSpreadsheetResponse, WhoamiResponse } from '../types';
/**
 * Free-function facade over the app-wide client.
 *
 * One function per operation, named exactly like the corresponding `QServerApiClient`
 * method, each delegating to `getDefaultQServerClient()`. Import these when a module just
 * needs to talk to the queue server and does not care which client instance it uses:
 *
 * ```ts
 * import { getStatus, setGlobalApiKey } from '@/api/qServer';
 *
 * setGlobalApiKey('my-key');
 * const status = await getStatus();
 * ```
 *
 * Generated shapes follow the interfaces in `../endpoints/`; keep them in sync when adding
 * an endpoint (the registry test enforces that every descriptor is exported from here).
 */
export declare function ping(payload?: QServerPayload, options?: GetWithBodyOptions<PingResponse>): Promise<PingResponse>;
export declare function getRoot(payload?: QServerPayload, options?: GetWithBodyOptions<PingResponse>): Promise<PingResponse>;
export declare function getStatus(payload?: QServerPayload, options?: GetWithBodyOptions<GetStatusResponse>): Promise<GetStatusResponse>;
export declare function getConfig(payload?: QServerPayload, options?: GetWithBodyOptions<GetConfigResponse>): Promise<GetConfigResponse>;
export declare function getQueue(payload?: Record<string, unknown>, options?: GetWithBodyOptions<GetQueueResponse>): Promise<GetQueueResponse>;
export declare function getQueueItem(body?: GetQueueItemBody, options?: GetWithBodyOptions<GetQueueItemResponse>): Promise<GetQueueItemResponse>;
export declare function addQueueItem(body: AddQueueItemBody, options?: QServerRequestOptions): Promise<PostItemAddResponse>;
export declare function addQueueItemBatch(body: AddQueueItemBatchBody, options?: QServerRequestOptions): Promise<PostItemBatchResponse>;
export declare function executeQueueItem(body: ExecuteQueueItemBody, options?: QServerRequestOptions): Promise<PostItemExecuteResponse>;
export declare function updateQueueItem(body: UpdateQueueItemBody, options?: QServerRequestOptions): Promise<PostItemUpdateResponse>;
export declare function removeQueueItem(body?: RemoveQueueItemBody, options?: QServerRequestOptions): Promise<PostItemRemoveResponse>;
export declare function removeQueueItemBatch(body: RemoveQueueItemBatchBody, options?: QServerRequestOptions): Promise<PostItemBatchResponse>;
export declare function moveQueueItem(body: MoveQueueItemBody, options?: QServerRequestOptions): Promise<PostItemAddResponse>;
export declare function moveQueueItemBatch(body: MoveQueueItemBatchBody, options?: QServerRequestOptions): Promise<PostItemBatchResponse>;
export declare function uploadQueueSpreadsheet(input: UploadSpreadsheetInput, options?: QServerRequestOptions): Promise<UploadSpreadsheetResponse>;
export declare function startQueue(options?: QServerRequestOptions): Promise<QueueStartResponse>;
export declare function stopQueue(options?: QServerRequestOptions): Promise<QServerSuccessResponse>;
export declare function cancelQueueStop(options?: QServerRequestOptions): Promise<QServerSuccessResponse>;
export declare function clearQueue(options?: QServerRequestOptions): Promise<QueueClearResponse>;
export declare function setQueueMode(body: QueueModeSetBody, options?: QServerRequestOptions): Promise<QServerSuccessResponse>;
export declare function setQueueAutostart(body: QueueAutostartBody, options?: QServerRequestOptions): Promise<QServerSuccessResponse>;
export declare function getQueueHistory(payload?: QServerPayload, options?: GetWithBodyOptions<GetHistoryResponse>): Promise<GetHistoryResponse>;
export declare function clearHistory(options?: QServerRequestOptions): Promise<ClearHistoryResponse>;
export declare function openEnvironment(options?: QServerRequestOptions): Promise<EnvironmentResponse>;
export declare function closeEnvironment(options?: QServerRequestOptions): Promise<EnvironmentResponse>;
export declare function destroyEnvironment(options?: QServerRequestOptions): Promise<EnvironmentResponse>;
export declare function updateEnvironment(body?: EnvironmentUpdateBody, options?: QServerRequestOptions): Promise<EnvironmentUpdateResponse>;
export declare function pauseRE(body?: RePauseBody, options?: QServerRequestOptions): Promise<ReControlResponse>;
export declare function resumeRE(body?: ReResumeBody, options?: QServerRequestOptions): Promise<ReControlResponse>;
export declare function stopRE(body?: ReResumeBody, options?: QServerRequestOptions): Promise<ReControlResponse>;
export declare function abortRE(body?: ReResumeBody, options?: QServerRequestOptions): Promise<ReControlResponse>;
export declare function haltRE(body?: ReResumeBody, options?: QServerRequestOptions): Promise<ReControlResponse>;
export declare function getRuns(body?: GetRunsBody, options?: QServerRequestOptions): Promise<GetRunsResponse>;
export declare function getRunsActive(options?: QServerRequestOptions): Promise<GetRunsResponse>;
export declare function getRunsOpen(options?: QServerRequestOptions): Promise<GetRunsResponse>;
export declare function getRunsClosed(options?: QServerRequestOptions): Promise<GetRunsResponse>;
export declare function getREMetadata(payload?: QServerPayload, options?: GetWithBodyOptions<GetReMetadataResponse>): Promise<GetReMetadataResponse>;
export declare function getPlansAllowed(payload?: PlansDevicesBody, options?: GetWithBodyOptions<GetPlansAllowedResponse>): Promise<GetPlansAllowedResponse>;
export declare function getDevicesAllowed(payload?: PlansDevicesBody, options?: GetWithBodyOptions<GetDevicesAllowedResponse>): Promise<GetDevicesAllowedResponse>;
export declare function getPlansExisting(payload?: PlansDevicesBody, options?: GetWithBodyOptions<GetPlansExistingResponse>): Promise<GetPlansExistingResponse>;
export declare function getDevicesExisting(payload?: PlansDevicesBody, options?: GetWithBodyOptions<GetDevicesExistingResponse>): Promise<GetDevicesExistingResponse>;
export declare function getPermissions(options?: QServerRequestOptions): Promise<GetPermissionsResponse>;
export declare function setPermissions(body: SetPermissionsBody, options?: QServerRequestOptions): Promise<PermissionsResponse>;
export declare function reloadPermissions(body?: ReloadPermissionsBody, options?: QServerRequestOptions): Promise<PermissionsResponse>;
export declare function executeFunction(body: ExecuteFunctionBody, options?: QServerRequestOptions): Promise<ExecuteFunctionResponse>;
export declare function uploadScript(body: UploadScriptBody, options?: QServerRequestOptions): Promise<UploadScriptResponse>;
export declare function getTaskStatus(body: TaskBody, options?: GetWithBodyOptions<GetTaskStatusResponse>): Promise<GetTaskStatusResponse>;
export declare function getTaskResult(body: TaskBody, options?: GetWithBodyOptions<GetTaskResultResponse>): Promise<GetTaskResultResponse>;
export declare function lock(body: LockBody, options?: QServerRequestOptions): Promise<LockResponse>;
export declare function unlock(body: UnlockBody, options?: QServerRequestOptions): Promise<LockResponse>;
export declare function getLockInfo(payload?: QServerPayload, options?: GetWithBodyOptions<GetLockInfoResponse>): Promise<GetLockInfoResponse>;
export declare function getConsoleOutput(payload?: ConsoleOutputBody, options?: GetWithBodyOptions<GetConsoleOutputResponse>): Promise<GetConsoleOutputResponse>;
export declare function getConsoleOutputUID(options?: QServerRequestOptions): Promise<GetConsoleOutputUidResponse>;
export declare function getConsoleOutputUpdate(payload?: ConsoleOutputUpdateBody, options?: GetWithBodyOptions<GetConsoleOutputUpdateResponse>): Promise<GetConsoleOutputUpdateResponse>;
export declare function streamConsoleOutput(options?: QServerRequestOptions): Promise<string>;
export declare function interruptKernel(body?: KernelInterruptBody, options?: QServerRequestOptions): Promise<AdminResponse>;
export declare function stopManager(body?: ManagerStopBody, options?: QServerRequestOptions): Promise<AdminResponse>;
export declare function testKillManager(options?: QServerRequestOptions): Promise<AdminResponse>;
export declare function testServerSleep(payload?: TestServerSleepBody, options?: GetWithBodyOptions<AdminResponse>): Promise<AdminResponse>;
export declare function whoami(options?: QServerRequestOptions): Promise<WhoamiResponse>;
export declare function getScopes(options?: QServerRequestOptions): Promise<ScopesResponse>;
export declare function listPrincipals(options?: QServerRequestOptions): Promise<PrincipalListResponse>;
export declare function getPrincipal(uuid: string, options?: QServerRequestOptions): Promise<PrincipalResponse>;
export declare function createApiKeyForPrincipal(uuid: string, body: APIKeyRequestParams, options?: QServerRequestOptions): Promise<NewApiKeyResponse>;
export declare function createApiKey(body: APIKeyRequestParams, options?: QServerRequestOptions): Promise<NewApiKeyResponse>;
export declare function getCurrentApiKeyInfo(options?: QServerRequestOptions): Promise<CurrentApiKeyInfoResponse>;
export declare function revokeApiKey(firstEight: string, options?: QServerRequestOptions): Promise<unknown>;
export declare function refreshSession(body: SessionRefreshBody, options?: QServerRequestOptions): Promise<AccessAndRefreshTokens>;
export declare function revokeSession(sessionId: string, options?: QServerRequestOptions): Promise<unknown>;
export declare function logout(options?: QServerRequestOptions): Promise<LogoutResponse>;
//# sourceMappingURL=facade.d.ts.map