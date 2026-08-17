/* eslint-disable @typescript-eslint/no-unused-vars */
import type { GetQueueResponse, QueueItem } from '../types/queue';
import type { GetStatusResponse } from '../types/status';
import { useQueueAddItemMutation, useQueueGetItemQuery, useQueueGetQuery } from './queueHooks';
import { useQueueGetStatusQuery } from './statusHooks';

/**
 * Compile-time assertions for the hook call shapes.
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
    // Position 1 is the endpoint argument, not TanStack options — the legacy call shape. Only the
    // hooks with a *typed* body can catch this; the payload-GETs take an open `Record`, so for those
    // the wrong object is simply sent as the payload.
    // @ts-expect-error refetchInterval belongs in the third parameter
    useQueueGetItemQuery({ refetchInterval: 1000 });
    useQueueGetQuery({}, { refetchInterval: 1000 }); // correct

    // @ts-expect-error a mutation's first parameter is requestOptions, not TanStack options
    useQueueAddItemMutation({ onSuccess: () => {} });
    useQueueAddItemMutation({}, { onSuccess: () => {} }); // correct

    // The hook owns the key and the fetcher; overriding either would detach the entry from the
    // invalidation map.
    // @ts-expect-error queryKey is not overridable
    useQueueGetQuery({}, { queryKey: ['whatever'] });
    // @ts-expect-error queryFn is not overridable
    useQueueGetQuery({}, { queryFn: async () => ({}) as GetQueueResponse });

    // Transport overrides are real and typed.
    useQueueGetQuery({ baseUrl: 'http://other:60610', apiKey: null });
    // @ts-expect-error unknown request option
    useQueueGetQuery({ nonsense: true });

    // A GET that needs no arguments has no argument slot at all — `getQueue`'s optional server-side
    // payload is not browser-deliverable, so offering it would only invite a silent no-op.
    // @ts-expect-error there is no payload parameter
    useQueueGetQuery({ some_payload: true }, {}, {});

    // The hooks whose endpoint has a mandatory body still expose the GET-body strategy.
    useQueueGetItemQuery({ uid: 'abc' }, { strategy: 'throw' });

    // An addressed query takes its argument first, and a required one cannot be omitted.
    useQueueGetItemQuery({ uid: 'abc' });
    useQueueGetItemQuery(undefined); // allowed: holds the query idle
    // @ts-expect-error the argument is required — pass `undefined` explicitly to stay idle
    useQueueGetItemQuery();
    // @ts-expect-error `uid` is a string, and `payload` is not a field of this body
    useQueueGetItemQuery({ payload: { uid: 'abc' } });
}

function useInferenceChecks(): void {
    const status = useQueueGetStatusQuery();
    expectType<GetStatusResponse | undefined>(status.data);
    // @ts-expect-error data is the status response, not a queue response
    expectType<GetQueueResponse | undefined>(status.data);

    // `select` drives the returned type.
    const managerState = useQueueGetStatusQuery({}, { select: (data) => data.manager_state });
    expectType<string | undefined>(managerState.data);

    const items = useQueueGetQuery({}, { select: (data) => data.items });
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
