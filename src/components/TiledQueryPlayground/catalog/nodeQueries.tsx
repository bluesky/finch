/* eslint-disable react-refresh/only-export-components --
 * A Runner has to live beside its descriptor: the descriptor's whole purpose is to pair a hook's
 * metadata with the one component allowed to call it. Splitting them to satisfy fast refresh would
 * scatter 41 one-hook components across 41 files and leave the catalog pointing at them from
 * elsewhere. These are dev-harness modules; losing component-level HMR granularity here costs
 * nothing.
 */
import {
    useTiledAwkwardBuffersQuery,
    useTiledAwkwardFullQuery,
    useTiledContainerFullQuery,
    useTiledNodeFullQuery,
    useTiledPostAwkwardBuffersQuery,
    useTiledPostContainerFullQuery,
    useTiledRaggedFullQuery,
} from '@/api/tiled';
import QueryResultPanel from '../QueryResultPanel';
import { list, str, type QueryDescriptor, type QueryRunnerProps } from '../types';

/**
 * Containers, nodes, awkward and ragged arrays.
 *
 * Four structure families, four query roots, one shape of request between them: a path, a selection
 * and a format. Pointing one at a node of the wrong family answers a 404 that names both families —
 * which is the server being right, and is worth seeing at least once so it is not mistaken for a
 * client bug later.
 */

const NODE_PATH = {
    name: 'path',
    kind: 'path',
    label: 'path',
    required: true,
    defaultValue: '',
} as const;

const FORMAT = {
    name: 'format',
    kind: 'enum',
    label: 'format',
    enums: ['JSON', 'CSV', 'PARQUET', 'ARROW', 'HDF5', 'ZIP', 'TEXT'],
} as const;

const FIELD = {
    name: 'field',
    kind: 'stringList',
    label: 'field',
    description: 'child keys, or columns for a table',
} as const;

function guard(values: Record<string, unknown>) {
    return { guardedBy: ['path'] as const, guardSatisfied: str(values, 'path').length > 0 };
}

/** The format decides the return type; `json` is the default and the common case. */
function kindFor(format: string): 'json' | 'text' | 'bytes' {
    if (!format || format === 'JSON') return 'json';
    if (format === 'CSV' || format === 'TEXT') return 'text';
    return 'bytes';
}

function ContainerFullRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const format = str(values, 'format');
    const result = useTiledContainerFullQuery(
        str(values, 'path'),
        { field: list(values, 'field'), format: format || undefined },
        queryOptions,
        requestOptions,
    );
    return <QueryResultPanel result={result} resultKind={kindFor(format)} {...guard(values)} />;
}

function PostContainerFullRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledPostContainerFullQuery(
        str(values, 'path'),
        list(values, 'fields') ?? null,
        { format: str(values, 'format') || undefined },
        queryOptions,
        requestOptions,
    );
    return <QueryResultPanel result={result} resultKind="json" {...guard(values)} />;
}

function NodeFullRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const format = str(values, 'format');
    const result = useTiledNodeFullQuery(
        str(values, 'path'),
        { field: list(values, 'field'), format: format || undefined },
        queryOptions,
        requestOptions,
    );
    return <QueryResultPanel result={result} resultKind={kindFor(format)} {...guard(values)} />;
}

function AwkwardFullRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledAwkwardFullQuery(
        str(values, 'path'),
        { format: str(values, 'format') || undefined },
        queryOptions,
        requestOptions,
    );
    return <QueryResultPanel result={result} resultKind="json" {...guard(values)} />;
}

function AwkwardBuffersRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledAwkwardBuffersQuery(
        str(values, 'path'),
        { form_key: list(values, 'form_key'), format: str(values, 'format') || undefined },
        queryOptions,
        requestOptions,
    );
    return <QueryResultPanel result={result} resultKind="json" {...guard(values)} />;
}

function PostAwkwardBuffersRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const formKeys = list(values, 'formKeys');
    const result = useTiledPostAwkwardBuffersQuery(
        str(values, 'path'),
        formKeys,
        { format: str(values, 'format') || undefined },
        queryOptions,
        requestOptions,
    );
    return (
        <QueryResultPanel
            result={result}
            resultKind="json"
            guardedBy={['path', 'formKeys']}
            guardSatisfied={str(values, 'path').length > 0 && formKeys !== undefined}
        />
    );
}

function RaggedFullRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledRaggedFullQuery(
        str(values, 'path'),
        { slice: str(values, 'slice') || undefined, format: str(values, 'format') || undefined },
        queryOptions,
        requestOptions,
    );
    return <QueryResultPanel result={result} resultKind="json" {...guard(values)} />;
}

export const nodeQueryDescriptors: readonly QueryDescriptor[] = [
    {
        id: 'container.full',
        group: 'container',
        hookName: 'useTiledContainerFullQuery',
        summary:
            "A container's metadata and data together. format: HDF5 or ZIP packages the subtree.",
        fields: [NODE_PATH, FIELD, FORMAT],
        guardedBy: ['path'],
        resultKind: 'json',
        Runner: ContainerFullRunner,
    },
    {
        id: 'container.postFull',
        group: 'container',
        hookName: 'useTiledPostContainerFullQuery',
        summary: 'The same with the field list in the body. A read, despite the verb.',
        fields: [
            NODE_PATH,
            { name: 'fields', kind: 'stringList', label: 'fields', required: true },
            FORMAT,
        ],
        guardedBy: ['path'],
        resultKind: 'json',
        Runner: PostContainerFullRunner,
    },
    {
        id: 'node.full',
        group: 'node',
        hookName: 'useTiledNodeFullQuery',
        summary:
            'Whichever of container or table the node turns out to be — the server dispatches.',
        fields: [NODE_PATH, FIELD, FORMAT],
        guardedBy: ['path'],
        resultKind: 'json',
        Runner: NodeFullRunner,
    },
    {
        id: 'awkward.full',
        group: 'awkward',
        hookName: 'useTiledAwkwardFullQuery',
        summary: 'A whole awkward array.',
        fields: [NODE_PATH, FORMAT],
        guardedBy: ['path'],
        resultKind: 'json',
        Runner: AwkwardFullRunner,
    },
    {
        id: 'awkward.buffers',
        group: 'awkward',
        hookName: 'useTiledAwkwardBuffersQuery',
        summary: 'Selected buffers by form key — one field of a nested record without the rest.',
        fields: [NODE_PATH, { name: 'form_key', kind: 'stringList', label: 'form_key' }, FORMAT],
        guardedBy: ['path'],
        resultKind: 'json',
        Runner: AwkwardBuffersRunner,
    },
    {
        id: 'awkward.postBuffers',
        group: 'awkward',
        hookName: 'useTiledPostAwkwardBuffersQuery',
        summary: 'The same with the form-key list in the body.',
        fields: [
            NODE_PATH,
            { name: 'formKeys', kind: 'stringList', label: 'formKeys', required: true },
            FORMAT,
        ],
        guardedBy: ['path', 'formKeys'],
        resultKind: 'json',
        Runner: PostAwkwardBuffersRunner,
    },
    {
        id: 'ragged.full',
        group: 'ragged',
        hookName: 'useTiledRaggedFullQuery',
        summary: 'A ragged array — rows of varying length.',
        fields: [
            NODE_PATH,
            { name: 'slice', kind: 'text', label: 'slice', description: "e.g. '::2'" },
            FORMAT,
        ],
        guardedBy: ['path'],
        resultKind: 'json',
        Runner: RaggedFullRunner,
    },
];
