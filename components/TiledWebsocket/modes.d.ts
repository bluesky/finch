export type SubscriptionMode = 'container' | 'table' | 'array' | 'generic' | 'raw';
export declare const MODE_LABELS: Record<SubscriptionMode, string>;
/** The subscription mode that fits a node's structure family. */
export declare function modeForFamily(family: string | null | undefined): SubscriptionMode;
//# sourceMappingURL=modes.d.ts.map