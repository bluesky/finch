import type { QServerAdminEndpoints } from '../endpoints/adminEndpoints';
import type { QServerAuthEndpoints } from '../endpoints/authEndpoints';
import type { QServerConsoleEndpoints } from '../endpoints/consoleEndpoints';
import type { QServerEnvironmentEndpoints } from '../endpoints/environmentEndpoints';
import type { QServerFunctionsScriptsEndpoints } from '../endpoints/functionsScriptsEndpoints';
import type { QServerHistoryEndpoints } from '../endpoints/historyEndpoints';
import type { QServerLockEndpoints } from '../endpoints/lockEndpoints';
import type { QServerPermissionsEndpoints } from '../endpoints/permissionsEndpoints';
import type { QServerPlansDevicesEndpoints } from '../endpoints/plansDevicesEndpoints';
import type { QServerQueueEndpoints } from '../endpoints/queueEndpoints';
import type { QServerRunEngineEndpoints } from '../endpoints/runEngineEndpoints';
import type { QServerStatusEndpoints } from '../endpoints/statusEndpoints';
import type { QServerTasksEndpoints } from '../endpoints/tasksEndpoints';

/**
 * Every queue-server operation as one type — the contract `QServerApiClient` implements,
 * and the interface to program against when a caller wants to substitute their own client.
 *
 * 70 operations across 68 paths (`/api/auth/apikey` serves GET, POST and DELETE).
 */
export interface QServerEndpoints
    extends
        QServerStatusEndpoints,
        QServerQueueEndpoints,
        QServerHistoryEndpoints,
        QServerEnvironmentEndpoints,
        QServerRunEngineEndpoints,
        QServerPlansDevicesEndpoints,
        QServerPermissionsEndpoints,
        QServerFunctionsScriptsEndpoints,
        QServerTasksEndpoints,
        QServerLockEndpoints,
        QServerConsoleEndpoints,
        QServerAdminEndpoints,
        QServerAuthEndpoints {}
