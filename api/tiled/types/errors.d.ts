import { ValidationError } from './generatedAliases';
import { TiledGraphQLErrorEntry } from './graph';
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
export declare class TiledApiError extends Error {
    readonly name = "TiledApiError";
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
    });
    /** The first machine-readable code in `graphqlErrors`, e.g. `'NODE_NOT_FOUND'`. */
    get graphqlCode(): string | undefined;
}
export declare function isTiledApiError(error: unknown): error is TiledApiError;
/** Whether `error` is a failure reported by the graph endpoint's GraphQL `errors` array. */
export declare function isTiledGraphQLError(error: unknown): error is TiledApiError & {
    graphqlErrors: TiledGraphQLErrorEntry[];
};
/** The `errors` array of a GraphQL envelope, or `undefined` when `body` is not one. */
export declare function extractGraphQLErrors(body: unknown): TiledGraphQLErrorEntry[] | undefined;
/** `message [CODE]; message …` — every GraphQL error, each with its code when it has one. */
export declare function formatGraphQLErrors(errors: TiledGraphQLErrorEntry[]): string;
/** Human-readable one-liner for a 422, e.g. `body.specs: field required`. */
export declare function formatValidationErrors(errors: ValidationError[] | undefined): string;
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
export declare function toTiledApiError(error: unknown, method: TiledHttpMethod, path: string): TiledApiError | Error;
//# sourceMappingURL=errors.d.ts.map