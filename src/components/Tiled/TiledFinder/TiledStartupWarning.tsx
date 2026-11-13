import { Warning } from '@phosphor-icons/react';

export interface TiledStartupWarningProps {
    warningMessage?: string;
}
export default function TiledStartupWarning({ warningMessage }: TiledStartupWarningProps) {
    return (
        <div className="p-4 max-w-[800px] m-auto mt-4 overflow-auto overflow-y-scroll">
            <Warning size={64} className="text-yellow-500 m-auto" />
            <h2 className="text-lg font-semibold mb-2 text-center">Warning</h2>
            <p className="mb-4">{warningMessage || 'Unable to connect to Tiled server'}</p>
            <p className="mb-4">Common Issues:</p>
            <ul className="list-disc list-inside mb-4">
                <li>Verify the URL is correct.</li>
                <li>
                    Verify the Tiled server you want to reach has been configured to accept
                    connections from this client
                </li>
                <li>
                    If testing locally, ensure you don't have multiple Tiled instances trying to map
                    to the same port.{' '}
                </li>
            </ul>
            <p className="text-sm text-gray-500 mt-8">
                If you check the console and see "Access to XMLHttpRequest at ... from origin ...
                has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
                on the requested resource", then congratulations! You reached a Tiled server, but it
                just wasn't configured to talk to this client! You will need to configure the Tiled
                server and allow connections to this client. Try using the "TILED_ALLOW_ORIGINS"
                environment variable when starting the Tiled server, or if using a configuration
                file add an allow_origins entry with a list of urls you need to allow. See the Tiled
                documentation for more details.{' '}
                <a
                    className="text-blue-500 underline"
                    href="https://blueskyproject.io/tiled/reference/service-configuration.html#allow-origins"
                >
                    https://blueskyproject.io/tiled/reference/service-configuration.html#allow-origins
                </a>
            </p>
        </div>
    );
}
