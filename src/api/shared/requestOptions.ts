/**
 * The per-call transport contract every Finch backend shares, and the helpers that apply it.
 *
 * "Transport" means **where this one call goes and who it is** — a different server, a different key,
 * a substitute client, a cancellation signal. Nothing here changes what the endpoint returns; that is
 * what the endpoint's own arguments are for. Keeping the two apart is what lets `requestOptions` mean
 * exactly one thing across `@/api/qServer`, `@/api/tiled` and whatever comes next.
 *
 * The types below are a **contract, not a base class**. `TiledRequestOptions` is defined by
 * `@blueskyproject/tiled` and cannot extend anything of ours, so conformance is asserted at compile
 * time in each backend's `hooks/typeTests.ts` instead — see {@link ConformsToFinchHttpRequestOptions}.
 * The contract fixes the *intersection* of the backends' options types, not the union: each keeps its
 * own extras (`headers` / `query` / `axiosConfig` for the queue server, `initialPath` / `pathMode`
 * for Tiled).
 */

/**
 * Where a request goes and who it is — the universal core.
 *
 * Deliberately just these two fields, because the websocket hooks have to satisfy it too and a
 * browser `WebSocket` handshake can carry neither a substitute HTTP client nor an `AbortSignal`. HTTP
 * backends use {@link FinchHttpRequestOptions}.
 *
 * `apiKey: null` and an absent `apiKey` are **different**: `null` sends no credentials at all, while
 * omitting the field inherits whatever the client is configured with. Every backend implements that
 * distinction through {@link mergeRequestOptions}, which copies only defined keys.
 */
export interface FinchRequestOptions {
    /** Send this one call to a different server. */
    baseUrl?: string;
    /** Override the credential for this one call. `null` sends none. */
    apiKey?: string | null;
}

/**
 * The two further fields every HTTP backend supports.
 *
 * `client` is generic because the client type is genuinely backend-specific — an `AxiosInstance` for
 * the queue server, a `TiledClientLike` for Tiled — and there is no useful supertype of the two.
 */
export interface FinchHttpRequestOptions<TClient = unknown> extends FinchRequestOptions {
    /** Use this client instead of the resolved one, for this call only. */
    client?: TClient;
    /** Abort signal for this call. Composed with TanStack's, never replacing it. */
    signal?: AbortSignal;
}

/** The widest HTTP options shape, for internals that are generic over the backend. */
export type AnyFinchHttpRequestOptions = FinchHttpRequestOptions<unknown>;

/**
 * Whether `T` is a faithful implementation of {@link FinchHttpRequestOptions}.
 *
 * Three checks, because the obvious one-liner is too weak in two ways. `T extends
 * FinchHttpRequestOptions` alone is satisfied by `{}` (every field is optional, so a type that is
 * *missing* `signal` still passes) and by `{ apiKey?: string }` (a narrowed field is assignable to a
 * wider one). So this asserts, in order: every contract key is present on `T`; `T` is assignable to
 * the contract; and the contract is assignable back to `T`'s copy of those same keys — which is what
 * catches a narrowed or retyped field.
 *
 * `Extract<…, keyof T>` inside the `Pick` is load-bearing: TypeScript does not narrow `T` inside the
 * true branch of a conditional, so a bare `Pick<T, keyof FinchHttpRequestOptions<TClient>>` is an
 * error even though the outer branch already established the keys exist. `Extract` is the identity
 * here and only exists to satisfy the checker.
 *
 * Use through {@link AssertTrue}, which turns a `false` result into a compile error.
 */
export type ConformsToFinchHttpRequestOptions<
    T,
    TClient = unknown,
> = keyof FinchHttpRequestOptions<TClient> extends keyof T
    ? T extends FinchHttpRequestOptions<TClient>
        ? FinchHttpRequestOptions<TClient> extends Pick<
              T,
              Extract<keyof FinchHttpRequestOptions<TClient>, keyof T>
          >
            ? true
            : false
        : false
    : false;

/** Whether `T` satisfies the two-field core — for the websocket hooks, which cannot satisfy the rest. */
export type ConformsToFinchRequestOptions<T> = keyof FinchRequestOptions extends keyof T
    ? T extends FinchRequestOptions
        ? FinchRequestOptions extends Pick<T, Extract<keyof FinchRequestOptions, keyof T>>
            ? true
            : false
        : false
    : false;

/**
 * Fails to compile unless the argument is exactly `true`.
 *
 * The point of routing conformance through a type alias rather than an `extends` clause: a violation
 * reports as "Type 'false' does not satisfy the constraint 'true'" on the assertion line, naming the
 * type that drifted, instead of as a cascade of assignment errors at every call site.
 */
export type AssertTrue<T extends true> = T;

/**
 * Layer a caller's request options over the resolver's defaults.
 *
 * Only *defined* own keys are copied from `request`. That is what makes `{ apiKey: null }` mean "send
 * no credentials for this call" while an absent `apiKey` inherits the configured one — spreading
 * naively would let an `undefined` from a spread props object erase a perfectly good default.
 *
 * `defaults` is typed loosely on purpose: a hook's `T` may be a backend-specific extension (the queue
 * server's `GetWithBodyOptions<X>`) while the resolver's defaults are the plain options type, and
 * typing both as `T` breaks inference at those call sites.
 */
export function mergeRequestOptions<T extends AnyFinchHttpRequestOptions>(
    defaults: AnyFinchHttpRequestOptions | undefined,
    request: T | undefined,
    signal?: AbortSignal,
): T {
    const merged: Record<string, unknown> = { ...defaults };

    if (request) {
        for (const [key, value] of Object.entries(request)) {
            if (value !== undefined) merged[key] = value;
        }
    }

    const combined = combineAbortSignals(signal, request?.signal);
    if (combined) merged.signal = combined;

    return merged as T;
}

/**
 * Combine abort signals so that aborting **either** aborts the request.
 *
 * Queries get a signal from TanStack (unmount, `cancelQueries`, a superseding refetch) and the caller
 * may supply their own. Letting the caller's replace TanStack's would silently disable cancellation
 * the caller does not know they are giving up, so they compose instead.
 */
export function combineAbortSignals(
    ...signals: (AbortSignal | undefined)[]
): AbortSignal | undefined {
    const present = signals.filter((signal): signal is AbortSignal => Boolean(signal));
    if (present.length <= 1) return present[0];

    const anyOf = (AbortSignal as { any?: (signals: AbortSignal[]) => AbortSignal }).any;
    if (typeof anyOf === 'function') return anyOf(present);

    // Relay for environments without AbortSignal.any (jsdom, older Safari).
    const controller = new AbortController();
    for (const signal of present) {
        if (signal.aborted) {
            controller.abort(signal.reason);
            break;
        }
        signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
    }
    return controller.signal;
}

/**
 * Drop `undefined`-valued keys.
 *
 * TanStack's key hash treats `{}` and `{ stack: undefined }` as different strings, so leaving the
 * holes in would give two identical requests separate cache entries.
 */
export function stripUndefined<T extends object>(value: T): T {
    const result: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
        if (entry !== undefined) result[key] = entry;
    }
    return result as T;
}
