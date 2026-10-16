import { PlaygroundDescriptor, PlaygroundQueryOptions } from './types';
export interface QueryDetailPanelProps {
    descriptor: PlaygroundDescriptor;
    values: Record<string, unknown>;
    onValuesChange: (values: Record<string, unknown>) => void;
    options: PlaygroundQueryOptions;
    onOptionsChange: (options: PlaygroundQueryOptions) => void;
    /** Shown in the header; lets a pinned query be unpinned from its own panel. */
    pinned?: boolean;
    onTogglePin?: () => void;
}
/**
 * One query: its inputs, its controls, and the Runner that actually calls the hook.
 *
 * The Runner is mounted as `<descriptor.Runner />` — a component, because a hook cannot be called
 * dynamically. Switching queries unmounts one and mounts another, which is itself informative: the
 * cache inspector shows the entry surviving with `observerCount: 0`, which is what `gcTime` is
 * counting down.
 */
export default function QueryDetailPanel({ descriptor, values, onValuesChange, options, onOptionsChange, pinned, onTogglePin, }: QueryDetailPanelProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=QueryDetailPanel.d.ts.map