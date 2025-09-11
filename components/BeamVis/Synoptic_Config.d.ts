export declare const TOP_Y = 100;
export interface Point {
    x: number;
    y: number;
}
export interface Node {
    id: string;
    label: string;
    x: number;
    y: number;
    status: keyof typeof statusColor;
    icon?: string;
}
export interface Edge {
    from: string;
    to: string;
    orthogonalVia?: Point[];
}
export declare const statusColor: {
    ok: string;
    moving: string;
    disconnected: string;
};
export declare const nodes: Node[];
export declare const edges: Edge[];
//# sourceMappingURL=Synoptic_Config.d.ts.map