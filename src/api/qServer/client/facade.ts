import { getDefaultQServerClient } from './defaultClient';
import type {
    APIKeyRequestParams,
    AccessAndRefreshTokens,
    AddQueueItemBatchBody,
    AddQueueItemBody,
    AdminResponse,
    ClearHistoryResponse,
    ConsoleOutputBody,
    ConsoleOutputUpdateBody,
    CurrentApiKeyInfoResponse,
    EnvironmentResponse,
    EnvironmentUpdateBody,
    EnvironmentUpdateResponse,
    ExecuteFunctionBody,
    ExecuteFunctionResponse,
    ExecuteQueueItemBody,
    GetConfigResponse,
    GetConsoleOutputResponse,
    GetConsoleOutputUidResponse,
    GetConsoleOutputUpdateResponse,
    GetDevicesAllowedResponse,
    GetDevicesExistingResponse,
    GetHistoryResponse,
    GetLockInfoResponse,
    GetPermissionsResponse,
    GetPlansAllowedResponse,
    GetPlansExistingResponse,
    GetQueueItemBody,
    GetQueueItemResponse,
    GetQueueResponse,
    GetReMetadataResponse,
    GetRunsBody,
    GetRunsResponse,
    GetStatusResponse,
    GetTaskResultResponse,
    GetTaskStatusResponse,
    GetWithBodyOptions,
    KernelInterruptBody,
    LockBody,
    LockResponse,
    LogoutResponse,
    ManagerStopBody,
    MoveQueueItemBatchBody,
    MoveQueueItemBody,
    NewApiKeyResponse,
    PermissionsResponse,
    PingResponse,
    PlansDevicesBody,
    PostItemAddResponse,
    PostItemBatchResponse,
    PostItemExecuteResponse,
    PostItemRemoveResponse,
    PostItemUpdateResponse,
    PrincipalListResponse,
    PrincipalResponse,
    QServerPayload,
    QServerRequestOptions,
    QServerSuccessResponse,
    QueueAutostartBody,
    QueueClearResponse,
    QueueModeSetBody,
    QueueStartResponse,
    ReControlResponse,
    RePauseBody,
    ReResumeBody,
    ReloadPermissionsBody,
    RemoveQueueItemBatchBody,
    RemoveQueueItemBody,
    ScopesResponse,
    SessionRefreshBody,
    SetPermissionsBody,
    TaskBody,
    TestServerSleepBody,
    UnlockBody,
    UpdateQueueItemBody,
    UploadScriptBody,
    UploadScriptResponse,
    UploadSpreadsheetInput,
    UploadSpreadsheetResponse,
    WhoamiResponse,
} from '../types';

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

// #region status

export function ping(
    payload?: QServerPayload,
    options?: GetWithBodyOptions<PingResponse>,
): Promise<PingResponse> {
    return getDefaultQServerClient().ping(payload, options);
}

export function getRoot(
    payload?: QServerPayload,
    options?: GetWithBodyOptions<PingResponse>,
): Promise<PingResponse> {
    return getDefaultQServerClient().getRoot(payload, options);
}

export function getStatus(
    payload?: QServerPayload,
    options?: GetWithBodyOptions<GetStatusResponse>,
): Promise<GetStatusResponse> {
    return getDefaultQServerClient().getStatus(payload, options);
}

export function getConfig(
    payload?: QServerPayload,
    options?: GetWithBodyOptions<GetConfigResponse>,
): Promise<GetConfigResponse> {
    return getDefaultQServerClient().getConfig(payload, options);
}

// #endregion

// #region queue

export function getQueue(
    payload?: Record<string, unknown>,
    options?: GetWithBodyOptions<GetQueueResponse>,
): Promise<GetQueueResponse> {
    return getDefaultQServerClient().getQueue(payload, options);
}

export function getQueueItem(
    body?: GetQueueItemBody,
    options?: GetWithBodyOptions<GetQueueItemResponse>,
): Promise<GetQueueItemResponse> {
    return getDefaultQServerClient().getQueueItem(body, options);
}

export function addQueueItem(
    body: AddQueueItemBody,
    options?: QServerRequestOptions,
): Promise<PostItemAddResponse> {
    return getDefaultQServerClient().addQueueItem(body, options);
}

export function addQueueItemBatch(
    body: AddQueueItemBatchBody,
    options?: QServerRequestOptions,
): Promise<PostItemBatchResponse> {
    return getDefaultQServerClient().addQueueItemBatch(body, options);
}

