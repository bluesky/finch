import type { QServerPathKey } from './generatedAliases';

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
export const QSERVER_PATHS = {
    ping: '/api/ping',
    root: '/api/',
    status: '/api/status',
    configGet: '/api/config/get',
    queueAutostart: '/api/queue/autostart',
    queueModeSet: '/api/queue/mode/set',
    queueGet: '/api/queue/get',
    queueClear: '/api/queue/clear',
    queueStart: '/api/queue/start',
    queueStop: '/api/queue/stop',
    queueStopCancel: '/api/queue/stop/cancel',
    queueItemAdd: '/api/queue/item/add',
    queueItemExecute: '/api/queue/item/execute',
    queueItemAddBatch: '/api/queue/item/add/batch',
    queueUploadSpreadsheet: '/api/queue/upload/spreadsheet',
    queueItemUpdate: '/api/queue/item/update',
    queueItemRemove: '/api/queue/item/remove',
    queueItemRemoveBatch: '/api/queue/item/remove/batch',
    queueItemMove: '/api/queue/item/move',
    queueItemMoveBatch: '/api/queue/item/move/batch',
    queueItemGet: '/api/queue/item/get',
    historyGet: '/api/history/get',
    historyClear: '/api/history/clear',
    environmentOpen: '/api/environment/open',
    environmentClose: '/api/environment/close',
    environmentDestroy: '/api/environment/destroy',
    environmentUpdate: '/api/environment/update',
    rePause: '/api/re/pause',
    reResume: '/api/re/resume',
    reStop: '/api/re/stop',
    reAbort: '/api/re/abort',
    reHalt: '/api/re/halt',
    reRuns: '/api/re/runs',
    reRunsActive: '/api/re/runs/active',
    reRunsOpen: '/api/re/runs/open',
    reRunsClosed: '/api/re/runs/closed',
    reMetadata: '/api/re/metadata',
    plansAllowed: '/api/plans/allowed',
    devicesAllowed: '/api/devices/allowed',
    plansExisting: '/api/plans/existing',
    devicesExisting: '/api/devices/existing',
    permissionsReload: '/api/permissions/reload',
    permissionsGet: '/api/permissions/get',
    permissionsSet: '/api/permissions/set',
    functionExecute: '/api/function/execute',
    scriptUpload: '/api/script/upload',
    taskStatus: '/api/task/status',
    taskResult: '/api/task/result',
    kernelInterrupt: '/api/kernel/interrupt',
    lock: '/api/lock',
    unlock: '/api/unlock',
    lockInfo: '/api/lock/info',
    managerStop: '/api/manager/stop',
    testManagerKill: '/api/test/manager/kill',
    testServerSleep: '/api/test/server/sleep',
    streamConsoleOutput: '/api/stream_console_output',
    consoleOutput: '/api/console_output',
    consoleOutputUid: '/api/console_output/uid',
    consoleOutputUpdate: '/api/console_output_update',
    authPrincipal: '/api/auth/principal',
    authPrincipalByUuid: '/api/auth/principal/{uuid}',
    authPrincipalByUuidApikey: '/api/auth/principal/{uuid}/apikey',
    authSessionRefresh: '/api/auth/session/refresh',
    authSessionRevokeBySessionId: '/api/auth/session/revoke/{session_id}',
    authApikey: '/api/auth/apikey',
    authWhoami: '/api/auth/whoami',
    authScopes: '/api/auth/scopes',
    authLogout: '/api/auth/logout',
} as const satisfies Record<string, QServerPathKey>;

/** Alias keys of {@link QSERVER_PATHS}, e.g. `'queueItemAdd'`. */
export type QServerPathAlias = keyof typeof QSERVER_PATHS;

/** The registered path literals — a subset of {@link QServerPathKey} by construction. */
export type QServerRegisteredPath = (typeof QSERVER_PATHS)[QServerPathAlias];

type MissingPaths = Exclude<QServerPathKey, QServerRegisteredPath>;
/**
 * Compile-time completeness check. If the regenerated schema adds a path, this alias
 * resolves to a tuple naming the offender instead of `true`, which fails the build.
 */
type _AssertNoMissingPaths = MissingPaths extends never
    ? true
    : ['unregistered paths', MissingPaths];

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
export function buildPath(template: string, params: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (match, name: string) => {
        const value = params[name];
        if (value === undefined || value === null || value === '') {
            throw new Error(`Missing path parameter '${name}' for '${template}'`);
        }
        return encodeURIComponent(String(value));
    });
}
