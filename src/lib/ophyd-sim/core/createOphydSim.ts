import { DependencyGraph } from './dependencyGraph';
import { Scheduler } from './scheduler';
import { SimState } from './state';
import type {
    CreateOphydSimOptions,
    OphydSim,
    PVMetadata,
    SimListener,
    SimRegistration,
    SimValue,
    SimValueContext,
    SimValueFn,
    TickHandler,
    Unsubscribe,
} from './types';

const DEFAULT_TICK_MS = 100;

/**
 * Build a simulator instance. Wires up shared state, a dependency graph for
 * derived signals, and a tick scheduler for periodic/motor updates. Devices
 * register themselves via the factory functions passed in `options.devices`.
 *
 * The simulator does not start ticking until `start()` is called — typically
 * by OphydSimProvider on mount.
 */
export function createOphydSim(options: CreateOphydSimOptions): OphydSim {
    const now = options.now ?? Date.now;
    const random = options.random ?? Math.random;
    const state = new SimState(now);
    const graph = new DependencyGraph();
    const scheduler = new Scheduler(options.tickMs ?? DEFAULT_TICK_MS, now);

    const setHandlers = new Map<string, Set<(value: SimValue) => void>>();
    const recomputeFns = new Map<string, () => void>();

    const buildContext = (dt: number, time: number): SimValueContext => ({
        time,
        dt,
        random,
        get: {
            value: (n) => state.get(n),
            number: (n) => {
                const v = state.get(n);
                return typeof v === 'number' ? v : Number(v ?? 0);
            },
            boolean: (n) => {
                const v = state.get(n);
                return typeof v === 'boolean' ? v : Boolean(v);
            },
            string: (n) => {
                const v = state.get(n);
                return v === undefined ? '' : String(v);
            },
        },
    });

    // `set` cascades: write value → notify subscribers → call onSet handlers →
    // recompute downstream derived signals in topological order. Recomputation
    // is best-effort: a derived signal that throws logs and is skipped.
    const setValue = (name: string, value: SimValue): void => {
        const changed = state.set(name, value);
        if (!changed) return;

        const handlers = setHandlers.get(name);
        if (handlers) {
            for (const h of handlers) {
                try {
                    h(value);
                } catch (err) {
                    console.error(`[ophyd-sim] onSet handler for "${name}" threw:`, err);
                }
            }
        }

        for (const dependent of graph.dependentsOf(name)) {
            const fn = recomputeFns.get(dependent);
            if (fn) {
                try {
                    fn();
                } catch (err) {
                    console.error(`[ophyd-sim] recompute for "${dependent}" threw:`, err);
                }
            }
        }
    };

    const registration: SimRegistration = {
        seed(name, value, metadata) {
            state.seed(name, value, metadata);
        },
        setMetadata(name, metadata) {
            state.setMetadata(name, metadata);
        },
        registerDerived(name: string, dependsOn: string[], compute: SimValueFn) {
            graph.register(name, dependsOn);
            const recompute = (): void => {
                const ctx = buildContext(0, now());
                const next = compute(ctx);
                setValue(name, next);
            };
            recomputeFns.set(name, recompute);
            // Seed initial value from compute() so dependents have something
            // to read on first subscribe. Compute may legitimately read
            // dependencies that aren't seeded yet — guard inside compute.
            try {
                const ctx = buildContext(0, now());
                state.seed(name, compute(ctx));
            } catch (err) {
                console.error(
                    `[ophyd-sim] initial compute for "${name}" failed (will retry on dep change):`,
                    err,
                );
            }
        },
        onTick(handler: TickHandler): Unsubscribe {
            return scheduler.onTick(handler);
        },
        onSet(name, handler) {
            let set = setHandlers.get(name);
            if (!set) {
                set = new Set();
                setHandlers.set(name, set);
            }
            set.add(handler);
            return () => set!.delete(handler);
        },
        get(name) {
            return state.get(name);
        },
        set: setValue,
        metadata(name) {
            return state.metadata(name);
        },
        random,
        now,
        context: buildContext,
    };

    for (const factory of options.devices) {
        factory(registration);
    }

    const sim: OphydSim = {
        subscribe(name, listener: SimListener) {
            return state.subscribe(name, listener);
        },
        set: setValue,
        get(name) {
            return state.get(name);
        },
        metadata(name): PVMetadata | undefined {
            return state.metadata(name);
        },
        names() {
            return state.names();
        },
        start() {
            scheduler.start();
        },
        stop() {
            scheduler.stop();
        },
        advance(deltaMs) {
            scheduler.advance(deltaMs);
        },
    };

    return sim;
}
