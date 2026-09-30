import axios from 'axios';
import { describe, expect, it } from 'vitest';
import { QServerApiClient } from '../../../api/qServer/client/QServerApiClient';
import { QServerApiError } from '../../../api/qServer/types/errors';
import { QSERVER_ENDPOINTS } from '../../../api/qServer/endpointRegistry';
import {
    QSERVER_CLIENT_LIKE_METHODS,
    type QServerClientLike,
} from '../../../api/qServerRuntime/clientLike';
import { createQServerSimAdapter } from '../../../lib/qserver-sim/client/QServerSimAdapter';
import { createQServerSimClient } from '../../../lib/qserver-sim/client/QServerSimClient';
import { handleRequest } from '../../../lib/qserver-sim/client/handleRequest';
import { SIM_ROUTES, SIM_SUPPORTED_ENDPOINT_IDS } from '../../../lib/qserver-sim/client/routes';
import type { QServerSim } from '../../../lib/qserver-sim/core/QServerSim';
import { defaultQServer } from '../../../lib/qserver-sim/scenarios/defaultQServer';

/** Build the real client, but with the simulator standing in for the network. */
function realClientOnSim(sim: QServerSim, expectApiKey?: string): QServerApiClient {
    return new QServerApiClient({
        baseUrl: 'http://sim.local:60610',
        apiKey: 'test',
        client: axios.create({ adapter: createQServerSimAdapter(sim, { expectApiKey }) }),
    });
}

/**
 * The assertions both seams must satisfy identically.
 *
 * Shared on purpose: the point of routing everything through one dispatcher is that the direct
 * sim client and the real client-on-adapter produce the same payloads, and the only way to know
 * that is to run the same expectations against both.
 */
function assertSharedBehavior(name: string, build: (sim: QServerSim) => QServerClientLike) {
    describe(name, () => {
        it('reads status, queue, history and catalogs', async () => {
            const client = build(defaultQServer());

            const status = await client.getStatus();
            expect(status).toMatchObject({
                manager_state: 'idle',
                items_in_queue: 3,
                items_in_history: 2,
            });

            const queue = await client.getQueue();
            expect(queue.items).toHaveLength(3);
            expect(queue.running_item).toEqual({});
            expect(queue.plan_queue_uid).toBe(status.plan_queue_uid);

            const history = await client.getQueueHistory();
            expect(history.items).toHaveLength(2);

            const plans = await client.getPlansAllowed();
            expect(Object.keys(plans.plans_allowed)).toEqual(['count', 'scan', 'grid_scan']);

            const devices = await client.getDevicesAllowed();
            expect(Object.keys(devices.devices_allowed)).toContain('motor1');

            const existing = await client.getPlansExisting();
            expect(Object.keys(existing.plans_existing)).toHaveLength(3);
        });

        it('adds an item and reports the minted uid', async () => {
            const client = build(defaultQServer());
            const response = await client.addQueueItem({
                item: { name: 'count', kwargs: { num: 3 }, item_type: 'plan' },
            });

            expect(response).toMatchObject({ success: true, qsize: 4 });
            expect(response.item.item_uid).toBe('sim-item-1');
        });

        it('returns the real failure envelope for an invalid item', async () => {
            const client = build(defaultQServer());
            const response = await client.addQueueItem({
                item: { name: 'not_a_plan', item_type: 'plan' },
            });

            expect(response).toMatchObject({ success: false, qsize: null });
            expect(response.msg).toContain('not in the list of allowed plans');
            expect('item_uid' in response.item).toBe(false);
        });

        it('drives a full run through the client', async () => {
            const sim = defaultQServer();
            const client = build(sim);

            expect(await client.startQueue()).toMatchObject({ success: true });
            expect((await client.getQueue()).running_item).toMatchObject({ name: 'count' });

            sim.advance(sim.getBehavior().runDurationMs);

            const history = await client.getQueueHistory();
            expect(history.items).toHaveLength(3);
            expect(history.items[2].result.exit_status).toBe('completed');
        });

        it('reads one item by uid — no browser GET-body problem in the sim', async () => {
            const client = build(defaultQServer());
            const response = await client.getQueueItem({ uid: 'fixture-item-2' });

            expect(response.success).toBe(true);
            expect(response.item).toMatchObject({ name: 'scan' });
        });

        it('controls the run engine and the environment', async () => {
            const sim = defaultQServer();
            const client = build(sim);

            await client.startQueue();
            expect(await client.pauseRE({ option: 'immediate' })).toMatchObject({ success: true });
            expect((await client.getStatus()).re_state).toBe('paused');

            expect(await client.abortRE()).toMatchObject({ success: true });
            expect((await client.getStatus()).manager_state).toBe('idle');

            expect(await client.closeEnvironment()).toMatchObject({ success: true });
            expect((await client.getStatus()).worker_environment_exists).toBe(false);
            expect(await client.openEnvironment()).toMatchObject({ success: true });
        });

        it('reads runs, console output and lock info', async () => {
            const sim = defaultQServer();
            const client = build(sim);
            await client.startQueue();

            expect((await client.getRunsActive()).run_list).toHaveLength(1);
            expect((await client.getRunsOpen()).run_list).toHaveLength(1);
            expect((await client.getRunsClosed()).run_list).toHaveLength(0);
            expect(await client.getRuns({ option: 'active' })).toMatchObject({ success: true });

            expect((await client.getConsoleOutput()).text).toContain('Starting the plan');
            // `nlines` counts rendered lines from the end of the buffer.
            expect((await client.getConsoleOutput({ nlines: 1 })).text.split('\n')).toHaveLength(1);
            const uid = await client.getConsoleOutputUID();
            expect(uid.console_output_uid).toBeTruthy();
            expect(
                (await client.getConsoleOutputUpdate({ last_msg_uid: uid.console_output_uid }))
                    .console_output_msgs,
            ).toHaveLength(0);

            expect((await client.getLockInfo()).lock_info).toMatchObject({ environment: false });
            expect(await client.lock({ lock_key: 'k', environment: true })).toMatchObject({
                success: true,
            });
            expect((await client.getLockInfo()).lock_info.environment).toBe(true);
            expect(await client.unlock({ lock_key: 'k' })).toMatchObject({ success: true });
        });

        it('reports an unknown task rather than failing', async () => {
            const client = build(defaultQServer());
            expect(await client.getTaskStatus({ task_uid: 'nope' })).toMatchObject({
                status: 'not_found',
            });
            expect(await client.getTaskResult({ task_uid: 'nope' })).toMatchObject({
                status: 'not_found',
            });
        });
    });
}

