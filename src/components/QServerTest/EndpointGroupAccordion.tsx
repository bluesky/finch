import { useState } from 'react';
import {
    QSERVER_GROUP_LABELS,
    type QServerEndpointDescriptor,
    type QServerEndpointGroup,
    type QServerEndpointInvocation,
} from '@/api/qServer_new';
import EndpointRow from './EndpointRow';
import type { EndpointRunState } from './useEndpointRunner';

export interface EndpointGroupAccordionProps {
    group: QServerEndpointGroup;
    endpoints: QServerEndpointDescriptor[];
    states: Record<string, EndpointRunState>;
    defaultOpen?: boolean;
    onRun: (endpoint: QServerEndpointDescriptor, input: QServerEndpointInvocation) => void;
}

/** One collapsible domain section, with a pass/fail tally in the header. */
export default function EndpointGroupAccordion({
    group,
    endpoints,
    states,
    defaultOpen = false,
    onRun,
}: EndpointGroupAccordionProps) {
    const [open, setOpen] = useState(defaultOpen);

    const passed = endpoints.filter((e) => states[e.id]?.status === 'success').length;
    const failed = endpoints.filter((e) => states[e.id]?.status === 'error').length;

    return (
        <section className="rounded border border-slate-300 dark:border-slate-700">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium"
            >
                <span className="text-slate-400">{open ? '▾' : '▸'}</span>
                <span>{QSERVER_GROUP_LABELS[group]}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                    ({endpoints.length})
                </span>
                {passed > 0 && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">
                        {passed} ok
                    </span>
                )}
                {failed > 0 && (
                    <span className="text-xs text-rose-600 dark:text-rose-400">
                        {failed} failed
                    </span>
                )}
            </button>
            {open &&
                endpoints.map((endpoint) => (
                    <EndpointRow
                        key={endpoint.id}
                        endpoint={endpoint}
                        state={states[endpoint.id]}
                        onRun={onRun}
                    />
                ))}
        </section>
    );
}
