import { ReactNode } from '../../../../node_modules/react';
import { QServerSim } from '../core/QServerSim';
import { CreateQServerSimOptions, QServerSimScenario } from '../core/types';
import { QServerSimSocketFactory } from '../sockets/createQServerSimSocketFactory';
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
export declare function withQServerSim(scenarioOrOptions?: QServerSimScenario | Partial<CreateQServerSimOptions>, overrides?: Partial<CreateQServerSimOptions>): Decorator;
/**
 * Build the pieces the decorator wires, when a story needs direct access — for example to hand
 * `socketFactory` to `useQServerStatusSocket`, or to drive `sim.advance()` from a play function.
 *
 * ```ts
 * const { sim, client, socketFactory } = buildQServerSimStoryContext(pausedQServer);
 * ```
 */
export declare function buildQServerSimStoryContext(scenario?: QServerSimScenario, overrides?: Partial<CreateQServerSimOptions>): {
    sim: import('../core/QServerSim').QServerSimulator;
    client: import('../client/QServerSimClient').QServerSimClient;
    socketFactory: QServerSimSocketFactory;
};
export {};
//# sourceMappingURL=withQServerSim.d.ts.map