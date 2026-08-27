import type { QueryKey } from '@tanstack/react-query';

/**
 * The query-key shape every Finch backend produces.
 *
 * A fixed four-element tuple:
 *
 * ```
 * [<backend>, <resource>, <args | null>, <scope>]
 * ```
 *
 * Two properties of that layout are load-bearing, and both are easy to break by accident:
 *
 * 1. **The scope is last.** TanStack matches keys by positional prefix, so a caller (or an
 *    invalidation bundle) can say `{ queryKey: ['qserver', 'queue'] }` and hit that resource on every
 *    server. Putting the scope earlier would make every prefix invalidation server-specific, which is
 *    the wrong default: over-invalidating a multi-server app is far cheaper than serving it stale
 *    data.
 * 2. **Args normalize to `null` when absent**, never `undefined` and never omitted. `getQueue()` and
 *    `getQueue({})` are the same request and must share one cache entry; a shorter tuple would also
 *    break the fixed-arity assumption above.
 *
 * Credentials are deliberately **not** part of any key. A secret does not belong in the Devtools
 * cache inspector, which is exactly why a credential change is handled by invalidating everything
 * rather than by re-keying — see each backend's `invalidation.ts`.
 */

/**
 * Which server a cached entry belongs to.
 *
 * Backends extend this when their namespace needs more than an origin to identify it —
 * `TiledQueryScope` adds `initialPath`, because the same relative path under two prefixes is
 * different data.
 */
export interface FinchQueryScope {
    readonly baseUrl: string;
}

/**
 * Stand-in `baseUrl` for a client injected through a provider.
 *
 * An injected client is the caller's explicit choice and is never redirected, so there is no
 * configured URL to key on — but entries still have to be separated from the default client's. Used
 * only when the injected client does not expose a `getBaseUrl()`; a test double usually does not.
 */
export const INJECTED_CLIENT_SCOPE = 'client:injected' as const;

/** A key built to the shape above. */
export type FinchQueryKey<
    TBackend extends string = string,
    TResource extends string = string,
    TArgs = unknown,
    TScope extends FinchQueryScope = FinchQueryScope,
> = readonly [TBackend, TResource, TArgs | null, TScope] & QueryKey;