assertSharedBehavior('sim client (direct seam)', (sim) => createQServerSimClient(sim));
assertSharedBehavior('real client on the sim adapter', (sim) => realClientOnSim(sim));

describe('dispatcher coverage', () => {
    it('supports only endpoint ids that exist in the real registry', () => {
        const known = new Set(QSERVER_ENDPOINTS.map((endpoint) => endpoint.id));
        for (const id of SIM_SUPPORTED_ENDPOINT_IDS) {
            expect(known.has(id), `unknown endpoint id: ${id}`).toBe(true);
        }
    });

    it('has a route for every supported endpoint id', () => {
        for (const id of SIM_SUPPORTED_ENDPOINT_IDS) {
            const endpoint = QSERVER_ENDPOINTS.find((entry) => entry.id === id);
            expect(endpoint, id).toBeDefined();
            expect(
                SIM_ROUTES[`${endpoint!.method} ${endpoint!.path}`],
                `${endpoint!.method} ${endpoint!.path}`,
            ).toBeTypeOf('function');
        }
    });

    it('declares exactly as many routes as supported ids', () => {
        expect(Object.keys(SIM_ROUTES)).toHaveLength(SIM_SUPPORTED_ENDPOINT_IDS.length);
    });

    it('agrees with QServerClientLike about the supported surface', () => {
        const supportedFns = SIM_SUPPORTED_ENDPOINT_IDS.map(
            (id) => QSERVER_ENDPOINTS.find((entry) => entry.id === id)!.fn,
        ).sort();
        expect(supportedFns).toEqual([...QSERVER_CLIENT_LIKE_METHODS].sort());
    });

    it('answers 501 for an endpoint the sim does not model, without throwing', () => {
        const sim = defaultQServer();
        const response = sim.request('POST', '/api/function/execute', { item: {} });

        expect(response.status).toBe(501);
        expect(response.data).toMatchObject({ success: false });
        expect((response.data as { msg: string }).msg).toContain('does not implement');
    });

    it('turns a throwing route into a 500 and leaves the sim usable', () => {
        const sim = defaultQServer();
        // `getRuns` is fine; force a throw by handing the route table something hostile.
        const response = handleRequest(sim, {
            method: 'POST',
            path: '/api/queue/mode/set',
            body: {
                get mode() {
                    throw new Error('boom');
                },
            },
            query: {},
        });

        expect(response.status).toBe(500);
        expect(sim.getStatus().items_in_queue).toBe(3);
    });

    it('normalizes a trailing slash but keeps /api/ itself', () => {
        const sim = defaultQServer();
        expect(sim.request('GET', '/api/status/').status).toBe(200);
        expect(sim.request('GET', '/api/').status).toBe(200);
    });
});

