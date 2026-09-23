import { AdminResponse, KernelInterruptBody, ManagerStopBody, TestServerSleepBody } from '../types/admin';
import { GetWithBodyOptions, QServerRequestOptions } from '../types/common';
import { QServerEndpointDescriptor } from '../types/registry';
export interface QServerAdminEndpoints {
    /** `POST /api/kernel/interrupt` — send a KeyboardInterrupt to the IPython kernel. */
    interruptKernel(body?: KernelInterruptBody, options?: QServerRequestOptions): Promise<AdminResponse>;
    /** `POST /api/manager/stop` — shut RE Manager down. */
    stopManager(body?: ManagerStopBody, options?: QServerRequestOptions): Promise<AdminResponse>;
    /** `POST /api/test/manager/kill` — kill RE Manager to exercise recovery. Test only. */
    testKillManager(options?: QServerRequestOptions): Promise<AdminResponse>;
    /** `GET /api/test/server/sleep` — delay a response, to exercise timeouts. Test only. */
    testServerSleep(payload?: TestServerSleepBody, options?: GetWithBodyOptions<AdminResponse>): Promise<AdminResponse>;
}
export declare const adminEndpointDescriptors: QServerEndpointDescriptor[];
//# sourceMappingURL=adminEndpoints.d.ts.map