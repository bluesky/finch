import { useState, useMemo } from 'react';

import TiledHeader from './TiledHeader';
import LoginUsernamePassword from './LoginUsernamePassword';
import LoginSelectProvider from './LoginSelectProvider';
import LoginOIDC from './LoginOIDC';
import LoginHelp from './LoginHelp';

import { Warning } from '@phosphor-icons/react';

import { useTiledServerInfoQuery } from '@/api/tiled';
import { TiledAuthProvider, TiledInfoResponse } from './types';

export type LoginProps = {
    onSuccess: () => void;
    url?: string;
    oidcRedirectUrl?: string;
};
export default function Login({ onSuccess, url, oidcRedirectUrl }: LoginProps) {
    const [warning, setWarning] = useState<string | null>(null);
    const [selectedProvider, setSelectedProvider] = useState<TiledAuthProvider | null>(null);

    const requestOptions = useMemo(() => ({ baseUrl: url }), [url]);
    // Resolves `null` rather than rejecting when the server cannot be reached.
    const { data, isSuccess } = useTiledServerInfoQuery(undefined, requestOptions);
    const serverInfo = (data ?? null) as TiledInfoResponse | null;

    //unlikely to occur because we should only render the login component if we previously reached the server (and it responded with a 401)
    //it is also possible that there is a cookie on the client with and invalid session causing continued 401 errors
    //this needs further testing but should be resolved here only when we get a 401 error
    const serverInfoWarning =
        isSuccess && data === null
            ? 'Could not fetch server info on public route. Please ensure the Tiled server is running and accessible.'
            : null;
    const displayedWarning = warning ?? serverInfoWarning;

    return (
        <div className="w-full h-full bg-white flex flex-col items-center overflow-auto">
            <TiledHeader
                handleExpandClick={() => {}}
                isExpanded={false}
                secondaryTitle={url}
                showExpandButton={false}
                showSearchBar={false}
            />
            {selectedProvider === null && (
                <LoginSelectProvider
                    handleClick={setSelectedProvider}
                    providers={serverInfo?.authentication?.providers || []}
                />
            )}
            {(selectedProvider?.mode === 'password' || selectedProvider?.mode === 'internal') && (
                <LoginUsernamePassword
                    onSuccess={onSuccess}
                    url={url}
                    setWarning={setWarning}
                    handleCancel={() => setSelectedProvider(null)}
                    provider={selectedProvider}
                />
            )}
            {selectedProvider?.mode === 'external' && (
                <LoginOIDC
                    oidcRedirectUrl={oidcRedirectUrl}
                    onSuccess={onSuccess}
                    handleCancel={() => setSelectedProvider(null)}
                    provider={selectedProvider}
                />
            )}
            {displayedWarning && (
                <section className="flex items-center max-w-72 m-auto space-x-4 my-4 flex-shrink-0">
                    <Warning className="text-red-700 flex-shrink-0" size={32} />
                    <p className="text-red-700 text-left text-sm">{displayedWarning}</p>
                </section>
            )}
            <LoginHelp serverInfo={serverInfo} />
        </div>
    );
}
