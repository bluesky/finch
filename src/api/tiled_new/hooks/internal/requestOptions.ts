import type { TiledRequestOptions } from '../../types/common';

/**
 * Layer a caller's request options over the resolver's defaults.
 *
 * Only *defined* own keys are copied from `request`, which is what lets `{ apiKey: null }` send no
 * credentials for one call while an absent `apiKey` inherits the configured one.
 */
export function mergeRequestOptions<T extends TiledRequestOptions>(
    defaults: TiledRequestOptions | undefined,
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
