import { UseQueryResult } from '@tanstack/react-query';
import { QueryResultKind } from './types';
export interface QueryResultPanelProps {
    result: UseQueryResult<unknown, Error>;
    resultKind: QueryResultKind;
    /** Field names the hook idles on, so an idle query can say *why*. */
    guardedBy?: readonly string[];
    /** Whether those fields are currently filled. */
    guardSatisfied?: boolean;
}
/**
 * Everything the hook is doing, not just what it returned.
 *
 * This is the panel that justifies a hook-level testbed existing alongside the client-level one.
 * `TestTiled` can show you a response; only this can show you that a query is idle rather than
 * loading, that its data is stale, that a refetch is in flight over data already rendered, or that
 * two hooks are sharing one cache entry.
 */
export default function QueryResultPanel({ result, resultKind, guardedBy, guardSatisfied, }: QueryResultPanelProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=QueryResultPanel.d.ts.map