export function executeQueueItem(
    body: ExecuteQueueItemBody,
    options?: QServerRequestOptions,
): Promise<PostItemExecuteResponse> {
    return getDefaultQServerClient().executeQueueItem(body, options);
}

export function updateQueueItem(
    body: UpdateQueueItemBody,
    options?: QServerRequestOptions,
): Promise<PostItemUpdateResponse> {
    return getDefaultQServerClient().updateQueueItem(body, options);
}

export function removeQueueItem(
    body?: RemoveQueueItemBody,
    options?: QServerRequestOptions,
): Promise<PostItemRemoveResponse> {
    return getDefaultQServerClient().removeQueueItem(body, options);
}

export function removeQueueItemBatch(
    body: RemoveQueueItemBatchBody,
    options?: QServerRequestOptions,
): Promise<PostItemBatchResponse> {
    return getDefaultQServerClient().removeQueueItemBatch(body, options);
}

export function moveQueueItem(
    body: MoveQueueItemBody,
    options?: QServerRequestOptions,
): Promise<PostItemAddResponse> {
    return getDefaultQServerClient().moveQueueItem(body, options);
}

export function moveQueueItemBatch(
    body: MoveQueueItemBatchBody,
    options?: QServerRequestOptions,
): Promise<PostItemBatchResponse> {
    return getDefaultQServerClient().moveQueueItemBatch(body, options);
}

export function uploadQueueSpreadsheet(
    input: UploadSpreadsheetInput,
    options?: QServerRequestOptions,
): Promise<UploadSpreadsheetResponse> {
    return getDefaultQServerClient().uploadQueueSpreadsheet(input, options);
}

export function startQueue(options?: QServerRequestOptions): Promise<QueueStartResponse> {
    return getDefaultQServerClient().startQueue(options);
}

export function stopQueue(options?: QServerRequestOptions): Promise<QServerSuccessResponse> {
    return getDefaultQServerClient().stopQueue(options);
}

export function cancelQueueStop(options?: QServerRequestOptions): Promise<QServerSuccessResponse> {
    return getDefaultQServerClient().cancelQueueStop(options);
}

export function clearQueue(options?: QServerRequestOptions): Promise<QueueClearResponse> {
    return getDefaultQServerClient().clearQueue(options);
}

export function setQueueMode(
    body: QueueModeSetBody,
    options?: QServerRequestOptions,
): Promise<QServerSuccessResponse> {
    return getDefaultQServerClient().setQueueMode(body, options);
}

export function setQueueAutostart(
    body: QueueAutostartBody,
    options?: QServerRequestOptions,
): Promise<QServerSuccessResponse> {
    return getDefaultQServerClient().setQueueAutostart(body, options);
}

// #endregion

// #region history

export function getQueueHistory(
    payload?: QServerPayload,
    options?: GetWithBodyOptions<GetHistoryResponse>,
): Promise<GetHistoryResponse> {
    return getDefaultQServerClient().getQueueHistory(payload, options);
}

export function clearHistory(options?: QServerRequestOptions): Promise<ClearHistoryResponse> {
    return getDefaultQServerClient().clearHistory(options);
}

// #endregion

// #region environment

export function openEnvironment(options?: QServerRequestOptions): Promise<EnvironmentResponse> {
    return getDefaultQServerClient().openEnvironment(options);
}

export function closeEnvironment(options?: QServerRequestOptions): Promise<EnvironmentResponse> {
    return getDefaultQServerClient().closeEnvironment(options);
}

export function destroyEnvironment(options?: QServerRequestOptions): Promise<EnvironmentResponse> {
    return getDefaultQServerClient().destroyEnvironment(options);
}

export function updateEnvironment(
    body?: EnvironmentUpdateBody,
    options?: QServerRequestOptions,
): Promise<EnvironmentUpdateResponse> {
    return getDefaultQServerClient().updateEnvironment(body, options);
}

// #endregion

// #region run engine

export function pauseRE(
    body?: RePauseBody,
    options?: QServerRequestOptions,
): Promise<ReControlResponse> {
    return getDefaultQServerClient().pauseRE(body, options);
}

export function resumeRE(
    body?: ReResumeBody,
    options?: QServerRequestOptions,
): Promise<ReControlResponse> {
    return getDefaultQServerClient().resumeRE(body, options);
}

