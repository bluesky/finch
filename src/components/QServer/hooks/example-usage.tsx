// Example usage in other components
import { useQueueQuery, useQueueHistoryQuery, useStatusQuery } from '@/components/QServer/hooks/useQServerQueries';

// Example: QueueStatus component that shows queue length
export const QueueStatus = () => {
    const { data: queueData, isLoading } = useQueueQuery();
    
    if (isLoading) return <div>Loading queue...</div>;
    
    return (
        <div>
            Queue has {queueData?.items?.length || 0} items
        </div>
    );
};

// Example: StatusIndicator component 
export const StatusIndicator = () => {
    const { data: statusData, isLoading } = useStatusQuery();
    
    if (isLoading) return <div>Loading status...</div>;
    
    return (
        <div>
            RE Status: {statusData?.re_state || 'unknown'}
        </div>
    );
};

// Example: HistorySummary component
export const HistorySummary = () => {
    const { data: historyData, isLoading } = useQueueHistoryQuery();
    
    if (isLoading) return <div>Loading history...</div>;
    
    return (
        <div>
            {historyData?.items?.length || 0} items in history
        </div>
    );
};
