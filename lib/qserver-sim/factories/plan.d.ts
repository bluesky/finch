import { Parameter, Plan } from '../../../api/qServer/types/plansDevices';
export interface PlanOptions {
    name: string;
    /** Python module the plan lives in. Defaults to `'bluesky.plans'`. */
    module?: string;
    description?: string;
    /** Defaults to none — a plan with no arguments. */
    parameters?: Parameter[];
    /** Defaults to true, as it is for every real bluesky plan. */
    isGenerator?: boolean;
}
/**
 * Build an allowed-plan entry.
 *
 * ```ts
 * plan({
 *     name: 'xafs_scan',
 *     description: 'Mock XAFS scan',
 *     parameters: [
 *         parameter({ name: 'energy_start', default: '7000' }),
 *         parameter({ name: 'detector', annotation: deviceAnnotation(['I0']) }),
 *     ],
 * })
 * ```
 */
export declare function plan(options: PlanOptions): Plan;
//# sourceMappingURL=plan.d.ts.map