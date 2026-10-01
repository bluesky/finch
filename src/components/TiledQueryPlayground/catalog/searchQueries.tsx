/* eslint-disable react-refresh/only-export-components --
 * A Runner has to live beside its descriptor: the descriptor's whole purpose is to pair a hook's
 * metadata with the one component allowed to call it. Splitting them to satisfy fast refresh would
 * scatter 41 one-hook components across 41 files and leave the catalog pointing at them from
 * elsewhere. These are dev-harness modules; losing component-level HMR granularity here costs
 * nothing.
 */
import {
    useTiledDistinctQuery,
    useTiledMetadataQuery,
    useTiledSearchByFullTextQuery,
    useTiledSearchByMetadataComparisonQuery,
    useTiledSearchByMetadataEqualsQuery,
    useTiledSearchByRegexQuery,
    useTiledSearchBySpecsQuery,
    useTiledSearchByStructureFamilyQuery,
    useTiledSearchQuery,
} from '@/api/tiled';
import type {
    Operator,
    StructureFamily,
    TiledDistinctConfig,
    TiledSearchConfig,
    TiledSearchOptions,
} from '@/api/tiled';
import QueryResultPanel from '../QueryResultPanel';
import { bool, json, list, str, type QueryDescriptor, type QueryRunnerProps } from '../types';

/**
 * Search, faceting and metadata.
 *
 * The six filter conveniences share one endpoint and one `search` query root, so running two of
 * them with filters that build the same config is the clearest demonstration of key sharing the
 * cache inspector offers.
 *
 * `searchPath: ''` is the root container and is legal, which is why none of these are guarded on
 * their path — unlike everything in the data groups.
 */

const SEARCH_PATH = {
    name: 'searchPath',
    kind: 'path',
    label: 'searchPath',
    description: 'the container to search; empty is the root',
    defaultValue: '',
} as const;

/** Shared across the six conveniences: pagination, sorting, field selection. */
const SEARCH_OPTIONS = {
    name: 'searchOptions',
    kind: 'json',
    label: 'searchOptions',
    description: 'pageLimit, pageOffset, sort, fields, selectMetadata, …',
} as const;

function readSearchOptions(values: Record<string, unknown>) {
    return json<TiledSearchOptions>(values, 'searchOptions');
}

function SearchRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledSearchQuery(
        str(values, 'searchPath'),
        json<TiledSearchConfig>(values, 'config'),
        queryOptions,
        requestOptions,
    );
    return <QueryResultPanel result={result} resultKind="json" />;
}

function SearchBySpecsRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledSearchBySpecsQuery(
        str(values, 'searchPath'),
        { include: list(values, 'include') ?? [], exclude: list(values, 'exclude') ?? [] },
        readSearchOptions(values),
        queryOptions,
        requestOptions,
    );
    return <QueryResultPanel result={result} resultKind="json" />;
}

function SearchByFullTextRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledSearchByFullTextQuery(
        str(values, 'searchPath'),
        { text: str(values, 'text') },
        readSearchOptions(values),
        queryOptions,
        requestOptions,
    );
    return (
        <QueryResultPanel
            result={result}
            resultKind="json"
            guardedBy={['text']}
            guardSatisfied={str(values, 'text').length > 0}
        />
    );
}

function SearchByMetadataEqualsRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledSearchByMetadataEqualsQuery(
        str(values, 'searchPath'),
        { key: str(values, 'key'), value: json(values, 'value') ?? str(values, 'value') },
        readSearchOptions(values),
        queryOptions,
        requestOptions,
    );
    return <QueryResultPanel result={result} resultKind="json" />;
}

function SearchByStructureFamilyRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledSearchByStructureFamilyQuery(
        str(values, 'searchPath'),
        { value: str(values, 'value', 'array') as StructureFamily },
        readSearchOptions(values),
        queryOptions,
        requestOptions,
    );
    return <QueryResultPanel result={result} resultKind="json" />;
}

function SearchByRegexRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledSearchByRegexQuery(
        str(values, 'searchPath'),
        {
            key: str(values, 'key'),
            pattern: str(values, 'pattern'),
            caseSensitive: bool(values, 'caseSensitive'),
        },
        readSearchOptions(values),
        queryOptions,
        requestOptions,
    );
    return <QueryResultPanel result={result} resultKind="json" />;
}

function SearchByComparisonRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledSearchByMetadataComparisonQuery(
        str(values, 'searchPath'),
        {
            operator: str(values, 'operator', 'gt') as Operator,
            key: str(values, 'key'),
            value: json(values, 'value') ?? str(values, 'value'),
        },
        readSearchOptions(values),
        queryOptions,
        requestOptions,
    );
    return <QueryResultPanel result={result} resultKind="json" />;
}

function DistinctRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const config: TiledDistinctConfig = {
        structureFamilies: bool(values, 'structureFamilies'),
        specs: bool(values, 'specs'),
        counts: bool(values, 'counts'),
        metadata: list(values, 'metadata'),
        searchFilters: json(values, 'searchFilters'),
    };
    const result = useTiledDistinctQuery(
        str(values, 'searchPath'),
        config,
        queryOptions,
        requestOptions,
    );
    return (
        <QueryResultPanel
            result={result}
            resultKind="json"
            guardedBy={['structureFamilies', 'specs', 'counts', 'metadata']}
            guardSatisfied={
                config.structureFamilies === true ||
                config.specs === true ||
                config.counts === true ||
                (config.metadata?.length ?? 0) > 0
            }
        />
    );
}

function MetadataRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledMetadataQuery(str(values, 'path'), queryOptions, requestOptions);
    return (
        <QueryResultPanel
            result={result}
            resultKind="json"
            guardedBy={['path']}
            guardSatisfied={str(values, 'path').length > 0}
        />
    );
}

