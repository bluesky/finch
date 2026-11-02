import axios from 'axios';
import { createRequire } from 'node:module';
import { afterAll, describe, expect, it } from 'vitest';
import { TiledApiClient } from '../../api/tiled/client/TiledApiClient';
import { TiledSubscription } from '../../api/tiled/client/websocket';
import type { TiledStreamMessage, WebSocketLike } from '../../api/tiled/client/websocket';

// jsdom's WebSocket trips over its own Event class, so sockets come from the `ws` package (already
// installed transitively), whose browser-style `on*` properties fit WebSocketLike.
const NodeWebSocket = createRequire(import.meta.url)('ws') as new (url: string) => WebSocketLike;

/**
 * End-to-end against a real Tiled server. Skipped unless `TILED_LIVE_URL` is set:
 *
 *     TILED_LIVE_URL=http://localhost:8000/api/v1 TILED_LIVE_API_KEY=secret \
 *         npx vitest run TiledWebSocket.live
 *
 * The server needs a `streaming_cache`; without one every stream connection fails with a 500. Writes
 * go under a throwaway key in `TILED_LIVE_PARENT` (default `finch-playground`), which is deleted
 * afterwards.
 *
 * Sockets use the `ws` package and HTTP uses axios's Node adapter, so both reach the server directly,
 * without jsdom's browser CORS checks in the way.
 */
const LIVE_URL = process.env.TILED_LIVE_URL;
const API_KEY = process.env.TILED_LIVE_API_KEY;
const PARENT = process.env.TILED_LIVE_PARENT ?? 'finch-playground';
const KEY = `ws-live-${Date.now()}`;
const NODE = `${PARENT}/${KEY}`;

const http = new TiledApiClient({
    baseUrl: LIVE_URL,
    apiKey: API_KEY ?? null,
    client: axios.create({ adapter: 'http' }),
});

/** Little-endian float64 bytes, matching the array's declared dtype. */
const float64 = (values: number[]) => new Float64Array(values).buffer;

/** Collect messages from a subscription and wait for one that matches. */
function record(path: string, options: { start?: number } = {}) {
    const messages: TiledStreamMessage[] = [];
    const subscription = new TiledSubscription({
        baseUrl: LIVE_URL!,
        path,
        apiKey: API_KEY,
        socketFactory: (url) => new NodeWebSocket(url),
        ...options,
    });
    subscription.onMessage((message) => messages.push(message));
    subscription.connect();

    const waitFor = async (
        predicate: (message: TiledStreamMessage) => boolean,
        timeoutMs = 5_000,
    ): Promise<TiledStreamMessage> => {
        const deadline = Date.now() + timeoutMs;
        while (Date.now() < deadline) {
            const found = messages.find(predicate);
            if (found) return found;
            await new Promise((resolve) => setTimeout(resolve, 25));
        }
        throw new Error(`Timed out on ${path}; got ${JSON.stringify(messages.map((m) => m.type))}`);
    };
    return { subscription, messages, waitFor };
}

describe.skipIf(!LIVE_URL)('Tiled websocket (live)', () => {
    afterAll(async () => {
        await http.deleteNode(NODE, { recursive: true, external_only: false });
    });

    it('reports child creation and metadata updates on the parent', async () => {
        const parent = record(PARENT);
        await parent.waitFor((m) => m.type === 'container-schema');
        expect(parent.subscription.getStatus()).toBe('connected');

        await http.createNode(PARENT, {
            id: KEY,
            structure_family: 'container',
            metadata: { start: { uid: KEY } },
            specs: [],
            data_sources: [],
        } as never);
        const created = await parent.waitFor(
            (m) => m.type === 'container-child-created' && m.key === KEY,
        );

        await http.updateMetadata(NODE, {
            metadata: { start: { uid: KEY }, stop: { exit_status: 'success' } },
        } as never);
        const updated = await parent.waitFor(
            (m) => m.type === 'container-child-metadata-updated' && m.key === KEY,
        );
        expect(
            updated.type === 'container-child-metadata-updated' && updated.metadata.stop,
        ).toEqual({
            exit_status: 'success',
        });
        if (created.type === 'container-child-created' && updated.type !== 'container-schema') {
            expect(updated.sequence).toBeGreaterThan(created.sequence);
        }
        parent.subscription.disconnect();
    });

    it('streams array writes, then replays them after a reconnect without duplicates', async () => {
        const arrayPath = `${NODE}/arr`;
        await http.createNode(NODE, {
            id: 'arr',
            structure_family: 'array',
            metadata: {},
            specs: [],
            data_sources: [
                {
                    structure_family: 'array',
                    structure: {
                        data_type: { endianness: 'little', kind: 'f', itemsize: 8, dt_units: null },
                        chunks: [[2], [3]],
                        shape: [2, 3],
                        dims: null,
                        resizable: false,
                    },
                    mimetype: 'application/x-zarr',
                    parameters: {},
                    assets: [],
                    management: 'writable',
                },
            ],
        } as never);

        const live = record(arrayPath);
        await live.waitFor((m) => m.type === 'array-schema');
        await http.putArrayFull(arrayPath, float64([1, 2, 3, 4, 5, 6]));
        await http.putArrayFull(arrayPath, float64([7, 8, 9, 10, 11, 12]));
        const first = await live.waitFor((m) => m.type === 'array-data');
        expect(first.type === 'array-data' && first.shape).toEqual([2, 3]);
        await live.waitFor((m) => m.type === 'array-data' && m.sequence > first.sequence);
        live.subscription.disconnect();

        // A fresh subscription replaying from 0 sees both writes exactly once.
        const replay = record(arrayPath, { start: 0 });
        await replay.waitFor((m) => m.type === 'array-data' && m.sequence > first.sequence);
        const sequences = replay.messages
            .filter((m) => m.type === 'array-data')
            .map((m) => (m.type === 'array-data' ? m.sequence : -1));
        expect(new Set(sequences).size).toBe(sequences.length);

        // A forced reconnect resumes after the last sequence, so nothing repeats.
        const before = replay.messages.length;
        replay.subscription.reconnect();
        await replay.waitFor(
            (m) => m.type === 'array-schema' && replay.messages.indexOf(m) >= before,
        );
        await http.putArrayFull(arrayPath, float64([0, 0, 0, 0, 0, 0]));
        await replay.waitFor(
            (m) => m.type === 'array-data' && m.sequence === sequences.at(-1)! + 1,
        );
        const after = replay.messages
            .slice(before)
            .filter((m) => m.type === 'array-data')
            .map((m) => (m.type === 'array-data' ? m.sequence : -1));
        expect(after).toEqual([sequences.at(-1)! + 1]);
        replay.subscription.disconnect();
    });
});
