/**
 * qserver-sim — a browser-side Bluesky queue-server simulator.
 *
 * Import everything from the package root:
 *
 * ```ts
 * import { defaultQServer, createQServerSimClient, plan, device } from '@/lib/qserver-sim';
 * ```
 *
 * See `README.md` for usage and `skills.md` for internals. The dependency direction is one-way:
 * this package imports from `@/api/qServer`, never the reverse.
 */

// Core
export { createQServerSim, QServerSimulator } from './core/QServerSim';
export type { QServerSim } from './core/QServerSim';
export { SimScheduler } from './core/scheduler';
export { SimEmitter } from './core/events';
export { deriveStatus, STATUS_KEYS } from './core/status';
export { SIM_CONSOLE, LEGACY_CONSOLE_PREFIXES } from './core/consoleMessages';
export { createCounterUidFactory, createUuidUidFactory } from './core/uid';
export type { SimUidFactory, SimUidPrefix } from './core/uid';
export type {
    CreateQServerSimOptions,
    QServerSimBehaviorOptions,
    QServerSimScenario,
    QServerSimState,
    QServerSimUids,
    ResolvedBehavior,
    SimConsoleMessage,
    SimDelay,
    SimEnvironmentState,
    SimExitStatus,
    SimManagerState,
    SimReState,
    SimRunOrigin,
    SimRunningSeed,
    SimRunningSlot,
    SimTask,
    TickContext,
    TickHandler,
    Unsubscribe,
} from './core/types';

// Factories
export { plan } from './factories/plan';
export type { PlanOptions } from './factories/plan';
export { device, component } from './factories/device';
export type { DeviceKind, DeviceOptions } from './factories/device';
export {
    parameter,
    deviceAnnotation,
    deviceListAnnotation,
    PARAMETER_KINDS,
} from './factories/parameter';
export type { ParameterKindName, ParameterOptions } from './factories/parameter';
export { queueItem, historyItem } from './factories/queueItem';
export type { HistoryItemOptions, QueueItemOptions } from './factories/queueItem';

// Fixtures
export { defaultPlans, countPlan, scanPlan, gridScanPlan } from './fixtures/defaultPlans';
export {
    defaultDevices,
    detDevice,
    det1Device,
    det2Device,
    motorDevice,
    motor1Device,
    motor2Device,
} from './fixtures/defaultDevices';
export { defaultQueue } from './fixtures/defaultQueue';
export { defaultHistory, failedHistoryItem } from './fixtures/defaultHistory';

// Scenarios
export {
    defaultQServer,
    createDefaultQServerSim,
    BASE_SCENARIO_OPTIONS,
} from './scenarios/defaultQServer';
export { emptyQServer } from './scenarios/emptyQServer';
export { runningQServer } from './scenarios/runningQServer';
export { pausedQServer } from './scenarios/pausedQServer';
export { errorQServer } from './scenarios/errorQServer';

// Client seams
export { createQServerSimClient } from './client/QServerSimClient';
export type { QServerSimClient } from './client/QServerSimClient';
export { createQServerSimAdapter } from './client/QServerSimAdapter';
export type { QServerSimAdapterOptions } from './client/QServerSimAdapter';
export { handleRequest, normalizePath } from './client/handleRequest';
export { SIM_ROUTES, SIM_SUPPORTED_ENDPOINT_IDS } from './client/routes';
export type { SimRequest, SimResponse, SimRoute } from './client/routes';

// Sockets
export { createQServerSimSocketFactory } from './sockets/createQServerSimSocketFactory';
export type {
    QServerSimSocketFactory,
    QServerSimSocketFactoryOptions,
} from './sockets/createQServerSimSocketFactory';

// React
export {
    QServerSimProvider,
    QServerSimContext,
    useQServerSim,
    useQServerSimOptional,
    useQServerSimStatus,
    useQServerSimState,
} from './react';
export type { QServerSimProviderProps } from './react';

// Storybook
export { withQServerSim, buildQServerSimStoryContext } from './storybook/withQServerSim';
export type { QServerSimDecoratorContext } from './storybook/withQServerSim';
