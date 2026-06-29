import{j as e}from"./jsx-runtime-Cf8x2fCZ.js";import{useMDXComponents as u}from"./index-DI2gBlDf.js";import{W as r}from"./index-C6riaNic.js";import"./index-yBjzXJbu.js";import"./index-BlmOqGMO.js";import"./iframe-CY6q6zEv.js";import"../sb-preview/runtime.js";import"./index-czWnIymw.js";import"./index-fNjTmf9T.js";import"./index-cS34vJOP.js";import"./index-DrFu-skq.js";function s(t){const n={code:"code",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...u(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(r,{title:"Documentation/Queue Server API Hooks"}),`
`,e.jsx(n.h1,{id:"queue-server-api-hooks",children:"Queue Server API Hooks"}),`
`,e.jsxs(n.p,{children:["Finch exposes react-query hooks for every Queue Server (bluesky-queueserver) endpoint. All hooks read their backend URL and API key from ",e.jsx(n.code,{children:"FinchConfigProvider"})," — see the ",e.jsx(n.strong,{children:"Configuration"})," page for setup."]}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Requirements:"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"QueryClientProvider"})," must wrap your component tree (react-query)"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"FinchConfigProvider"})," must be configured with the Queue Server HTTP base URL"]}),`
`]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"setup",children:"Setup"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FinchConfigProvider } from '@blueskyproject/finch';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FinchConfigProvider config={{ qServerUrl: 'http://localhost:60610' }}>
        <YourApp />
      </FinchConfigProvider>
    </QueryClientProvider>
  );
}
`})}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"query-hooks",children:"Query hooks"}),`
`,e.jsxs(n.p,{children:["All query hooks accept an optional ",e.jsx(n.code,{children:"queryOptions"})," argument that is passed through to react-query's ",e.jsx(n.code,{children:"useQuery"}),". Use it to configure polling intervals, stale time, conditional enabling, and more."]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`// Poll every 2 seconds
useStatusQuery({ refetchInterval: 2000 });

// Only fetch when the user is authenticated
useQueueQuery({ enabled: isAuthenticated });

// Cache for 30 seconds before re-fetching in the background
usePlansAllowedQuery({ staleTime: 30_000 });
`})}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h3,{id:"usestatusquery",children:e.jsx(n.code,{children:"useStatusQuery"})}),`
`,e.jsx(n.p,{children:"Returns the current RunEngine and environment status."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import { useStatusQuery } from '@blueskyproject/finch';

function StatusBadge() {
  const { data: status, isLoading } = useStatusQuery({ refetchInterval: 2000 });

  if (isLoading) return <span>Loading...</span>;

  return (
    <div>
      <p>Manager state: {status?.manager_state}</p>
      <p>Environment: {status?.worker_environment_state}</p>
      <p>RE state: {status?.re_state}</p>
      <p>Queue size: {status?.items_in_queue}</p>
      <p>Running: {status?.items_in_history} completed</p>
    </div>
  );
}
`})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Query key:"})," ",e.jsx(n.code,{children:"['qserver', 'status']"})]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h3,{id:"usequeuequery",children:e.jsx(n.code,{children:"useQueueQuery"})}),`
`,e.jsx(n.p,{children:"Returns the list of items currently in the queue."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import { useQueueQuery } from '@blueskyproject/finch';

function QueueList() {
  const { data: queue } = useQueueQuery({ refetchInterval: 1000 });

  return (
    <ul>
      {queue?.items.map((item) => (
        <li key={item.item_uid}>
          {item.name} — uid: {item.item_uid}
        </li>
      ))}
    </ul>
  );
}
`})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Query key:"})," ",e.jsx(n.code,{children:"['qserver', 'queue']"})]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h3,{id:"usequeuehistoryquery",children:e.jsx(n.code,{children:"useQueueHistoryQuery"})}),`
`,e.jsx(n.p,{children:"Returns the execution history of completed queue items."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import { useQueueHistoryQuery } from '@blueskyproject/finch';

function HistoryList() {
  const { data: history } = useQueueHistoryQuery();

  return (
    <ul>
      {history?.items.map((item) => (
        <li key={item.item_uid}>
          {item.name} — result: {item.result?.exit_status}
        </li>
      ))}
    </ul>
  );
}
`})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Query key:"})," ",e.jsx(n.code,{children:"['qserver', 'history']"})]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h3,{id:"useplansallowedquery",children:e.jsx(n.code,{children:"usePlansAllowedQuery"})}),`
`,e.jsx(n.p,{children:"Returns the list of plans allowed on this Queue Server instance."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import { usePlansAllowedQuery } from '@blueskyproject/finch';

function PlanSelector() {
  const { data } = usePlansAllowedQuery();

  return (
    <select>
      {Object.keys(data?.plans_allowed ?? {}).map((planName) => (
        <option key={planName} value={planName}>{planName}</option>
      ))}
    </select>
  );
}
`})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Query key:"})," ",e.jsx(n.code,{children:"['qserver', 'plansAllowed']"})]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h3,{id:"usedevicesallowedquery",children:e.jsx(n.code,{children:"useDevicesAllowedQuery"})}),`
`,e.jsx(n.p,{children:"Returns the list of devices allowed on this Queue Server instance."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import { useDevicesAllowedQuery } from '@blueskyproject/finch';

function DeviceList() {
  const { data } = useDevicesAllowedQuery();

  return (
    <ul>
      {Object.keys(data?.devices_allowed ?? {}).map((name) => (
        <li key={name}>{name}</li>
      ))}
    </ul>
  );
}
`})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Query key:"})," ",e.jsx(n.code,{children:"['qserver', 'devicesAllowed']"})]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h3,{id:"usequeueitemquery",children:e.jsx(n.code,{children:"useQueueItemQuery"})}),`
`,e.jsxs(n.p,{children:["Returns details for a specific queue item by UID. Automatically disabled when ",e.jsx(n.code,{children:"itemUid"})," is ",e.jsx(n.code,{children:"undefined"}),"."]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import { useQueueItemQuery } from '@blueskyproject/finch';

function QueueItemDetail({ uid }: { uid: string | undefined }) {
  const { data: item } = useQueueItemQuery(uid);

  if (!item) return null;

  return (
    <div>
      <p>Plan: {item.item?.name}</p>
      <p>UID: {item.item?.item_uid}</p>
    </div>
  );
}
`})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Parameters:"})," ",e.jsx(n.code,{children:"(itemUid: string | undefined, queryOptions?)"})]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Query key:"})," ",e.jsx(n.code,{children:"['qserver', 'queueItem', itemUid]"})]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h3,{id:"userunsactivequery",children:e.jsx(n.code,{children:"useRunsActiveQuery"})}),`
`,e.jsx(n.p,{children:"Returns the list of currently active (running) Bluesky runs."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import { useRunsActiveQuery } from '@blueskyproject/finch';

function ActiveRuns() {
  const { data } = useRunsActiveQuery({ refetchInterval: 1000 });

  return (
    <ul>
      {data?.run_list?.map((run) => (
        <li key={run.uid}>{run.uid}</li>
      ))}
    </ul>
  );
}
`})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Query key:"})," ",e.jsx(n.code,{children:"['qserver', 'runsActive']"})]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"mutation-hooks",children:"Mutation hooks"}),`
`,e.jsxs(n.p,{children:["Mutation hooks use react-query's ",e.jsx(n.code,{children:"useMutation"})," and automatically invalidate related queries on success so your UI stays in sync without manual refetches."]}),`
`,e.jsx(n.h3,{id:"runengine-lifecycle-mutations",children:"RunEngine lifecycle mutations"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import {
  useOpenEnvironmentMutation,
  useStartREMutation,
  usePauseREMutation,
  useResumeREMutation,
  useAbortREMutation,
} from '@blueskyproject/finch';

function REControls() {
  const openEnv = useOpenEnvironmentMutation();
  const startRE = useStartREMutation();
  const pauseRE = usePauseREMutation();
  const resumeRE = useResumeREMutation();
  const abortRE = useAbortREMutation();

  return (
    <div>
      <button onClick={() => openEnv.mutate()}>Open environment</button>
      <button onClick={() => startRE.mutate()}>Start queue</button>
      <button onClick={() => pauseRE.mutate()}>Pause</button>
      <button onClick={() => resumeRE.mutate()}>Resume</button>
      <button onClick={() => abortRE.mutate()}>Abort</button>
    </div>
  );
}
`})}),`
`,e.jsxs(n.p,{children:[`| Hook | Invalidates on success |
|---|---|
| `,e.jsx(n.code,{children:"useOpenEnvironmentMutation"})," | ",e.jsx(n.code,{children:"status"}),` |
| `,e.jsx(n.code,{children:"useStartREMutation"})," | ",e.jsx(n.code,{children:"status"}),", ",e.jsx(n.code,{children:"queue"}),` |
| `,e.jsx(n.code,{children:"usePauseREMutation"})," | ",e.jsx(n.code,{children:"status"}),` |
| `,e.jsx(n.code,{children:"useResumeREMutation"})," | ",e.jsx(n.code,{children:"status"}),` |
| `,e.jsx(n.code,{children:"useAbortREMutation"})," | ",e.jsx(n.code,{children:"status"}),", ",e.jsx(n.code,{children:"queue"}),", ",e.jsx(n.code,{children:"runsActive"})," |"]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h3,{id:"useaddqueueitemmutation",children:e.jsx(n.code,{children:"useAddQueueItemMutation"})}),`
`,e.jsx(n.p,{children:"Adds a plan to the queue."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import { useAddQueueItemMutation } from '@blueskyproject/finch';

function AddPlanButton() {
  const addItem = useAddQueueItemMutation();

  const handleAdd = () => {
    addItem.mutate({
      item: {
        name: 'count',
        args: [['det']],
        kwargs: { num: 5, delay: 0.1 },
        item_type: 'plan',
      },
      pos: 'back',
    });
  };

  return (
    <button onClick={handleAdd} disabled={addItem.isPending}>
      {addItem.isPending ? 'Adding...' : 'Add to queue'}
    </button>
  );
}
`})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Parameter:"})," ",e.jsx(n.code,{children:"AddQueueItemBody"})]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Invalidates on success:"})," ",e.jsx(n.code,{children:"queue"}),", ",e.jsx(n.code,{children:"history"})]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h3,{id:"useexecutequeueitemmutation",children:e.jsx(n.code,{children:"useExecuteQueueItemMutation"})}),`
`,e.jsx(n.p,{children:"Immediately executes a single plan item (outside the queue)."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import { useExecuteQueueItemMutation } from '@blueskyproject/finch';

function RunNowButton() {
  const execute = useExecuteQueueItemMutation();

  return (
    <button
      onClick={() =>
        execute.mutate({
          item: {
            name: 'count',
            args: [['det']],
            kwargs: { num: 1 },
            item_type: 'plan',
          },
        })
      }
    >
      Run now
    </button>
  );
}
`})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Parameter:"})," ",e.jsx(n.code,{children:"ExecuteQueueItemBody"})]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Invalidates on success:"})," ",e.jsx(n.code,{children:"queue"}),", ",e.jsx(n.code,{children:"status"}),", ",e.jsx(n.code,{children:"runsActive"})]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h3,{id:"useremovequeueitemmutation",children:e.jsx(n.code,{children:"useRemoveQueueItemMutation"})}),`
`,e.jsx(n.p,{children:"Removes an item from the queue by UID."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import { useRemoveQueueItemMutation } from '@blueskyproject/finch';

function RemoveButton({ uid }: { uid: string }) {
  const remove = useRemoveQueueItemMutation();

  return (
    <button onClick={() => remove.mutate({ uid })}>
      Remove
    </button>
  );
}
`})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Parameter:"})," ",e.jsx(n.code,{children:"RemoveQueueItemBody"})]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Invalidates on success:"})," ",e.jsx(n.code,{children:"queue"}),", ",e.jsx(n.code,{children:"history"})]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"combined-example",children:"Combined example"}),`
`,e.jsx(n.p,{children:"A realistic panel showing live status polling alongside queue control mutations:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import {
  useStatusQuery,
  useQueueQuery,
  useOpenEnvironmentMutation,
  useStartREMutation,
  useAddQueueItemMutation,
} from '@blueskyproject/finch';

function QServerPanel() {
  const { data: status } = useStatusQuery({ refetchInterval: 2000 });
  const { data: queue } = useQueueQuery({ refetchInterval: 2000 });
  const openEnv = useOpenEnvironmentMutation();
  const startRE = useStartREMutation();
  const addItem = useAddQueueItemMutation();

  const isReady = status?.manager_state === 'idle';

  return (
    <div>
      <p>State: {status?.manager_state ?? '—'}</p>
      <p>Queue: {queue?.items.length ?? 0} items</p>

      <button onClick={() => openEnv.mutate()} disabled={!isReady}>
        Open environment
      </button>

      <button
        onClick={() =>
          addItem.mutate({
            item: { name: 'count', args: [['det']], kwargs: { num: 5 }, item_type: 'plan' },
            pos: 'back',
          })
        }
      >
        Add plan
      </button>

      <button onClick={() => startRE.mutate()} disabled={!isReady}>
        Start queue
      </button>
    </div>
  );
}
`})})]})}function y(t={}){const{wrapper:n}={...u(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(s,{...t})}):s(t)}export{y as default};
