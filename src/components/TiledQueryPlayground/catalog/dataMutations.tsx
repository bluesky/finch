/* eslint-disable react-refresh/only-export-components --
 * A Runner has to live beside its descriptor; see `infoQueries.tsx` for the reasoning.
 */
import {
    useTiledPatchArrayFullMutation,
    useTiledPatchRaggedFullMutation,
    useTiledPatchTablePartitionMutation,
    useTiledPutArrayBlockMutation,
    useTiledPutArrayFullMutation,
    useTiledPutAwkwardFullMutation,
    useTiledPutNodeFullMutation,
    useTiledPutRaggedBlockMutation,
    useTiledPutRaggedFullMutation,
    useTiledPutTableFullMutation,
    useTiledPutTablePartitionMutation,
} from '@/api/tiled';
import MutationResultPanel from '../MutationResultPanel';
import {
    bool,
    fileBytes,
    json,
    num,
    numList,
    str,
    type MutationDescriptor,
    type MutationRunnerProps,
} from '../types';

/**
 * Data writes — arrays, ragged arrays, tables, nodes and awkward arrays.
 *
 * All but the awkward one take a **binary body**: bytes already in the target's own dtype and C
 * order. Nothing here encodes for you, deliberately — a dtype mismatch writes plausible-looking
 * garbage rather than failing, so that call belongs to whoever knows the dtype. An empty body is
 * still worth sending: the server's complaint about it tells you the request shape was right.
 *
 * Table and node writes additionally need an explicit `mimetype`, because the server dispatches its
 * reader on exactly that header.
 */

const DATA_PATH = {
    name: 'path',
    kind: 'path',
    label: 'path',
    required: true,
    defaultValue: '',
} as const;

const DATA_FILE = {
    name: 'data',
    kind: 'file',
    label: 'data',
    description: 'raw bytes, in the target’s own dtype and C order',
} as const;

const PERSIST = {
    name: 'persist',
    kind: 'boolean',
    label: 'persist',
    description: 'flush to storage rather than leaving the write in the server cache',
} as const;

const MIMETYPE = {
    name: 'mimetype',
    kind: 'enum',
    label: 'mimetype',
    required: true,
    enums: ['application/x-parquet', 'text/csv', 'application/vnd.apache.arrow.file'],
    defaultValue: 'application/x-parquet',
    description: 'the encoding of the body; the server dispatches its reader on this',
} as const;

const REGION_FIELDS = [
    {
        name: 'offset',
        kind: 'numberList',
        label: 'offset',
        required: true,
        description: 'where the region starts, per axis',
    },
    {
        name: 'shape',
        kind: 'numberList',
        label: 'shape',
        required: true,
        description: "the region's size, per axis",
    },
    {
        name: 'extend',
        kind: 'boolean',
        label: 'extend',
        description: 'let the write grow a resizable array — how a running scan appends',
    },
] as const;

const hasPath = (values: Record<string, unknown>) => str(values, 'path').length > 0;

// #region arrays

function PutArrayFullRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledPutArrayFullMutation(undefined, requestOptions);
    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledPutArrayFullMutation"
            canRun={hasPath(values)}
            onRun={() => {
                if (!confirm(`Overwrite the array at "${str(values, 'path')}"`)) return;
                void fileBytes(values, 'data').then((data) =>
                    mutation.mutate({
                        path: str(values, 'path'),
                        data,
                        persist: bool(values, 'persist'),
                    }),
                );
            }}
        />
    );
}

function PutArrayBlockRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledPutArrayBlockMutation(undefined, requestOptions);
    const block = numList(values, 'block');
    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledPutArrayBlockMutation"
            canRun={hasPath(values) && block !== undefined}
            onRun={() => {
                if (!block || !confirm(`Overwrite block ${block.join(',')}`)) return;
                void fileBytes(values, 'data').then((data) =>
                    mutation.mutate({
                        path: str(values, 'path'),
                        data,
                        block,
                        persist: bool(values, 'persist'),
                    }),
                );
            }}
        />
    );
}

function PatchArrayFullRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledPatchArrayFullMutation(undefined, requestOptions);
    const offset = numList(values, 'offset');
    const shape = numList(values, 'shape');
    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledPatchArrayFullMutation"
            canRun={hasPath(values) && offset !== undefined && shape !== undefined}
            onRun={() => {
                if (!offset || !shape) return;
                if (!confirm(`Write a region of "${str(values, 'path')}"`)) return;
                void fileBytes(values, 'data').then((data) =>
                    mutation.mutate({
                        path: str(values, 'path'),
                        data,
                        offset,
                        shape,
                        extend: bool(values, 'extend'),
                        persist: bool(values, 'persist'),
                    }),
                );
            }}
        />
    );
}

