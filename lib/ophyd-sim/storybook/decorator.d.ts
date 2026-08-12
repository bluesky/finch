import { ReactNode } from '../../../../node_modules/react';
import { OphydSim } from '../core/types';
/**
 * Build a Storybook decorator that wraps stories in a shared simulator
 * provider + a transport provider. Apply globally in .storybook/preview.ts
 * or per-story for scenario-specific simulators.
 *
 * Usage:
 *   export const decorators = [withOphydSim(defaultBeamline)];
 */
export declare function withOphydSim(sim: OphydSim): (Story: () => ReactNode) => ReactNode;
//# sourceMappingURL=decorator.d.ts.map