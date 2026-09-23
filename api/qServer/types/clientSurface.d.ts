import { QServerAdminEndpoints } from '../endpoints/adminEndpoints';
import { QServerAuthEndpoints } from '../endpoints/authEndpoints';
import { QServerConsoleEndpoints } from '../endpoints/consoleEndpoints';
import { QServerEnvironmentEndpoints } from '../endpoints/environmentEndpoints';
import { QServerFunctionsScriptsEndpoints } from '../endpoints/functionsScriptsEndpoints';
import { QServerHistoryEndpoints } from '../endpoints/historyEndpoints';
import { QServerLockEndpoints } from '../endpoints/lockEndpoints';
import { QServerPermissionsEndpoints } from '../endpoints/permissionsEndpoints';
import { QServerPlansDevicesEndpoints } from '../endpoints/plansDevicesEndpoints';
import { QServerQueueEndpoints } from '../endpoints/queueEndpoints';
import { QServerRunEngineEndpoints } from '../endpoints/runEngineEndpoints';
import { QServerStatusEndpoints } from '../endpoints/statusEndpoints';
import { QServerTasksEndpoints } from '../endpoints/tasksEndpoints';
/**
 * Every queue-server operation as one type — the contract `QServerApiClient` implements,
 * and the interface to program against when a caller wants to substitute their own client.
 *
 * 70 operations across 68 paths (`/api/auth/apikey` serves GET, POST and DELETE).
 */
export interface QServerEndpoints extends QServerStatusEndpoints, QServerQueueEndpoints, QServerHistoryEndpoints, QServerEnvironmentEndpoints, QServerRunEngineEndpoints, QServerPlansDevicesEndpoints, QServerPermissionsEndpoints, QServerFunctionsScriptsEndpoints, QServerTasksEndpoints, QServerLockEndpoints, QServerConsoleEndpoints, QServerAdminEndpoints, QServerAuthEndpoints {
}
//# sourceMappingURL=clientSurface.d.ts.map