import { useState } from 'react';
import TiledNodeBrowser from '../devtools/TiledNodeBrowser';
import type { QueryFieldSpec } from './types';

export interface QueryFieldEditorProps {
    field: QueryFieldSpec;
    value: unknown;
    onChange: (value: unknown) => void;
}

const inputClass =
    'w-full rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs text-slate-900 ' +
    'dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100';

/**
 * One control per {@link QueryFieldSpec}.
 *
 * The two that are not obvious:
 *
 * - **`json` keeps the last valid parse.** It holds the raw text locally and only propagates a
 *   successfully parsed value, so a hook never re-runs on half-typed JSON — otherwise typing a
 *   filter object would fire a request per keystroke, each with a different cache key.
 * - **`path` offers the node browser inline**, because the interesting paths on a real server are
 *   uuids and typing them by hand is the single most tedious part of exercising this API.
 */
export default function QueryFieldEditor({ field, value, onChange }: QueryFieldEditorProps) {
    return (
        <label className="block text-xs">
            <span className="text-slate-600">
                {field.label}
                {field.required && <span className="text-red-500"> *</span>}
                {field.description && (
                    <span className="ml-1 text-slate-500">— {field.description}</span>
                )}
            </span>
            <Control field={field} value={value} onChange={onChange} />
        </label>
    );
}

function Control({ field, value, onChange }: QueryFieldEditorProps) {
    switch (field.kind) {
        case 'path':
            return <PathControl value={String(value ?? '')} onChange={onChange} />;
        case 'json':
            return <JsonControl value={value} onChange={onChange} />;
        case 'file':
            return <FileControl value={value} onChange={onChange} />;
        case 'stringList':
            return <StringListControl value={value} onChange={onChange} />;
        case 'numberList':
            return <NumberListControl value={value} onChange={onChange} />;
        case 'boolean':
            return (
                <input
                    type="checkbox"
                    checked={value === true}
                    onChange={(event) => onChange(event.target.checked)}
                    className="mt-1"
                />
            );
        case 'number':
            return (
                <input
                    type="number"
                    value={value === undefined || value === null ? '' : String(value)}
                    onChange={(event) =>
                        onChange(event.target.value === '' ? undefined : Number(event.target.value))
                    }
                    className={inputClass}
                />
            );
        case 'enum':
            return (
                <select
                    value={String(value ?? '')}
                    onChange={(event) => onChange(event.target.value || undefined)}
                    className={inputClass}
                >
                    <option value="">(default)</option>
                    {field.enums?.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            );
        default:
            return (
                <input
                    type="text"
                    value={String(value ?? '')}
                    onChange={(event) => onChange(event.target.value || undefined)}
                    className={inputClass}
                />
            );
    }
}

function PathControl({ value, onChange }: { value: string; onChange: (v: unknown) => void }) {
    const [browsing, setBrowsing] = useState(false);

    return (
        <div className="space-y-1">
            <div className="flex gap-1">
                <input
                    type="text"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder="(root container)"
                    className={inputClass}
                />
                <button
                    type="button"
                    className="shrink-0 rounded border border-slate-300 px-2 text-xs hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                    onClick={() => setBrowsing((open) => !open)}
                >
                    {browsing ? 'close' : 'browse'}
                </button>
            </div>
            {browsing && <TiledNodeBrowser path={value} onPathChange={(next) => onChange(next)} />}
        </div>
    );
}

/**
 * A JSON editor that propagates only parseable values.
 *
 * The raw text lives here; the parsed value goes up. That split is what stops a hook re-running on
 * every keystroke of an object that is not yet valid.
 */
function JsonControl({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) {
    const [text, setText] = useState(() =>
        value === undefined ? '' : JSON.stringify(value, null, 2),
    );
    const [error, setError] = useState<string | null>(null);

    const handle = (next: string) => {
        setText(next);
        if (!next.trim()) {
            setError(null);
            onChange(undefined);
            return;
        }
        try {
            onChange(JSON.parse(next));
            setError(null);
        } catch (parseError) {
            setError(parseError instanceof Error ? parseError.message : 'Invalid JSON');
        }
    };

    return (
        <>
            <textarea
                value={text}
                onChange={(event) => handle(event.target.value)}
                rows={Math.min(14, text.split('\n').length + 1)}
                className={inputClass}
            />
            {error && <span className="text-red-600 dark:text-red-400">{error}</span>}
        </>
    );
}

/** Chip editor: a list of strings, added on Enter and removed by clicking. */
function StringListControl({
    value,
    onChange,
}: {
    value: unknown;
    onChange: (v: unknown) => void;
}) {
    const items = Array.isArray(value) ? (value as string[]) : [];
    const [draft, setDraft] = useState('');

    const add = () => {
        const entry = draft.trim();
        if (!entry) return;
        onChange([...items, entry]);
        setDraft('');
    };

    return (
        <div className="space-y-1">
            <div className="flex flex-wrap gap-1">
                {items.map((item, index) => (
                    <button
                        key={`${item}-${index}`}
                        type="button"
                        className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-900 hover:line-through dark:bg-slate-700 dark:text-slate-100"
                        onClick={() => onChange(items.filter((_, i) => i !== index))}
                        title="remove"
                    >
                        {item} ×
                    </button>
                ))}
            </div>
            <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        add();
                    }
                }}
                onBlur={add}
                placeholder="type and press Enter"
                className={inputClass}
            />
        </div>
    );
}

/**
 * A binary body.
 *
 * The `File` itself goes into the values record, not its bytes — reading on pick would hold every
 * chosen file in memory for as long as the page is open, and a write harness is exactly where
 * someone selects a large array and then changes their mind. `fileBytes` reads it at submit time.
 */
function FileControl({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) {
    const picked = typeof File !== 'undefined' && value instanceof File ? value : null;

    return (
        <div className="space-y-1">
            <input
                type="file"
                onChange={(event) => onChange(event.target.files?.[0] ?? undefined)}
                className="block w-full py-1 text-xs"
            />
            <p className="text-slate-500">
                {picked
                    ? `${picked.name} · ${picked.size.toLocaleString()} bytes`
                    : 'No file — an empty body still exercises the request shape.'}
            </p>
        </div>
    );
}

/** Comma-separated numbers — how `stack`, `block`, `offset` and `shape` read naturally. */
function NumberListControl({
    value,
    onChange,
}: {
    value: unknown;
    onChange: (v: unknown) => void;
}) {
    const items = Array.isArray(value) ? (value as number[]) : [];
    const [text, setText] = useState(items.join(','));

    const handle = (next: string) => {
        setText(next);
        const parsed = next
            .split(',')
            .map((part) => part.trim())
            .filter(Boolean)
            .map(Number)
            .filter((entry) => Number.isFinite(entry));
        onChange(parsed.length ? parsed : undefined);
    };

    return (
        <input
            type="text"
            value={text}
            onChange={(event) => handle(event.target.value)}
            placeholder="e.g. 0,2"
            className={inputClass}
        />
    );
}
