import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import {
    appendColumnarRows,
    resetDefaultTiledApiClient,
    useTiledArraySubscription,
    useTiledContainerSubscription,
    useTiledSubscription,
    useTiledTableSubscription,
} from '../../api/tiled';
import type { TiledClientLike } from '../../api/tiled';
import { TiledApiProvider } from '../../api/tiled/runtime/TiledApiProvider';
import { FinchConfigProvider } from '../../app/FinchConfigProvider';
import { FakeSocket, STREAM_FIXTURES, fakeSocketFactory } from './tiledStreamFixtures';

const CONFIG = { tiledApiUrl: 'http://tiled.test/api/v1', tiledApiKey: 'cfg-key' };

function configWrapper(config: Record<string, string> = CONFIG) {
    return ({ children }: { children: ReactNode }) => (
        <FinchConfigProvider config={config}>{children}</FinchConfigProvider>
    );
}

/** Open the latest socket and deliver `messages`, inside act so state updates flush. */
function serve(...messages: object[]) {
    act(() => {
        const socket = FakeSocket.latest();
        if (socket.readyState === 0) socket.open();
        for (const message of messages) socket.emit(message);
    });
}

beforeEach(() => {
    FakeSocket.reset();
    resetDefaultTiledApiClient();
});

afterEach(() => {
    resetDefaultTiledApiClient();
    vi.restoreAllMocks();
});

describe('useTiledSubscription', () => {
    it('connects on mount with Finch config and closes on unmount', () => {
        const { result, unmount } = renderHook(
            () => useTiledSubscription('run/primary', { socketFactory: fakeSocketFactory }),
            { wrapper: configWrapper() },
        );
        expect(FakeSocket.instances).toHaveLength(1);
        const socket = FakeSocket.latest();
        expect(socket.url).toBe(
            'ws://tiled.test/api/v1/stream/single/run/primary?envelope_format=json',
        );
        expect(result.current.status).toBe('connecting');

        serve(STREAM_FIXTURES['table-schema']);
        expect(JSON.parse(socket.sent[0])).toEqual({ type: 'auth', api_key: 'cfg-key' });
        expect(result.current.status).toBe('connected');
        expect(result.current.lastMessage?.type).toBe('table-schema');

        unmount();
        expect(socket.closedWith).toBe(1000);
    });

    it('does not connect when disabled', () => {
        const { result } = renderHook(
            () => useTiledSubscription('x', { enabled: false, socketFactory: fakeSocketFactory }),
            { wrapper: configWrapper() },
        );
        expect(FakeSocket.instances).toHaveLength(0);
        expect(result.current.status).toBe('idle');
    });

    it('opens a new socket when the path changes', () => {
        const { rerender } = renderHook(
            ({ path }) => useTiledSubscription(path, { socketFactory: fakeSocketFactory }),
            { wrapper: configWrapper(), initialProps: { path: 'a' } },
        );
        const first = FakeSocket.latest();
        rerender({ path: 'b' });
        expect(FakeSocket.instances).toHaveLength(2);
        expect(first.closedWith).toBe(1000);
        expect(FakeSocket.latest().url).toContain('/stream/single/b?');
    });

    it('does not reopen the socket when an inline callback changes', () => {
        const { rerender } = renderHook(
            () =>
                useTiledSubscription('a', {
                    socketFactory: (url) => fakeSocketFactory(url),
                    onMessage: () => {},
                }),
            { wrapper: configWrapper() },
        );
        rerender();
        rerender();
        expect(FakeSocket.instances).toHaveLength(1);
    });

    it('calls the latest onMessage and tracks the sequence', () => {
        const seen: string[] = [];
        const { result } = renderHook(
            () =>
                useTiledSubscription('t', {
                    socketFactory: fakeSocketFactory,
                    onMessage: (message) => seen.push(message.type),
                }),
            { wrapper: configWrapper() },
        );
        serve(STREAM_FIXTURES['table-schema'], STREAM_FIXTURES['table-data']);
        expect(seen).toEqual(['table-schema', 'table-data']);
        expect(result.current.sequence).toBe(2);
    });

    it('skips per-message state with trackLastMessage: false', () => {
        const onMessage = vi.fn();
        const { result } = renderHook(
            () =>
                useTiledSubscription('t', {
                    socketFactory: fakeSocketFactory,
                    trackLastMessage: false,
                    onMessage,
                }),
            { wrapper: configWrapper() },
        );
        serve(STREAM_FIXTURES['table-schema'], STREAM_FIXTURES['table-data']);
        expect(onMessage).toHaveBeenCalledTimes(2);
        expect(result.current.lastMessage).toBeUndefined();
    });

    it('disconnect() closes, and reconnect() resumes from the last sequence', () => {
        const { result } = renderHook(
            () => useTiledSubscription('t', { socketFactory: fakeSocketFactory }),
            { wrapper: configWrapper() },
        );
        serve(STREAM_FIXTURES['table-schema'], STREAM_FIXTURES['table-data']);
        act(() => result.current.disconnect());
        expect(result.current.status).toBe('closed');

        act(() => result.current.reconnect());
        expect(FakeSocket.instances).toHaveLength(2);
        expect(new URL(FakeSocket.latest().url).searchParams.get('start')).toBe('3');
    });

    it('applies an injected client URL, initial path and key', () => {
        const injected = {
            getBaseUrl: () => 'https://injected.test/api/v1',
            getInitialPath: () => 'beamline',
            getApiKey: () => 'inj-key',
        } as unknown as TiledClientLike;
        const wrapper = ({ children }: { children: ReactNode }) => (
            <TiledApiProvider client={injected}>{children}</TiledApiProvider>
        );
        renderHook(() => useTiledSubscription('run', { socketFactory: fakeSocketFactory }), {
            wrapper,
        });
        expect(FakeSocket.latest().url).toBe(
            'wss://injected.test/api/v1/stream/single/beamline/run?envelope_format=json',
        );
        serve();
        expect(JSON.parse(FakeSocket.latest().sent[0])).toEqual({
            type: 'auth',
            api_key: 'inj-key',
        });
    });

    it('stays idle for an injected stub with no URL', () => {
        const injected = {} as TiledClientLike;
        const wrapper = ({ children }: { children: ReactNode }) => (
            <TiledApiProvider client={injected}>{children}</TiledApiProvider>
        );
        const { result } = renderHook(
            () => useTiledSubscription('run', { socketFactory: fakeSocketFactory }),
            { wrapper },
        );
        expect(FakeSocket.instances).toHaveLength(0);
        expect(result.current.status).toBe('idle');
    });
});

