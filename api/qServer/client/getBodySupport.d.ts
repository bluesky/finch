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
export declare const PAYLOAD_GET_ENDPOINT_IDS: readonly ["status.ping", "status.root", "status.status", "status.config", "queue.get", "queue.itemGet", "history.get", "re.metadata", "plansDevices.plansAllowed", "plansDevices.devicesAllowed", "plansDevices.plansExisting", "plansDevices.devicesExisting", "tasks.status", "tasks.result", "lock.info", "admin.testServerSleep", "console.output", "console.outputUpdate"];
export type PayloadGetEndpointId = (typeof PAYLOAD_GET_ENDPOINT_IDS)[number];
/**
 * Payload-GETs whose body is *mandatory* — a bodiless request is rejected with 422
 * (`{"loc": ["body"], "msg": "Field required"}`), verified against RE Manager v0.0.19.
 *
 * For the rest of {@link PAYLOAD_GET_ENDPOINT_IDS} the server defaults `payload` to `{}`,
 * so a browser can still call them as long as it needs no arguments.
 */
export declare const BODY_REQUIRED_GET_ENDPOINT_IDS: readonly string[];
/**
 * Endpoints that require arguments and have no browser-viable substitute at all.
 *
 * Consequence worth knowing: because task polling is unreachable from a browser, the
 * results of `executeFunction` and `uploadScript` (which return a `task_uid`) cannot be
 * collected browser-side against this server version.
 */
export declare const NO_BROWSER_PATH_ENDPOINT_IDS: readonly string[];
/** True when the server rejects a bodiless GET for this endpoint. */
export declare function isBodyRequired(endpointId: string): boolean;
/**
 * Whether this environment can put a body on a `GET`.
 *
 * True under Node (axios' http adapter), false in a browser or jsdom. Tests can pin the
 * answer with {@link setGetBodySupportOverride}.
 */
export declare function canSendGetBody(): boolean;
/** Pin {@link canSendGetBody}; pass `null` to restore detection. Intended for tests. */
export declare function setGetBodySupportOverride(value: boolean | null): void;
/** Warn at most once per endpoint id, per session. */
export declare function warnGetBodyOnce(endpointId: string, message: string): void;
/** Clear the warn-once memory. Intended for tests. */
export declare function resetGetBodyWarnings(): void;
/** True when a payload is worth sending at all. */
export declare function hasPayload(payload: object | undefined): boolean;
//# sourceMappingURL=getBodySupport.d.ts.map