export function stopRE(
    body?: ReResumeBody,
    options?: QServerRequestOptions,
): Promise<ReControlResponse> {
    return getDefaultQServerClient().stopRE(body, options);
}

export function abortRE(
    body?: ReResumeBody,
    options?: QServerRequestOptions,
): Promise<ReControlResponse> {
    return getDefaultQServerClient().abortRE(body, options);
}

export function haltRE(
    body?: ReResumeBody,
    options?: QServerRequestOptions,
): Promise<ReControlResponse> {
    return getDefaultQServerClient().haltRE(body, options);
}

export function getRuns(
    body?: GetRunsBody,
    options?: QServerRequestOptions,
): Promise<GetRunsResponse> {
    return getDefaultQServerClient().getRuns(body, options);
}

export function getRunsActive(options?: QServerRequestOptions): Promise<GetRunsResponse> {
    return getDefaultQServerClient().getRunsActive(options);
}

export function getRunsOpen(options?: QServerRequestOptions): Promise<GetRunsResponse> {
    return getDefaultQServerClient().getRunsOpen(options);
}

export function getRunsClosed(options?: QServerRequestOptions): Promise<GetRunsResponse> {
    return getDefaultQServerClient().getRunsClosed(options);
}

export function getREMetadata(
    payload?: QServerPayload,
    options?: GetWithBodyOptions<GetReMetadataResponse>,
): Promise<GetReMetadataResponse> {
    return getDefaultQServerClient().getREMetadata(payload, options);
}

// #endregion

// #region plans and devices

export function getPlansAllowed(
    payload?: PlansDevicesBody,
    options?: GetWithBodyOptions<GetPlansAllowedResponse>,
): Promise<GetPlansAllowedResponse> {
    return getDefaultQServerClient().getPlansAllowed(payload, options);
}

export function getDevicesAllowed(
    payload?: PlansDevicesBody,
    options?: GetWithBodyOptions<GetDevicesAllowedResponse>,
): Promise<GetDevicesAllowedResponse> {
    return getDefaultQServerClient().getDevicesAllowed(payload, options);
}

export function getPlansExisting(
    payload?: PlansDevicesBody,
    options?: GetWithBodyOptions<GetPlansExistingResponse>,
): Promise<GetPlansExistingResponse> {
    return getDefaultQServerClient().getPlansExisting(payload, options);
}

export function getDevicesExisting(
    payload?: PlansDevicesBody,
    options?: GetWithBodyOptions<GetDevicesExistingResponse>,
): Promise<GetDevicesExistingResponse> {
    return getDefaultQServerClient().getDevicesExisting(payload, options);
}

// #endregion

// #region permissions

export function getPermissions(options?: QServerRequestOptions): Promise<GetPermissionsResponse> {
    return getDefaultQServerClient().getPermissions(options);
}

export function setPermissions(
    body: SetPermissionsBody,
    options?: QServerRequestOptions,
): Promise<PermissionsResponse> {
    return getDefaultQServerClient().setPermissions(body, options);
}

export function reloadPermissions(
    body?: ReloadPermissionsBody,
    options?: QServerRequestOptions,
): Promise<PermissionsResponse> {
    return getDefaultQServerClient().reloadPermissions(body, options);
}

// #endregion

// #region functions and scripts

export function executeFunction(
    body: ExecuteFunctionBody,
    options?: QServerRequestOptions,
): Promise<ExecuteFunctionResponse> {
    return getDefaultQServerClient().executeFunction(body, options);
}

export function uploadScript(
    body: UploadScriptBody,
    options?: QServerRequestOptions,
): Promise<UploadScriptResponse> {
    return getDefaultQServerClient().uploadScript(body, options);
}

// #endregion

// #region tasks

export function getTaskStatus(
    body: TaskBody,
    options?: GetWithBodyOptions<GetTaskStatusResponse>,
): Promise<GetTaskStatusResponse> {
    return getDefaultQServerClient().getTaskStatus(body, options);
}

export function getTaskResult(
    body: TaskBody,
    options?: GetWithBodyOptions<GetTaskResultResponse>,
): Promise<GetTaskResultResponse> {
    return getDefaultQServerClient().getTaskResult(body, options);
}

// #endregion

// #region lock

export function lock(body: LockBody, options?: QServerRequestOptions): Promise<LockResponse> {
    return getDefaultQServerClient().lock(body, options);
}

