import { TiledEndpointDescriptor, TiledEndpointInvocation } from '../../api/tiled';
import { TiledRunState } from './useTiledEndpointRunner';
export interface TiledEndpointRowProps {
    endpoint: TiledEndpointDescriptor;
    state: TiledRunState | undefined;
    /** The path picked in the node browser, used unless this row overrides it. */
    sharedPath: string;
    onRun: (endpoint: TiledEndpointDescriptor, input: TiledEndpointInvocation) => void;
}
/**
 * One endpoint: its parameters, its body, a run button and the result.
 *
 * Two things the row has to get right, both of which a generic "call this endpoint" UI usually gets
 * wrong:
 *
 * - **A destructive endpoint asks first.** `destructive` comes from the registry, so the list cannot
 *   drift from what actually writes. A `readOnly` POST is not treated as destructive.
 * - **A binary endpoint takes a file, not JSON.** There is no useful way to type array bytes into a
 *   textarea, so those rows show a file picker and say what the bytes have to be.
 */
export default function TiledEndpointRow({ endpoint, state, sharedPath, onRun, }: TiledEndpointRowProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=TiledEndpointRow.d.ts.map