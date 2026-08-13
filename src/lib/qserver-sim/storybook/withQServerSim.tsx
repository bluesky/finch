import type { ReactNode } from 'react';
import { QServerApiProvider } from '@/api/qServerRuntime/QServerApiProvider';
import { createQServerSimClient } from '../client/QServerSimClient';
import type { QServerSim } from '../core/QServerSim';
import type { CreateQServerSimOptions, QServerSimScenario } from '../core/types';
import { QServerSimProvider } from '../react/QServerSimProvider';
import { defaultQServer } from '../scenarios/defaultQServer';
import {
    createQServerSimSocketFactory,
    type QServerSimSocketFactory,
} from '../sockets/createQServerSimSocketFactory';

type Decorator = (Story: () => ReactNode) => ReactNode;

/** What the sim decorator hands stories, alongside the providers. */
export interface QServerSimDecoratorContext {
    sim: QServerSim;
    socketFactory: QServerSimSocketFactory;
}

/**
 * Build a Storybook decorator that runs a story entirely against the simulator.
 *
 * It wires both providers: `QServerSimProvider` (so story-only controls can drive the sim) and
 * `QServerApiProvider` with a simulator-backed client *and* socket factory (so the component under
 * test uses its normal client and its normal socket hooks). Nothing leaves the page.
 *
 * ```ts
 * const meta = {
 *     title: 'Bluesky Components/QServerSimDemo',
 *     component: QServerSimDemo,
 *     decorators: [withQServerSim(defaultQServer)],
 * } satisfies Meta<typeof QServerSimDemo>;
 * ```
 *
 * Takes a **scenario function**, not a simulator, and builds one per decorator application — so
 * two stories never share mutable queue state. Pass overrides as the second argument:
 *
 * ```ts
 * decorators: [withQServerSim(runningQServer, { runDurationMs: 8000 })]
 * ```
 *
 * Give it a plain options object to use the default scenario:
 * `withQServerSim({ queue: [], runDurationMs: 500 })`.
 */
export function withQServerSim(
    scenarioOrOptions: QServerSimScenario | Partial<CreateQServerSimOptions> = defaultQServer,
    overrides: Partial<CreateQServerSimOptions> = {},
): Decorator {
    const sim =
        typeof scenarioOrOptions === 'function'
            ? scenarioOrOptions(overrides)
            : defaultQServer({ ...scenarioOrOptions, ...overrides });

    // Built once, outside the render function, so they stay stable across story re-renders.
    const client = createQServerSimClient(sim);
    const socketFactory = createQServerSimSocketFactory(sim);

    return function QServerSimDecorator(Story) {
        return (
            <QServerSimProvider sim={sim}>
                <QServerApiProvider client={client} socketFactory={socketFactory}>
                    <Story />
                </QServerApiProvider>
            </QServerSimProvider>
        );
    };
}

/**
 * Build the pieces the decorator wires, when a story needs direct access — for example to hand
 * `socketFactory` to `useQServerStatusSocket`, or to drive `sim.advance()` from a play function.
 *
 * ```ts
 * const { sim, client, socketFactory } = buildQServerSimStoryContext(pausedQServer);
 * ```
 */
export function buildQServerSimStoryContext(
    scenario: QServerSimScenario = defaultQServer,
    overrides: Partial<CreateQServerSimOptions> = {},
) {
    const sim = scenario(overrides);
    return {
        sim,
        client: createQServerSimClient(sim),
        socketFactory: createQServerSimSocketFactory(sim),
    };
}
