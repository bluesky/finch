import { QServerEndpointDescriptor, QServerEndpointInvocation } from '../../api/qServer';
import { EndpointRunState } from './useEndpointRunner';
export interface EndpointRowProps {
    endpoint: QServerEndpointDescriptor;
    state: EndpointRunState | undefined;
    onRun: (endpoint: QServerEndpointDescriptor, input: QServerEndpointInvocation) => void;
}
/** One endpoint: inputs, a Run button, and the last outcome. Rendered from metadata only. */
export default function EndpointRow({ endpoint, state, onRun }: EndpointRowProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=EndpointRow.d.ts.map