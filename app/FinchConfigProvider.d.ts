import { default as React } from '../../node_modules/react';
export type FinchConfig = {
    tiledApiUrl?: string;
    tiledApiKey?: string;
    ophydApiUrl?: string;
    qServerApiUrl?: string;
    qServerApiKey?: string;
    finchApiUrl?: string;
};
export declare function FinchConfigProvider({ config, children, }: {
    config: FinchConfig;
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useOptionalFinchConfig(): FinchConfig | null;
export declare function useFinchConfig(): FinchConfig;
//# sourceMappingURL=FinchConfigProvider.d.ts.map