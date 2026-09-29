import type { QServerRequestOptions } from '../types/common';
import { QSERVER_PATHS } from '../types/paths';
import type {
    GetPermissionsResponse,
    PermissionsResponse,
    ReloadPermissionsBody,
    SetPermissionsBody,
} from '../types/permissions';
import { payloadAs, type QServerEndpointDescriptor } from '../types/registry';

export interface QServerPermissionsEndpoints {
    /** `GET /api/permissions/get` — current user-group permissions. */
    getPermissions(options?: QServerRequestOptions): Promise<GetPermissionsResponse>;
    /** `POST /api/permissions/set` — replace the user-group permissions. */
    setPermissions(
        body: SetPermissionsBody,
        options?: QServerRequestOptions,
    ): Promise<PermissionsResponse>;
    /** `POST /api/permissions/reload` — reload permissions and optionally plan/device lists. */
    reloadPermissions(
        body?: ReloadPermissionsBody,
        options?: QServerRequestOptions,
    ): Promise<PermissionsResponse>;
}

export const permissionsEndpointDescriptors: QServerEndpointDescriptor[] = [
    {
        id: 'permissions.get',
        group: 'permissions',
        method: 'GET',
        path: QSERVER_PATHS.permissionsGet,
        fn: 'getPermissions',
        summary: 'Current user-group permissions.',
        browserSafe: true,
        call: (client) => client.getPermissions(),
    },
    {
        id: 'permissions.set',
        group: 'permissions',
        method: 'POST',
        path: QSERVER_PATHS.permissionsSet,
        fn: 'setPermissions',
        summary: 'Replace user-group permissions.',
        browserSafe: true,
        destructive: true,
        sampleBody: { user_group_permissions: { user_groups: {} } },
        call: (client, input) => client.setPermissions(payloadAs<SetPermissionsBody>(input)),
    },
    {
        id: 'permissions.reload',
        group: 'permissions',
        method: 'POST',
        path: QSERVER_PATHS.permissionsReload,
        fn: 'reloadPermissions',
        summary: 'Reload permissions from disk.',
        browserSafe: true,
        sampleBody: { restore_plans_devices: false, restore_permissions: true },
        call: (client, input) => client.reloadPermissions(payloadAs<ReloadPermissionsBody>(input)),
    },
];
