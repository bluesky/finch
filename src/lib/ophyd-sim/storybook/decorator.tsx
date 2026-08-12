import type { ReactNode } from 'react';
import type { OphydSim } from '../core/types';
import { OphydSimProvider } from '../react/OphydSimProvider';
import { OphydTransportProvider } from '@/api/ophyd/OphydTransportProvider';
import { createOphydSimTransport } from '../transport/createOphydSimTransport';

/**
 * Build a Storybook decorator that wraps stories in a shared simulator
 * provider + a transport provider. Apply globally in .storybook/preview.ts
 * or per-story for scenario-specific simulators.
 *
 * Usage:
 *   export const decorators = [withOphydSim(defaultBeamline)];
 */
export function withOphydSim(sim: OphydSim) {
    const transport = createOphydSimTransport(sim);
    return function OphydSimDecorator(Story: () => ReactNode): ReactNode {
        return (
            <OphydSimProvider sim={sim}>
                <OphydTransportProvider transport={transport}>
                    <Story />
                </OphydTransportProvider>
            </OphydSimProvider>
        );
    };
}
