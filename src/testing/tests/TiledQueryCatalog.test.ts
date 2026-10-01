import { describe, expect, it } from 'vitest';
import * as tiled from '../../api/tiled';
import { TILED_ENDPOINT_GROUPS } from '../../api/tiled';
import {
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

    it('covers the whole surface, counted', () => {
        // 41 hooks: 40 queries plus the URL helper. A change here should be a deliberate edit.
        expect(exportedQueryHooks).toHaveLength(40);
        expect(TILED_QUERY_CATALOG).toHaveLength(41);
    });
});

describe('query catalog shape', () => {
    it('has unique ids', () => {
        const ids = TILED_QUERY_CATALOG.map((descriptor) => descriptor.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('puts every descriptor in a known endpoint group', () => {
        for (const descriptor of TILED_QUERY_CATALOG) {
            expect(TILED_ENDPOINT_GROUPS, descriptor.id).toContain(descriptor.group);
        }
    });

    it('gives every field a unique name within its query', () => {
        for (const descriptor of TILED_QUERY_CATALOG) {
            const names = descriptor.fields.map((field) => field.name);
            expect(new Set(names).size, descriptor.id).toBe(names.length);
        }
    });

    it('declares enums for every enum field', () => {
        for (const descriptor of TILED_QUERY_CATALOG) {
            for (const field of descriptor.fields) {
                if (field.kind !== 'enum') continue;
                expect(field.enums?.length, `${descriptor.id}.${field.name}`).toBeGreaterThan(0);
            }
        }
    });

    /** A guard naming a field that does not exist would render a message about nothing. */
    it('guards only on fields the query actually has', () => {
        for (const descriptor of TILED_QUERY_CATALOG) {
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
        for (const descriptor of TILED_QUERY_CATALOG) {
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