describe('sim client specifics', () => {
    it('is structurally interchangeable with the real client', () => {
        // Compile-time proof that the provider's type accepts either implementation.
        const simClient: QServerClientLike = createQServerSimClient(defaultQServer());
        const realClient: QServerClientLike = new QServerApiClient();

        expect(typeof simClient.getStatus).toBe('function');
        expect(typeof realClient.getStatus).toBe('function');
    });

    it('exposes the simulator it is bound to', () => {
        const sim = defaultQServer();
        expect(createQServerSimClient(sim).sim).toBe(sim);
    });

    it('applies latency to the response but never to the mutation', async () => {
        const sim = defaultQServer({ latencyMs: 50, delay: () => Promise.resolve() });
        const client = createQServerSimClient(sim);

        const pending = client.addQueueItem({ item: { name: 'count', item_type: 'plan' } });
        // The state has already changed, even though nobody has awaited the promise yet.
        expect(sim.getState().queue).toHaveLength(4);

        await expect(pending).resolves.toMatchObject({ success: true });
    });

    it('maps a non-2xx dispatcher result onto a QServerApiError', async () => {
        const client = createQServerSimClient(defaultQServer());
        const key = 'GET /api/status';
        const route = SIM_ROUTES[key];

        // Drop a route so the dispatcher answers 501, then check what a caller sees.
        delete SIM_ROUTES[key];
        try {
            await client.getStatus().catch((error: QServerApiError) => {
                expect(error).toBeInstanceOf(QServerApiError);
                expect(error.status).toBe(501);
                expect(error.path).toBe('/api/status');
            });
            expect.hasAssertions();
        } finally {
            SIM_ROUTES[key] = route;
        }
    });

    it('reports a missing queue item as an unsuccessful response, not an error', async () => {
        // The server answers 200 with `success: false` here, and so must the sim.
        await expect(
            createQServerSimClient(defaultQServer()).getQueueItem({ uid: 'missing' }),
        ).resolves.toMatchObject({ success: false, item: {} });
    });
});

describe('sim adapter specifics', () => {
    it('parses the JSON string axios hands an adapter', async () => {
        const sim = defaultQServer();
        const client = realClientOnSim(sim);

        await client.addQueueItem({
            item: { name: 'count', kwargs: { num: 7 }, item_type: 'plan' },
        });

        expect(sim.getState().queue.at(-1)?.kwargs).toEqual({ num: 7 });
    });

    it('surfaces a 501 as a QServerApiError through the real client', async () => {
        const client = realClientOnSim(defaultQServer());

        await expect(
            client.executeFunction({ item: { name: 'f', item_type: 'function' } }),
        ).rejects.toBeInstanceOf(QServerApiError);

        await client
            .executeFunction({ item: { name: 'f', item_type: 'function' } })
            .catch((error: QServerApiError) => {
                expect(error.status).toBe(501);
                expect(error.responseBody).toMatchObject({ success: false });
            });
    });

    it('rejects a wrong api key with 401 when one is expected', async () => {
        const sim = defaultQServer();
        const client = realClientOnSim(sim, 'right-key');
        client.setApiKey('wrong-key');

        await client.getStatus().catch((error: QServerApiError) => {
            expect(error.status).toBe(401);
        });
        expect.hasAssertions();

        client.setApiKey('right-key');
        await expect(client.getStatus()).resolves.toMatchObject({ manager_state: 'idle' });
    });

    it('accepts a query-mode api key', async () => {
        const sim = defaultQServer();
        const client = realClientOnSim(sim, 'right-key');
        client.setApiKeyLocation('query');
        client.setApiKey('right-key');

        await expect(client.getStatus()).resolves.toMatchObject({ manager_state: 'idle' });
    });

    it('answers 501 for the multipart upload rather than crashing', async () => {
        const client = realClientOnSim(defaultQServer());
        const file = new File(['a,b\n'], 'plans.csv', { type: 'text/csv' });

        await client
            .uploadQueueSpreadsheet({ spreadsheet: file })
            .catch((error: QServerApiError) => {
                expect(error.status).toBe(501);
            });
        expect.hasAssertions();
    });

    it('resolves the root path', async () => {
        const client = realClientOnSim(defaultQServer());
        await expect(client.getRoot()).resolves.toMatchObject({ manager_state: 'idle' });
    });
});
