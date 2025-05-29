type User = {
    name: string;
};
export interface HeaderProps {
    user?: User;
    onLogin?: () => void;
    onLogout?: () => void;
    onCreateAccount?: () => void;
}
export declare const Header: ({ user, onLogin, onLogout, onCreateAccount }: HeaderProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Header.d.ts.map