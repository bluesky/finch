var z=Object.defineProperty;var Z=(e,t,r)=>t in e?z(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r;var N=(e,t,r)=>Z(e,typeof t!="symbol"?t+"":t,r);import{j as n}from"./jsx-runtime-Cf8x2fCZ.js";import{useMDXComponents as H}from"./index-DI2gBlDf.js";import"./blocks-CeHdU2hB.js";import{b as ee,n as te,d as ne,u as re,a as se,Q as ae,c as oe,e as ie,f as le,q as D,g as E,p as P,h as j,i as ce,j as L}from"./QServerSimProvider-Dj0gd15U.js";import{r as l}from"./index-BlmOqGMO.js";import{b as ue}from"./apiUtils-CrwNbuDx.js";import{ap as de,aq as me}from"./index-CDVkbnX3.js";import"./index-yBjzXJbu.js";import"./FinchConfigProvider-CTKpkgTV.js";import"./iframe-DrVdNM26.js";import"../sb-preview/runtime.js";import"./index-DHavueZW.js";import"./index-fNjTmf9T.js";import"./index-CXQShRbs.js";import"./index-DrFu-skq.js";const Y={console:"api/console_output/ws",status:"api/status/ws",info:"api/info/ws"},U=4401,pe=4001,he=1e4,fe={enabled:!0,initialDelayMs:500,maxDelayMs:15e3,factor:2,jitter:.2,maxAttempts:Number.POSITIVE_INFINITY},ve=1e3;function ye(e){var v;const t=e.label??"qserver-ws",r={...fe,...e.reconnect},s=e.parse??ge,o=e.socketFactory??(a=>new WebSocket(a)),c=new Set,b=new Set,Q=new Set;let m="connecting",d=null,f=!1,p=0,S=0,g=null,x=null;const w=((v=e.auth)==null?void 0:v.mode)??"query",u=a=>{if(m!==a){m=a;for(const y of b)try{y(a)}catch(_){console.error(`[${t}] status listener threw:`,_)}}},k=a=>{for(const y of Q)try{y(a)}catch(_){console.error(`[${t}] error listener threw:`,_)}},q=()=>{x!==null&&(clearTimeout(x),x=null)},C=()=>{g!==null&&(clearTimeout(g),g=null)},h=()=>{if(f||!r.enabled)return;if(p>=r.maxAttempts){k({kind:"reconnect-exhausted",message:`Giving up after ${p} reconnect attempts.`});return}const a=Math.min(r.maxDelayMs,r.initialDelayMs*r.factor**p),y=a*r.jitter*(Math.random()*2-1);p+=1,C(),g=setTimeout(()=>{g=null,i()},Math.max(0,Math.round(a+y)))},i=()=>{if(f)return;q(),u("connecting");let a;try{a=o(w==="query"?Se(e.url,e.auth):e.url)}catch(y){k({kind:"transport",message:$(y)}),u("error"),h();return}d=a,a.onopen=()=>{if(w!=="message"){p=0,u("open");return}u("authenticating");try{a.send(JSON.stringify(be(e.auth)))}catch(y){k({kind:"auth",message:$(y)})}x=setTimeout(()=>{x=null,m==="authenticating"&&d===a&&(p=0,u("open"))},he)},a.onmessage=y=>{m!=="open"&&(q(),p=0,u("open"));const _=typeof y.data=="string"?y.data:String(y.data);let A;try{A=s(_)}catch(T){A=null,console.error(`[${t}] failed to parse frame:`,T)}if(A==null){S+=1,k({kind:"parse",message:"Dropped an unparseable frame."});return}for(const T of c)try{T(A)}catch(X){console.error(`[${t}] message listener threw:`,X)}},a.onerror=()=>{k({kind:"transport",message:"WebSocket reported an error."})},a.onclose=y=>{q(),d=null;const _=(y==null?void 0:y.code)??ve;if(f){u("closed");return}if(_===U||_===pe){k({kind:"auth",code:_,message:_===U?"Server requires credentials for this socket (close 4401).":"Server rejected the credentials (close 4001)."}),u("error");return}u("closed"),h()}};return i(),{onMessage(a){return c.add(a),()=>c.delete(a)},onStatus(a){return b.add(a),a(m),()=>b.delete(a)},onError(a){return Q.add(a),()=>Q.delete(a)},getStatus:()=>m,getDroppedCount:()=>S,reconnect(){if(C(),p=0,f=!1,d){const a=d;d=null,a.onclose=null,a.onmessage=null,a.onerror=null;try{a.close()}catch{}}i()},close(){if(f=!0,C(),q(),d)try{d.close()}catch{}u("closed")}}}function ge(e){const t=JSON.parse(e);return t===null?null:t}function Se(e,t){if(!t||t.mode==="none")return e;const r=new URLSearchParams;t.accessToken?r.set("access_token",t.accessToken):t.apiKey&&r.set("api_key",t.apiKey);const s=r.toString();return s?e.includes("?")?`${e}&${s}`:`${e}?${s}`:e}function be(e){return e!=null&&e.accessToken?{type:"auth",access_token:e.accessToken}:{type:"auth",api_key:(e==null?void 0:e.apiKey)??""}}function $(e){return e instanceof Error?e.message:String(e)}function xe(e){return!!e&&typeof e=="object"&&"msg"in e&&typeof e.time=="number"}function ke(e){return xe(e)&&typeof e.msg=="string"}function we(e,t,r){return{url:ee(t.baseUrl,Y[e]),auth:{apiKey:t.apiKey,accessToken:t.accessToken,mode:t.authMode??"query"},reconnect:t.reconnect,socketFactory:t.socketFactory,label:`qserver-ws:${e}`,parse:o=>{const c=JSON.parse(o);return r(c)?c:null}}}function Qe(e){return ye(we("console",e,ke))}function _e(e,t={}){const{enabled:r=!0,onFrame:s}=t,[o,c]=l.useState("closed"),[b,Q]=l.useState(null),[m,d]=l.useState(0),[f,p]=l.useState(0),[S,g]=l.useState(null),[x,w]=l.useState(0),u=l.useRef(null),k=l.useRef(s);k.current=s,l.useEffect(()=>{if(!r){c("closed");return}const h=e();u.current=h,g(null);const i=[h.onStatus(c),h.onMessage(v=>{var a;Q(v),d(y=>y+1),(a=k.current)==null||a.call(k,v)}),h.onError(v=>{g(v),v.kind==="parse"&&p(h.getDroppedCount())})];return()=>{for(const v of i)v();h.close(),u.current=null}},[e,r,x]);const q=l.useCallback(()=>{g(null),w(h=>h+1)},[]),C=l.useCallback(()=>{var h;(h=u.current)==null||h.close()},[]);return l.useMemo(()=>({connectionStatus:o,lastFrame:b,frameCount:m,droppedCount:f,error:S,reconnect:q,close:C}),[o,b,m,f,S,q,C])}function qe(e){const{httpBaseUrl:t,apiKey:r}=ue(),s=te(e.baseUrl??t),o=e.apiKey!==void 0?e.apiKey:r,{accessToken:c,authMode:b,reconnect:Q,socketFactory:m}=e;return l.useMemo(()=>({baseUrl:s,apiKey:o,accessToken:c,authMode:b??"query",reconnect:Q,socketFactory:m}),[s,o,c,b,Q,m])}function Ce(e={}){const{maxLines:t=1e3}=e,r=qe(e),[s,o]=l.useState([]),c=l.useRef(t);c.current=t;const b=l.useCallback(()=>Qe(r),[r]),Q=l.useCallback(p=>{o(S=>{const g=[...S,p];return g.length>c.current?g.slice(g.length-c.current):g})},[]),m=_e(b,{enabled:e.enabled,onFrame:Q}),d=l.useCallback(()=>o([]),[]),f=l.useMemo(()=>s.map(p=>p.msg).join(""),[s]);return l.useMemo(()=>({...m,lines:s,text:f,clear:d}),[m,s,f,d])}const G=1e3,Ne=4401,F=4001,je=1008;function Ae(e,t={}){const r=new Set;return Object.assign(o=>{const c=new Ee(e,o,t,()=>r.delete(c));return r.add(c),c},{closeAll:()=>{for(const o of[...r])o.close(G,"factory teardown")}})}class Ee{constructor(t,r,s,o){N(this,"readyState",0);N(this,"onopen",null);N(this,"onmessage",null);N(this,"onerror",null);N(this,"onclose",null);N(this,"sent",[]);N(this,"unsubscribe",null);N(this,"closed",!1);this.sim=t,this.url=r,this.options=s,this.onDispose=o,queueMicrotask(()=>this.open())}send(t){if(this.sent.push(t),!!this.options.expectApiKey)try{const r=JSON.parse(t);if(r.type!=="auth")return;r.api_key!==this.options.expectApiKey&&this.close(F,"Invalid token")}catch{}}close(t=G,r="sim close"){var s;this.closed||(this.closed=!0,this.readyState=3,(s=this.unsubscribe)==null||s.call(this),this.unsubscribe=null,this.onDispose(),queueMicrotask(()=>{var o;return(o=this.onclose)==null?void 0:o.call(this,{code:t,reason:r})}))}open(){var s;if(this.closed)return;const t=Re(this.url);if(!t){console.warn(`[qserver-sim] unknown websocket path: ${this.url}`),this.close(je,"Unknown socket path");return}const r=this.checkAuth();if(r){this.close(r.code,r.reason);return}this.readyState=1,(s=this.onopen)==null||s.call(this,{}),this.subscribe(t)}checkAuth(){const t=Ie(this.url),{requireAuth:r,expectApiKey:s}=this.options;return!t.apiKey&&!t.accessToken?r?{code:Ne,reason:"Auth required"}:null:s&&t.apiKey&&t.apiKey!==s?{code:F,reason:"Invalid token"}:null}subscribe(t){if(t==="status"){this.unsubscribe=this.sim.subscribeStatus(r=>{this.emit({time:this.sim.now()/1e3,msg:{status:r}})});return}if(t==="console"){if(this.options.replayConsoleOnOpen??!0){const r=this.options.replayLines??50;for(const s of this.sim.getState().console.slice(-r))this.emit({time:s.time,msg:s.msg})}this.unsubscribe=this.sim.subscribeConsole(r=>{this.emit({time:r.time,msg:r.msg})});return}this.emit({time:this.sim.now()/1e3,msg:{sim:!0,version:ne(this.sim.getState()).msg}})}emit(t){if(this.closed)return;const r=JSON.stringify(t);queueMicrotask(()=>{var s;this.closed||(s=this.onmessage)==null||s.call(this,{data:r})})}}function Re(e){const[t]=e.split("?");for(const[r,s]of Object.entries(Y))if(t.endsWith(s))return r;return null}function Ie(e){const t=e.split("?")[1];if(!t)return{};const r=new URLSearchParams(t);return{apiKey:r.get("api_key")??void 0,accessToken:r.get("access_token")??void 0}}const Te=`# QServer Sim

A self-contained, browser-side simulator for the Bluesky
[queue server](https://blueskyproject.io/bluesky-queueserver/). It models the queue, history, Run
Engine states, environment lifecycle and console output entirely in-process, so Finch's normal
queue-server API client can be driven without an RE Manager, an HTTP server, or a network. It
powers Storybook stories and tests, and it is the fastest way to develop queue UI.

It is the sibling of [Ophyd Sim](?path=/docs/documentation-ophyd-sim--docs): ophyd-sim simulates
the devices, qserver-sim simulates the thing that runs plans against them. The two compose — mount
both sets of providers and a story has live device values _and_ a working queue.

The **live demo** at the top of this page is the real
[\`QServerSimDemo\`](https://github.com/bluesky/finch/blob/main/src/components/QServerSimDemo/QServerSimDemo.tsx)
component talking to a simulator built with a _custom_ plan and device catalog — exactly what
[Bringing your own plans and devices](#bringing-your-own-plans-and-devices) walks through. Pick a
plan, press **Run plan**, and watch it move from the queue to history.

Everything is re-exported from the package root
([index.ts](https://github.com/bluesky/finch/blob/main/src/lib/qserver-sim/index.ts)); import from
\`@/lib/qserver-sim\`, never from subfolders.

> This page is the usage / getting-started guide. For the state machine, the uid bump rules and
> the rest of the internals, see
> [skills.md](https://github.com/bluesky/finch/blob/main/src/lib/qserver-sim/skills.md).

---

## Getting started

The bare minimum: build a sim, wrap the tree in the two providers, and let a component talk to it
through the ordinary queue-server client.

\`\`\`tsx
import { QServerSimProvider, createQServerSimClient, defaultQServer } from '@/lib/qserver-sim';
import { QServerApiProvider, useQServerApiClient } from '@/api/qServerRuntime';

// 1. Build a sim. Keep it stable across renders (module scope, or useMemo).
const sim = defaultQServer();

// 2. Wrap it in a client. This is what components actually call.
const client = createQServerSimClient(sim);

// 3. A leaf that talks to the queue server through the provider — no sim knowledge at all.
function QueueLength() {
    const qserver = useQServerApiClient();
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        void qserver.getQueue().then((queue) => setCount(queue.items.length));
    }, [qserver]);

    return <p>{count ?? '…'} items queued</p>;
}

// 4. Mount both providers: QServerSimProvider owns the tick loop (so runs progress),
//    QServerApiProvider supplies the client every descendant will use.
export function Example() {
    return (
        <QServerSimProvider sim={sim}>
            <QServerApiProvider client={client}>
                <QueueLength />
            </QServerApiProvider>
        </QServerSimProvider>
    );
}
\`\`\`

Two things are worth understanding about that arrangement, because they are the whole design:

- **\`QServerApiProvider\` is not part of the simulator.** It lives in
  [\`@/api/qServerRuntime\`](https://github.com/bluesky/finch/blob/main/src/api/qServerRuntime/QServerApiProvider.tsx)
  and takes anything satisfying \`QServerClientLike\` — a simulator client here, a real
  [\`QServerApiClient\`](https://github.com/bluesky/finch/blob/main/src/api/qServer/README.md)
  in production. Components never know which they got, which is exactly why a story and the real
  app can share them.
- **\`QServerSimProvider\` only owns the simulator**: it starts the tick loop on mount and stops it
  on unmount, and puts the sim in context for story-only controls. Skip it and everything still
  works, but nothing progresses on its own — you would have to call \`sim.advance(ms)\` yourself.

### Going live later

Swapping in a real server is a one-line change at the top of your tree, and nothing below it
moves:

\`\`\`tsx
import { createQServerApiClient } from '@/api/qServer';

const client = createQServerApiClient({ baseUrl: 'http://localhost:60610', apiKey: 'test' });

<QServerApiProvider client={client}>
    <YourQueueUi />
</QServerApiProvider>;
\`\`\`

### In Storybook

Skip all the boilerplate with the \`withQServerSim\` decorator, which builds a fresh simulator and
mounts both providers for you:

\`\`\`tsx
import { withQServerSim, defaultQServer, runningQServer } from '@/lib/qserver-sim';

const meta = {
    title: 'Bluesky Components/MyQueueWidget',
    component: MyQueueWidget,
    decorators: [withQServerSim(defaultQServer)],
} satisfies Meta<typeof MyQueueWidget>;

// A story that opens mid-run instead:
export const Running: Story = {
    decorators: [withQServerSim(runningQServer)],
};

// …or the default scenario with an override:
export const SlowRuns: Story = {
    decorators: [withQServerSim(defaultQServer, { runDurationMs: 8000 })],
};
\`\`\`

The decorator takes a **scenario function**, not a simulator, and builds one per story — so no two
stories share queue state.

---

## Scenarios

Five ready-made starting states. Each is a function returning a fresh simulator, and each accepts
per-field overrides.

| Scenario           | Environment | Manager / RE              | Queue | History           |
| ------------------ | ----------- | ------------------------- | ----- | ----------------- |
| \`defaultQServer()\` | open, idle  | idle / idle               | 3     | 2                 |
| \`emptyQServer()\`   | closed      | idle / —                  | 0     | 0                 |
| \`runningQServer()\` | executing   | executing_queue / running | 2     | 2                 |
| \`pausedQServer()\`  | executing   | paused / paused           | 2     | 2                 |
| \`errorQServer()\`   | open, idle  | idle / idle               | 1     | 3, next run fails |

\`\`\`ts
defaultQServer(); // the everyday baseline
defaultQServer({ runDurationMs: 500 }); // faster runs
defaultQServer({ queue: [], history: [] }); // empty, but environment still open
pausedQServer(); // the only state where abort/stop/halt work
\`\`\`

\`emptyQServer()\` starts with the environment **closed**, which is the honest cold-start state: any
attempt to start the queue is refused until something calls \`openEnvironment()\`, exactly as a real
server refuses it.

---

## Bringing your own plans and devices

The defaults (\`count\`, \`scan\`, \`grid_scan\` and a handful of \`ophyd.sim\` devices) exist so
\`defaultQServer()\` is useful immediately. Your beamline has different ones. Pass them to
\`createQServerSim\` and they **replace** the defaults entirely:

\`\`\`ts
import {
    createQServerSim,
    createQServerSimClient,
    plan,
    parameter,
    device,
    deviceAnnotation,
    deviceListAnnotation,
    queueItem,
} from '@/lib/qserver-sim';

const sim = createQServerSim({
    plans: {
        xafs_scan: plan({
            name: 'xafs_scan',
            module: 'mybeamline.plans',
            description: 'Mock XAFS scan',
            parameters: [
                parameter({ name: 'energy_start', description: 'eV', default: '7000' }),
                parameter({ name: 'energy_stop', description: 'eV', default: '7200' }),
                parameter({ name: 'num', description: 'number of points', default: '101' }),
                parameter({ name: 'detector', annotation: deviceAnnotation(['I0', 'diode']) }),
            ],
        }),
    },
    devices: {
        I0: device({ name: 'I0', type: 'detector' }),
        diode: device({ name: 'diode', type: 'detector' }),
        energy: device({ name: 'energy', type: 'motor' }),
    },
    queue: [
        queueItem({
            name: 'xafs_scan',
            kwargs: { energy_start: 7000, energy_stop: 7200, num: 101, detector: 'I0' },
        }),
    ],
    runDurationMs: 1500,
});

const client = createQServerSimClient(sim);
\`\`\`

That is the entire setup for a custom beamline — it is what the demo at the top of this page does.

### Plans

\`plan({ name, module?, description?, parameters?, isGenerator? })\` produces the same shape
\`GET /api/plans/allowed\` returns. Parameters are where the detail lives, because form widgets are
built from them:

\`\`\`ts
parameter({ name: 'num', default: '101' }); // plain value
parameter({ name: 'md', kind: 'KEYWORD_ONLY', default: 'None' }); // keyword-only
parameter({ name: 'mode', default: 'fast', enums: ['fast', 'slow'] }); // enum → select
parameter({ name: 'detector', annotation: deviceAnnotation(['I0']) }); // one device → dropdown
parameter({ name: 'detectors', annotation: deviceListAnnotation(['I0', 'diode']) }); // many
\`\`\`

Defaults are **strings**, including \`'None'\` — that is how the queue server reports Python
defaults, and copying the quirk means a form rendered against the sim looks like one rendered
against a real server. \`kind\` accepts the Python parameter kinds (\`POSITIONAL_OR_KEYWORD\` is the
default; also \`POSITIONAL_ONLY\`, \`VAR_POSITIONAL\`, \`KEYWORD_ONLY\`, \`VAR_KEYWORD\`).

### Devices

\`device({ name, type })\` covers the common cases with one word — \`'detector'\`, \`'motor'\`,
\`'signal'\` or \`'flyer'\` — each setting the readable/movable/flyable flags and a plausible
classname:

\`\`\`ts
device({ name: 'I0', type: 'detector' });
device({ name: 'energy', type: 'motor' });
\`\`\`

Override any flag when a device is unusual, and nest \`component()\` calls when UI inspects a
device's internals:

\`\`\`ts
import { device, component } from '@/lib/qserver-sim';

device({
    name: 'sample_stage',
    type: 'motor',
    classname: 'SampleStage',
    module: 'mybeamline.devices',
    components: {
        readback: component({ classname: '_ReadbackSignal', module: 'ophyd.sim' }),
        setpoint: component({ classname: '_SetpointSignal', module: 'ophyd.sim' }),
    },
});
\`\`\`

Device names in \`annotation\` are just strings — the simulator does not check that a plan's
annotated devices exist. Plan _names_, by contrast, are validated on \`addQueueItem\` (turn that off
with \`validatePlanNames: false\`).

### Queue and history

\`queueItem({ name, args?, kwargs?, itemUid? })\` seeds the queue; \`historyItem({ ..., exitStatus,
runUids, scanIds, msg, traceback })\` seeds history, including failures:

\`\`\`ts
import { historyItem, queueItem } from '@/lib/qserver-sim';

createQServerSim({
    queue: [queueItem({ name: 'xafs_scan', itemUid: 'seed-1', kwargs: { num: 51 } })],
    history: [
        historyItem({ name: 'xafs_scan', exitStatus: 'completed', scanIds: [1] }),
        historyItem({
            name: 'xafs_scan',
            exitStatus: 'failed',
            msg: "Device 'I0' timed out.",
            traceback: 'Traceback (most recent call last): ...',
        }),
    ],
});
\`\`\`

Give seeded items a fixed \`itemUid\` so tests can address them without reading the queue first;
anything added at runtime gets a minted uid (\`sim-item-1\`, \`sim-item-2\`, …).

---

## Behaviour options

Everything about _how_ the simulator behaves is one flat set of options, passed to
\`createQServerSim\` or any scenario, and changeable at runtime with \`sim.setBehavior({ … })\`:

| Option               | Default                                   | Effect                                                           |
| -------------------- | ----------------------------------------- | ---------------------------------------------------------------- |
| \`runDurationMs\`      | \`3000\`                                    | Simulated length of one run                                      |
| \`runDurationByPlan\`  | \`{}\`                                      | Per-plan overrides, e.g. \`{ count: 500 }\`                        |
| \`autoCompleteRuns\`   | \`true\`                                    | When false, runs start but never finish                          |
| \`failNextRun\`        | \`false\`                                   | Arms the next run to fail; consumed when it starts               |
| \`failMessage\`        | —                                         | Message recorded in the failed result                            |
| \`latencyMs\`          | \`0\`                                       | Delays the response, never the state change                      |
| \`consoleOutput\`      | \`true\`                                    | Emit console lines on transitions                                |
| \`consolePrefix\`      | \`true\`                                    | Prefix lines with \`[I <timestamp> <logger>]\`, as the server does |
| \`environmentOpenMs\`  | \`500\`                                     | Time \`openEnvironment()\` takes (scenarios use \`0\`)               |
| \`tickMs\`             | \`100\`                                     | Live tick interval                                               |
| \`validatePlanNames\`  | \`true\`                                    | Reject items whose plan is not in the catalog                    |
| \`user\` / \`userGroup\` | \`UNAUTHENTICATED_SINGLE_USER\` / \`primary\` | Stamped on accepted items                                        |

Arming a failure from a story button, for instance:

\`\`\`tsx
const sim = useQServerSim();
<button onClick={() => sim.setBehavior({ failNextRun: true })}>Make the next run fail</button>;
\`\`\`

---

## What the simulator models

Behaviour, not canned responses. Every read is computed from live state, so the queue, history and
status can never disagree with each other.

- **Queue lifecycle** — add (with \`pos\` / \`before_uid\` / \`after_uid\`), update, move, remove, batch
  variants, clear; items validated against the plan catalog exactly as the server validates them.
- **Run lifecycle** — start the queue, the front item moves onto the Run Engine, progresses over
  simulated time, then lands in history with a real \`result\` (\`exit_status\`, \`run_uids\`,
  \`scan_ids\`, \`time_start\`/\`time_stop\`) and the next item begins.
- **Run Engine control** — pause, resume, and the three terminal ones: \`stop\` finishes cleanly,
  \`abort\` and \`halt\` mark the run failed and return the item to the front of the queue. All three
  stop the queue, as user-initiated interventions do.
- **Queue control** — stop-after-current-plan and cancelling it, autostart, loop mode and
  \`ignore_failures\`.
- **Environment lifecycle** — open, close (refused while a plan is running), and destroy (allowed
  mid-plan, failing the run).
- **Console output** — the lines the real server emits, wording and all, taken from captured
  \`/api/console_output/ws\` traffic: the worker-startup narration when an environment opens, the
  item dictionary and scan identifiers when a plan starts, the run-closed and plan-state lines
  when it ends. Enough to watch a run happen; not a full transcript (no live data table).
- **Failures** — \`failNextRun\` for the next run, or \`sim.panic()\` to fail immediately.

### Not simulated

Deliberate omissions, so the gaps are visible rather than surprising. These endpoints answer
**501**, and they are left out of \`QServerClientLike\`, so calling one is a compile error rather
than a runtime surprise in a story:

authentication and API keys, permissions, admin (\`manager/stop\`, \`kernel/interrupt\`),
\`function/execute\`, \`script/upload\`, spreadsheet upload, \`environment/update\`, \`config/get\`,
\`re/metadata\`, and the streaming console endpoint.

Also: a run is a timer, so there is **no real plan execution** — no documents, no data, no Tiled
writes. Deferred pause is collapsed to immediate, since nothing in Finch observes
\`pause_pending\`.

---

## Websockets

The queue server pushes status and console output over websockets. The simulator can serve those
too, through the \`socketFactory\` seam the real hooks already accept — so no production code
changes:

\`\`\`tsx
import { buildQServerSimStoryContext, defaultQServer } from '@/lib/qserver-sim';
import { useQServerStatusSocket, useQServerConsoleSocket } from '@/api/qServer';

const { sim, client, socketFactory } = buildQServerSimStoryContext(defaultQServer);

function LiveStatus() {
    const { status, connectionStatus } = useQServerStatusSocket({
        baseUrl: 'http://sim.local:60610',
        socketFactory,
    });
    const { text } = useQServerConsoleSocket({
        baseUrl: 'http://sim.local:60610',
        socketFactory,
    });

    return (
        <>
            <p>
                {connectionStatus}: {status?.manager_state}
            </p>
            <pre>{text}</pre>
        </>
    );
}
\`\`\`

Most of the time you do not pass \`socketFactory\` by hand. \`QServerApiProvider\` accepts one
alongside the client, \`withQServerSim\` supplies the simulator's, and a component just asks for it:

\`\`\`tsx
import { useQServerSocketFactory } from '@/api/qServerRuntime';
import { useQServerConsoleSocket } from '@/api/qServer';

function ConsoleView() {
    const socketFactory = useQServerSocketFactory(); // undefined against a real server
    const { lines } = useQServerConsoleSocket({ socketFactory });
    return <pre>{lines.map((line) => line.msg)}</pre>;
}
\`\`\`

That is exactly what the console panel in the demo above does — the same component opens a real
websocket in the app and a simulated one here.

Status frames are pushed on every real status change and **never** for a run merely progressing.
Console frames stream as lines are emitted, with the recent backlog replayed on connect. Setting
\`requireAuth\` or \`expectApiKey\` on the factory closes with 4401 / 4001, so auth-failure UI is
demoable with no server.

---

## Driving the sim without React

Nothing ticks until \`start()\` is called — which \`QServerSimProvider\` does for you. In a test, skip
\`start()\` entirely and step time by hand, which keeps everything synchronous and deterministic:

\`\`\`ts
import { defaultQServer } from '@/lib/qserver-sim';

const sim = defaultQServer();

sim.startQueue();
expect(sim.getStatus().manager_state).toBe('executing_queue');

sim.advance(3000); // exactly one run completes
expect(sim.getState().history).toHaveLength(3);
expect(sim.getState().running?.item.name).toBe('scan'); // the next one already started
\`\`\`

\`advance(ms)\` is **one** tick, not a subdivision, and surplus time is not carried past a
transition — so \`advance(runDurationMs)\` reliably means "finish one run". Two runs need two calls.

Useful handles when driving directly: \`getState()\`, \`getStatus()\`, \`subscribeStatus(fn)\`,
\`subscribeConsole(fn)\`, \`setBehavior({...})\`, \`reset()\`, and \`panic()\`.

---

## Testing against the real client

There are two ways to point code at the simulator, and they share one internal request handler, so
they always produce identical payloads.

**\`createQServerSimClient(sim)\`** — the in-memory client used everywhere above. Fast, no axios.

**\`createQServerSimAdapter(sim)\`** — an axios adapter, so the **real** \`QServerApiClient\` runs
against the simulator with its interceptors, auth handling and error normalization intact. Use it
when you want to exercise the production code path:

\`\`\`ts
import axios from 'axios';
import { QServerApiClient } from '@/api/qServer';
import { createQServerSimAdapter, defaultQServer } from '@/lib/qserver-sim';

const sim = defaultQServer();
const client = new QServerApiClient({
    baseUrl: 'http://sim.local:60610',
    apiKey: 'test',
    client: axios.create({ adapter: createQServerSimAdapter(sim) }),
});

await client.getStatus(); // real client, real interceptors, no network
\`\`\`

Either way, failures are the real \`QServerApiError\`, so component error handling behaves the same
under the simulator as it does against a live server.
`,Me={connecting:"bg-amber-400",authenticating:"bg-amber-400",open:"bg-emerald-500",closed:"bg-slate-400",error:"bg-rose-500"};function M({autoConnect:e=!0,maxLines:t=500,className:r=""}){const s=re(),[o,c]=l.useState(e),[b,Q]=l.useState(!0),m=l.useRef(null),{lines:d,connectionStatus:f,frameCount:p,error:S,clear:g,reconnect:x}=Ce({socketFactory:s,enabled:o,maxLines:t});return l.useEffect(()=>{!b||!m.current||(m.current.scrollTop=m.current.scrollHeight)},[d,b]),n.jsxs("section",{"data-testid":"qserver-console-output",className:"rounded border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950 "+r,children:[n.jsxs("div",{className:"flex flex-wrap items-center gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-700",children:[n.jsx("span",{className:`${Me[f]??"bg-slate-400"} h-2.5 w-2.5 rounded-full`}),n.jsx("h3",{className:"text-sm font-medium",children:"Console output"}),n.jsxs("span",{className:"text-xs text-slate-500 dark:text-slate-400",children:["/api/console_output/ws · ",f," · ",p," messages"]}),n.jsxs("label",{className:"ml-auto flex items-center gap-1 text-xs",children:[n.jsx("input",{type:"checkbox",checked:b,onChange:w=>Q(w.target.checked)}),"follow"]}),n.jsx("button",{type:"button",onClick:()=>c(w=>!w),className:"rounded bg-slate-800 px-2 py-1 text-xs font-medium text-white dark:bg-slate-200 dark:text-slate-900",children:o?"Disconnect":"Connect"}),o&&n.jsx("button",{type:"button",onClick:x,className:"rounded border border-slate-400 px-2 py-1 text-xs dark:border-slate-600",children:"Reconnect"}),n.jsx("button",{type:"button",onClick:g,className:"rounded border border-slate-400 px-2 py-1 text-xs dark:border-slate-600",children:"Clear"})]}),S&&n.jsxs("p",{className:"px-3 py-1 text-xs text-rose-600 dark:text-rose-400",children:[S.kind,S.code?` (${S.code})`:"",": ",S.message]}),n.jsx("div",{ref:m,className:"h-72 overflow-y-auto rounded-b bg-slate-950 px-3 py-2 font-mono text-xs leading-relaxed text-slate-100",children:d.length===0?n.jsx("p",{className:"text-slate-500",children:Oe(o,f)}):d.map((w,u)=>{const{bracket:k,message:q}=De(w.msg);return n.jsxs("pre",{className:"whitespace-pre-wrap break-words",children:[k&&n.jsx("span",{className:"text-slate-500",children:k}),n.jsx("span",{children:q})]},`${u}-${w.time}`)})})]})}function Oe(e,t){return e?t==="open"?"connected — waiting for output…":t==="error"?"connection failed; see the error above":`${t}… no console output yet`:"disconnected"}function De(e){const t=e.replace(/\n$/,"");if(!t.startsWith("["))return{bracket:"",message:t};const r=t.indexOf("]");return r===-1?{bracket:"",message:t}:{bracket:t.slice(0,r+1),message:t.slice(r+1)}}try{M.displayName="QServerConsoleOutput",M.__docgenInfo={description:"Live console output from `/api/console_output/ws`.\n\nUses the ordinary `useQServerConsoleSocket` hook, so this is a real websocket against a real\nserver and a simulated one in Storybook — the only difference is the socket factory the provider\nhands over.\n\nThe server splits its output into `[I <timestamp> <logger>] message` lines; those are dimmed here\nso the message itself reads clearly, which is the same treatment `QSConsole` gives them.",displayName:"QServerConsoleOutput",props:{autoConnect:{defaultValue:{value:"true"},description:"Open the socket on mount. Default true.",name:"autoConnect",required:!1,type:{name:"boolean"}},maxLines:{defaultValue:{value:"500"},description:"Lines retained before the oldest are dropped. Default 500.",name:"maxLines",required:!1,type:{name:"number"}},className:{defaultValue:{value:""},description:"",name:"className",required:!1,type:{name:"string"}}}}}catch{}const Pe={status:null,queue:[],running:null,history:[],plans:{}};function O({pollIntervalMs:e=1e3,showConsole:t=!0,className:r=""}){const s=se(),[o,c]=l.useState(Pe),[b,Q]=l.useState(""),[m,d]=l.useState(""),[f,p]=l.useState(!1),S=l.useRef(!0),g=l.useRef(!1),x=l.useCallback(async()=>{if(!g.current){g.current=!0;try{const[i,v,a,y]=await Promise.all([s.getStatus(),s.getQueue(),s.getQueueHistory(),s.getPlansAllowed()]);if(!S.current)return;const _=v.running_item;c({status:i,queue:v.items??[],running:_&&"item_uid"in _?_:null,history:a.items??[],plans:y.plans_allowed??{}})}catch(i){S.current&&d(R(i))}finally{g.current=!1}}},[s]);l.useEffect(()=>{if(S.current=!0,x(),e<=0)return()=>{S.current=!1};const i=setInterval(()=>void x(),e);return()=>{S.current=!1,clearInterval(i)}},[x,e]);const w=Object.keys(o.plans),u=b||w[0]||"",k=async()=>{if(u){p(!0);try{const i=await s.addQueueItem({item:{name:u,item_type:"plan"}});d(i.success?`Added ${u} to the queue (${i.qsize} queued).`:`Could not add ${u}: ${i.msg}`)}catch(i){d(R(i))}finally{p(!1),await x()}}},q=async()=>{if(u){p(!0);try{const i=await s.addQueueItem({item:{name:u,item_type:"plan"}});if(!i.success){d(`Could not add ${u}: ${i.msg}`);return}const v=await s.getStatus();if(v.manager_state==="idle"){const a=await s.startQueue();d(a.success?`Queued and started ${u}.`:`Queued ${u}, but the queue did not start: ${a.msg}`)}else d(`Queued ${u}; the queue is already ${v.manager_state}.`)}catch(i){d(R(i))}finally{p(!1),await x()}}},C=async(i,v)=>{p(!0);try{const a=await v();d(a.success?`${i}: ok`:`${i} failed: ${a.msg}`)}catch(a){d(R(a))}finally{p(!1),await x()}},{status:h}=o;return n.jsxs("div",{"data-testid":"qserver-sim-demo",className:`mx-auto max-w-4xl space-y-4 rounded-lg border border-slate-300 bg-slate-50 p-4 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${r}`,children:[n.jsxs("header",{className:"space-y-1",children:[n.jsx("h2",{className:"text-lg font-semibold",children:"Queue Server client demo"}),n.jsx("p",{className:"font-mono text-xs text-slate-600 dark:text-slate-300",children:h?`${h.msg} · manager ${h.manager_state} · RE ${h.re_state??"—"} · env ${h.worker_environment_state} · queued ${h.items_in_queue} · history ${h.items_in_history}`:"loading…"})]}),n.jsxs("div",{className:"flex flex-wrap items-center gap-2",children:[n.jsxs("select",{value:u,onChange:i=>Q(i.target.value),className:"rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800",children:[w.length===0&&n.jsx("option",{value:"",children:"no plans available"}),w.map(i=>n.jsx("option",{value:i,children:i},i))]}),n.jsx("button",{type:"button",onClick:()=>void k(),disabled:f||!u,className:"rounded border border-slate-400 px-3 py-1 text-sm disabled:opacity-40 dark:border-slate-600",children:"Add plan"}),n.jsx("button",{type:"button",onClick:()=>void q(),disabled:f||!u,className:"rounded bg-slate-800 px-3 py-1 text-sm font-medium text-white disabled:opacity-40 dark:bg-slate-200 dark:text-slate-900",children:"Run plan"}),n.jsx("button",{type:"button",onClick:()=>void C("Open environment",()=>s.openEnvironment()),disabled:f,className:"rounded border border-slate-400 px-3 py-1 text-sm disabled:opacity-40 dark:border-slate-600",children:"Open environment"}),n.jsx("button",{type:"button",onClick:()=>void C("Close environment",()=>s.closeEnvironment()),disabled:f,className:"rounded border border-slate-400 px-3 py-1 text-sm disabled:opacity-40 dark:border-slate-600",children:"Close environment"}),n.jsx("button",{type:"button",onClick:()=>void C("Start queue",()=>s.startQueue()),disabled:f,className:"rounded border border-slate-400 px-3 py-1 text-sm disabled:opacity-40 dark:border-slate-600",children:"Start queue"}),n.jsx("button",{type:"button",onClick:()=>void x(),className:"rounded border border-slate-400 px-3 py-1 text-sm dark:border-slate-600",children:"Refresh"})]}),n.jsx("p",{title:m,className:"h-4 truncate font-mono text-xs leading-4 text-slate-600 dark:text-slate-300",children:m}),n.jsxs("section",{className:"h-20 rounded border p-3 "+(o.running?"border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950":"border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950"),children:[n.jsx("h3",{className:"text-sm font-medium",children:"Running"}),n.jsx("p",{className:"truncate font-mono text-xs",children:o.running?`${o.running.name} · ${J(o.running)}`:"—"})]}),n.jsxs("section",{children:[n.jsxs("h3",{className:"mb-1 text-sm font-medium",children:["Queue (",o.queue.length,")"]}),n.jsx(K,{children:n.jsx(B,{items:o.queue,empty:"Nothing queued.",testId:"qserver-sim-demo-queue"})})]}),n.jsxs("section",{children:[n.jsxs("h3",{className:"mb-1 text-sm font-medium",children:["History (",o.history.length,")"]}),n.jsx(K,{children:n.jsx(B,{items:o.history,empty:"No completed plans yet.",testId:"qserver-sim-demo-history",renderExtra:i=>{var v;return((v=i.result)==null?void 0:v.exit_status)??""},extraHeader:"Exit status"})})]}),t&&n.jsx(M,{})]})}function K({children:e}){return n.jsx("div",{className:"h-40 overflow-y-auto rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-950",children:e})}function B({items:e,empty:t,testId:r,renderExtra:s,extraHeader:o}){return e.length===0?n.jsx("p",{className:"text-xs text-slate-500 dark:text-slate-400",children:t}):n.jsxs("table",{"data-testid":r,className:"w-full text-left text-xs",children:[n.jsx("thead",{className:"sticky top-0 bg-white text-slate-500 dark:bg-slate-950 dark:text-slate-400",children:n.jsxs("tr",{children:[n.jsx("th",{className:"py-1 pr-2",children:"Plan"}),n.jsx("th",{className:"py-1 pr-2",children:"Arguments"}),o&&n.jsx("th",{className:"py-1 pr-2",children:o}),n.jsx("th",{className:"py-1",children:"Uid"})]})}),n.jsx("tbody",{className:"font-mono",children:e.map(c=>n.jsxs("tr",{className:"border-t border-slate-200 dark:border-slate-700",children:[n.jsx("td",{className:"py-1 pr-2",children:c.name}),n.jsx("td",{className:"py-1 pr-2",children:J(c)}),s&&n.jsx("td",{className:"py-1 pr-2",children:s(c)}),n.jsx("td",{className:"py-1 text-slate-500 dark:text-slate-400",children:c.item_uid})]},c.item_uid))})]})}function J(e){var r;const t=[];return(r=e.args)!=null&&r.length&&t.push(JSON.stringify(e.args)),e.kwargs&&Object.keys(e.kwargs).length>0&&t.push(JSON.stringify(e.kwargs)),t.join(" ")||"—"}function R(e){return e instanceof Error?`${e.name}: ${e.message}`:String(e)}try{O.displayName="QServerSimDemo",O.__docgenInfo={description:`A minimal queue-server client exercise: what's queued, what ran, and a button to run a plan.

Uses the API client from \`QServerApiProvider\` and nothing else — no TanStack Query, no caching
layer — so it reads as a direct test of the client against whatever is behind the provider
(the simulator in Storybook, a real server in the app).`,displayName:"QServerSimDemo",props:{pollIntervalMs:{defaultValue:{value:"1000"},description:"Poll interval in ms. Set to 0 to refresh only on demand.",name:"pollIntervalMs",required:!1,type:{name:"number"}},showConsole:{defaultValue:{value:"true"},description:"Show the live console-output websocket panel. Default true.",name:"showConsole",required:!1,type:{name:"boolean"}},className:{defaultValue:{value:""},description:"",name:"className",required:!1,type:{name:"string"}}}}}catch{}const V=["I0","diode"],I=oe({plans:{xafs_scan:P({name:"xafs_scan",module:"demo.plans",description:"Mock XAFS energy scan.",parameters:[j({name:"energy_start",description:"eV",default:"7000"}),j({name:"energy_stop",description:"eV",default:"7200"}),j({name:"num",description:"number of points",default:"101"}),j({name:"detector",annotation:L(V)})]}),align_beamstop:P({name:"align_beamstop",module:"demo.plans",description:"Mock beamstop alignment.",parameters:[j({name:"detectors",annotation:ce(V)}),j({name:"motor",annotation:L(["beamstop_x"])})]})},devices:{I0:E({type:"detector"}),diode:E({type:"detector"}),energy:E({type:"motor"}),beamstop_x:E({type:"motor"})},queue:[D({name:"xafs_scan",itemUid:"doc-item-1",kwargs:{energy_start:7e3,energy_stop:7200,num:101,detector:"I0"}}),D({name:"align_beamstop",itemUid:"doc-item-2",kwargs:{detectors:["diode"],motor:"beamstop_x"}})],runDurationMs:2500,environmentOpenMs:0,environmentState:"closed"});I.openEnvironment();const Le=le(I),Ue=Ae(I);function $e(){return n.jsx(ae,{sim:I,children:n.jsx(ie,{client:Le,socketFactory:Ue,children:n.jsx(O,{})})})}function W(e){const t={h1:"h1",p:"p",...H(),...e.components};return n.jsxs(n.Fragment,{children:[n.jsx(de,{title:"Documentation/QServer Sim"}),`
`,n.jsx(t.h1,{id:"qserver-sim",children:"QServer Sim"}),`
`,n.jsx(t.p,{children:`A browser-side simulator for the Bluesky queue server — queue, history, Run Engine states,
environment lifecycle and console output — that drives finch's normal queue-server client without
an RE Manager or any backend.`}),`
`,n.jsx("div",{style:{margin:"1rem 0 2rem"},children:n.jsx($e,{})}),`
`,n.jsx(me,{children:Te})]})}function st(e={}){const{wrapper:t}={...H(),...e.components};return t?n.jsx(t,{...e,children:n.jsx(W,{...e})}):W(e)}export{st as default};
