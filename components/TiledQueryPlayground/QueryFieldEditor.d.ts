import { QueryFieldSpec } from './types';
export interface QueryFieldEditorProps {
    field: QueryFieldSpec;
    value: unknown;
    onChange: (value: unknown) => void;
}
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
export default function QueryFieldEditor({ field, value, onChange }: QueryFieldEditorProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=QueryFieldEditor.d.ts.map