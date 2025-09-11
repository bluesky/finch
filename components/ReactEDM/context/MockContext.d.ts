import { ReactNode } from '../../../../node_modules/react';
interface MockContextType {
    mock: boolean;
}
export declare const MockProvider: ({ children, mock }: {
    children: ReactNode;
    mock: boolean;
}) => import("react/jsx-runtime").JSX.Element;
export declare const useMock: () => MockContextType;
export {};
//# sourceMappingURL=MockContext.d.ts.map