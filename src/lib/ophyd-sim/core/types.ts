export type SimValue = string | number | boolean;

export interface PVMetadata {
    units?: string;
    lower_ctrl_limit?: number | null;
    upper_ctrl_limit?: number | null;
    precision?: number;
    enum_strs?: string[] | null;
    write_access?: boolean;
    read_access?: boolean;
}

export interface SimEvent {
    name: string;
    value: SimValue;
    timestamp: number;
}

export type SimListener = (event: SimEvent) => void;
export type Unsubscribe = () => void;

export interface SimValueContext {
    get: {
        value(name: string): SimValue | undefined;
        number(name: string): number;
        boolean(name: string): boolean;
        string(name: string): string;
    };
    time: number;
    dt: number;
    random: () => number;
}

export type SimValueFn = (ctx: SimValueContext) => SimValue;

export interface TickHandlerContext {
    time: number;
    dt: number;
}

export type TickHandler = (ctx: TickHandlerContext) => void;

/**
 * Internal handle a device factory uses to wire itself into the simulator.
 *
 * The factory receives this from `createOphydSim` at registration time and is
 * free to seed initial state, declare derived signals, and register tick or
 * set handlers. Devices do not see other devices directly — they read shared
 * state via the same `get`/`set` API user code uses.
 */
export interface SimRegistration {
    seed(name: string, value: SimValue, metadata?: PVMetadata): void;
    setMetadata(name: string, metadata: PVMetadata): void;
    /**
     * Declare a derived signal. `compute` is invoked with a value context any
     * time one of `dependsOn` changes (and once at registration time to seed
     * the initial value).
     */
    registerDerived(name: string, dependsOn: string[], compute: SimValueFn): void;
    onTick(handler: TickHandler): Unsubscribe;
    onSet(name: string, handler: (value: SimValue) => void): Unsubscribe;
    get(name: string): SimValue | undefined;
    set(name: string, value: SimValue): void;
    metadata(name: string): PVMetadata | undefined;
    random(): number;
    now(): number;
    /** Build a SimValueContext for use in tick callbacks. */
    context(dt: number, time: number): SimValueContext;
}

export type DeviceFactory = (registration: SimRegistration) => void;

export interface OphydSim {
    /** Subscribe to value updates for a PV. Replays the latest value synchronously if known. */
    subscribe(name: string, listener: SimListener): Unsubscribe;
    /** Write to a PV. Triggers dependent recomputation and notifies subscribers if value changed. */
    set(name: string, value: SimValue): void;
    /** Read the latest value for a PV. */
    get(name: string): SimValue | undefined;
    /** Read metadata (units, limits, access) for a PV if known. */
    metadata(name: string): PVMetadata | undefined;
    /** Names of every PV currently registered. */
    names(): string[];
    /** Begin the tick loop. Idempotent. */
    start(): void;
    /** Stop the tick loop. Idempotent. */
    stop(): void;
    /**
     * Run a single synthetic tick of `deltaMs`. Useful in tests to drive
     * motor motion and periodic recompute without spinning the real loop.
     */
    advance(deltaMs: number): void;
}

export interface CreateOphydSimOptions {
    devices: DeviceFactory[];
    /** Global tick interval in ms. Defaults to ~33ms (≈30 Hz). */
    tickMs?: number;
    /** Random source. Defaults to Math.random. Override for deterministic tests. */
    random?: () => number;
    /** Override the clock. Defaults to Date.now. */
    now?: () => number;
}
