import type { QueueItem } from '@/api/qServer_new/types/queue';

/**
 * The exact console lines the simulator emits.
 *
 * These are an interface, not decoration. `src/components/QServer/QSConsole.tsx` inspects
 * console output for literal substrings — `'Processing the next queue item'`,
 * `'Starting the plan'`, `'Item added: success=True'`, `'Clearing the queue'`,
 * `'Queue is empty'`, `'The plan failed'`, `'Removing item from the queue'`,
 * `'Starting queue processing'` — and refetches the queue and history when it sees them. A
 * sim-driven UI only behaves like the real thing if these prefixes match, so they live in one
 * place with a test that drives each transition and checks the prefix it produces.
 */
export const SIM_CONSOLE = {
    // Queue control
    startingQueue: 'Starting queue processing.',
    queueEmpty: 'Queue is empty.',
    queueEmptyNothingToProcess: 'Queue is empty. Nothing to process.',
    queueStopRequested: 'Queue stop is requested.',
    queueStopped: 'Queue is stopped.',
    queueStoppedAfterFailure: 'Queue processing is stopped due to plan failure.',
    clearingQueue: 'Clearing the queue.',
    clearingHistory: 'Clearing the history.',

    // Item lifecycle
    processingNextItem: (remaining: number) =>
        `Processing the next queue item: ${remaining} plans are left in the queue.`,
    startingPlan: (name: string) => `Starting the plan: ${name}`,
    itemAdded: (item: QueueItem) =>
        `Item added: success=True item_type='${item.item_type}' name='${item.name}' ` +
        `item_uid='${item.item_uid}'`,
    removingItem: (uid: string) => `Removing item from the queue: success=True item_uid='${uid}'`,

    // Run outcomes
    planExited: (exitStatus: string) => `The plan was exited. Exit status: '${exitStatus}'.`,
    planFailed: (msg: string) => `The plan failed: ${msg}`,

    // Run engine control
    pausing: (option: string) => `Pausing the queue (option='${option}').`,
    paused: 'Run Engine is paused.',
    resuming: 'Resuming the paused plan.',

    // Environment
    openingEnvironment: 'Opening the new RE environment.',
    environmentReady: 'RE environment is ready.',
    closingEnvironment: 'Closing RE environment.',
    environmentClosed: 'RE environment is closed.',
    destroyingEnvironment: 'Destroying the RE environment.',
    environmentDestroyed: 'RE environment is destroyed.',
} as const;

/**
 * The substrings the legacy console watcher keys off.
 *
 * Exported so `consoleMessages.test.ts` can assert every one of them is reachable from some
 * sim transition — if a message is reworded and stops matching, that test fails.
 */
export const LEGACY_CONSOLE_PREFIXES = [
    'Starting queue processing',
    'Processing the next queue item',
    'Starting the plan',
    'Item added: success=True',
    'Removing item from the queue',
    'Clearing the queue',
    'Queue is empty',
    'The plan failed',
] as const;
