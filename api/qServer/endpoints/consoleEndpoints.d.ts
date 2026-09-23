import { GetWithBodyOptions, QServerRequestOptions } from '../types/common';
import { ConsoleOutputBody, ConsoleOutputUpdateBody, GetConsoleOutputResponse, GetConsoleOutputUidResponse, GetConsoleOutputUpdateResponse } from '../types/console';
import { QServerEndpointDescriptor } from '../types/registry';
/**
 * Polling counterparts to the console websocket.
 *
 * For live output prefer `useQServerConsoleSocket`; these exist for one-shot reads and for
 * environments where a websocket is not available.
 */
export interface QServerConsoleEndpoints {
    /** `GET /api/console_output` — the last `nlines` of console text. */
    getConsoleOutput(payload?: ConsoleOutputBody, options?: GetWithBodyOptions<GetConsoleOutputResponse>): Promise<GetConsoleOutputResponse>;
    /** `GET /api/console_output/uid` — uid of the most recent console message. */
    getConsoleOutputUID(options?: QServerRequestOptions): Promise<GetConsoleOutputUidResponse>;
    /**
     * `GET /api/console_output_update` — messages newer than `last_msg_uid`.
     *
     * Requires a request body, so browsers get a synthesized response built from
     * `getConsoleOutput` + `getConsoleOutputUID` instead.
     */
    getConsoleOutputUpdate(payload?: ConsoleOutputUpdateBody, options?: GetWithBodyOptions<GetConsoleOutputUpdateResponse>): Promise<GetConsoleOutputUpdateResponse>;
    /** `GET /api/stream_console_output` — a never-ending text stream of console output. */
    streamConsoleOutput(options?: QServerRequestOptions): Promise<string>;
}
export declare const consoleEndpointDescriptors: QServerEndpointDescriptor[];
//# sourceMappingURL=consoleEndpoints.d.ts.map