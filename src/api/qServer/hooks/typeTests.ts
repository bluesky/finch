/* eslint-disable @typescript-eslint/no-unused-vars */
import type { AxiosInstance } from 'axios';
import type { AssertTrue, ConformsToFinchHttpRequestOptions } from '../../shared/requestOptions';
import type { GetWithBodyOptions, QServerRequestOptions } from '../types/common';
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

/**
 * The transport type honours the cross-backend contract in `@/api/shared/requestOptions`.
 *
 * Not a formality: this is what makes "`requestOptions` means the same thing on every backend" a
 * checked claim rather than a comment. Dropping a field, or narrowing `apiKey` to `string` and losing
 * the "send no credentials" case, fails here.
 */
type _QServerOptionsConform = AssertTrue<
    ConformsToFinchHttpRequestOptions<QServerRequestOptions, AxiosInstance>
>;

/** The payload-GET variant must conform too — it only *adds* `strategy` and `fallback`. */
type _GetWithBodyOptionsConform = AssertTrue<
    ConformsToFinchHttpRequestOptions<GetWithBodyOptions<unknown>, AxiosInstance>
>;

// Named as hooks because they call hooks: that satisfies `rules-of-hooks` honestly, rather than
// disabling the rule for a file whose whole purpose is to be type-checked.
function useCallShapeChecks(): void {
    // TanStack options come *before* transport, and a hook with an endpoint argument takes it first.
    // The no-argument case is the payoff for that order: no placeholder.
    useQueueGetQuery({ refetchInterval: 1000 });
    useQueueGetQuery({ refetchInterval: 1000 }, { baseUrl: 'http://other:60610' });
    useQueueGetItemQuery({ uid: 'abc' }, { refetchInterval: 1000 });

    // Both directions of the slot order are pinned, because muscle memory from the old order is the
    // likeliest way to undo it. These hold only while the two option types share no field — they do
    // not today, and if a future TanStack option collides, `tsc` reports the directive as unused
    // rather than letting the swap through silently.
    // @ts-expect-error requestOptions is the last slot, not the first
    useQueueGetQuery({ baseUrl: 'http://other:60610' });
    // @ts-expect-error queryOptions comes before requestOptions
    useQueueGetStatusQuery(undefined, { refetchInterval: 1000 });

    // @ts-expect-error a mutation's first parameter is mutationOptions, not transport
    useQueueAddItemMutation({ baseUrl: 'http://other:60610' });
    useQueueAddItemMutation({ onSuccess: () => {} }); // correct

    // The hook owns the key and the fetcher; overriding either would detach the entry from the
    // invalidation map.
    // @ts-expect-error queryKey is not overridable
    useQueueGetQuery({ queryKey: ['whatever'] });
    // @ts-expect-error queryFn is not overridable
    useQueueGetQuery({ queryFn: async () => ({}) as GetQueueResponse });

    // Transport overrides are real and typed, in the last slot.
    useQueueGetQuery(undefined, { baseUrl: 'http://other:60610', apiKey: null });
    // @ts-expect-error unknown request option
    useQueueGetQuery(undefined, { nonsense: true });

    // A GET that needs no arguments has no argument slot at all — `getQueue`'s optional server-side
    // payload is not browser-deliverable, so offering it would only invite a silent no-op.
    // @ts-expect-error there is no body parameter
    useQueueGetQuery({ some_payload: true }, {}, {});

    // The hooks whose endpoint has a mandatory body still expose the GET-body strategy, which is
    // transport — how to send the body — so it lives in the last slot.
    useQueueGetItemQuery({ uid: 'abc' }, undefined, { strategy: 'throw' });

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
    const managerState = useQueueGetStatusQuery({ select: (data) => data.manager_state });
    expectType<string | undefined>(managerState.data);

    const items = useQueueGetQuery({ select: (data) => data.items });
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