describe('useTiledContainerSubscription', () => {
    it('routes each container message to its callback', () => {
        const onSchema = vi.fn();
        const onChildCreated = vi.fn();
        const onChildMetadataUpdated = vi.fn();
        renderHook(
            () =>
                useTiledContainerSubscription('', {
                    socketFactory: fakeSocketFactory,
                    onSchema,
                    onChildCreated,
                    onChildMetadataUpdated,
                }),
            { wrapper: configWrapper() },
        );
        expect(FakeSocket.latest().url).toContain('/stream/single/?');
        serve(
            STREAM_FIXTURES['container-schema'],
            STREAM_FIXTURES['container-child-created'],
            STREAM_FIXTURES['container-child-metadata-updated'],
        );
        expect(onSchema).toHaveBeenCalledTimes(1);
        expect(onChildCreated).toHaveBeenCalledWith(
            expect.objectContaining({ key: 'ws-probe', sequence: 1 }),
        );
        expect(onChildMetadataUpdated.mock.calls[0][0].metadata.stop).toEqual({
            exit_status: 'success',
        });
    });
});

describe('useTiledTableSubscription', () => {
    const rowsAt = (sequence: number, x: number[]) => ({
        ...STREAM_FIXTURES['table-data'],
        sequence,
        payload: { x, y: x.map((v) => v * 10) },
    });

    it('does not accumulate by default', () => {
        const onData = vi.fn();
        const { result } = renderHook(
            () => useTiledTableSubscription('t', { socketFactory: fakeSocketFactory, onData }),
            { wrapper: configWrapper() },
        );
        serve(STREAM_FIXTURES['table-schema'], rowsAt(1, [1]), rowsAt(2, [2]));
        expect(onData).toHaveBeenCalledTimes(2);
        expect(result.current.schema?.type).toBe('table-schema');
        expect(result.current.rows).toBeUndefined();
        expect(result.current.latest).toBeUndefined();
    });

    it('accumulates columnar rows when asked, trimmed to maxRows', () => {
        const { result } = renderHook(
            () =>
                useTiledTableSubscription('t', {
                    socketFactory: fakeSocketFactory,
                    accumulate: true,
                    maxRows: 3,
                }),
            { wrapper: configWrapper() },
        );
        expect(result.current.rows).toEqual({});
        serve(STREAM_FIXTURES['table-schema'], rowsAt(1, [1, 2]), rowsAt(2, [3, 4]));
        expect(result.current.rows).toEqual({ x: [2, 3, 4], y: [20, 30, 40] });
        expect(result.current.latest?.sequence).toBe(2);
    });
});

describe('appendColumnarRows', () => {
    it('pads columns that appear or disappear so lengths stay equal', () => {
        const first = appendColumnarRows(undefined, { a: [1, 2] });
        expect(appendColumnarRows(first, { b: [9] })).toEqual({
            a: [1, 2, null],
            b: [null, null, 9],
        });
    });
});

describe('useTiledArraySubscription', () => {
    it('keeps no payload history by default', () => {
        const onData = vi.fn();
        const onRef = vi.fn();
        const { result } = renderHook(
            () =>
                useTiledArraySubscription('arr', {
                    socketFactory: fakeSocketFactory,
                    onData,
                    onRef,
                }),
            { wrapper: configWrapper() },
        );
        serve(
            STREAM_FIXTURES['array-schema'],
            STREAM_FIXTURES['array-ref'],
            STREAM_FIXTURES['array-data'],
        );
        expect(onRef).toHaveBeenCalledTimes(1);
        expect(onData).toHaveBeenCalledWith(expect.objectContaining({ shape: [1, 3] }));
        expect(result.current.schema?.data_type.kind).toBe('f');
        expect(result.current.latest).toBeUndefined();
        expect(result.current.shape).toBeUndefined();
    });

    it('keeps only the newest message with trackLatest', () => {
        const { result } = renderHook(
            () =>
                useTiledArraySubscription('arr', {
                    socketFactory: fakeSocketFactory,
                    trackLatest: true,
                }),
            { wrapper: configWrapper() },
        );
        serve(
            STREAM_FIXTURES['array-schema'],
            STREAM_FIXTURES['array-ref'],
            STREAM_FIXTURES['array-data'],
        );
        expect(result.current.latest?.type).toBe('array-data');
        expect(result.current.shape).toEqual([1, 3]);
    });
});
