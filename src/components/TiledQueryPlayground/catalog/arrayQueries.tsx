/* eslint-disable react-refresh/only-export-components --
 * A Runner has to live beside its descriptor: the descriptor's whole purpose is to pair a hook's
 * metadata with the one component allowed to call it. Splitting them to satisfy fast refresh would
 * scatter 41 one-hook components across 41 files and leave the catalog pointing at them from
 * elsewhere. These are dev-harness modules; losing component-level HMR granularity here costs
 * nothing.
 */
import {
    useTiledArrayAsBufferQuery,
    useTiledArrayAsJSONQuery,
    useTiledArrayAsPngQuery,
    useTiledArrayAsQuery,
    useTiledArrayBlockQuery,
    useTiledArrayImagePath,
} from '@/api/tiled';
import type { TiledArrayEndpointParams, TiledArrayReturnType } from '@/api/tiled';
import QueryResultPanel from '../QueryResultPanel';
import ResultRenderer from '../ResultRenderer';
import { bool, num, numList, str, type QueryDescriptor, type QueryRunnerProps } from '../types';

/**
 * Array reads.
 *
 * All of them idle on an empty path, and all of them share the `array` query root — so two format
 * reads of the same array are two entries (the format is in the key) while two reads differing only
 * in `structure` are one (it cannot change the bytes).
 */

const ARRAY_PATH = {
    name: 'arrayPath',
    kind: 'path',
    label: 'arrayPath',
    required: true,
    defaultValue: '',
} as const;

/** The downsampling and slicing parameters, shared by the four format reads. */
const ARRAY_OPTION_FIELDS = [
    {
        name: 'stack',
        kind: 'numberList',
        label: 'stack',
        description: 'frame indices for a higher-dimensional array, e.g. 5',
    },
    {
        name: 'downSampleRatio',
        kind: 'number',
        label: 'downSampleRatio',
        description: '1 = every pixel, 2 = every other; wins over maxBytesAllowed',
    },
    {
        name: 'maxBytesAllowed',
        kind: 'number',
        label: 'maxBytesAllowed',
        description: 'the client computes a stride from the shape and dtype to fit this',
    },
    { name: 'isRGB', kind: 'boolean', label: 'isRGB' },
    {
        name: 'channelFirst',
        kind: 'boolean',
        label: 'channelFirst',
        description: 'with isRGB, for [3, h, w] rather than [h, w, 3]',
    },
] as const;

function readArrayOptions(values: Record<string, unknown>): TiledArrayEndpointParams {
    return {
        stack: numList(values, 'stack'),
        downSampleRatio:
            values.downSampleRatio === undefined ? undefined : num(values, 'downSampleRatio'),
        maxBytesAllowed:
            values.maxBytesAllowed === undefined ? undefined : num(values, 'maxBytesAllowed'),
        isRGB: bool(values, 'isRGB') || undefined,
        channelFirst: bool(values, 'channelFirst') || undefined,
    };
}

function guard(values: Record<string, unknown>) {
    return {
        guardedBy: ['arrayPath'] as const,
        guardSatisfied: str(values, 'arrayPath').length > 0,
    };
}

function ArrayAsRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const type = str(values, 'type', 'JSON') as TiledArrayReturnType;
    const result = useTiledArrayAsQuery(
        str(values, 'arrayPath'),
        type,
        readArrayOptions(values),
        queryOptions,
        requestOptions,
    );
    return (
        <QueryResultPanel
            result={result}
            resultKind={type === 'PNG' ? 'image' : type === 'BUFFER' ? 'bytes' : 'json'}
            {...guard(values)}
        />
    );
}

function ArrayAsJSONRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledArrayAsJSONQuery(
        str(values, 'arrayPath'),
        readArrayOptions(values),
        queryOptions,
        requestOptions,
    );
    return <QueryResultPanel result={result} resultKind="json" {...guard(values)} />;
}

function ArrayAsPngRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledArrayAsPngQuery(
        str(values, 'arrayPath'),
        readArrayOptions(values),
        queryOptions,
        requestOptions,
    );
    return <QueryResultPanel result={result} resultKind="image" {...guard(values)} />;
}

function ArrayAsBufferRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledArrayAsBufferQuery(
        str(values, 'arrayPath'),
        readArrayOptions(values),
        queryOptions,
        requestOptions,
    );
    return <QueryResultPanel result={result} resultKind="bytes" {...guard(values)} />;
}

