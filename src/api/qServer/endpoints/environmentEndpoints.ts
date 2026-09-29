import type { QServerRequestOptions } from '../types/common';
import type {
    EnvironmentResponse,
    EnvironmentUpdateBody,
    EnvironmentUpdateResponse,
} from '../types/environment';
import { QSERVER_PATHS } from '../types/paths';
import { payloadAs, type QServerEndpointDescriptor } from '../types/registry';

export interface QServerEnvironmentEndpoints {
    /** `POST /api/environment/open` — start the worker environment. */
    openEnvironment(options?: QServerRequestOptions): Promise<EnvironmentResponse>;
    /** `POST /api/environment/close` — shut the worker environment down cleanly. */
    closeEnvironment(options?: QServerRequestOptions): Promise<EnvironmentResponse>;
    /** `POST /api/environment/destroy` — kill the worker, even mid-plan. */
    destroyEnvironment(options?: QServerRequestOptions): Promise<EnvironmentResponse>;
    /** `POST /api/environment/update` — re-run startup scripts in the live environment. */
    updateEnvironment(
        body?: EnvironmentUpdateBody,
        options?: QServerRequestOptions,
    ): Promise<EnvironmentUpdateResponse>;
}

export const environmentEndpointDescriptors: QServerEndpointDescriptor[] = [
    {
        id: 'environment.open',
        group: 'environment',
        method: 'POST',
        path: QSERVER_PATHS.environmentOpen,
        fn: 'openEnvironment',
        summary: 'Open the worker environment.',
        browserSafe: true,
        call: (client) => client.openEnvironment(),
    },
    {
        id: 'environment.close',
        group: 'environment',
        method: 'POST',
        path: QSERVER_PATHS.environmentClose,
        fn: 'closeEnvironment',
        summary: 'Close the worker environment.',
        browserSafe: true,
        destructive: true,
        call: (client) => client.closeEnvironment(),
    },
    {
        id: 'environment.destroy',
        group: 'environment',
        method: 'POST',
        path: QSERVER_PATHS.environmentDestroy,
        fn: 'destroyEnvironment',
        summary: 'Kill the worker environment, even while a plan is running.',
        browserSafe: true,
        destructive: true,
        call: (client) => client.destroyEnvironment(),
    },
    {
        id: 'environment.update',
        group: 'environment',
        method: 'POST',
        path: QSERVER_PATHS.environmentUpdate,
        fn: 'updateEnvironment',
        summary: 'Re-run startup scripts in the live environment.',
        browserSafe: true,
        sampleBody: { run_in_background: false },
        call: (client, input) => client.updateEnvironment(payloadAs<EnvironmentUpdateBody>(input)),
    },
];
