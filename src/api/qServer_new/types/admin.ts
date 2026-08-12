import type { QServerSuccessResponse } from './common';

export interface ManagerStopBody {
    /** `'safe_on'` (default) refuses to stop while the queue is running. */
    option?: 'safe_on' | 'safe_off';
}

export interface KernelInterruptBody {
    /** Interrupt a running background task. */
    interrupt_task?: boolean;
    /** Interrupt a running plan. */
    interrupt_plan?: boolean;
    lock_key?: string;
}

export interface TestServerSleepBody {
    /** Seconds the server should sleep before responding. */
    time?: number;
}

export type AdminResponse = QServerSuccessResponse;
