import { useEffect, useMemo, useState } from 'react';
import JsonResultViewer from '../devtools/JsonResultViewer';
import type { QueryResultKind } from './types';

export interface ResultRendererProps {
    kind: QueryResultKind;
    value: unknown;
}

/**
 * Renders a query result according to what it actually is.
 *
 * `TestTiled` summarises bytes as `«ArrayBuffer, 4031 bytes»`, which is the right call for a
 * 22-endpoint sweep and useless when the point is to look at one result. A PNG should be a picture,
 * a CSV should be text, and an `ArrayBuffer` should at least show its first bytes and offer a
 * download.
 */
export default function ResultRenderer({ kind, value }: ResultRendererProps) {
    if (value === undefined) return null;

    switch (kind) {
        case 'image':
            return <BlobImage value={value} />;
        case 'bytes':
            return <Bytes value={value} />;
        case 'url':
            return <UrlPreview value={value} />;
        case 'text':
            return <TextBlock value={value} />;
        default:
            return <JsonResultViewer value={value} />;
    }
}

/**
 * A `Blob` as a picture.
 *
 * The object URL is revoked when the blob changes or the component unmounts. Without that, every
 * refetch leaks a URL for the lifetime of the document — which on a tool you sit in front of
 * re-running an image query is a real leak, not a theoretical one.
 */
function BlobImage({ value }: { value: unknown }) {
    const blob = value instanceof Blob ? value : null;
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!blob) {
            setUrl(null);
            return;
        }
        const next = URL.createObjectURL(blob);
        setUrl(next);
        return () => URL.revokeObjectURL(next);
    }, [blob]);

    if (!blob) {
        return (
            <p className="text-xs text-slate-500">
                Expected a Blob. Outside a browser axios ignores{' '}
                <code>responseType: &apos;blob&apos;</code>, so this is probably an ArrayBuffer —
                see the client README.
            </p>
        );
    }

    return (
        <div className="space-y-1">
            <p className="text-xs text-slate-500">
                {blob.type || 'no type'} · {blob.size.toLocaleString()} bytes
            </p>
            {url && (
                <img
                    src={url}
                    alt="array"
                    className="max-h-96 max-w-full rounded border border-slate-300 bg-white dark:border-slate-600"
                />
            )}
        </div>
    );
}

/** Size, a hex head, and a download. Enough to tell a plausible array from an HTML error page. */
function Bytes({ value }: { value: unknown }) {
    const buffer =
        value instanceof ArrayBuffer
            ? value
            : ArrayBuffer.isView(value)
              ? (value.buffer as ArrayBuffer)
              : null;

    const { head, url } = useMemo(() => {
        if (!buffer) return { head: '', url: null as string | null };
        const bytes = new Uint8Array(buffer.slice(0, 64));
        const hex = Array.from(bytes)
            .map((byte) => byte.toString(16).padStart(2, '0'))
            .join(' ');
        return { head: hex, url: URL.createObjectURL(new Blob([buffer])) };
    }, [buffer]);

    useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url]);

    if (!buffer) return <JsonResultViewer value={value} />;

    return (
        <div className="space-y-1 rounded border border-slate-300 bg-slate-50 p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            <p className="text-xs text-slate-500">
                {buffer.byteLength.toLocaleString()} bytes
                {url && (
                    <>
                        {' · '}
                        <a href={url} download="tiled-result.bin" className="hover:underline">
                            download
                        </a>
                    </>
                )}
            </p>
            <pre className="overflow-auto whitespace-pre-wrap break-all font-mono text-[10px]">
                {head}
                {buffer.byteLength > 64 && ' …'}
            </pre>
        </div>
    );
}

/** `useTiledArrayImagePath` — a URL, which is also worth seeing rendered. */
function UrlPreview({ value }: { value: unknown }) {
    const url = typeof value === 'string' ? value : '';
    if (!url) return <p className="text-xs text-slate-500">no URL (the path is empty)</p>;

    return (
        <div className="space-y-1">
            <pre className="overflow-auto whitespace-pre-wrap break-all rounded border border-slate-300 bg-slate-50 p-2 font-mono text-[10px] text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                {url}
            </pre>
            <img
                src={url}
                alt="array"
                className="max-h-96 max-w-full rounded border border-slate-300 bg-white dark:border-slate-600"
            />
            <p className="text-xs text-slate-500">
                The browser fetches this directly — with the key in the URL only when the client is
                in <code>apiKeyLocation: &apos;query&apos;</code> mode. In header mode an
                authenticated server will refuse it, which is the behaviour, not a bug.
            </p>
        </div>
    );
}

function TextBlock({ value }: { value: unknown }) {
    const text = typeof value === 'string' ? value : String(value);
    return (
        <div className="rounded border border-slate-300 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            <div className="border-b border-slate-200 px-2 py-1 text-xs text-slate-500 dark:border-slate-700">
                {text.length.toLocaleString()} chars
            </div>
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words px-2 py-1 font-mono text-xs">
                {text.slice(0, 20_000)}
                {text.length > 20_000 && '\n…'}
            </pre>
        </div>
    );
}
