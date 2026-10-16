import { QueryResultKind } from './types';
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
export default function ResultRenderer({ kind, value }: ResultRendererProps): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=ResultRenderer.d.ts.map