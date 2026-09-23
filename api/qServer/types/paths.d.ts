/**
 * Every URL the queue server exposes, keyed by a stable camelCase alias.
 *
 * Two things to know:
 *
 * 1. Spec paths already begin with `/api/`, so a client's `baseUrl` must be the
 *    server **origin** (`http://host:60610`) and never `.../api`.
 * 2. The table is `satisfies Record<string, QServerPathKey>`, so a typo is a compile
 *    error, and `_AssertNoMissingPaths` below fails to compile if the regenerated
 *    schema gains a path that is not registered here.
 */
export declare const QSERVER_PATHS: {
    readonly ping: "/api/ping";
    readonly root: "/api/";
    readonly status: "/api/status";
    readonly configGet: "/api/config/get";
    readonly queueAutostart: "/api/queue/autostart";
    readonly queueModeSet: "/api/queue/mode/set";
    readonly queueGet: "/api/queue/get";
    readonly queueClear: "/api/queue/clear";
    readonly queueStart: "/api/queue/start";
    readonly queueStop: "/api/queue/stop";
    readonly queueStopCancel: "/api/queue/stop/cancel";
    readonly queueItemAdd: "/api/queue/item/add";
    readonly queueItemExecute: "/api/queue/item/execute";
    readonly queueItemAddBatch: "/api/queue/item/add/batch";
    readonly queueUploadSpreadsheet: "/api/queue/upload/spreadsheet";
    readonly queueItemUpdate: "/api/queue/item/update";
    readonly queueItemRemove: "/api/queue/item/remove";
    readonly queueItemRemoveBatch: "/api/queue/item/remove/batch";
    readonly queueItemMove: "/api/queue/item/move";
    readonly queueItemMoveBatch: "/api/queue/item/move/batch";
    readonly queueItemGet: "/api/queue/item/get";
    readonly historyGet: "/api/history/get";
    readonly historyClear: "/api/history/clear";
    readonly environmentOpen: "/api/environment/open";
    readonly environmentClose: "/api/environment/close";
    readonly environmentDestroy: "/api/environment/destroy";
    readonly environmentUpdate: "/api/environment/update";
    readonly rePause: "/api/re/pause";
    readonly reResume: "/api/re/resume";
    readonly reStop: "/api/re/stop";
    readonly reAbort: "/api/re/abort";
    readonly reHalt: "/api/re/halt";
    readonly reRuns: "/api/re/runs";
    readonly reRunsActive: "/api/re/runs/active";
    readonly reRunsOpen: "/api/re/runs/open";
    readonly reRunsClosed: "/api/re/runs/closed";
    readonly reMetadata: "/api/re/metadata";
    readonly plansAllowed: "/api/plans/allowed";
    readonly devicesAllowed: "/api/devices/allowed";
    readonly plansExisting: "/api/plans/existing";
    readonly devicesExisting: "/api/devices/existing";
    readonly permissionsReload: "/api/permissions/reload";
    readonly permissionsGet: "/api/permissions/get";
    readonly permissionsSet: "/api/permissions/set";
    readonly functionExecute: "/api/function/execute";
    readonly scriptUpload: "/api/script/upload";
    readonly taskStatus: "/api/task/status";
    readonly taskResult: "/api/task/result";
    readonly kernelInterrupt: "/api/kernel/interrupt";
    readonly lock: "/api/lock";
    readonly unlock: "/api/unlock";
    readonly lockInfo: "/api/lock/info";
    readonly managerStop: "/api/manager/stop";
    readonly testManagerKill: "/api/test/manager/kill";
    readonly testServerSleep: "/api/test/server/sleep";
    readonly streamConsoleOutput: "/api/stream_console_output";
    readonly consoleOutput: "/api/console_output";
    readonly consoleOutputUid: "/api/console_output/uid";
    readonly consoleOutputUpdate: "/api/console_output_update";
    readonly authPrincipal: "/api/auth/principal";
    readonly authPrincipalByUuid: "/api/auth/principal/{uuid}";
    readonly authPrincipalByUuidApikey: "/api/auth/principal/{uuid}/apikey";
    readonly authSessionRefresh: "/api/auth/session/refresh";
    readonly authSessionRevokeBySessionId: "/api/auth/session/revoke/{session_id}";
    readonly authApikey: "/api/auth/apikey";
    readonly authWhoami: "/api/auth/whoami";
    readonly authScopes: "/api/auth/scopes";
    readonly authLogout: "/api/auth/logout";
};
/** Alias keys of {@link QSERVER_PATHS}, e.g. `'queueItemAdd'`. */
export type QServerPathAlias = keyof typeof QSERVER_PATHS;
/** The registered path literals — a subset of {@link QServerPathKey} by construction. */
export type QServerRegisteredPath = (typeof QSERVER_PATHS)[QServerPathAlias];
/**
 * Substitute `{placeholder}` segments in a templated path.
 *
 * Values are percent-encoded, so a uuid or session id containing `/` cannot escape
 * its segment.
 *
 * ```ts
 * buildPath(QSERVER_PATHS.authPrincipalByUuid, { uuid }); // '/api/auth/principal/abc-123'
 * ```
 */
export declare function buildPath(template: string, params: Record<string, string | number>): string;
//# sourceMappingURL=paths.d.ts.map