type HexapodProps = {
    /** Optional prefix for device PV names (e.g., 'SYM:HEX01'). If not provided, defaults to no prefix. */
    prefix?: string;
    /** When true, skips the WebSocket connection and simulates a connected hexapod at all-zero positions. */
    demo?: boolean;
};
export default function Hexapod({ prefix, demo }: HexapodProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Hexapod.d.ts.map