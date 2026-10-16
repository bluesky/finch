export interface JsonResultViewerProps {
    value: unknown;
    /** Rows shown before the viewer starts scrolling. */
    maxHeightClass?: string;
}
/**
 * Pretty-printed, collapsible JSON with a copy button.
 *
 * Shared by the queue-server and Tiled dev harnesses, which is why it lives in `devtools/` rather
 * than beside either of them.
 *
 * It sets its own text colour explicitly. The harnesses render inside Finch's dark app chrome,
 * which supplies a light inherited colour, while this panel has a light background of its own —
 * inheriting gave white-on-white. Tailwind's `dark:` variants are keyed off a class the app does
 * not set, so they are not a substitute for being explicit here.
 */
export default function JsonResultViewer({ value, maxHeightClass, }: JsonResultViewerProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=JsonResultViewer.d.ts.map