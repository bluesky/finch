/**
 * Identifier generation for the simulator.
 *
 * The default is a deterministic per-prefix counter rather than a uuid, because tests assert
 * on returned identifiers constantly (`expect(item.item_uid).toBe('sim-item-1')`) and random
 * uuids make Storybook churn on every reload. Pass `newUid` to `createQServerSim` to change it.
 */
/** Prefixes the sim mints identifiers for. Not exhaustive — any string works. */
export type SimUidPrefix = 'item' | 'run' | 'task' | 'queue-uid' | 'history-uid' | 'runlist-uid' | 'taskresults-uid' | 'lock-uid' | 'plans-uid' | 'devices-uid' | 'console-uid';
export type SimUidFactory = (prefix: string) => string;
/**
 * `sim-item-1`, `sim-item-2`, … with an independent counter per prefix.
 *
 * Readable in failing-test diffs: a uid bump shows up as `sim-queue-uid-1` → `sim-queue-uid-2`.
 */
export declare function createCounterUidFactory(): SimUidFactory;
/**
 * Uuid-shaped identifiers, for stories where the shape matters — some UI slices a uid to
 * show a short form, which looks odd with counter uids.
 *
 * Uses `crypto.randomUUID` when available, otherwise builds a v4-shaped string from the
 * injected random source (so it stays deterministic when one is supplied).
 */
export declare function createUuidUidFactory(random?: () => number): SimUidFactory;
//# sourceMappingURL=uid.d.ts.map