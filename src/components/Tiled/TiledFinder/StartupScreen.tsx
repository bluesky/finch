import { useState, useEffect, useMemo, useRef } from 'react';

import Button from './ui/Button';
import TiledLoading from './TiledLoading';
import { useTiledServerInfoQuery } from '@/api/tiled';

type StartupScreenProps = {
    url: string | undefined;
    handleUrlChange: (url: string) => void;
    handleSubmit: () => void;
};
export default function StartupScreen({
    url,
    handleUrlChange,
    handleSubmit,
    ...props
}: StartupScreenProps) {
    const [warning, setWarning] = useState<JSX.Element | null>(null);

    // The URL most recently submitted for testing; `null` until the user submits.
    const [probeUrl, setProbeUrl] = useState<string | null>(null);
    const requestOptions = useMemo(
        () => (probeUrl ? { baseUrl: probeUrl } : undefined),
        [probeUrl],
    );
    // Resolves `null` rather than rejecting when the server cannot be reached.
    const { data, isSuccess, isFetching, dataUpdatedAt, refetch } = useTiledServerInfoQuery(
        { enabled: probeUrl !== null, staleTime: 0 },
        requestOptions,
    );

    const testTiledConnection = (url: string | undefined) => {
        //ping the tiled server at the url and check if we get a response.
        const next = url ?? '';
        if (next === probeUrl) {
            void refetch();
        } else {
            setProbeUrl(next);
        }
    };

    // Act once per completed probe, not on every render.
    const handledProbe = useRef<number | null>(null);
    useEffect(() => {
        if (probeUrl === null || !isSuccess || isFetching) return;
        if (handledProbe.current === dataUpdatedAt) return;
        handledProbe.current = dataUpdatedAt;

        if (data) {
            handleSubmit();
        } else {
            setWarning(
                <p className="px-8">
                    Did not receive a valid response from{' '}
                    <b>
                        <i>{probeUrl}</i>
                    </b>
                    , please verify your Tiled server can be reached from this path. The most common
                    issue is CORS restrictions, which need to be set during Tiled server
                    initialization. Check the console for more details.
                </p>,
            );
        }
    }, [probeUrl, isSuccess, isFetching, dataUpdatedAt, data, handleSubmit]);

    const handleEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            testTiledConnection(url);
        }
    };

    return (
        <div
            className="flex flex-col justify-center items-center space-y-8 h-full w-full"
            {...props}
        >
            <div className="h-1/2 flex flex-col space-y-8 justify-end py-8 items-center">
                <h2 className="text-slate-700 font-light text-lg">Enter your Tiled url</h2>
                <input
                    className="w-72 h-10 pl-2 border border-slate-500"
                    type="text"
                    value={url ? url : ''}
                    onKeyDown={handleEnterKey}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="e.g. http://localhost:8000/api/v1"
                ></input>
                <Button
                    disabled={url ? false : true}
                    text="Submit"
                    cb={() => testTiledConnection(url)}
                />
            </div>
            <div className="h-1/2">
                {probeUrl !== null && isFetching ? (
                    <TiledLoading
                        size="small"
                        message="Checking the server"
                        requestUrl={`${probeUrl.replace(/\/+$/, '')}/`}
                    />
                ) : (
                    warning
                )}
            </div>
        </div>
    );
}
