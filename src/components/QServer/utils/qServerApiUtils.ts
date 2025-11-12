import { getStatusPromise, getRunsActivePromise, getQueueHistoryPromise } from './apiClient';

/**
 * Gets the run UIDs for a given item ID from either active runs or history
 * @param itemId - The item ID to search for
 * @returns Array of run UIDs if found, empty array if not found
 */
export const getBlueskyRunList = async (itemId: string): Promise<string[]> => {
    try {
        console.log(`[getBlueskyRunList] Starting search for item ID: ${itemId}`);
        
        // Step 1: Check if the item is currently running
        console.log('[getBlueskyRunList] Step 1: Checking status...');
        const statusData = await getStatusPromise();
        console.log(`[getBlueskyRunList] Status response - running_item_uid: ${statusData.running_item_uid}`);
        
        if (statusData.running_item_uid === itemId) {
            console.log('[getBlueskyRunList] Item is currently running! Checking active runs...');
            
            // Step 2: Get active runs if item is currently running
            const activeRunsData = await getRunsActivePromise();
            console.log(`[getBlueskyRunList] Active runs response - success: ${activeRunsData.success}, run_list length: ${activeRunsData.run_list?.length || 0}`);
            
            if (activeRunsData.success && activeRunsData.run_list && activeRunsData.run_list.length > 0) {
                // Return all UIDs from active runs
                const runUids = activeRunsData.run_list.map(run => run.uid);
                console.log(`[getBlueskyRunList] Found ${runUids.length} active run UIDs:`, runUids);
                return runUids;
            } else {
                console.log('[getBlueskyRunList] No active runs found despite item running');
            }
        } else {
            console.log('[getBlueskyRunList] Item is not currently running, checking history...');
        }
        
        // Step 3: If no active runs, check history for the most recent items
        console.log('[getBlueskyRunList] Step 3: Checking queue history...');
        const historyData = await getQueueHistoryPromise();
        console.log(`[getBlueskyRunList] History response - success: ${historyData.success}, items length: ${historyData.items?.length || 0}`);
        
        if (historyData.success && historyData.items && historyData.items.length > 0) {
            // Check the last two items in history (most recent)
            const recentItems = historyData.items.slice(-2);
            console.log(`[getBlueskyRunList] Checking last ${recentItems.length} items in history`);
            
            for (let i = 0; i < recentItems.length; i++) {
                const historyItem = recentItems[i];
                console.log(`[getBlueskyRunList] Checking history item ${i + 1}: item_uid=${historyItem.item_uid}, has_result=${!!historyItem.result}, run_uids_count=${historyItem.result?.run_uids?.length || 0}`);
                
                if (historyItem.item_uid === itemId && historyItem.result?.run_uids) {
                    console.log(`[getBlueskyRunList] Match found in history! Run UIDs:`, historyItem.result.run_uids);
                    return historyItem.result.run_uids;
                }
            }
            console.log('[getBlueskyRunList] No matching item found in recent history');
        } else {
            console.log('[getBlueskyRunList] No history data available');
        }
        
        // No matching runs found
        console.log('[getBlueskyRunList] No matching runs found, returning empty array');
        return [];
        
    } catch (error) {
        console.error('[getBlueskyRunList] Error getting Bluesky run list:', error);
        return [];
    }
};
