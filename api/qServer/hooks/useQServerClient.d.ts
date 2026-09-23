import { QServerEndpoints } from '../types/clientSurface';
import { QServerRequestOptions } from '../types/common';
import { QServerQueryScope } from './queryKeys';
/**
 * Operations in `QServerEndpoints` but not in `QServerClientLike`.
 *
 * Kept beside the resolver because it is the list that decides which hooks can work against an
 * injected client. `QServerNewHooks.test.tsx` asserts it is exactly the set difference, so widening
 * `QServerClientLike` cannot leave this stale.
 */
export declare const QSERVER_NON_CORE_METHODS: readonly ["getConfig", "moveQueueItemBatch", "uploadQueueSpreadsheet", "updateEnvironment", "getREMetadata", "getPermissions", "setPermissions", "reloadPermissions", "executeFunction", "uploadScript", "streamConsoleOutput", "interruptKernel", "stopManager", "testKillManager", "testServerSleep", "whoami", "getScopes", "listPrincipals", "getPrincipal", "createApiKeyForPrincipal", "createApiKey", "getCurrentApiKeyInfo", "revokeApiKey", "refreshSession", "revokeSession", "logout"];
export interface QServerClientResolution {
    /**
     * The full 70-operation surface.
     *
     * On a partial injected client the missing operations are present but throw
     * `QServerEndpointUnavailableError` when called, so every hook can be typed against the whole
     * surface without a cast.
     */
    readonly client: QServerEndpoints;
    readonly source: 'provider' | 'default';
    /**
     * Transport defaults merged *under* each caller's `request`.
     *
     * Non-empty only for the default client: an injected client is the caller's explicit choice and
     * is never redirected to another server.
     */
    readonly requestDefaults: QServerRequestOptions;
    /** Cache scope — which server these hooks talk to. */
    readonly scope: QServerQueryScope;
}
/**
 * Resolve the client the hooks should use, and the transport defaults to apply.
 *
 * Precedence:
 *
 * 1. a client injected through `QServerApiProvider` — this is what lets `qserver-sim` (and any test
 *    stub) drive hook-based components;
 * 2. otherwise the app-wide default client, with the base URL and API key from
 *    `FinchConfigProvider` (via `useQueueServerApiUrls`).
 *
 * Config correctness does not depend on the singleton's stored state: the resolved base URL and key
 * are returned as `requestDefaults` and travel with every request, so the very first fetch already
 * uses the configured server — there is nothing that can be stale. The singleton is *also* synced in
 * an effect so the free functions in `client/facade.ts` and the socket hooks agree with the hooks.
 */
export declare function useQServerClient(): QServerClientResolution;
/**
 * The cache scope a query hook should key on, given its own `requestOptions`.
 *
 * Normally the resolver's scope — which server the hooks talk to. A per-call `requestOptions.baseUrl`
 * overrides it, so two instances of the same hook pointed at different servers keep separate cache
 * entries instead of overwriting each other's data.
 */
export declare function useQServerQueryScope(requestOptions?: QServerRequestOptions): QServerQueryScope;
//# sourceMappingURL=useQServerClient.d.ts.map