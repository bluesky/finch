/* eslint-disable react-refresh/only-export-components --
 * A Runner has to live beside its descriptor: the descriptor's whole purpose is to pair a hook's
 * metadata with the one component allowed to call it. Splitting them to satisfy fast refresh would
 * scatter 41 one-hook components across 41 files and leave the catalog pointing at them from
 * elsewhere. These are dev-harness modules; losing component-level HMR granularity here costs
 * nothing.
 */
import {
    useTiledPostTableFullQuery,
    useTiledPostTablePartitionQuery,
    useTiledTableAsQuery,
    useTiledTableFullAsJSONQuery,
    useTiledTableFullAsJSONSequenceQuery,
    useTiledTableFullAsQuery,
    useTiledTablePartitionAsJSONQuery,
    useTiledTablePartitionAsJSONSequenceQuery,
} from '@/api/tiled';
import type { TiledTableEndpoint, TiledTableReturnType } from '@/api/tiled';
import QueryResultPanel from '../QueryResultPanel';
import { list, num, str, type QueryDescriptor, type QueryRunnerProps } from '../types';

/**
 * Table reads, including the two POSTs that are reads.
 *
 * `column` is the field worth playing with here: it narrows the response *and* is part of the cache
 * key, so two reads of one table with different selections are two entries. Leaving it out of the
 * key was a real bug; the cache inspector is where you can see it is no longer one.
 */

const TABLE_PATH = {
    name: 'tablePath',
    kind: 'path',
    label: 'tablePath',
    required: true,
    defaultValue: '',
} as const;

const COLUMN = {
    name: 'column',
    kind: 'stringList',
    label: 'column',
    description: 'narrows the response; empty means every column',
} as const;

const PARTITION = {
    name: 'partition',
    kind: 'number',
    label: 'partition',
    description: '0-based',
    defaultValue: 0,
} as const;

const TABLE_FORMATS = [
    'JSON',
    'JSON_SEQ',
    'CSV',
    'PARQUET',
    'ARROW',
    'XLSX',
    'HDF5',
    'HTML',
    'TEXT',
] as const;

function guard(values: Record<string, unknown>) {
    return {
        guardedBy: ['tablePath'] as const,
        guardSatisfied: str(values, 'tablePath').length > 0,
    };
}

function PartitionJSONRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledTablePartitionAsJSONQuery(
        str(values, 'tablePath'),
        { partition: num(values, 'partition'), column: list(values, 'column') },
        queryOptions,
        requestOptions,
    );
    return <QueryResultPanel result={result} resultKind="json" {...guard(values)} />;
}

function PartitionSeqRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledTablePartitionAsJSONSequenceQuery(
        str(values, 'tablePath'),
        { partition: num(values, 'partition'), column: list(values, 'column') },
        queryOptions,
        requestOptions,
    );
    return <QueryResultPanel result={result} resultKind="json" {...guard(values)} />;
}

function FullJSONRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledTableFullAsJSONQuery(
        str(values, 'tablePath'),
        { column: list(values, 'column') },
        queryOptions,
        requestOptions,
    );
    return <QueryResultPanel result={result} resultKind="json" {...guard(values)} />;
}

function FullSeqRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledTableFullAsJSONSequenceQuery(
        str(values, 'tablePath'),
        { column: list(values, 'column') },
        queryOptions,
        requestOptions,
    );
    return <QueryResultPanel result={result} resultKind="json" {...guard(values)} />;
}

function TableAsRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledTableAsQuery(
        str(values, 'tablePath'),
        str(values, 'type', 'JSON') as TiledTableReturnType,
        str(values, 'endpoint', 'partition') as TiledTableEndpoint,
        { partition: num(values, 'partition'), column: list(values, 'column') },
        queryOptions,
        requestOptions,
    );
    return <QueryResultPanel result={result} resultKind="json" {...guard(values)} />;
}

/** The format decides the return type, so the renderer has to follow it. */
function FullAsRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const format = str(values, 'format', 'CSV');
    const result = useTiledTableFullAsQuery(
        str(values, 'tablePath'),
        format,
        { column: list(values, 'column') },
        queryOptions,
        requestOptions,
    );
    const kind =
        format === 'JSON' || format === 'JSON_SEQ'
            ? 'json'
            : format === 'CSV' || format === 'TEXT' || format === 'HTML'
              ? 'text'
              : 'bytes';
    return <QueryResultPanel result={result} resultKind={kind} {...guard(values)} />;
}

function PostFullRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledPostTableFullQuery(
        str(values, 'tablePath'),
        list(values, 'columns') ?? null,
        { format: str(values, 'format') || undefined },
        queryOptions,
        requestOptions,
    );
    return <QueryResultPanel result={result} resultKind="json" {...guard(values)} />;
}

function PostPartitionRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledPostTablePartitionQuery(
        str(values, 'tablePath'),
        list(values, 'columns') ?? null,
        { partition: num(values, 'partition'), format: str(values, 'format') || undefined },
        queryOptions,
        requestOptions,
    );
    return <QueryResultPanel result={result} resultKind="json" {...guard(values)} />;
}

export const tableQueryDescriptors: readonly QueryDescriptor[] = [
    {
        id: 'table.partitionAsJSON',
        group: 'table',
        hookName: 'useTiledTablePartitionAsJSONQuery',
        summary: 'One partition, column-oriented — what a plotting library wants.',
        fields: [TABLE_PATH, PARTITION, COLUMN],
        guardedBy: ['tablePath'],
        resultKind: 'json',
        Runner: PartitionJSONRunner,
    },
    {
        id: 'table.partitionAsJSONSequence',
        group: 'table',
        hookName: 'useTiledTablePartitionAsJSONSequenceQuery',
        summary: 'One partition, row-oriented — what a table wants.',
        fields: [TABLE_PATH, PARTITION, COLUMN],
        guardedBy: ['tablePath'],
        resultKind: 'json',
        Runner: PartitionSeqRunner,
    },
    {
        id: 'table.fullAsJSON',
        group: 'table',
        hookName: 'useTiledTableFullAsJSONQuery',
        summary: 'Every partition, column-oriented.',
        fields: [TABLE_PATH, COLUMN],
        guardedBy: ['tablePath'],
        resultKind: 'json',
        Runner: FullJSONRunner,
    },
    {
        id: 'table.fullAsJSONSequence',
        group: 'table',
        hookName: 'useTiledTableFullAsJSONSequenceQuery',
        summary: 'Every partition, row-oriented.',
        fields: [TABLE_PATH, COLUMN],
        guardedBy: ['tablePath'],
        resultKind: 'json',
        Runner: FullSeqRunner,
    },
    {
        id: 'table.as',
        group: 'table',
        hookName: 'useTiledTableAsQuery',
        summary: 'The generic dispatcher: format × endpoint.',
        fields: [
            TABLE_PATH,
            {
                name: 'type',
                kind: 'enum',
                label: 'type',
                enums: ['JSON', 'JSON_SEQ'],
                defaultValue: 'JSON',
            },
            {
                name: 'endpoint',
                kind: 'enum',
                label: 'endpoint',
                enums: ['partition', 'full'],
                defaultValue: 'partition',
            },
            PARTITION,
            COLUMN,
        ],
        guardedBy: ['tablePath'],
        resultKind: 'json',
        Runner: TableAsRunner,
    },
    {
        id: 'table.fullAs',
        group: 'table',
        hookName: 'useTiledTableFullAsQuery',
        summary: 'Any representation — CSV, parquet, arrow, Excel. What a download button reads.',
        fields: [
            TABLE_PATH,
            {
                name: 'format',
                kind: 'enum',
                label: 'format',
                enums: TABLE_FORMATS,
                defaultValue: 'CSV',
            },
            COLUMN,
        ],
        guardedBy: ['tablePath'],
        resultKind: 'text',
        Runner: FullAsRunner,
    },
    {
        id: 'table.postFull',
        group: 'table',
        hookName: 'useTiledPostTableFullQuery',
        summary:
            'A read with the column list in the body. The server rejects an empty list with 422.',
        fields: [
            TABLE_PATH,
            { name: 'columns', kind: 'stringList', label: 'columns', required: true },
            { name: 'format', kind: 'enum', label: 'format', enums: TABLE_FORMATS },
        ],
        guardedBy: ['tablePath'],
        resultKind: 'json',
        Runner: PostFullRunner,
    },
    {
        id: 'table.postPartition',
        group: 'table',
        hookName: 'useTiledPostTablePartitionQuery',
        summary: 'The same, for one partition.',
        fields: [
            TABLE_PATH,
            PARTITION,
            { name: 'columns', kind: 'stringList', label: 'columns', required: true },
            { name: 'format', kind: 'enum', label: 'format', enums: TABLE_FORMATS },
        ],
        guardedBy: ['tablePath'],
        resultKind: 'json',
        Runner: PostPartitionRunner,
    },
];
