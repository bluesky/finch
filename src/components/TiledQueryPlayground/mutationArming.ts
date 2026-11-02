import { createContext, useContext } from 'react';

/**
 * Whether the panel's Run button is armed for a destructive write.
 *
 * A context rather than a prop because the arm state lives in `QueryDetailPanel` — which owns the
 * confirm — while the Run button lives in `MutationResultPanel`, two levels down through a Runner.
 * Threading it would mean a prop on `MutationRunnerProps` that all 27 Runners forward and none of
 * them use.
 */
export const MutationArmedContext = createContext(false);

export function useMutationArmed(): boolean {
    return useContext(MutationArmedContext);
}
