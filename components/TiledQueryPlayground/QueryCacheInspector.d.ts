/**
 * A live view of the playground's `QueryCache`.
 *
 * This is the panel that makes the playground diagnostic rather than merely convenient. Pin two
 * queries and it answers questions a result panel cannot:
 *
 * - two searches whose filters build the same config share **one** entry;
 * - two table reads differing only in `column` get **two** — the collision that was a real bug;
 * - `useTiledServerInfoQuery` and `useTiledAboutQuery` get **two**, for the same reason;
 * - changing the base URL in the connection bar forks the scope and doubles everything;
 * - unpinning a query leaves its entry behind with `observers: 0`, which is what `gcTime` counts.
 *
 * It subscribes to the cache rather than polling, so a status change shows up on the same frame the
 * hook sees it.
 */
export default function QueryCacheInspector(): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=QueryCacheInspector.d.ts.map