// #endregion

// #region ragged

function PutRaggedFullRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledPutRaggedFullMutation(undefined, requestOptions);
    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledPutRaggedFullMutation"
            canRun={hasPath(values)}
            onRun={() => {
                if (!confirm(`Overwrite the ragged array at "${str(values, 'path')}"`)) return;
                void fileBytes(values, 'data').then((data) =>
                    mutation.mutate({
                        path: str(values, 'path'),
                        data,
                        persist: bool(values, 'persist'),
                    }),
                );
            }}
        />
    );
}

function PutRaggedBlockRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledPutRaggedBlockMutation(undefined, requestOptions);
    const block = numList(values, 'block');
    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledPutRaggedBlockMutation"
            canRun={hasPath(values) && block !== undefined}
            onRun={() => {
                if (!block || !confirm(`Overwrite ragged block ${block.join(',')}`)) return;
                void fileBytes(values, 'data').then((data) =>
                    mutation.mutate({
                        path: str(values, 'path'),
                        data,
                        block,
                        persist: bool(values, 'persist'),
                    }),
                );
            }}
        />
    );
}

function PatchRaggedFullRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledPatchRaggedFullMutation(undefined, requestOptions);
    const offset = numList(values, 'offset');
    const shape = numList(values, 'shape');
    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledPatchRaggedFullMutation"
            canRun={hasPath(values) && offset !== undefined && shape !== undefined}
            onRun={() => {
                if (!offset || !shape) return;
                if (!confirm(`Write a region of "${str(values, 'path')}"`)) return;
                void fileBytes(values, 'data').then((data) =>
                    mutation.mutate({
                        path: str(values, 'path'),
                        data,
                        offset,
                        shape,
                        extend: bool(values, 'extend'),
                        persist: bool(values, 'persist'),
                    }),
                );
            }}
        />
    );
}

// #endregion

// #region tables and nodes

function PutTablePartitionRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledPutTablePartitionMutation(undefined, requestOptions);
    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledPutTablePartitionMutation"
            canRun={hasPath(values)}
            onRun={() => {
                if (!confirm(`Overwrite partition ${num(values, 'partition')}`)) return;
                void fileBytes(values, 'data').then((data) =>
                    mutation.mutate({
                        path: str(values, 'path'),
                        data,
                        partition: num(values, 'partition'),
                        mimetype: str(values, 'mimetype', 'application/x-parquet'),
                    }),
                );
            }}
        />
    );
}

function PatchTablePartitionRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledPatchTablePartitionMutation(undefined, requestOptions);
    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledPatchTablePartitionMutation"
            canRun={hasPath(values)}
            onRun={() => {
                if (!confirm(`Append to partition ${num(values, 'partition')}`)) return;
                void fileBytes(values, 'data').then((data) =>
                    mutation.mutate({
                        path: str(values, 'path'),
                        data,
                        partition: num(values, 'partition'),
                        mimetype: str(values, 'mimetype', 'application/x-parquet'),
                    }),
                );
            }}
        />
    );
}

function PutTableFullRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledPutTableFullMutation(undefined, requestOptions);
    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledPutTableFullMutation"
            canRun={hasPath(values)}
            onRun={() => {
                if (!confirm(`Overwrite the table at "${str(values, 'path')}"`)) return;
                void fileBytes(values, 'data').then((data) =>
                    mutation.mutate({
                        path: str(values, 'path'),
                        data,
                        mimetype: str(values, 'mimetype', 'application/x-parquet'),
                    }),
                );
            }}
        />
    );
}

function PutNodeFullRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledPutNodeFullMutation(undefined, requestOptions);
    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledPutNodeFullMutation"
            canRun={hasPath(values)}
            onRun={() => {
                if (!confirm(`Overwrite the node at "${str(values, 'path')}"`)) return;
                void fileBytes(values, 'data').then((data) =>
                    mutation.mutate({
                        path: str(values, 'path'),
                        data,
                        mimetype: str(values, 'mimetype', 'application/x-parquet'),
                    }),
                );
            }}
        />
    );
}

function PutAwkwardFullRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledPutAwkwardFullMutation(undefined, requestOptions);
    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledPutAwkwardFullMutation"
            canRun={hasPath(values)}
            onRun={() =>
                confirm(`Overwrite the awkward array at "${str(values, 'path')}"`) &&
                mutation.mutate({
                    path: str(values, 'path'),
                    form: json(values, 'form') ?? {},
                    length: num(values, 'length'),
                    container: json<Record<string, unknown>>(values, 'container') ?? {},
                })
            }
        />
    );
}

// #endregion

