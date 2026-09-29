import { useMemo, useState } from 'react';

export interface JsonResultViewerProps {
    value: unknown;
    /** Rows shown before the viewer starts scrolling. */
    maxHeightClass?: string;
}

const PREVIEW_LIMIT = 4000;

/** Pretty-printed, collapsible JSON with a copy button. */
export default function JsonResultViewer({
    value,
    maxHeightClass = 'max-h-72',
}: JsonResultViewerProps) {
    const [expanded, setExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    const text = useMemo(() => {
        if (typeof value === 'string') return value;
        try {
            return JSON.stringify(value, null, 2) ?? String(value);
        } catch {
            return String(value);
        }
    }, [value]);

    const truncated = !expanded && text.length > PREVIEW_LIMIT;
    const shown = truncated ? `${text.slice(0, PREVIEW_LIMIT)}\n…` : text;

    const copy = () => {
        void navigator.clipboard?.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    return (
        <div className="rounded border border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-2 py-1 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <span>{text.length.toLocaleString()} chars</span>
                <div className="flex gap-2">
                    {text.length > PREVIEW_LIMIT && (
                        <button
                            type="button"
                            className="hover:underline"
                            onClick={() => setExpanded((v) => !v)}
                        >
                            {expanded ? 'Collapse' : 'Show all'}
                        </button>
                    )}
                    <button type="button" className="hover:underline" onClick={copy}>
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                </div>
            </div>
            <pre
                className={`overflow-auto whitespace-pre-wrap break-words px-2 py-1 font-mono text-xs ${maxHeightClass}`}
            >
                {shown}
            </pre>
        </div>
    );
}
