import { QueryResultKind } from './types';
/**
 * The part of a `UseMutationResult` this panel reads.
 *
 * Structural rather than `UseMutationResult<…, TVariables>` so one panel serves all 27 mutations
 * without being generic: the Runner owns `mutate` and the variables, so the panel never touches
 * either, and saying so in the type keeps it that way.
 */
export interface MutationView {
    isIdle: boolean;
    isPending: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
    data: unknown;
    /** Epoch ms of the last `mutate` call; 0 before the first. */
    submittedAt: number;
    reset: () => void;
}
export interface MutationResultPanelProps {
    result: MutationView;
    resultKind: QueryResultKind;
    /** Used to look up what this mutation invalidates. */
    hookName: string;
    /** Rendered inline — the Runner owns its own trigger. */
    onRun: () => void;
    /** Disables Run while a required field is missing. */
    canRun?: boolean;
}
/**
 * What a mutation did, and — the part that matters — what it invalidated.
 *
 * `useTiledMutation` awaits the bundles in `TILED_MUTATION_INVALIDATIONS` before `mutateAsync`
 * resolves, so by the time `success` appears here the affected queries have already refetched. That
 * map is hand-written and is the most error-prone thing in the mutation layer; showing it beside
 * the result turns it from something you have to trust into something you can check against the
 * cache inspector.
 */
export default function MutationResultPanel({ result, resultKind, hookName, onRun, canRun, }: MutationResultPanelProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=MutationResultPanel.d.ts.map