import type { QServerEndpoints } from '../types/clientSurface';

/**
 * Thrown when a hook's endpoint is missing from the client injected via `QServerApiProvider`.
 *
 * `QServerClientLike` — the type the provider accepts — covers 44 of the queue server's 70
 * operations, because that is what the simulator implements. The other 26 (auth, permissions,
 * admin, function/script execution, spreadsheet upload, the streaming console, and a handful of
 * others) are only available on a full `QServerApiClient`.
 *
 * The alternative would be to silently fall through to the app-wide default client, which in a
 * Storybook story or a test would mean an unexpected real network request. Failing loudly is the
 * point: the hook rejects and the error surfaces in `error`, exactly like a 4xx would.
 */
export class QServerEndpointUnavailableError extends Error {
    readonly name = 'QServerEndpointUnavailableError';
    readonly method: keyof QServerEndpoints;
    readonly reason = 'not-on-injected-client';

    constructor(method: keyof QServerEndpoints) {
        super(
            `${String(method)}() is not available on the client injected via <QServerApiProvider>. ` +
                'QServerClientLike covers 44 of the 70 queue-server operations; auth, permissions, ' +
                'admin, function/script execution, spreadsheet upload and the streaming console are ' +
                'excluded. Provide a full QServerApiClient, or remove the provider to use the ' +
                'app-wide default client.',
        );
        this.method = method;
        // Restore the prototype chain so `instanceof` survives TS downlevelling.
        Object.setPrototypeOf(this, QServerEndpointUnavailableError.prototype);
    }
}

export function isQServerEndpointUnavailableError(
    error: unknown,
): error is QServerEndpointUnavailableError {
    return error instanceof QServerEndpointUnavailableError;
}
