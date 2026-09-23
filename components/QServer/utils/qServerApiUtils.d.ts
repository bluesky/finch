/**
 * Hook that returns a `getBlueskyRunList(itemId)` callback bound to the
 * current QServer API client.  Use this in components instead of importing
 * `getBlueskyRunList` directly.
 *
 * The client comes from `useQServerClient`, the same resolver the query hooks use — so it honours a
 * client injected through `QServerApiProvider` (the simulator, a test stub) and otherwise the app-wide
 * default with Finch config applied. It no longer builds an axios instance of its own per render.
 */
export declare function useGetBlueskyRunList(): (itemId: string) => Promise<string[]>;
//# sourceMappingURL=qServerApiUtils.d.ts.map