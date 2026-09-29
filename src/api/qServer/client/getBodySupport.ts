/**
 * Support detection and bookkeeping for the queue server's payload-bearing `GET` endpoints.
 *
 * bluesky-httpserver declares 18 operations as `GET` while reading their arguments from a
 * JSON request body (`payload: dict = {}`). `curl -X GET -d '{...}'` works, query parameters
 * are ignored by the server, and `POST` returns 405 — so the body is the only channel.
 *
 * Browsers cannot send one: `fetch` rejects a GET with a body outright and `XMLHttpRequest`
 * (axios' browser adapter) silently discards it. Most of the 18 take an *optional* payload,
 * so an empty-bodied GET is perfectly fine; only the ones needing arguments are affected.
 */

/** Endpoint ids of every operation that reads a JSON body from a `GET`. */
export const PAYLOAD_GET_ENDPOINT_IDS = [
    'status.ping',
    'status.root',
    'status.status',
    'status.config',
    'queue.get',
    'queue.itemGet',
    'history.get',
    're.metadata',
    'plansDevices.plansAllowed',
    'plansDevices.devicesAllowed',
    'plansDevices.plansExisting',
    'plansDevices.devicesExisting',
    'tasks.status',
    'tasks.result',
    'lock.info',
    'admin.testServerSleep',
    'console.output',
    'console.outputUpdate',
] as const;

export type PayloadGetEndpointId = (typeof PAYLOAD_GET_ENDPOINT_IDS)[number];

/**
 * Payload-GETs whose body is *mandatory* — a bodiless request is rejected with 422
 * (`{"loc": ["body"], "msg": "Field required"}`), verified against RE Manager v0.0.19.
 *
 * For the rest of {@link PAYLOAD_GET_ENDPOINT_IDS} the server defaults `payload` to `{}`,
 * so a browser can still call them as long as it needs no arguments.
 */
export const BODY_REQUIRED_GET_ENDPOINT_IDS: readonly string[] = [
    'tasks.status',
    'tasks.result',
    'lock.info',
    'console.outputUpdate',
];

/**
 * Endpoints that require arguments and have no browser-viable substitute at all.
 *
 * Consequence worth knowing: because task polling is unreachable from a browser, the
 * results of `executeFunction` and `uploadScript` (which return a `task_uid`) cannot be
 * collected browser-side against this server version.
 */
export const NO_BROWSER_PATH_ENDPOINT_IDS: readonly string[] = ['tasks.status', 'tasks.result'];

/** True when the server rejects a bodiless GET for this endpoint. */
export function isBodyRequired(endpointId: string): boolean {
    return BODY_REQUIRED_GET_ENDPOINT_IDS.includes(endpointId);
}

let supportOverride: boolean | null = null;

/**
 * Whether this environment can put a body on a `GET`.
 *
 * True under Node (axios' http adapter), false in a browser or jsdom. Tests can pin the
 * answer with {@link setGetBodySupportOverride}.
 */
export function canSendGetBody(): boolean {
    if (supportOverride !== null) return supportOverride;
    return typeof window === 'undefined' || typeof XMLHttpRequest === 'undefined';
}

/** Pin {@link canSendGetBody}; pass `null` to restore detection. Intended for tests. */
export function setGetBodySupportOverride(value: boolean | null): void {
    supportOverride = value;
}

const warned = new Set<string>();

/** Warn at most once per endpoint id, per session. */
export function warnGetBodyOnce(endpointId: string, message: string): void {
    if (warned.has(endpointId)) return;
    warned.add(endpointId);
    console.warn(`[qserver] ${endpointId}: ${message}`);
}

/** Clear the warn-once memory. Intended for tests. */
export function resetGetBodyWarnings(): void {
    warned.clear();
}

/** True when a payload is worth sending at all. */
export function hasPayload(payload: object | undefined): boolean {
    return !!payload && Object.keys(payload).length > 0;
}
