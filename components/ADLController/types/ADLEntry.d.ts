export interface Entry {
    var_type: string;
    location: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
    name: string;
    label?: string;
    press_msg?: string;
    children?: Entry[];
    comp_file?: string;
    format?: string;
    dynamic_attribute?: {
        vis: string;
        calc: string;
        chan: string;
    };
    display?: {
        label: string;
        file: string;
        args: Record<string, string>;
    }[];
    align?: string;
}
//# sourceMappingURL=ADLEntry.d.ts.map