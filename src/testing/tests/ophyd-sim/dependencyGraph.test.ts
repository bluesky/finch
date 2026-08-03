import { describe, it, expect } from 'vitest';
import { DependencyGraph } from '../../../lib/ophyd-sim/core/dependencyGraph';

describe('DependencyGraph', () => {
    it('returns direct dependents in topological order', () => {
        const g = new DependencyGraph();
        g.register('I0', ['x']);
        g.register('I1', ['x']);
        // Both I0 and I1 should appear (no order constraint between them).
        const order = g.dependentsOf('x');
        expect(order.sort()).toEqual(['I0', 'I1']);
    });

    it('returns transitive dependents with dependencies before dependents', () => {
        const g = new DependencyGraph();
        g.register('mid', ['x']);
        g.register('leaf', ['mid']);
        const order = g.dependentsOf('x');
        expect(order).toEqual(['mid', 'leaf']);
    });

    it('throws on direct cycle', () => {
        const g = new DependencyGraph();
        g.register('a', ['b']);
        expect(() => g.register('b', ['a'])).toThrow(/cycle/);
    });

    it('throws on indirect cycle', () => {
        const g = new DependencyGraph();
        g.register('a', ['b']);
        g.register('b', ['c']);
        expect(() => g.register('c', ['a'])).toThrow(/cycle/);
    });

    it('returns empty list for a source with no dependents', () => {
        const g = new DependencyGraph();
        expect(g.dependentsOf('orphan')).toEqual([]);
    });
});
