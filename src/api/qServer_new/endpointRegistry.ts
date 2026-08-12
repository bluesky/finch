import { adminEndpointDescriptors } from './endpoints/adminEndpoints';
import { authEndpointDescriptors } from './endpoints/authEndpoints';
import { consoleEndpointDescriptors } from './endpoints/consoleEndpoints';
import { environmentEndpointDescriptors } from './endpoints/environmentEndpoints';
import { functionsScriptsEndpointDescriptors } from './endpoints/functionsScriptsEndpoints';
import { historyEndpointDescriptors } from './endpoints/historyEndpoints';
import { lockEndpointDescriptors } from './endpoints/lockEndpoints';
import { permissionsEndpointDescriptors } from './endpoints/permissionsEndpoints';
import { plansDevicesEndpointDescriptors } from './endpoints/plansDevicesEndpoints';
import { queueEndpointDescriptors } from './endpoints/queueEndpoints';
import { runEngineEndpointDescriptors } from './endpoints/runEngineEndpoints';
import { statusEndpointDescriptors } from './endpoints/statusEndpoints';
import { tasksEndpointDescriptors } from './endpoints/tasksEndpoints';
import type { QServerEndpointDescriptor, QServerEndpointGroup } from './types/registry';

/**
 * Every operation the client implements, described as data.
 *
 * Ordered by domain so a UI can render it top to bottom. `QServerNewRegistry.test.tsx`
 * diffs this against `openapi.json`, so a spec change surfaces as a failing test rather
 * than a silently missing endpoint.
 */
export const QSERVER_ENDPOINTS: readonly QServerEndpointDescriptor[] = [
    ...statusEndpointDescriptors,
    ...queueEndpointDescriptors,
    ...historyEndpointDescriptors,
    ...environmentEndpointDescriptors,
    ...runEngineEndpointDescriptors,
    ...plansDevicesEndpointDescriptors,
    ...permissionsEndpointDescriptors,
    ...functionsScriptsEndpointDescriptors,
    ...tasksEndpointDescriptors,
    ...lockEndpointDescriptors,
    ...consoleEndpointDescriptors,
    ...adminEndpointDescriptors,
    ...authEndpointDescriptors,
];

/** Domain order used for display. */
export const QSERVER_ENDPOINT_GROUPS: readonly QServerEndpointGroup[] = [
    'status',
    'queue',
    'history',
    'environment',
    'runEngine',
    'plansDevices',
    'permissions',
    'functionsScripts',
    'tasks',
    'lock',
    'console',
    'admin',
    'auth',
];

/** Human-readable group labels. */
export const QSERVER_GROUP_LABELS: Record<QServerEndpointGroup, string> = {
    status: 'Status',
    queue: 'Queue',
    history: 'History',
    environment: 'Environment',
    runEngine: 'Run Engine',
    plansDevices: 'Plans & Devices',
    permissions: 'Permissions',
    functionsScripts: 'Functions & Scripts',
    tasks: 'Tasks',
    lock: 'Lock',
    console: 'Console',
    admin: 'Admin',
    auth: 'Auth',
};

export function getEndpointById(id: string): QServerEndpointDescriptor | undefined {
    return QSERVER_ENDPOINTS.find((endpoint) => endpoint.id === id);
}

export function getEndpointsByGroup(group: QServerEndpointGroup): QServerEndpointDescriptor[] {
    return QSERVER_ENDPOINTS.filter((endpoint) => endpoint.group === group);
}

/**
 * Endpoints safe to fire in bulk against a live server: reads that neither mutate state nor
 * block. Excludes the console stream, which never completes on its own.
 */
export function getReadOnlyEndpoints(): QServerEndpointDescriptor[] {
    return QSERVER_ENDPOINTS.filter(
        (endpoint) =>
            endpoint.method === 'GET' &&
            endpoint.browserSafe &&
            !endpoint.destructive &&
            !endpoint.streaming &&
            !endpoint.params?.some((param) => param.required),
    );
}
