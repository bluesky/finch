import { useState, useRef, useCallback } from 'react';

import Button from './ui/Button';
import { useTiledLoginMutation } from '@/api/tiled';
import { TiledAuthProvider } from './types';
export type LoginUsernamePasswordProps = {
    onSuccess: () => void;
    url?: string;
    setWarning: (warning: string | null) => void;
    handleCancel: () => void;
    provider?: TiledAuthProvider;
};
export default function LoginUsernamePassword({
    onSuccess,
    url,
    setWarning,
    handleCancel,
    provider,
}: LoginUsernamePasswordProps) {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const passwordRef = useRef<HTMLInputElement>(null);

    // On success this also invalidates every cached Tiled query, since what the user can see changes
    // with their identity.
    const { mutateAsync: login, isPending } = useTiledLoginMutation();

    const attemptLogin = useCallback(async () => {
        if (isPending) return;
        setWarning(null);
        // Resolves `null` on bad credentials; a rejection (network, server error) is treated the same.
        const result = await login({ username, password, url, provider }).catch((error) => {
            console.error(error);
            return null;
        });
        if (result) {
            onSuccess();
        } else {
            setWarning('Login failed. Please check your credentials.');
            //put focus back on the password field
            if (passwordRef.current) {
                passwordRef.current.focus();
                passwordRef.current.select();
            }
        }
    }, [username, password, onSuccess, provider, url, setWarning, login, isPending]);
    return (
        <section className="flex flex-col items-center space-y-8 mt-8 flex-shrink-0">
            <h2 className="text-slate-700 font-light text-lg">Please login to access Tiled</h2>
            <input
                className="w-72 h-10 pl-2 border border-slate-500"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                className="w-72 h-10 pl-2 border border-slate-500"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                ref={passwordRef}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        attemptLogin();
                    }
                }}
            />
            <span className="flex items-center space-x-4">
                <Button
                    cb={attemptLogin}
                    text="Login"
                    disabled={!username || !password || isPending}
                />
                <Button isSecondary={true} cb={handleCancel} text="Cancel" />
            </span>
        </section>
    );
}