export function unlock(body: UnlockBody, options?: QServerRequestOptions): Promise<LockResponse> {
    return getDefaultQServerClient().unlock(body, options);
}

export function getLockInfo(
    payload?: QServerPayload,
    options?: GetWithBodyOptions<GetLockInfoResponse>,
): Promise<GetLockInfoResponse> {
    return getDefaultQServerClient().getLockInfo(payload, options);
}

// #endregion

// #region console

export function getConsoleOutput(
    payload?: ConsoleOutputBody,
    options?: GetWithBodyOptions<GetConsoleOutputResponse>,
): Promise<GetConsoleOutputResponse> {
    return getDefaultQServerClient().getConsoleOutput(payload, options);
}

export function getConsoleOutputUID(
    options?: QServerRequestOptions,
): Promise<GetConsoleOutputUidResponse> {
    return getDefaultQServerClient().getConsoleOutputUID(options);
}

export function getConsoleOutputUpdate(
    payload?: ConsoleOutputUpdateBody,
    options?: GetWithBodyOptions<GetConsoleOutputUpdateResponse>,
): Promise<GetConsoleOutputUpdateResponse> {
    return getDefaultQServerClient().getConsoleOutputUpdate(payload, options);
}

export function streamConsoleOutput(options?: QServerRequestOptions): Promise<string> {
    return getDefaultQServerClient().streamConsoleOutput(options);
}

// #endregion

// #region admin

export function interruptKernel(
    body?: KernelInterruptBody,
    options?: QServerRequestOptions,
): Promise<AdminResponse> {
    return getDefaultQServerClient().interruptKernel(body, options);
}

export function stopManager(
    body?: ManagerStopBody,
    options?: QServerRequestOptions,
): Promise<AdminResponse> {
    return getDefaultQServerClient().stopManager(body, options);
}

export function testKillManager(options?: QServerRequestOptions): Promise<AdminResponse> {
    return getDefaultQServerClient().testKillManager(options);
}

export function testServerSleep(
    payload?: TestServerSleepBody,
    options?: GetWithBodyOptions<AdminResponse>,
): Promise<AdminResponse> {
    return getDefaultQServerClient().testServerSleep(payload, options);
}

// #endregion

// #region auth

export function whoami(options?: QServerRequestOptions): Promise<WhoamiResponse> {
    return getDefaultQServerClient().whoami(options);
}

export function getScopes(options?: QServerRequestOptions): Promise<ScopesResponse> {
    return getDefaultQServerClient().getScopes(options);
}

export function listPrincipals(options?: QServerRequestOptions): Promise<PrincipalListResponse> {
    return getDefaultQServerClient().listPrincipals(options);
}

export function getPrincipal(
    uuid: string,
    options?: QServerRequestOptions,
): Promise<PrincipalResponse> {
    return getDefaultQServerClient().getPrincipal(uuid, options);
}

export function createApiKeyForPrincipal(
    uuid: string,
    body: APIKeyRequestParams,
    options?: QServerRequestOptions,
): Promise<NewApiKeyResponse> {
    return getDefaultQServerClient().createApiKeyForPrincipal(uuid, body, options);
}

export function createApiKey(
    body: APIKeyRequestParams,
    options?: QServerRequestOptions,
): Promise<NewApiKeyResponse> {
    return getDefaultQServerClient().createApiKey(body, options);
}

export function getCurrentApiKeyInfo(
    options?: QServerRequestOptions,
): Promise<CurrentApiKeyInfoResponse> {
    return getDefaultQServerClient().getCurrentApiKeyInfo(options);
}

export function revokeApiKey(
    firstEight: string,
    options?: QServerRequestOptions,
): Promise<unknown> {
    return getDefaultQServerClient().revokeApiKey(firstEight, options);
}

export function refreshSession(
    body: SessionRefreshBody,
    options?: QServerRequestOptions,
): Promise<AccessAndRefreshTokens> {
    return getDefaultQServerClient().refreshSession(body, options);
}

export function revokeSession(
    sessionId: string,
    options?: QServerRequestOptions,
): Promise<unknown> {
    return getDefaultQServerClient().revokeSession(sessionId, options);
}

export function logout(options?: QServerRequestOptions): Promise<LogoutResponse> {
    return getDefaultQServerClient().logout(options);
}

// #endregion