export const searchQueryDescriptors: readonly QueryDescriptor[] = [
    {
        id: 'search.search',
        group: 'search',
        hookName: 'useTiledSearchQuery',
        summary: 'The general form: a whole TiledSearchConfig of filters and options.',
        fields: [
            SEARCH_PATH,
            {
                name: 'config',
                kind: 'json',
                label: 'config',
                description:
                    '{ searchFilters, searchOptions } — filter values are JSON-encoded for you',
                defaultValue: { searchOptions: { pageLimit: 10 } },
            },
        ],
        resultKind: 'json',
        Runner: SearchRunner,
    },
    {
        id: 'search.bySpecs',
        group: 'search',
        hookName: 'useTiledSearchBySpecsQuery',
        summary: 'Filter by spec name. Both lists travel as whole JSON arrays.',
        fields: [
            SEARCH_PATH,
            {
                name: 'include',
                kind: 'stringList',
                label: 'include',
                defaultValue: ['BlueskyRun'],
            },
            { name: 'exclude', kind: 'stringList', label: 'exclude' },
            SEARCH_OPTIONS,
        ],
        resultKind: 'json',
        Runner: SearchBySpecsRunner,
    },
    {
        id: 'search.byFullText',
        group: 'search',
        hookName: 'useTiledSearchByFullTextQuery',
        summary: 'Full-text across metadata. Idles while the text is empty.',
        fields: [
            SEARCH_PATH,
            { name: 'text', kind: 'text', label: 'text', required: true },
            SEARCH_OPTIONS,
        ],
        guardedBy: ['text'],
        resultKind: 'json',
        Runner: SearchByFullTextRunner,
    },
    {
        id: 'search.byMetadataEquals',
        group: 'search',
        hookName: 'useTiledSearchByMetadataEqualsQuery',
        summary: 'Exact match on a metadata key. Pass the value itself, not pre-quoted JSON.',
        fields: [
            SEARCH_PATH,
            { name: 'key', kind: 'text', label: 'key', defaultValue: 'start.plan_name' },
            {
                name: 'value',
                kind: 'json',
                label: 'value',
                description: 'string | number | boolean | null — quoted for you on the wire',
                defaultValue: 'count',
            },
            SEARCH_OPTIONS,
        ],
        resultKind: 'json',
        Runner: SearchByMetadataEqualsRunner,
    },
    {
        id: 'search.byStructureFamily',
        group: 'search',
        hookName: 'useTiledSearchByStructureFamilyQuery',
        summary: 'Filter by structure family.',
        fields: [
            SEARCH_PATH,
            {
                name: 'value',
                kind: 'enum',
                label: 'value',
                enums: ['array', 'awkward', 'bytes', 'container', 'ragged', 'sparse', 'table'],
                defaultValue: 'table',
            },
            SEARCH_OPTIONS,
        ],
        resultKind: 'json',
        Runner: SearchByStructureFamilyRunner,
    },
    {
        id: 'search.byRegex',
        group: 'search',
        hookName: 'useTiledSearchByRegexQuery',
        summary: 'Regular-expression match. The pattern is a plain string, not JSON-encoded.',
        fields: [
            SEARCH_PATH,
            { name: 'key', kind: 'text', label: 'key', defaultValue: 'start.plan_name' },
            { name: 'pattern', kind: 'text', label: 'pattern', defaultValue: '^co' },
            { name: 'caseSensitive', kind: 'boolean', label: 'caseSensitive' },
            SEARCH_OPTIONS,
        ],
        resultKind: 'json',
        Runner: SearchByRegexRunner,
    },
    {
        id: 'search.byComparison',
        group: 'search',
        hookName: 'useTiledSearchByMetadataComparisonQuery',
        summary: 'Ordered comparison on a metadata key.',
        fields: [
            SEARCH_PATH,
            {
                name: 'operator',
                kind: 'enum',
                label: 'operator',
                enums: ['gt', 'gte', 'lt', 'lte'],
                defaultValue: 'gt',
            },
            { name: 'key', kind: 'text', label: 'key', defaultValue: 'start.time' },
            { name: 'value', kind: 'json', label: 'value', defaultValue: 0 },
            SEARCH_OPTIONS,
        ],
        resultKind: 'json',
        Runner: SearchByComparisonRunner,
    },
    {
        id: 'search.distinct',
        group: 'search',
        hookName: 'useTiledDistinctQuery',
        summary:
            'Facets over a container, scoped by the same filters a search takes. Idles until you ask for one.',
        fields: [
            SEARCH_PATH,
            { name: 'structureFamilies', kind: 'boolean', label: 'structureFamilies' },
            { name: 'specs', kind: 'boolean', label: 'specs' },
            { name: 'counts', kind: 'boolean', label: 'counts', defaultValue: true },
            {
                name: 'metadata',
                kind: 'stringList',
                label: 'metadata',
                description: 'keys to compute distinct values for',
                defaultValue: ['start.plan_name'],
            },
            { name: 'searchFilters', kind: 'json', label: 'searchFilters' },
        ],
        guardedBy: ['structureFamilies', 'specs', 'counts', 'metadata'],
        resultKind: 'json',
        Runner: DistinctRunner,
    },
    {
        id: 'metadata.get',
        group: 'metadata',
        hookName: 'useTiledMetadataQuery',
        summary: "One node's metadata, specs, structure and links. Idles on an empty path.",
        fields: [{ name: 'path', kind: 'path', label: 'path', required: true, defaultValue: '' }],
        guardedBy: ['path'],
        resultKind: 'json',
        Runner: MetadataRunner,
    },
];
