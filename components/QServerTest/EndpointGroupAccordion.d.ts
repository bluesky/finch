import { QServerEndpointDescriptor, QServerEndpointGroup, QServerEndpointInvocation } from '../../api/qServer';
import { EndpointRunState } from './useEndpointRunner';
export interface EndpointGroupAccordionProps {
    group: QServerEndpointGroup;
    endpoints: QServerEndpointDescriptor[];
    states: Record<string, EndpointRunState>;
    defaultOpen?: boolean;
    onRun: (endpoint: QServerEndpointDescriptor, input: QServerEndpointInvocation) => void;
}
/** One collapsible domain section, with a pass/fail tally in the header. */
export default function EndpointGroupAccordion({ group, endpoints, states, defaultOpen, onRun, }: EndpointGroupAccordionProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=EndpointGroupAccordion.d.ts.map