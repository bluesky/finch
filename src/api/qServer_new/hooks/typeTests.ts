/* eslint-disable @typescript-eslint/no-unused-vars */
import type { GetQueueResponse, QueueItem } from '../types/queue';
import type { GetStatusResponse } from '../types/status';
import { useQueueAddItemMutation, useQueueGetItemQuery, useQueueGetQuery } from './queueHooks';
import { useQueueGetStatusQuery } from './statusHooks';

/**
 * Compile-time assertions for the hook option shapes.
 *
 * This file is never imported and never runs — it exists so `tsc` checks the guarantees the hooks
 * promise. It lives here rather than in `src/testing/` because `tsconfig.json` excludes that folder,
 * so a `@ts-expect-error` in a test file would never be verified by `npm run build`.
 *
 * Each `@ts-expect-error` below *must* keep erroring; if one of them ever compiles, `tsc` fails with
 * "unused '@ts-expect-error' directive" and this file tells you which guarantee broke.
 */

declare function expectType<T>(value: T): void;

// Named as hooks because they call hooks: that satisfies `rules-of-hooks` honestly, rather than
// disabling the rule for a file whose whole purpose is to be type-checked.
function useCallShapeChecks(): void {
    // TanStack options belong under `query`, never at the top level. This is the shape the legacy
    // hooks used, and catching it is the whole reason for the single-options-object design.
    // @ts-expect-error legacy call shape: refetchInterval must go inside `query`
    useQueueGetQuery({ refetchInterval: 1000 });
    useQueueGetQuery({ query: { refetchInterval: 1000 } }); // correct

    // @ts-expect-error legacy call shape: mutation callbacks must go inside `mutation`
    useQueueAddItemMutation({ onSuccess: () => {} });
    useQueueAddItemMutation({ mutation: { onSuccess: () => {} } }); // correct

    // The hook owns the key and the fetcher; overriding either would detach the entry from the
    // invalidation map.
    // @ts-expect-error queryKey is not overridable
    useQueueGetQuery({ query: { queryKey: ['whatever'] } });
    // @ts-expect-error queryFn is not overridable
    useQueueGetQuery({ query: { queryFn: async () => ({}) as GetQueueResponse } });

    // Transport overrides are real and typed.
    useQueueGetQuery({ request: { baseUrl: 'http://other:60610', apiKey: null } });
    // @ts-expect-error unknown request option
    useQueueGetQuery({ request: { nonsense: true } });

    // Payload-GET hooks expose the GET-body strategy; plain ones do not.
    useQueueGetQuery({ request: { strategy: 'throw' } });
    useQueueGetItemQuery({ body: { uid: 'abc' } });
    // @ts-expect-error `payload` is not this hook's argument key
    useQueueGetItemQuery({ payload: { uid: 'abc' } });
}

function useInferenceChecks(): void {
    const status = useQueueGetStatusQuery();
    expectType<GetStatusResponse | undefined>(status.data);
    // @ts-expect-error data is the status response, not a queue response
    expectType<GetQueueResponse | undefined>(status.data);

    // `select` drives the returned type.
    const managerState = useQueueGetStatusQuery({
        query: { select: (data) => data.manager_state },
    });
    expectType<string | undefined>(managerState.data);

    const items = useQueueGetQuery({ query: { select: (data) => data.items } });
    expectType<QueueItem[] | undefined>(items.data);

    // Mutation variables are checked, not inferred loose.
    const add = useQueueAddItemMutation();
    add.mutate({ item: { name: 'count', item_type: 'plan' } });
    // @ts-expect-error `item` is required
    add.mutate({ pos: 'front' });
    // @ts-expect-error a plan name is required on the item
    add.mutate({ item: { item_type: 'plan' } });
    expectType<Promise<import('../types/queue').PostItemAddResponse>>(
        add.mutateAsync({ item: { name: 'count', item_type: 'plan' } }),
    );
}
