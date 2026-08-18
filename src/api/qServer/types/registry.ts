import type { QServerApiClient } from '../client/QServerApiClient';
import type { QServerHttpMethod } from './errors';

/** Domain groupings used by the registry, the docs and the manual test harness. */
export type QServerEndpointGroup =
    | 'status'
    | 'queue'
    | 'history'
    | 'environment'
    | 'runEngine'
    | 'plansDevices'
    | 'permissions'
    | 'functionsScripts'
    | 'tasks'
    | 'lock'
    | 'console'
    | 'admin'
    | 'auth';

export interface QServerEndpointParam {
    name: string;
    in: 'path' | 'query';
    required: boolean;
    description?: string;
}

/** Everything a caller needs to supply to invoke an arbitrary endpoint generically. */
export interface QServerEndpointInvocation {
    payload?: Record<string, unknown>;
    /** Path and query parameter values, keyed by parameter name. */
    params?: Record<string, string>;
    /** For the one multipart endpoint. */
    file?: File | null;
}

/**
 * Read a generic invocation's payload as a specific body type.
 *
 * The harness hands over free-form JSON that a human typed, so this is an assertion by
 * construction; the server performs the real validation and answers 422 when it is wrong.
 */
export function payloadAs<T>(input: QServerEndpointInvocation): T {
    return (input.payload ?? {}) as T;
}

/**
 * Machine-readable description of a single operation.
 *
 * The registry exists so that generic consumers — the manual test harness, docs, and the
 * coverage test that diffs the registry against `openapi.json` — can enumerate the API
 * without hand-maintained lists. `call` carries the invocation itself, which keeps
 * heterogeneous method signatures out of the harness.
 */
export interface QServerEndpointDescriptor {
    /** Stable id, `<group>.<name>`, e.g. `'queue.itemAdd'`. */
    id: string;
    group: QServerEndpointGroup;
    method: QServerHttpMethod;
    /** Spec path, including `{placeholder}` segments. */
    path: string;
    /** Name of the corresponding `QServerApiClient` method. */
    fn: string;
    summary: string;
    /** A `GET` that reads arguments from a JSON request body. */
    payloadGet?: boolean;
    /** Rejects a bodiless GET with 422, so browsers cannot call it at all. */
    bodyRequired?: boolean;
    /** False when the endpoint cannot work from a browser under any strategy. */
    browserSafe: boolean;
    /** A browser fallback is wired up for this endpoint. */
    hasFallback?: boolean;
    /** Changes server state in a way a tester should confirm first. */
    destructive?: boolean;
    multipart?: boolean;
    /** Returns a streaming/plain-text body rather than JSON. */
    streaming?: boolean;
    params?: QServerEndpointParam[];
    /** Prefilled body for the manual test harness. */
    sampleBody?: Record<string, unknown>;
    /** Invoke this endpoint on a client. */
    call: (client: QServerApiClient, input: QServerEndpointInvocation) => Promise<unknown>;
}
