/**
 * Error types shared by every Finch backend's hooks.
 *
 * The rule these follow: a hook **rejects**, it does not throw during render. Everything here is
 * raised inside a `queryFn` or `mutationFn`, so it lands in `error` exactly like a 4xx would and a
 * caller handles all failures in one place.
 */

/**
 * How every Finch hook rejects.
 *
 * Plain `Error` rather than a per-backend error class, because a single hook can reject with any of
 * several unrelated things: an API error from the server, a transport error from axios, a DOM
 * `AbortError` on unmount, a {@link FinchMissingArgumentError}, or a backend's
 * `EndpointUnavailableError` for an injected client that does not implement the method. Narrowing to
 * one class would force a cast at every one of those. Use the backends' `isX` guards to discriminate.
 */
export type FinchHookError = Error;

/**
 * A hook whose argument is positionally required was called with `undefined` **and** told to run
 * anyway.
 *
 * Those hooks idle while the argument is missing — that is what the `arg: T | undefined` signature is
 * for. Passing `queryOptions.enabled: true` overrides the guard, and without this error the hook would
 * send a request with `undefined` where the server expects an identifier. Failing loudly beats a 422
 * whose cause is three layers away.
 */
export class FinchMissingArgumentError extends Error {
    readonly name = 'FinchMissingArgumentError';
    /** The hook that was called. */
    readonly hook: string;
    /** The parameter that was missing. */
    readonly argument: string;

    constructor(hook: string, argument: string) {
        super(
            `${hook} was called with \`${argument}\` undefined but enabled. The hook idles while ` +
                `\`${argument}\` is undefined; \`enabled: true\` overrides that guard and would send ` +
                `a malformed request. Supply \`${argument}\`, or drop the \`enabled\` override.`,
        );
        this.hook = hook;
        this.argument = argument;
        // Restores the prototype chain across the ES5 downlevel, so `instanceof` works.
        Object.setPrototypeOf(this, FinchMissingArgumentError.prototype);
    }
}

/**
 * Assert that a positionally-required argument arrived.
 *
 * Call inside `fetch`, never during render — see the file header. Replaces the `as` casts these hooks
 * used to carry, which let a forced `enabled` through to the network.
 */
export function requireArg<T>(
    value: T | undefined | null,
    hook: string,
    argument: string,
): NonNullable<T> {
    if (value === undefined || value === null) throw new FinchMissingArgumentError(hook, argument);
    return value as NonNullable<T>;
}

/** Whether an unknown rejection is a {@link FinchMissingArgumentError}. */
export function isFinchMissingArgumentError(error: unknown): error is FinchMissingArgumentError {
    return error instanceof FinchMissingArgumentError;
}
