import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import { QServerApiProvider } from '../../../api/qServerRuntime/QServerApiProvider';
import {
    useQueueAddItemMutation,
    useQueueClearMutation,
    useQueueGetItemQuery,
    useQueueGetQuery,
    useQueueStartMutation,
} from '../../../api/qServer_new/hooks/queueHooks';
import { useQueueGetHistoryQuery } from '../../../api/qServer_new/hooks/historyHooks';
import { useQueueGetStatusQuery } from '../../../api/qServer_new/hooks/statusHooks';
import { createQServerSimClient } from '../../../lib/qserver-sim/client/QServerSimClient';
import type { QServerSim } from '../../../lib/qserver-sim/core/QServerSim';
import { defaultQServer } from '../../../lib/qserver-sim/scenarios/defaultQServer';

/**
 * The hooks driven against the simulator through the real provider boundary.
 *
 * This is the end-to-end check that matters: a component using these hooks in a story or a test gets
 * real data, and a mutation refreshes the queries it should — without anyone calling
 * `invalidateQueries` by hand.
 */
function harness(sim: QServerSim) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const client = createQServerSimClient(sim);

    return {
        queryClient,
        wrapper: ({ children }: { children: ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                <QServerApiProvider client={client}>{children}</QServerApiProvider>
            </QueryClientProvider>
        ),
    };
}

describe('qserver hooks against the simulator', () => {
    it('reads the queue, history and status consistently', async () => {
        const sim = defaultQServer();
        const { wrapper } = harness(sim);

        const { result } = renderHook(
            () => ({
                queue: useQueueGetQuery(),
                history: useQueueGetHistoryQuery(),
                status: useQueueGetStatusQuery(),
            }),
            { wrapper },
        );

        await waitFor(() => {
            expect(result.current.queue.data).toBeDefined();
            expect(result.current.history.data).toBeDefined();
            expect(result.current.status.data).toBeDefined();
        });

        expect(result.current.queue.data?.items).toHaveLength(3);
        expect(result.current.queue.data?.running_item).toEqual({});
        expect(result.current.history.data?.items).toHaveLength(2);
        // The two reads agree, because they are the same simulator state.
        expect(result.current.queue.data?.plan_queue_uid).toBe(
            result.current.status.data?.plan_queue_uid,
        );
        expect(result.current.status.data?.items_in_queue).toBe(3);
    });

    it('refreshes the queue and status after an add, with no manual invalidation', async () => {
        const sim = defaultQServer();
        const { wrapper } = harness(sim);

        const { result } = renderHook(
            () => ({
                queue: useQueueGetQuery(),
                status: useQueueGetStatusQuery(),
                add: useQueueAddItemMutation(),
            }),
            { wrapper },
        );

        await waitFor(() => expect(result.current.queue.data?.items).toHaveLength(3));

        await result.current.add.mutateAsync({
            item: { name: 'count', kwargs: { num: 2 }, item_type: 'plan' },
        });

        // `mutateAsync` resolves only after the invalidated queries have refetched.
        await waitFor(() => {
            expect(result.current.queue.data?.items).toHaveLength(4);
            expect(result.current.status.data?.items_in_queue).toBe(4);
        });
        expect(sim.getState().queue).toHaveLength(4);
    });

    it('reflects a run started through a mutation', async () => {
        const sim = defaultQServer();
        const { wrapper } = harness(sim);

        const { result } = renderHook(
            () => ({
                queue: useQueueGetQuery(),
                status: useQueueGetStatusQuery(),
                start: useQueueStartMutation(),
            }),
            { wrapper },
        );

        await waitFor(() => expect(result.current.queue.data?.items).toHaveLength(3));

        await result.current.start.mutateAsync();

        await waitFor(() => {
            expect(result.current.status.data?.manager_state).toBe('executing_queue');
            expect(result.current.queue.data?.running_item).toMatchObject({ name: 'count' });
            expect(result.current.queue.data?.items).toHaveLength(2);
        });
    });

    it('reads one item by uid and stays idle without an address', async () => {
        const sim = defaultQServer();
        const { wrapper } = harness(sim);

        const { result } = renderHook(
            () => ({
                addressed: useQueueGetItemQuery({ body: { uid: 'fixture-item-2' } }),
                unaddressed: useQueueGetItemQuery(),
            }),
            { wrapper },
        );

        await waitFor(() => expect(result.current.addressed.data).toBeDefined());
        expect(result.current.addressed.data?.item).toMatchObject({ name: 'scan' });

        // No uid and no pos: the guard keeps it from firing at all.
        expect(result.current.unaddressed.fetchStatus).toBe('idle');
        expect(result.current.unaddressed.data).toBeUndefined();
    });

    it('invalidates the queue after clearing it', async () => {
        const sim = defaultQServer();
        const { wrapper } = harness(sim);

        const { result } = renderHook(
            () => ({ queue: useQueueGetQuery(), clear: useQueueClearMutation() }),
            { wrapper },
        );

        await waitFor(() => expect(result.current.queue.data?.items).toHaveLength(3));
        await result.current.clear.mutateAsync();

        await waitFor(() => expect(result.current.queue.data?.items).toHaveLength(0));
    });

    it('keys entries by resource with the scope last', async () => {
        const sim = defaultQServer();
        const { wrapper, queryClient } = harness(sim);

        const { result } = renderHook(() => useQueueGetQuery(), { wrapper });
        await waitFor(() => expect(result.current.data).toBeDefined());

        const [entry] = queryClient.getQueryCache().getAll();
        expect(entry.queryKey).toEqual(['qserver', 'queue', null, { baseUrl: 'client:injected' }]);

        // The legacy prefix still matches, so existing invalidation calls keep working.
        const matched = queryClient.getQueryCache().findAll({ queryKey: ['qserver', 'queue'] });
        expect(matched).toHaveLength(1);
    });
});
