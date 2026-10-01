import type { ComponentType } from 'react';
import type { TiledEndpointGroup, TiledRequestOptions } from '@/api/tiled';

/**
 * The shape of the query catalog.
 *
 * One descriptor per `useTiled…Query` hook. The descriptor is data — a label, a field list, a
 * result kind — except for `Runner`, which has to be a component, because **a hook cannot be called
 * dynamically**. `catalog[selected].hook(...args)` is illegal: React identifies hooks by call order
 * within a component, so the call site has to be fixed. Each Runner is a component created once at
 * module scope that calls exactly one hook.
 *
 * Runners render their own result panel rather than reporting state upward through a callback. An
 * effect lifting hook state to a parent would add a render cascade and a frame of lag to every
 * status change, in a tool whose entire job is showing status changes accurately.
 */

/** The kinds of input a query argument can be, and therefore the control that edits it. */
export type QueryFieldKind =
    | 'path'
    | 'text'
    | 'number'
    | 'boolean'
    | 'enum'
    | 'stringList'
    | 'numberList'
    | 'json';

export interface QueryFieldSpec {
    /** Key into the values record, and the hook argument it feeds. */
    name: string;
    kind: QueryFieldKind;
    label: string;
    /** Shown beside the label. Say what the server does with it, not what the type is. */
    description?: string;
    /** Options for `kind: 'enum'`. */
    enums?: readonly string[];
    /** Prefilled when the query is first opened. */
    defaultValue?: unknown;
    /** Rendered with a marker. Does not block running — the server's rejection is informative. */
    required?: boolean;
}

/**
 * What `data` is, so the result panel picks a renderer rather than stringifying bytes.
 *
 * `'url'` is `useTiledArrayImagePath`, which is not a query at all — it is synchronous and returns
 * a string. It is in the catalog because it is part of the array-reading surface and people look
 * for it here.
 */
export type QueryResultKind = 'json' | 'text' | 'image' | 'bytes' | 'url';

/**
 * The TanStack options the playground's controls produce.
 *
 * Deliberately only these three, and deliberately *not* `FinchQueryOptions<…>` — that type is
 * parameterised by each hook's response and key types, so a single value could not be passed to all
 * 41 without a cast. These three exist on every hook's options with compatible types, so this is
 * assignable to each of them as-is and every Runner stays cast-free in the slot that matters.
 */
export interface PlaygroundQueryOptions {
    enabled?: boolean;
    staleTime?: number;
    refetchInterval?: number | false;
}

/** What every Runner receives. */
export interface QueryRunnerProps {
    /** Current field values, keyed by `QueryFieldSpec.name`. */
    values: Record<string, unknown>;
    /** `enabled`, `staleTime`, `refetchInterval` from the per-query controls. */
    queryOptions: PlaygroundQueryOptions;
    /** Normally empty — the connection bar binds through `TiledApiProvider` instead. */
    requestOptions?: TiledRequestOptions;
}

export interface QueryDescriptor {
    /** Stable id, `<group>.<name>` — matches the endpoint registry's convention. */
    id: string;
    /** The registry's groups, so both harnesses order and name things identically. */
    group: TiledEndpointGroup;
    /** The exported hook this runs, shown in the UI and checked by the coverage test. */
    hookName: string;
    summary: string;
    fields: readonly QueryFieldSpec[];
    /**
     * Field names the hook idles on.
     *
     * Shown as "idle — guarded by `path`" rather than as a loading spinner. A guarded query reads
     * `status: 'pending'` with `fetchStatus: 'idle'`; conflating the two is why an idled hook looks
     * broken.
     */
    guardedBy?: readonly string[];
    resultKind: QueryResultKind;
    Runner: ComponentType<QueryRunnerProps>;
}

/** Read a field value with a fallback, for the Runners. */
export function str(values: Record<string, unknown>, name: string, fallback = ''): string {
    const value = values[name];
    return typeof value === 'string' ? value : fallback;
}

export function num(values: Record<string, unknown>, name: string, fallback = 0): number {
    const value = values[name];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

export function bool(values: Record<string, unknown>, name: string): boolean {
    return values[name] === true;
}

/** A list field, or `undefined` when empty — which is what "no selection" means to the hooks. */
export function list(values: Record<string, unknown>, name: string): string[] | undefined {
    const value = values[name];
    if (!Array.isArray(value) || value.length === 0) return undefined;
    return value.map(String);
}

export function numList(values: Record<string, unknown>, name: string): number[] | undefined {
    const value = values[name];
    if (!Array.isArray(value) || value.length === 0) return undefined;
    return value.map(Number).filter((entry) => Number.isFinite(entry));
}

/**
 * A JSON field, already parsed by the editor.
 *
 * The editor keeps the last valid parse and surfaces a parse error inline, so a Runner never has to
 * deal with half-typed JSON — a hook re-running on every keystroke of a malformed object would
 * issue a request per character.
 */
export function json<T>(values: Record<string, unknown>, name: string): T | undefined {
    const value = values[name];
    return value === undefined || value === null ? undefined : (value as T);
}

/** Initial values for a descriptor, from its field defaults. */
export function defaultValues(descriptor: QueryDescriptor): Record<string, unknown> {
    const values: Record<string, unknown> = {};
    for (const field of descriptor.fields) {
        if (field.defaultValue !== undefined) values[field.name] = field.defaultValue;
    }
    return values;
}
