import type { TiledClientLikeMethod } from '../runtime/clientLike';

/**
 * Thrown when a hook's method is missing from the client injected via `TiledApiProvider`.
 *
 * `TiledClientLike` is a `Pick` of `TiledApiClient`, so a real client always satisfies it — this only
 * fires for a hand-written stub or fake that implements part of the surface.
 *
 * The alternative would be to silently fall through to the package's default client, which in a
 * Storybook story or a test would mean an unexpected real network request. Failing loudly is the
 * point: thrown inside `queryFn`/`mutationFn`, so it surfaces in `error` exactly like a 4xx would,
 * and never crashes a render.
 */
export class TiledEndpointUnavailableError extends Error {
    readonly name = 'TiledEndpointUnavailableError';
    readonly method: TiledClientLikeMethod;
    readonly reason = 'not-on-injected-client';

    constructor(method: TiledClientLikeMethod) {
        super(
            `${method}() is not available on the client injected via <TiledApiProvider>. ` +
                'Provide a client implementing the whole TiledClientLike surface (a real ' +
                'TiledApiClient does), or remove the provider to use the package default client.',
        );
        this.method = method;
        // Restore the prototype chain so `instanceof` survives TS downlevelling.
        Object.setPrototypeOf(this, TiledEndpointUnavailableError.prototype);
    }
}

export function isTiledEndpointUnavailableError(
    error: unknown,
): error is TiledEndpointUnavailableError {
    return error instanceof TiledEndpointUnavailableError;
}
