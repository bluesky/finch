/**
 * Forward-edge dependency map: when a source PV changes, walk its dependents
 * and recompute them in topological order.
 *
 * Cycles throw at registration time — derived signals must form a DAG.
 */
export class DependencyGraph {
    private readonly dependents = new Map<string, Set<string>>();
    private readonly dependencies = new Map<string, Set<string>>();

    /** Declare that `name` depends on every PV in `dependsOn`. */
    register(name: string, dependsOn: string[]): void {
        const deps = this.dependencies.get(name) ?? new Set<string>();
        for (const source of dependsOn) {
            deps.add(source);
            const fwd = this.dependents.get(source) ?? new Set<string>();
            fwd.add(name);
            this.dependents.set(source, fwd);
        }
        this.dependencies.set(name, deps);

        if (this.hasCycle()) {
            throw new Error(
                `[ophyd-sim] dependency cycle detected involving "${name}" (depends on: ${dependsOn.join(
                    ', ',
                )})`,
            );
        }
    }

    /**
     * Return dependents of `name` in topological order — every dependent
     * appears after each of its own (transitive) dependencies in this list.
     * Useful for cascading recomputation after a source value changes.
     */
    dependentsOf(name: string): string[] {
        const visited = new Set<string>();
        const order: string[] = [];

        const visit = (node: string): void => {
            if (visited.has(node)) return;
            visited.add(node);
            const fwd = this.dependents.get(node);
            if (fwd) {
                for (const next of fwd) visit(next);
            }
            order.push(node);
        };

        const direct = this.dependents.get(name);
        if (!direct) return [];
        for (const d of direct) visit(d);
        // visit() pushes in post-order; reverse so dependencies precede dependents.
        return order.reverse();
    }

    private hasCycle(): boolean {
        const WHITE = 0;
        const GRAY = 1;
        const BLACK = 2;
        const color = new Map<string, number>();

        const dfs = (node: string): boolean => {
            color.set(node, GRAY);
            const fwd = this.dependents.get(node);
            if (fwd) {
                for (const next of fwd) {
                    const c = color.get(next) ?? WHITE;
                    if (c === GRAY) return true;
                    if (c === WHITE && dfs(next)) return true;
                }
            }
            color.set(node, BLACK);
            return false;
        };

        for (const node of this.dependencies.keys()) {
            if ((color.get(node) ?? WHITE) === WHITE) {
                if (dfs(node)) return true;
            }
        }
        return false;
    }
}
