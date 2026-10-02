import { describe, expect, it } from 'vitest';
import * as tiled from '../../api/tiled';
import { TILED_ENDPOINT_GROUPS } from '../../api/tiled';
import {
    TILED_MUTATION_CATALOG,
    TILED_PLAYGROUND_CATALOG,
    TILED_QUERY_CATALOG,
    getQueryById,
    groupedQueries,
} from '../../components/TiledQueryPlayground/catalog';

/**
 * The playground catalog must cover every query hook.
 *
 * Same arrangement as `TiledRegistry.test.ts`, one layer up: that suite stops the endpoint registry
 * drifting from `openapi.json`, this one stops the catalog drifting from the hooks. Without it, a
 * hook added next year is simply absent from the playground and nobody notices until they go
 * looking for it.
 */

/** Every exported name that is a query hook, by convention. */
const exportedQueryHooks = Object.keys(tiled)
    .filter((name) => name.startsWith('useTiled') && name.endsWith('Query'))
    .filter(
        (name) =>
            // Infrastructure, not an endpoint: it resolves the cache scope and makes no request.
            name !== 'useTiledQueryScope',
    )
    .sort();

/** Every exported mutation hook. */
const exportedMutationHooks = Object.keys(tiled)
    .filter((name) => name.startsWith('useTiled') && name.endsWith('Mutation'))
    .sort();

describe('query catalog coverage', () => {
    it('has a descriptor for every exported query hook', () => {
        const covered = new Set(TILED_QUERY_CATALOG.map((descriptor) => descriptor.hookName));
        const missing = exportedQueryHooks.filter((name) => !covered.has(name));

        expect(missing, `query hooks with no catalog entry:\n${missing.join('\n')}`).toEqual([]);
    });

    it('names no hook that is not exported', () => {
        const exported = new Set(Object.keys(tiled));
        const invented = TILED_QUERY_CATALOG.filter(
            (descriptor) => !exported.has(descriptor.hookName),
        ).map((descriptor) => `${descriptor.id} -> ${descriptor.hookName}`);

        expect(invented).toEqual([]);
    });

    /**
     * `useTiledArrayImagePath` is in the catalog but is not a query — it is synchronous, makes no
     * request and has no cache entry. Pinned here so the exception stays deliberate.
     */
    it('includes the one non-query helper, and only that one', () => {
        const nonQueries = TILED_QUERY_CATALOG.filter(
            (descriptor) => !descriptor.hookName.endsWith('Query'),
        ).map((descriptor) => descriptor.hookName);

        expect(nonQueries).toEqual(['useTiledArrayImagePath']);
        expect(typeof (tiled as Record<string, unknown>).useTiledArrayImagePath).toBe('function');
    });

    it('has a descriptor for every exported mutation hook', () => {
        const covered = new Set(TILED_MUTATION_CATALOG.map((descriptor) => descriptor.hookName));
        const missing = exportedMutationHooks.filter((name) => !covered.has(name));

        expect(missing, `mutation hooks with no catalog entry:\n${missing.join('\n')}`).toEqual([]);
    });

    it('covers the whole surface, counted', () => {
        // 41 query entries: 40 query hooks plus the URL helper. 27 mutations. A change here should
        // be a deliberate edit, not a surprise.
        expect(exportedQueryHooks).toHaveLength(40);
        expect(TILED_QUERY_CATALOG).toHaveLength(41);
        expect(exportedMutationHooks).toHaveLength(27);
        expect(TILED_MUTATION_CATALOG).toHaveLength(27);
        expect(TILED_PLAYGROUND_CATALOG).toHaveLength(68);
    });
});

