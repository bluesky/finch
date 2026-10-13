import axios from 'axios';
import type { HTTPValidationError, ValidationError } from './generatedAliases';
import type { TiledGraphQLErrorEntry } from './graph';

/** HTTP verbs this client issues. */
export type TiledHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Normalized transport failure. Every rejection from a client method is either this, a
 * {@link TiledEndpointUnavailableError}, or an `AbortError` from a cancelled signal.
 *
 * This is the piece `@blueskyproject/tiled` never had: its methods reject with whatever axios
 * produced, so callers had to know about `error.response?.data` to read a Tiled error message, and
 * the hook layer could only type its failures as bare `Error`. The shape is deliberately identical
 * to `QServerApiError` — both backends now fail the same way, and a component that handles one
 * handles the other.
 */
export class TiledApiError extends Error {
    readonly name = 'TiledApiError';
    /** HTTP status, or `undefined` for network/timeout failures. */
    readonly status?: number;
    readonly method: TiledHttpMethod;
    readonly path: string;
    /** Parsed response body, when the server sent one. */
    readonly responseBody?: unknown;
    /** True for FastAPI's 422; `validationErrors` is then populated. */
    readonly isValidationError: boolean;
    readonly validationErrors?: ValidationError[];
    /**
     * The `errors` array of a GraphQL response, for failures from the graph endpoint.
     *
     * Present whether the server answered 200 with errors (the usual case — a resolver failed) or
     * 400 (the document did not parse or validate). `responseBody` keeps the whole envelope,
     * including any partial `data`.
     */
    readonly graphqlErrors?: TiledGraphQLErrorEntry[];
    /** The original axios error, for callers that need `config`/`request`. */
    readonly cause?: unknown;

    constructor(init: {
        message: string;
        method: TiledHttpMethod;
        path: string;
        status?: number;
        responseBody?: unknown;
        cause?: unknown;
    }) {
        super(init.message);
        this.method = init.method;
        this.path = init.path;
        this.status = init.status;
        this.responseBody = init.responseBody;
        this.cause = init.cause;
        this.validationErrors = extractValidationErrors(init.responseBody);
        this.isValidationError = init.status === 422 || this.validationErrors !== undefined;
        this.graphqlErrors = extractGraphQLErrors(init.responseBody);
        // Restore the prototype chain — required for `instanceof` after TS downlevelling.
        Object.setPrototypeOf(this, TiledApiError.prototype);
    }

    /** The first machine-readable code in `graphqlErrors`, e.g. `'NODE_NOT_FOUND'`. */
    get graphqlCode(): string | undefined {
        return this.graphqlErrors?.find((entry) => typeof entry.extensions?.code === 'string')
            ?.extensions?.code;
    }
}

export function isTiledApiError(error: unknown): error is TiledApiError {
    return error instanceof TiledApiError;
}

/** Whether `error` is a failure reported by the graph endpoint's GraphQL `errors` array. */
export function isTiledGraphQLError(
    error: unknown,
): error is TiledApiError & { graphqlErrors: TiledGraphQLErrorEntry[] } {
    return error instanceof TiledApiError && error.graphqlErrors !== undefined;
}

/** The `errors` array of a GraphQL envelope, or `undefined` when `body` is not one. */
export function extractGraphQLErrors(body: unknown): TiledGraphQLErrorEntry[] | undefined {
    if (!body || typeof body !== 'object') return undefined;
    const errors = (body as { errors?: unknown }).errors;
    if (!Array.isArray(errors) || errors.length === 0) return undefined;
    return errors.every(
        (entry) => entry && typeof entry === 'object' && typeof entry.message === 'string',
    )
        ? (errors as TiledGraphQLErrorEntry[])
        : undefined;
}

/** `message [CODE]; message …` — every GraphQL error, each with its code when it has one. */
export function formatGraphQLErrors(errors: TiledGraphQLErrorEntry[]): string {
    return errors
        .map((entry) => {
            const code = entry.extensions?.code;
            return typeof code === 'string' ? `${entry.message} [${code}]` : entry.message;
        })
        .join('; ');
}

function extractValidationErrors(body: unknown): ValidationError[] | undefined {
    if (!body || typeof body !== 'object') return undefined;
    const detail = (body as HTTPValidationError).detail;
    if (!Array.isArray(detail)) return undefined;
    return detail.every((entry) => entry && typeof entry === 'object' && 'loc' in entry)
        ? detail
        : undefined;
}

/** Human-readable one-liner for a 422, e.g. `body.specs: field required`. */
export function formatValidationErrors(errors: ValidationError[] | undefined): string {
    if (!errors?.length) return '';
    return errors.map((entry) => `${entry.loc.join('.')}: ${entry.msg}`).join('; ');
}

/**
 * Normalize an unknown rejection into a {@link TiledApiError}.
 *
 * Tiled reports failures in three shapes — FastAPI's `{ detail }` for validation and framework
 * errors, its own `{ error: { code, message } }` envelope for some application errors, and the
 * graph endpoint's GraphQL `{ errors: [...] }` — so the message is assembled from whichever is
 * present before falling back to axios's own.
 *
 * An `AbortError` passes through untouched: a cancelled request is not an API failure, and TanStack
 * relies on being able to recognise it.
 */
export function toTiledApiError(
    error: unknown,
    method: TiledHttpMethod,
    path: string,
): TiledApiError | Error {
    if (error instanceof TiledApiError) return error;

    // Cancellation is not a failure of the API. Let it through so TanStack can tell the difference.
    if (axios.isCancel(error) || (error instanceof Error && error.name === 'AbortError')) {
        return error;
    }

    if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const responseBody = error.response?.data;
        return new TiledApiError({
            message: describeFailure(method, path, status, responseBody, error.message),
            method,
            path,
            status,
            responseBody,
            cause: error,
        });
    }

    return new TiledApiError({
        message: error instanceof Error ? error.message : String(error),
        method,
        path,
        cause: error,
    });
}

function describeFailure(
    method: TiledHttpMethod,
    path: string,
    status: number | undefined,
    body: unknown,
    axiosMessage: string,
): string {
    const detail = readServerMessage(body);
    const where = `${method} ${path}`;
    if (status === undefined) return `${where} failed: ${axiosMessage}`;
    return detail ? `${where} failed with ${status}: ${detail}` : `${where} failed with ${status}`;
}

/** Pull a human-readable message out of either error envelope Tiled uses. */
function readServerMessage(body: unknown): string | undefined {
    if (typeof body === 'string') return body.trim() || undefined;
    if (!body || typeof body !== 'object') return undefined;

    const validation = extractValidationErrors(body);
    if (validation) return formatValidationErrors(validation);

    const graphql = extractGraphQLErrors(body);
    if (graphql) return formatGraphQLErrors(graphql);

    const { detail, error } = body as { detail?: unknown; error?: unknown };
    if (typeof detail === 'string') return detail;

    if (error && typeof error === 'object') {
        const { code, message } = error as { code?: unknown; message?: unknown };
        if (typeof message === 'string') {
            return typeof code === 'string' || typeof code === 'number'
                ? `${message} (${code})`
                : message;
        }
    }
    return undefined;
}
