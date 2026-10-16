import { StreamLog } from './useStreamLog';
/**
 * A subscription's event log: per-type counters, a filter, a pause switch, and expandable rows.
 *
 * Pausing freezes what is on screen. Messages keep arriving and being counted, so you can read a
 * fast stream without it scrolling away.
 */
export default function StreamLogView({ log }: {
    log: StreamLog;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=StreamLogView.d.ts.map