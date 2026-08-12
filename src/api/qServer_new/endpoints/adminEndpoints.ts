import type {
    AdminResponse,
    KernelInterruptBody,
    ManagerStopBody,
    TestServerSleepBody,
} from '../types/admin';
import type { GetWithBodyOptions, QServerRequestOptions } from '../types/common';
import { QSERVER_PATHS } from '../types/paths';
import { payloadAs, type QServerEndpointDescriptor } from '../types/registry';

export interface QServerAdminEndpoints {
    /** `POST /api/kernel/interrupt` — send a KeyboardInterrupt to the IPython kernel. */
    interruptKernel(
        body?: KernelInterruptBody,
        options?: QServerRequestOptions,
    ): Promise<AdminResponse>;
    /** `POST /api/manager/stop` — shut RE Manager down. */
    stopManager(body?: ManagerStopBody, options?: QServerRequestOptions): Promise<AdminResponse>;
    /** `POST /api/test/manager/kill` — kill RE Manager to exercise recovery. Test only. */
    testKillManager(options?: QServerRequestOptions): Promise<AdminResponse>;
    /** `GET /api/test/server/sleep` — delay a response, to exercise timeouts. Test only. */
    testServerSleep(
        payload?: TestServerSleepBody,
        options?: GetWithBodyOptions<AdminResponse>,
    ): Promise<AdminResponse>;
}

export const adminEndpointDescriptors: QServerEndpointDescriptor[] = [
    {
        id: 'admin.kernelInterrupt',
        group: 'admin',
        method: 'POST',
        path: QSERVER_PATHS.kernelInterrupt,
        fn: 'interruptKernel',
        summary: 'Interrupt the IPython kernel.',
        browserSafe: true,
        destructive: true,
        sampleBody: { interrupt_task: true, interrupt_plan: false },
        call: (client, input) => client.interruptKernel(payloadAs<KernelInterruptBody>(input)),
    },
    {
        id: 'admin.managerStop',
        group: 'admin',
        method: 'POST',
        path: QSERVER_PATHS.managerStop,
        fn: 'stopManager',
        summary: 'Stop RE Manager.',
        browserSafe: true,
        destructive: true,
        sampleBody: { option: 'safe_on' },
        call: (client, input) => client.stopManager(payloadAs<ManagerStopBody>(input)),
    },
    {
        id: 'admin.testManagerKill',
        group: 'admin',
        method: 'POST',
        path: QSERVER_PATHS.testManagerKill,
        fn: 'testKillManager',
        summary: 'Kill RE Manager to exercise recovery (test endpoint).',
        browserSafe: true,
        destructive: true,
        call: (client) => client.testKillManager(),
    },
    {
        id: 'admin.testServerSleep',
        group: 'admin',
        method: 'GET',
        path: QSERVER_PATHS.testServerSleep,
        fn: 'testServerSleep',
        summary: 'Delay a response by N seconds (test endpoint).',
        payloadGet: true,
        browserSafe: true,
        sampleBody: { time: 1 },
        call: (client, input) => client.testServerSleep(payloadAs<TestServerSleepBody>(input)),
    },
];
