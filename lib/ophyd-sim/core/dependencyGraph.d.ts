/**
 * Forward-edge dependency map: when a source PV changes, walk its dependents
 * and recompute them in topological order.
 *
 * Cycles throw at registration time — derived signals must form a DAG.
 */
export declare class DependencyGraph {
    private readonly dependents;
    private readonly dependencies;
    /** Declare that `name` depends on every PV in `dependsOn`. */
    register(name: string, dependsOn: string[]): void;
    /**
     * Return dependents of `name` in topological order — every dependent
     * appears after each of its own (transitive) dependencies in this list.
     * Useful for cascading recomputation after a source value changes.
     */
    dependentsOf(name: string): string[];
    private hasCycle;
}
//# sourceMappingURL=dependencyGraph.d.ts.map