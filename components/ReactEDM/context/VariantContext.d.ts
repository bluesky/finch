import { ReactNode } from '../../../../node_modules/react';
interface VariantContextType {
    variant: string;
}
export declare const VariantProvider: ({ children, variant }: {
    children: ReactNode;
    variant: string;
}) => import("react/jsx-runtime").JSX.Element;
export declare const useVariant: () => VariantContextType;
export {};
//# sourceMappingURL=VariantContext.d.ts.map