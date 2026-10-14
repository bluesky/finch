export type SubscriptionMode = 'container' | 'table' | 'array' | 'generic' | 'raw';

export const MODE_LABELS: Record<SubscriptionMode, string> = {
    container: 'useTiledContainerSubscription',
    table: 'useTiledTableSubscription',
    array: 'useTiledArraySubscription',
    generic: 'useTiledSubscription',
    raw: 'TiledSubscription (no React)',
};

/** The subscription mode that fits a node's structure family. */
export function modeForFamily(family: string | null | undefined): SubscriptionMode {
    if (family === 'table') return 'table';
    if (family === 'array' || family === 'sparse') return 'array';
    if (family === 'container') return 'container';
    return 'generic';
}
