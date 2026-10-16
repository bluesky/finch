export interface TiledNodeBrowserProps {
    /** The container currently being listed. `''` is the root. */
    path: string;
    onPathChange: (path: string) => void;
}
/**
 * A one-level node browser, used to pick the path most endpoints are addressed by.
 *
 * Typing a Tiled path by hand is the single most tedious part of exercising this API — nearly every
 * route takes one, and the interesting paths are uuids. This lists the current container's children
 * and lets you walk down into them, so a path can be assembled by clicking.
 *
 * Deliberately one level at a time rather than a full tree: a Tiled container can hold thousands of
 * children, and a recursive tree would issue a request per expanded node.
 */
export default function TiledNodeBrowser({ path, onPathChange }: TiledNodeBrowserProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=TiledNodeBrowser.d.ts.map