describe('mutation descriptors', () => {
    /**
     * Every mutation must appear in `TILED_MUTATION_INVALIDATIONS`.
     *
     * The panel reads that map by hook name to show what a write invalidated. A mutation missing
     * from it would silently render no invalidation line — which would read as "this invalidates
     * nothing" rather than as a gap in the map.
     */
    it('maps every mutation to an invalidation bundle', () => {
        const map = tiled.TILED_MUTATION_INVALIDATIONS as Record<string, readonly string[]>;
        const unmapped = TILED_MUTATION_CATALOG.filter(
            (descriptor) => !map[descriptor.hookName]?.length,
        ).map((descriptor) => descriptor.id);

        expect(unmapped, `mutations with no invalidation bundle:\n${unmapped.join('\n')}`).toEqual(
            [],
        );
    });

    /** Bundles have to expand to real roots, or the panel prints an empty arrow. */
    it('uses bundles that resolve to known roots', () => {
        const bundles = tiled.TILED_INVALIDATION_BUNDLES as Record<string, readonly string[]>;
        const map = tiled.TILED_MUTATION_INVALIDATIONS as Record<string, readonly string[]>;

        for (const descriptor of TILED_MUTATION_CATALOG) {
            for (const bundle of map[descriptor.hookName]) {
                expect(bundles[bundle]?.length, `${descriptor.id} -> ${bundle}`).toBeGreaterThan(0);
            }
        }
    });

    /**
     * A write that only adds something is not destructive, and should run without a prompt.
     *
     * Kept in step with the endpoint registry's own flag — if the two disagree about what is
     * dangerous, one of the harnesses is lying to whoever is clicking.
     */
    it('flags writes as destructive except the two that only add', () => {
        const nonDestructive = TILED_MUTATION_CATALOG.filter(
            (descriptor) => !descriptor.destructive,
        ).map((descriptor) => descriptor.id);

        expect(nonDestructive.sort()).toEqual([
            'auth.createApiKey',
            'auth.login',
            'auth.refreshSession',
            'management.register',
            'metadata.create',
            'webhooks.register',
        ]);
    });

    it('gives every mutation a Runner and a group', () => {
        for (const descriptor of TILED_MUTATION_CATALOG) {
            expect(typeof descriptor.Runner, descriptor.id).toBe('function');
            expect(TILED_ENDPOINT_GROUPS, descriptor.id).toContain(descriptor.group);
        }
    });
});

describe('catalog shape', () => {
    it('has unique ids', () => {
        const ids = TILED_PLAYGROUND_CATALOG.map((descriptor) => descriptor.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('puts every descriptor in a known endpoint group', () => {
        for (const descriptor of TILED_PLAYGROUND_CATALOG) {
            expect(TILED_ENDPOINT_GROUPS, descriptor.id).toContain(descriptor.group);
        }
    });

    it('gives every field a unique name within its query', () => {
        for (const descriptor of TILED_PLAYGROUND_CATALOG) {
            const names = descriptor.fields.map((field) => field.name);
            expect(new Set(names).size, descriptor.id).toBe(names.length);
        }
    });

    it('declares enums for every enum field', () => {
        for (const descriptor of TILED_PLAYGROUND_CATALOG) {
            for (const field of descriptor.fields) {
                if (field.kind !== 'enum') continue;
                expect(field.enums?.length, `${descriptor.id}.${field.name}`).toBeGreaterThan(0);
            }
        }
    });

    /** A guard naming a field that does not exist would render a message about nothing. */
    it('guards only on fields the query actually has', () => {
        for (const descriptor of TILED_PLAYGROUND_CATALOG) {
            const names = new Set(descriptor.fields.map((field) => field.name));
            for (const guard of descriptor.guardedBy ?? []) {
                expect(
                    names.has(guard),
                    `${descriptor.id} guards on unknown field '${guard}'`,
                ).toBe(true);
            }
        }
    });

    it('provides a Runner component for every descriptor', () => {
        for (const descriptor of TILED_PLAYGROUND_CATALOG) {
            expect(typeof descriptor.Runner, descriptor.id).toBe('function');
        }
    });

    it('groups in the endpoint registry order, with no empty groups', () => {
        const groups = groupedQueries();
        expect(groups.length).toBeGreaterThan(0);
        for (const entry of groups) {
            expect(entry.queries.length).toBeGreaterThan(0);
        }
        const order = groups.map((entry) => entry.group);
        const expected = TILED_ENDPOINT_GROUPS.filter((group) => order.includes(group));
        expect(order).toEqual(expected);
    });

    it('finds descriptors by id', () => {
        expect(getQueryById('metadata.get')?.hookName).toBe('useTiledMetadataQuery');
        expect(getQueryById('nope')).toBeUndefined();
    });
});
