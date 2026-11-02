import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TiledWebsocket from '../../components/TiledWebsocket/TiledWebsocket';
import { FinchConfigProvider } from '../../app/FinchConfigProvider';
import { FakeSocket, STREAM_FIXTURES, fakeSocketFactory } from './tiledStreamFixtures';

function renderHarness() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    return render(
        <FinchConfigProvider config={{ tiledApiUrl: 'http://tiled.test/api/v1', tiledApiKey: 'k' }}>
            <QueryClientProvider client={queryClient}>
                <TiledWebsocket socketFactory={fakeSocketFactory} />
            </QueryClientProvider>
        </FinchConfigProvider>,
    );
}

/** Deliver frames, then let the log's animation-frame flush run. */
async function serve(...messages: object[]) {
    await act(async () => {
        const socket = FakeSocket.latest();
        if (socket.readyState === 0) socket.open();
        for (const message of messages) socket.emit(message);
        await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
    });
}

beforeEach(() => {
    FakeSocket.reset();
    window.localStorage.clear();
    // The node browser and server-info queries hit an unreachable host; their errors are expected.
    vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('TiledWebsocket harness', () => {
    it('subscribes to a container and shows children as they are created and finished', async () => {
        renderHarness();

        fireEvent.click(screen.getByRole('button', { name: /Add subscription/ }));
        const panel = screen.getByTestId('subscription-panel');
        expect(within(panel).getByLabelText('subscription mode')).toHaveValue('container');
        expect(FakeSocket.instances).toHaveLength(0);

        fireEvent.click(within(panel).getByRole('button', { name: 'Subscribe' }));
        expect(FakeSocket.latest().url).toBe(
            'ws://tiled.test/api/v1/stream/single/?envelope_format=json',
        );

        await serve(
            STREAM_FIXTURES['container-schema'],
            STREAM_FIXTURES['container-child-created'],
        );

        expect(JSON.parse(FakeSocket.latest().sent[0])).toEqual({ type: 'auth', api_key: 'k' });
        expect(within(panel).getByTestId('subscription-status')).toHaveTextContent('connected');
        const row = within(panel).getByText('ws-probe').closest('tr')!;
        expect(row).toHaveTextContent('BlueskyRun');

        // An update carries the node's current specs and metadata, so the row takes them.
        await serve(STREAM_FIXTURES['container-child-metadata-updated']);
        expect(row).toHaveTextContent('success');
        expect(within(panel).getByTestId('stream-log')).toHaveTextContent(
            'container-child-metadata-updated',
        );

        // Drilling into a child opens a second panel on its path.
        fireEvent.click(within(row).getByRole('button', { name: 'Subscribe' }));
        const panels = screen.getAllByTestId('subscription-panel');
        expect(panels).toHaveLength(2);
        expect(within(panels[0]).getByLabelText('subscription path')).toHaveValue('ws-probe');
    });

    it('replays from the last sequence when reconnect() is pressed', async () => {
        renderHarness();
        fireEvent.click(screen.getByRole('button', { name: /Add subscription/ }));
        const panel = screen.getByTestId('subscription-panel');
        fireEvent.change(within(panel).getByLabelText('subscription mode'), {
            target: { value: 'raw' },
        });
        fireEvent.click(within(panel).getByRole('button', { name: 'Subscribe' }));
        await serve(
            STREAM_FIXTURES['container-schema'],
            STREAM_FIXTURES['container-child-created'],
        );

        fireEvent.click(within(panel).getByRole('button', { name: 'reconnect()' }));
        expect(new URL(FakeSocket.latest().url).searchParams.get('start')).toBe('2');
    });

    it('draws the newest array frame without keeping history', async () => {
        renderHarness();
        fireEvent.click(screen.getByRole('button', { name: /Add subscription/ }));
        const panel = screen.getByTestId('subscription-panel');
        fireEvent.change(within(panel).getByLabelText('subscription path'), {
            target: { value: 'run/det' },
        });
        fireEvent.change(within(panel).getByLabelText('subscription mode'), {
            target: { value: 'array' },
        });
        fireEvent.click(within(panel).getByRole('button', { name: 'Subscribe' }));
        await serve(STREAM_FIXTURES['array-schema'], STREAM_FIXTURES['array-data']);

        await waitFor(() => expect(within(panel).getByTestId('array-preview')).toBeInTheDocument());
        expect(panel).toHaveTextContent('offset[2]');
    });
});
