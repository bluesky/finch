import { useState, type ReactElement } from 'react';
import { createBrowserTokenStorage } from '@/api/tiled';
import Tiled from './Tiled';
import ButtonCopyToClipboard from './ui/ButtonCopyToClipboard';

/**
 * A manual test page for the TiledFinder: one row per UI mode, each with the command (run from the
 * finch root) that starts the Tiled server it needs. Click a row to render that mode below.
 */

type TestCase = {
    id: string;
    name: string;
    element: ReactElement;
    info: string;
    command: string;
    link?: string;
};

const SERVICES = 'src/testing/services/tiled';
const OIDC_SETUP =
    'https://github.com/bluesky/finch/blob/main/src/testing/services/tiled/OIDC_SETUP.md';

const TEST_CASES: TestCase[] = [
    {
        id: 'Demo1',
        name: 'Default View',
        element: <Tiled />,
        info: 'The default view, which should render the viewer properly.',
        command: `tiled serve config ${SERVICES}/tiled_demo.yml`,
    },
    {
        id: 'Demo2',
        name: 'Row Mode',
        element: <Tiled displayMode="rows" />,
        info: 'All items in a single column, with indented rows to show depth. The right column always previews the selected container or data.',
        command: `tiled serve config ${SERVICES}/tiled_demo.yml`,
    },
    {
        id: 'Demo3',
        name: 'Single Column Mode',
        element: <Tiled singleColumnMode={true} closeOnSelect={true} />,
        info: 'Only one column is rendered and clicking an item does not show a preview. Click an item to close the viewer. For picking a specific piece of data for a callback.',
        command: `tiled serve config ${SERVICES}/tiled_demo.yml`,
    },
    {
        id: 'Demo4',
        name: 'Button Mode',
        element: <Tiled isButtonMode={true} />,
        info: 'Renders a button that opens the viewer. Clicking outside the viewer should close it.',
        command: `tiled serve config ${SERVICES}/tiled_demo.yml`,
    },
    {
        id: 'Api1',
        name: 'Button Mode with API Key',
        element: <Tiled isButtonMode={true} inButtonModeShowApiKeyInput={true} />,
        info: 'Enter "test" into the form. Button mode with an API key input.',
        command: `TILED_SINGLE_USER_API_KEY=test tiled serve config ${SERVICES}/tiled_api_key.yml`,
    },
    {
        id: 'Auth1',
        name: 'Username Password Auth',
        element: <Tiled />,
        info: 'Username: alice, password: test. Should show a login screen, and authenticate later requests once logged in.',
        command: `ALICE_PASSWORD=test tiled serve config ${SERVICES}/tiled_username_password.yml`,
    },
    {
        id: 'Auth2',
        name: 'OIDC Flow',
        element: (
            <Tiled
                tiledBaseUrl="http://tiled.localhost:8000/api/v1"
                oidcRedirectUrl="http://tiled.localhost:5173"
            />
        ),
        info: 'Follows the OIDC (ORCID) login flow. Needs an ORCID app, an /etc/hosts entry and two environment variables first:',
        link: OIDC_SETUP,
        command: `tiled serve config ${SERVICES}/tiled_oidc.yml`,
    },
];

/**
 * Forget the previous case's auth, so the next viewer starts logged out: login tokens are shared
 * through localStorage, and the CSRF cookie belongs to whichever server was last used.
 */
function clearAuthState() {
    createBrowserTokenStorage().clear();
    document.cookie = 'tiled_csrf=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

export default function TiledFinderManualTest() {
    const [selectedId, setSelectedId] = useState(TEST_CASES[0].id);
    const selected = TEST_CASES.find((c) => c.id === selectedId) ?? TEST_CASES[0];

    const select = (id: string) => {
        if (id === selectedId) return;
        clearAuthState();
        setSelectedId(id);
    };

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
            <table className="w-full border-collapse border border-slate-200 text-sm">
                <thead className="bg-slate-100 text-left">
                    <tr>
                        <th className="border border-slate-200 p-2">Mode</th>
                        <th className="border border-slate-200 p-2">Info</th>
                        <th className="border border-slate-200 p-2">
                            Command (from the finch root)
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {TEST_CASES.map((c) => (
                        <tr
                            key={c.id}
                            onClick={() => select(c.id)}
                            className={`align-top hover:bg-sky-50 ${
                                c.id === selectedId ? 'bg-sky-100' : ''
                            }`}
                        >
                            <td className="cursor-pointer border border-slate-200 p-2 font-medium">
                                {c.name}
                            </td>
                            <td className="cursor-pointer border border-slate-200 p-2 text-slate-600">
                                {c.info}
                                {c.link && (
                                    <>
                                        {' '}
                                        <a
                                            className="text-sky-600 underline"
                                            href={c.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            setup guide
                                        </a>
                                    </>
                                )}
                            </td>
                            {/* Selectable text, not a click target: selecting or copying the
                                command should not also switch cases. */}
                            <td
                                className="cursor-text select-text border border-slate-200 p-2"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 break-all font-mono text-xs">
                                        {c.command}
                                    </code>
                                    <ButtonCopyToClipboard copyText={c.command} size="small" />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <section className="flex flex-col items-center gap-2">
                <h2 className="text-lg font-light">{selected.name}</h2>
                {/* Keyed so each case mounts a fresh viewer with its own client. */}
                <div key={selected.id} className="flex w-full justify-center">
                    {selected.element}
                </div>
            </section>
        </div>
    );
}