function ArrayBlockRunner({ values, queryOptions, requestOptions }: QueryRunnerProps) {
    const block = numList(values, 'block');
    const result = useTiledArrayBlockQuery(
        str(values, 'arrayPath'),
        block ? { block, slice: str(values, 'slice') || undefined } : undefined,
        queryOptions,
        requestOptions,
    );
    return (
        <QueryResultPanel
            result={result}
            resultKind="bytes"
            guardedBy={['arrayPath', 'block']}
            guardSatisfied={str(values, 'arrayPath').length > 0 && block !== undefined}
        />
    );
}

/**
 * The one entry that is not a query.
 *
 * `useTiledArrayImagePath` is synchronous and returns a string — there is no request, no cache
 * entry and no status. It renders the URL and an `<img>` rather than a result panel.
 */
function ArrayImagePathRunner({ values, requestOptions }: QueryRunnerProps) {
    const url = useTiledArrayImagePath(
        str(values, 'arrayPath'),
        readArrayOptions(values),
        requestOptions,
    );
    return (
        <div className="space-y-2">
            <p className="text-xs text-slate-500">
                Not a query — synchronous, no request, no cache entry. Being synchronous it cannot
                fetch the structure either, so downsampling applies only if you pass one.
            </p>
            <ResultRenderer kind="url" value={url} />
        </div>
    );
}

export const arrayQueryDescriptors: readonly QueryDescriptor[] = [
    {
        id: 'array.asJSON',
        kind: 'query',
        group: 'array',
        hookName: 'useTiledArrayAsJSONQuery',
        summary: 'An array as JSON — number[][] by default.',
        fields: [ARRAY_PATH, ...ARRAY_OPTION_FIELDS],
        guardedBy: ['arrayPath'],
        resultKind: 'json',
        Runner: ArrayAsJSONRunner,
    },
    {
        id: 'array.asPng',
        kind: 'query',
        group: 'array',
        hookName: 'useTiledArrayAsPngQuery',
        summary: 'An array as a PNG Blob, rendered here as a picture.',
        fields: [ARRAY_PATH, ...ARRAY_OPTION_FIELDS],
        guardedBy: ['arrayPath'],
        resultKind: 'image',
        Runner: ArrayAsPngRunner,
    },
    {
        id: 'array.asBuffer',
        kind: 'query',
        group: 'array',
        hookName: 'useTiledArrayAsBufferQuery',
        summary: 'Raw bytes in the array dtype and C order.',
        fields: [ARRAY_PATH, ...ARRAY_OPTION_FIELDS],
        guardedBy: ['arrayPath'],
        resultKind: 'bytes',
        Runner: ArrayAsBufferRunner,
    },
    {
        id: 'array.as',
        kind: 'query',
        group: 'array',
        hookName: 'useTiledArrayAsQuery',
        summary:
            'The generic dispatcher. The format is part of the key, so each gets its own entry.',
        fields: [
            ARRAY_PATH,
            {
                name: 'type',
                kind: 'enum',
                label: 'type',
                enums: ['JSON', 'PNG', 'BUFFER'],
                defaultValue: 'JSON',
            },
            ...ARRAY_OPTION_FIELDS,
        ],
        guardedBy: ['arrayPath'],
        resultKind: 'json',
        Runner: ArrayAsRunner,
    },
    {
        id: 'array.block',
        kind: 'query',
        group: 'array',
        hookName: 'useTiledArrayBlockQuery',
        summary: 'One chunk, addressed by its block index. Idles until block is given.',
        fields: [
            ARRAY_PATH,
            {
                name: 'block',
                kind: 'numberList',
                label: 'block',
                description: 'index per axis, e.g. 0,0',
                required: true,
            },
            { name: 'slice', kind: 'text', label: 'slice' },
        ],
        guardedBy: ['arrayPath', 'block'],
        resultKind: 'bytes',
        Runner: ArrayBlockRunner,
    },
    {
        id: 'array.imagePath',
        kind: 'query',
        group: 'array',
        hookName: 'useTiledArrayImagePath',
        summary: 'A URL for <img src>. Synchronous — not a query.',
        fields: [ARRAY_PATH, ...ARRAY_OPTION_FIELDS],
        resultKind: 'url',
        Runner: ArrayImagePathRunner,
    },
];
