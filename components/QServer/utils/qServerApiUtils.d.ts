/**
 * Hook that returns a `getBlueskyRunList(itemId)` callback bound to the
 * current QServer API client.  Use this in components instead of importing
 * `getBlueskyRunList` directly.
 */
export declare function useGetBlueskyRunList(): (itemId: string) => Promise<string[]>;
//# sourceMappingURL=qServerApiUtils.d.ts.map