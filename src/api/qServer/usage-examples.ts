/**
 * Example usage of enhanced React Query hooks with queryOptions parameter
 *
 * These hooks now accept an optional queryOptions parameter that allows developers
 * to customize React Query behavior such as polling intervals, caching, error handling, etc.
 */

// Example 1: Basic usage (unchanged - backward compatible)
// const queueQuery = useQueueQuery();

// Example 2: Enable polling every 5 seconds
// const queueQuery = useQueueQuery({
//   refetchInterval: 5000,
// });

// Example 3: Disable automatic refetching on window focus
// const statusQuery = useStatusQuery({
//   refetchOnWindowFocus: false,
// });

// Example 4: Custom stale time and cache time
// const historyQuery = useQueueHistoryQuery({
//   staleTime: 10 * 60 * 1000, // 10 minutes
//   gcTime: 30 * 60 * 1000,    // 30 minutes (previously cacheTime)
// });

// Example 5: Custom error handling
// const plansQuery = usePlansAllowedQuery({
//   retry: (failureCount, error) => {
//     if (error.status === 404) return false;
//     return failureCount < 3;
//   },
//   onError: (error) => {
//     console.error('Plans query failed:', error);
//   },
// });

// Example 6: Enable/disable query based on conditions
// const devicesQuery = useDevicesAllowedQuery({
//   enabled: userHasPermission && isLoggedIn,
// });

// Example 7: Custom select to transform data
// const activeRunsQuery = useRunsActiveQuery({
//   select: (data) => data.filter(run => run.status === 'active'),
// });

// Example 8: Queue item with custom options
// const itemQuery = useQueueItemQuery(itemId, {
//   refetchInterval: itemId ? 2000 : false, // Poll every 2 seconds if itemId exists
//   enabled: !!itemId && showDetails,
// });

export {};