export const dataMutationDescriptors: readonly MutationDescriptor[] = [
    {
        id: 'array.putFull',
        kind: 'mutation',
        group: 'array',
        hookName: 'useTiledPutArrayFullMutation',
        summary: 'Write a whole array.',
        destructive: true,
        fields: [DATA_PATH, DATA_FILE, PERSIST],
        resultKind: 'json',
        Runner: PutArrayFullRunner,
    },
    {
        id: 'array.putBlock',
        kind: 'mutation',
        group: 'array',
        hookName: 'useTiledPutArrayBlockMutation',
        summary: 'Write one chunk.',
        destructive: true,
        fields: [
            DATA_PATH,
            DATA_FILE,
            { name: 'block', kind: 'numberList', label: 'block', required: true },
            PERSIST,
        ],
        resultKind: 'json',
        Runner: PutArrayBlockRunner,
    },
    {
        id: 'array.patchFull',
        kind: 'mutation',
        group: 'array',
        hookName: 'useTiledPatchArrayFullMutation',
        summary: 'Write a sub-region; extend grows a resizable array.',
        destructive: true,
        fields: [DATA_PATH, DATA_FILE, ...REGION_FIELDS, PERSIST],
        resultKind: 'json',
        Runner: PatchArrayFullRunner,
    },
    {
        id: 'ragged.putFull',
        kind: 'mutation',
        group: 'ragged',
        hookName: 'useTiledPutRaggedFullMutation',
        summary: 'Write a whole ragged array.',
        destructive: true,
        fields: [DATA_PATH, DATA_FILE, PERSIST],
        resultKind: 'json',
        Runner: PutRaggedFullRunner,
    },
    {
        id: 'ragged.putBlock',
        kind: 'mutation',
        group: 'ragged',
        hookName: 'useTiledPutRaggedBlockMutation',
        summary: 'Write one chunk of a ragged array.',
        destructive: true,
        fields: [
            DATA_PATH,
            DATA_FILE,
            { name: 'block', kind: 'numberList', label: 'block', required: true },
            PERSIST,
        ],
        resultKind: 'json',
        Runner: PutRaggedBlockRunner,
    },
    {
        id: 'ragged.patchFull',
        kind: 'mutation',
        group: 'ragged',
        hookName: 'useTiledPatchRaggedFullMutation',
        summary: 'Write a sub-region of a ragged array.',
        destructive: true,
        fields: [DATA_PATH, DATA_FILE, ...REGION_FIELDS, PERSIST],
        resultKind: 'json',
        Runner: PatchRaggedFullRunner,
    },
    {
        id: 'table.putPartition',
        kind: 'mutation',
        group: 'table',
        hookName: 'useTiledPutTablePartitionMutation',
        summary: 'Write one partition.',
        destructive: true,
        fields: [
            DATA_PATH,
            DATA_FILE,
            { name: 'partition', kind: 'number', label: 'partition', defaultValue: 0 },
            MIMETYPE,
        ],
        resultKind: 'json',
        Runner: PutTablePartitionRunner,
    },
    {
        id: 'table.patchPartition',
        kind: 'mutation',
        group: 'table',
        hookName: 'useTiledPatchTablePartitionMutation',
        summary: 'Append to one partition.',
        destructive: true,
        fields: [
            DATA_PATH,
            DATA_FILE,
            { name: 'partition', kind: 'number', label: 'partition', defaultValue: 0 },
            MIMETYPE,
        ],
        resultKind: 'json',
        Runner: PatchTablePartitionRunner,
    },
    {
        id: 'table.putFull',
        kind: 'mutation',
        group: 'table',
        hookName: 'useTiledPutTableFullMutation',
        summary: 'Write a whole table. The same server operation as node.putFull.',
        destructive: true,
        fields: [DATA_PATH, DATA_FILE, MIMETYPE],
        resultKind: 'json',
        Runner: PutTableFullRunner,
    },
    {
        id: 'node.putFull',
        kind: 'mutation',
        group: 'node',
        hookName: 'useTiledPutNodeFullMutation',
        summary: 'Write a whole node.',
        destructive: true,
        fields: [DATA_PATH, DATA_FILE, MIMETYPE],
        resultKind: 'json',
        Runner: PutNodeFullRunner,
    },
    {
        id: 'awkward.putFull',
        kind: 'mutation',
        group: 'awkward',
        hookName: 'useTiledPutAwkwardFullMutation',
        summary: 'Write an awkward array as its form plus a buffer map. JSON, not bytes.',
        destructive: true,
        fields: [
            DATA_PATH,
            { name: 'form', kind: 'json', label: 'form', defaultValue: {} },
            { name: 'length', kind: 'number', label: 'length', defaultValue: 0 },
            { name: 'container', kind: 'json', label: 'container', defaultValue: {} },
        ],
        resultKind: 'json',
        Runner: PutAwkwardFullRunner,
    },
];
