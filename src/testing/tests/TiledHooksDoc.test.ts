import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import * as tiled from '../../api/tiled';

/**
 * The hooks page's reference tables must list every hook, and no hook that does not exist.
 *
 * Third of the same arrangement: `TiledRegistry.test.ts` keeps the endpoint registry honest against
 * `openapi.json`, `TiledQueryCatalog.test.ts` keeps the playground honest against the hooks, and this
 * keeps the documentation honest against them too. It is the cheapest of the three and the easiest to
 * skip, which is why it is worth having — a reference table is read as authoritative, so a hook
 * missing from it is a hook nobody finds, and a hook listed but since renamed is worse than no table.
 *
 * It checks names only. Whether a row's argument list is right is not mechanically checkable here;
 * that is what review is for.
 */

const DOC = path.join(__dirname, '../../stories/TiledHooks.md');

/** Placeholders in the call-shape sketch at the top. They stand for any hook, so they are not real. */
const PLACEHOLDERS = new Set(['useTiledSomethingQuery', 'useTiledSomethingMutation']);

/**
 * Hooks that are infrastructure rather than an endpoint: they make no request, so they belong in the
 * prose where they are relevant rather than in a table of API operations.
 */
const NOT_ENDPOINTS = new Set([
    'useTiledClient',
    'useTiledQueryScope',
    'useTiledInvalidate',
    'useTiledApiClient',
    'useTiledApiClientOptional',
]);

const markdown = fs.readFileSync(DOC, 'utf8');

/** Hooks named in a table row — the reference tables, as opposed to a mention in a code sample. */
const inTables = new Set(
    markdown
        .split('\n')
        .filter((line) => line.startsWith('|'))
        .flatMap((line) => [...line.matchAll(/`(useTiled\w+)`/g)].map((match) => match[1])),
);

const everyMention = new Set([...markdown.matchAll(/useTiled\w+/g)].map((match) => match[0]));

const exportedHooks = Object.keys(tiled)
    .filter((name) => name.startsWith('useTiled') && !NOT_ENDPOINTS.has(name))
    .sort();

describe('TiledHooks.md reference tables', () => {
    it('lists every exported hook', () => {
        const missing = exportedHooks.filter((name) => !inTables.has(name));

        expect(
            missing,
            `hooks with no row in the reference tables:\n${missing.join('\n')}`,
        ).toEqual([]);
    });

    it('names no hook that does not exist', () => {
        const exported = new Set(Object.keys(tiled));
        const unknown = [...everyMention].filter(
            (name) => !exported.has(name) && !PLACEHOLDERS.has(name),
        );

        expect(unknown, `named in the docs but not exported:\n${unknown.join('\n')}`).toEqual([]);
    });

    it('opens with the tables rather than with prose', () => {
        // The point of the rewrite: the reference comes first, the commentary after. If a future
        // edit buries the tables under sections again, this fails rather than quietly regressing.
        const firstTable = markdown.indexOf('\n| hook ');
        const detailMarker = markdown.indexOf('Everything below is detail');

        expect(firstTable).toBeGreaterThan(-1);
        expect(detailMarker).toBeGreaterThan(firstTable);
    });
});
