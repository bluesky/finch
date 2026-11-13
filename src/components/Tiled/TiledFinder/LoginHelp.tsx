import { useState } from 'react';

import { Lock, Info } from '@phosphor-icons/react';
import { TiledInfoResponse } from './types';
import { clearAuthFromLocalStorage } from './utils';

export type LoginHelpProps = {
    serverInfo: TiledInfoResponse | null;
};
export default function LoginHelp({ serverInfo }: LoginHelpProps) {
    const [showHelp, setShowHelp] = useState<boolean>(false);

    return (
        <>
            <p
                className="text-slate-700 hover:text-slate-500 hover:cursor-pointer flex-shrink-0 mt-6 m-auto w-fit"
                onClick={() => setShowHelp(!showHelp)}
            >
                {showHelp ? 'hide server info' : 'info'}
            </p>
            {showHelp && (
                <section className="flex flex-col items-center mt-4 flex-grow overflow-y-auto w-3/4 max-w-5xl m-auto mb-4  bg-slate-100 rounded-sm min-h-96">
                    <div className="text-sm px-4 py-4 w-full">
                        <p className="w-full">
                            If you've reached this login form it indicates that the Tiled server has
                            been configured to require authentication, and your credentials are
                            either missing or invalid. For more information on the Tiled server, see
                            below.
                        </p>
                        <p className="w-full mt-4">
                            To reset any access or refresh tokens saved in this browser's local
                            storage, click the button below and then refresh the page.
                        </p>
                        <span className="w-full flex items-center justify-center">
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded"
                                onClick={clearAuthFromLocalStorage}
                            >
                                Clear Tokens
                            </button>
                        </span>
                        <div>
                            <div className="flex items-center space-x-2 sticky top-0 bg-slate-100/90 pt-4 backdrop-blur-sm">
                                <Lock className="text-slate-800" size={24} />
                                <p className="font-medium text-lg">Tiled Authentication Settings</p>
                            </div>
                            <pre className="pl-4">
                                {serverInfo?.authentication &&
                                    JSON.stringify(serverInfo.authentication, null, 2)}
                            </pre>
                        </div>
                        <div>
                            <div className="flex items-center space-x-2 sticky top-0 bg-slate-100/90 pt-4 backdrop-blur-sm">
                                <Info className="text-slate-800" size={24} />
                                <p className="font-medium text-lg">All Tiled Server Info</p>
                            </div>
                            <pre className="pl-4"> {JSON.stringify(serverInfo, null, 2)} </pre>
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
