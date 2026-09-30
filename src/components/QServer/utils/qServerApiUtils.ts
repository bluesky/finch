import { useCallback } from 'react';
import { useQServerClient } from '@/api/qServer';
import type { QServerEndpoints, QServerRequestOptions } from '@/api/qServer';

/** Only the three reads this file needs, so a test can stub it without the whole 70-method surface. */
type RunListClient = Pick<QServerEndpoints, 'getStatus' | 'getRunsActive' | 'getQueueHistory'>;

/**
 * Gets the run UIDs for a given item ID from either active runs or history
 * @param client - The queue-server client to read through
 * @param itemId - The item ID to search for
 * @param request - Transport overrides (base URL and API key from Finch config)
 * @returns Array of run UIDs if found, empty array if not found
 */
const getBlueskyRunList = async (
    client: RunListClient,
    itemId: string,
    request?: QServerRequestOptions,
): Promise<string[]> => {
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
        console.log(`[getBlueskyRunList] Starting search for item ID: ${itemId}`);

        // Step 1: Check if the item is currently running
        console.log('[getBlueskyRunList] Step 1: Checking status...');
        const statusData = await client.getStatus(undefined, request);
        console.log(
            `[getBlueskyRunList] Status response - running_item_uid: ${statusData.running_item_uid}`,
        );

        if (statusData.running_item_uid === itemId) {
            console.log('[getBlueskyRunList] Item is currently running! Checking active runs...');

            // Step 2: Get active runs if item is currently running
            const activeRunsData = await client.getRunsActive(request);
            console.log(
                `[getBlueskyRunList] Active runs response - success: ${activeRunsData.success}, run_list length: ${activeRunsData.run_list?.length || 0}`,
            );

            if (
                activeRunsData.success &&
                activeRunsData.run_list &&
                activeRunsData.run_list.length > 0
            ) {
                // Return all UIDs from active runs
                const runUids = activeRunsData.run_list.map((run) => run.uid);
                console.log(
                    `[getBlueskyRunList] Found ${runUids.length} active run UIDs:`,
                    runUids,
                );
                return runUids;
            } else {
                console.log(
                    '[getBlueskyRunList] No active runs found despite item running, will check history...',
                );
            }
        } else {
            console.log('[getBlueskyRunList] Item is not currently running, checking history...');
        }

        // Step 3: Check history for the most recent items
        console.log('[getBlueskyRunList] Step 3: Checking queue history...');
        const historyData = await client.getQueueHistory(undefined, request);
        console.log(
            `[getBlueskyRunList] History response - success: ${historyData.success}, items length: ${historyData.items?.length || 0}`,
        );

        if (historyData.success && historyData.items && historyData.items.length > 0) {
            // Check the last two items in history (most recent)
            const recentItems = historyData.items.slice(-2);
            console.log(`[getBlueskyRunList] Checking last ${recentItems.length} items in history`);

            for (let i = 0; i < recentItems.length; i++) {
                const historyItem = recentItems[i];
                console.log(
                    `[getBlueskyRunList] Checking history item ${i + 1}: item_uid=${historyItem.item_uid}, has_result=${!!historyItem.result}, run_uids_count=${historyItem.result?.run_uids?.length || 0}`,
                );

                if (historyItem.item_uid === itemId && historyItem.result?.run_uids) {
                    console.log(
                        `[getBlueskyRunList] Match found in history! Run UIDs:`,
                        historyItem.result.run_uids,
                    );
                    return historyItem.result.run_uids;
                }
            }
            console.log('[getBlueskyRunList] No matching item found in recent history');
        } else {
            console.log('[getBlueskyRunList] No history data available');
        }

        // If we reach here and the item was running, wait and retry from step 2
        if (statusData.running_item_uid === itemId) {
            console.log(
                '[getBlueskyRunList] Item still running but no runs found. Waiting 0.5s and retrying...',
            );
            await delay(500);

            // Retry Step 2: Check active runs again
            console.log('[getBlueskyRunList] Retry Step 2: Checking active runs after delay...');
            const retryActiveRunsData = await client.getRunsActive(request);
            console.log(
                `[getBlueskyRunList] Retry active runs response - success: ${retryActiveRunsData.success}, run_list length: ${retryActiveRunsData.run_list?.length || 0}`,
            );

            if (
                retryActiveRunsData.success &&
                retryActiveRunsData.run_list &&
                retryActiveRunsData.run_list.length > 0
            ) {
                const runUids = retryActiveRunsData.run_list.map((run) => run.uid);
                console.log(
                    `[getBlueskyRunList] Found ${runUids.length} active run UIDs after retry:`,
                    runUids,
                );
                return runUids;
            }

            // Retry Step 3: Check history again
            console.log('[getBlueskyRunList] Retry Step 3: Checking queue history after delay...');
            const retryHistoryData = await client.getQueueHistory(undefined, request);
            console.log(
                `[getBlueskyRunList] Retry history response - success: ${retryHistoryData.success}, items length: ${retryHistoryData.items?.length || 0}`,
            );

            if (
                retryHistoryData.success &&
                retryHistoryData.items &&
                retryHistoryData.items.length > 0
            ) {
                const retryRecentItems = retryHistoryData.items.slice(-2);
                console.log(
                    `[getBlueskyRunList] Retry: Checking last ${retryRecentItems.length} items in history`,
                );

                for (let i = 0; i < retryRecentItems.length; i++) {
                    const historyItem = retryRecentItems[i];
                    console.log(
                        `[getBlueskyRunList] Retry: Checking history item ${i + 1}: item_uid=${historyItem.item_uid}, has_result=${!!historyItem.result}, run_uids_count=${historyItem.result?.run_uids?.length || 0}`,
                    );

                    if (historyItem.item_uid === itemId && historyItem.result?.run_uids) {
                        console.log(
                            `[getBlueskyRunList] Match found in history after retry! Run UIDs:`,
                            historyItem.result.run_uids,
                        );
                        return historyItem.result.run_uids;
                    }
                }
                console.log(
                    '[getBlueskyRunList] No matching item found in recent history after retry',
                );
            }
        }

        // No matching runs found
        console.log('[getBlueskyRunList] No matching runs found, returning empty array');
        return [];
    } catch (error) {
        console.error('[getBlueskyRunList] Error getting Bluesky run list:', error);
        return [];
    }
};

/**
 * Hook that returns a `getBlueskyRunList(itemId)` callback bound to the
 * current QServer API client.  Use this in components instead of importing
 * `getBlueskyRunList` directly.
 *
 * The client comes from `useQServerClient`, the same resolver the query hooks use — so it honours a
 * client injected through `QServerApiProvider` (the simulator, a test stub) and otherwise the app-wide
 * default with Finch config applied. It no longer builds an axios instance of its own per render.
 */
export function useGetBlueskyRunList() {
    const { client, requestDefaults } = useQServerClient();
    return useCallback(
        (itemId: string) => getBlueskyRunList(client, itemId, requestDefaults),
        [client, requestDefaults],
    );
}
