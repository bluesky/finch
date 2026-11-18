import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * The viewer reads Tiled only through Finch's hooks in `src/api/tiled`. It must not build its own
 * query logic (keys, query functions, `useQuery`/`fetchQuery`) or call the client or the free
 * functions directly — otherwise its reads drift from the hooks' keys, invalidation and error
 * handling.
 */
const VIEWER_DIR = join(process.cwd(), 'src/components/Tiled/TiledFinder');

/** The one file allowed to touch TanStack directly: it only supplies a QueryClient. */
const QUERY_CLIENT_BOUNDARY = 'TiledFinderQueryBoundary.tsx';

const FORBIDDEN: { pattern: RegExp; why: string }[] = [
    {
        pattern: /\buseQuery\s*\(|\buseQueries\s*\(|\buseInfiniteQuery\s*\(/,
        why: 'raw TanStack query',
    },
    {
        pattern: /\bfetchQuery\s*\(|\bprefetchQuery\s*\(|\bensureQueryData\s*\(/,
        why: 'imperative query',
    },
    { pattern: /\bqueryFn\b|\bqueryKey\b|\btiledQueryKeys\b/, why: 'hand-built query' },
    { pattern: /@\/api\/tiled\/client/, why: 'direct client import' },
];

function sourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) return sourceFiles(path);
        return /\.(ts|tsx)$/.test(name) ? [path] : [];
    });
}

describe('TiledFinder reads Tiled only through Finch hooks', () => {
    const files = sourceFiles(VIEWER_DIR);

    it('finds the viewer sources', () => {
        expect(files.length).toBeGreaterThan(10);
    });

    it.each(files.map((file) => [relative(VIEWER_DIR, file), file]))('%s', (_name, file) => {
        const source = readFileSync(file, 'utf8');
        const violations = FORBIDDEN.filter(({ pattern }) => pattern.test(source)).map(
            ({ why }) => why,
        );
        // From Finch's Tiled layer: hooks, the provider, types and error helpers — not the free
        // request functions or the default-client setters.
        for (const match of source.matchAll(
            /import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*'@\/api\/tiled'/g,
        )) {
            const names = match[1].split(',').map((n) => n.trim().replace(/^type\s+/, ''));
            const facade = names.filter((n) =>
                /^(getTiled|setDefault|setGlobal|loginWith|resetDefault)/.test(n),
            );
            if (facade.length) violations.push(`facade import: ${facade.join(', ')}`);
        }
        if (!file.endsWith(QUERY_CLIENT_BOUNDARY) && /@tanstack\/react-query/.test(source)) {
            const imported = source.match(/import\s*\{([^}]*)\}\s*from\s*'@tanstack\/react-query'/);
            const names = imported ? imported[1].split(',').map((n) => n.trim()) : ['?'];
            // Option helpers passed to Finch's hooks are fine; anything else is query logic.
            const disallowed = names.filter((n) => n && n !== 'keepPreviousData');
            if (disallowed.length) violations.push(`TanStack import: ${disallowed.join(', ')}`);
        }
        expect(violations).toEqual([]);
    });
});
