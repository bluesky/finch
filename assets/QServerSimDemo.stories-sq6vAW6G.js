import{c as $,Q as se}from"./QServerSimDemo-BT7pVG84.js";import{B as p,d as h,a as v,f as ne,b as s}from"./defaultQServer-Bf7CnH0-.js";import{c as l,Q as ae,a as ie,b as ee}from"./QServerSimProvider-CottkjZw.js";import{j as S}from"./jsx-runtime-Cf8x2fCZ.js";import"./index-BlmOqGMO.js";import"./index-yBjzXJbu.js";import"./apiUtils-CrwNbuDx.js";import"./FinchConfigProvider-CTKpkgTV.js";function ce(e={}){return l({...p,queue:[],history:[],environmentState:"closed",...e})}function ue(e={}){return l({...p,queue:v,history:h,environmentState:"idle",running:{itemIndex:0},...e})}function de(e={}){const o=e.runDurationMs??p.runDurationMs??3e3;return l({...p,queue:v,history:h,environmentState:"idle",running:{itemIndex:0,elapsedMs:Math.round(o/3),paused:!0},...e})}function me(e={}){return l({...p,queue:[v[0]],history:[...h,ne],environmentState:"idle",failNextRun:!0,failMessage:"Simulated plan failure: device 'det' timed out.",...e})}function r(e=s,o={}){const t=typeof e=="function"?e(o):s({...e,...o}),re=ee(t),te=$(t);return function(oe){return S.jsx(ae,{sim:t,children:S.jsx(ie,{client:re,socketFactory:te,children:S.jsx(oe,{})})})}}function y(e=s,o={}){const t=e(o);return{sim:t,client:ee(t),socketFactory:$(t)}}try{r.displayName="withQServerSim",r.__docgenInfo={description:`Build a Storybook decorator that runs a story entirely against the simulator.

It wires both providers: \`QServerSimProvider\` (so story-only controls can drive the sim) and
\`QServerApiProvider\` with a simulator-backed client *and* socket factory (so the component under
test uses its normal client and its normal socket hooks). Nothing leaves the page.

\`\`\`ts
const meta = {
    title: 'Bluesky Components/QServerSimDemo',
    component: QServerSimDemo,
    decorators: [withQServerSim(defaultQServer)],
} satisfies Meta<typeof QServerSimDemo>;
\`\`\`

Takes a **scenario function**, not a simulator, and builds one per decorator application — so
two stories never share mutable queue state. Pass overrides as the second argument:

\`\`\`ts
decorators: [withQServerSim(runningQServer, { runDurationMs: 8000 })]
\`\`\`

Give it a plain options object to use the default scenario:
\`withQServerSim({ queue: [], runDurationMs: 500 })\`.`,displayName:"withQServerSim",props:{}}}catch{}try{y.displayName="buildQServerSimStoryContext",y.__docgenInfo={description:"Build the pieces the decorator wires, when a story needs direct access — for example to hand\n`socketFactory` to `useQServerStatusSocket`, or to drive `sim.advance()` from a play function.\n\n```ts\nconst { sim, client, socketFactory } = buildQServerSimStoryContext(pausedQServer);\n```",displayName:"buildQServerSimStoryContext",props:{}}}catch{}const ge={title:"Bluesky Components/QServerSimDemo",component:se,tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:`A minimal exercise of the queue-server API client, running entirely against
**qserver-sim** — no RE Manager, no network.

It shows what is queued, what has run, and lets you queue and start a plan. The component only
uses the client from \`QServerApiProvider\`, so what you see here is what it would do against a
real server.

Each story gets its own simulator via the \`withQServerSim\` decorator, so they never interfere.
Runs progress on a real timer while a story is mounted (3 s each by default), and the component
polls once a second, so the tables move on their own.`}}},decorators:[r(s)]},n={},a={decorators:[r(ce)]},i={decorators:[r(ue)]},c={decorators:[r(de)]},u={decorators:[r(me)]},d={decorators:[r(s,{runDurationMs:8e3})]},m={decorators:[r(s,{latencyMs:400})]};var f,Q,w,g,_;n.parameters={...n.parameters,docs:{...(f=n.parameters)==null?void 0:f.docs,source:{originalSource:"{}",...(w=(Q=n.parameters)==null?void 0:Q.docs)==null?void 0:w.source},description:{story:"Environment open and idle, three plans queued and two in history.",...(_=(g=n.parameters)==null?void 0:g.docs)==null?void 0:_.description}}};var x,b,k,q,D;a.parameters={...a.parameters,docs:{...(x=a.parameters)==null?void 0:x.docs,source:{originalSource:`{
  decorators: [withQServerSim(emptyQServer)]
}`,...(k=(b=a.parameters)==null?void 0:b.docs)==null?void 0:k.source},description:{story:`A closed environment with an empty queue.

"Run plan" queues the item but cannot start it — open the environment first, which is exactly
what a real server insists on.`,...(D=(q=a.parameters)==null?void 0:q.docs)==null?void 0:D.description}}};var M,I,A,E,N;i.parameters={...i.parameters,docs:{...(M=i.parameters)==null?void 0:M.docs,source:{originalSource:`{
  decorators: [withQServerSim(runningQServer)]
}`,...(A=(I=i.parameters)==null?void 0:I.docs)==null?void 0:A.source},description:{story:"A plan already executing, with two more queued behind it. Watch it drain.",...(N=(E=i.parameters)==null?void 0:E.docs)==null?void 0:N.description}}};var P,R,C,F,j;c.parameters={...c.parameters,docs:{...(P=c.parameters)==null?void 0:P.docs,source:{originalSource:`{
  decorators: [withQServerSim(pausedQServer)]
}`,...(C=(R=c.parameters)==null?void 0:R.docs)==null?void 0:C.source},description:{story:"A paused plan: progress is frozen until something resumes, stops, aborts or halts it.",...(j=(F=c.parameters)==null?void 0:F.docs)==null?void 0:j.description}}};var B,T,z,H,G;u.parameters={...u.parameters,docs:{...(B=u.parameters)==null?void 0:B.docs,source:{originalSource:`{
  decorators: [withQServerSim(errorQServer)]
}`,...(z=(T=u.parameters)==null?void 0:T.docs)==null?void 0:z.source},description:{story:"The next run is armed to fail. Start the queue and it lands in history with\n`exit_status: 'failed'`, the item returns to the front of the queue, and the queue stops.",...(G=(H=u.parameters)==null?void 0:H.docs)==null?void 0:G.description}}};var L,U,W,J,K;d.parameters={...d.parameters,docs:{...(L=d.parameters)==null?void 0:L.docs,source:{originalSource:`{
  decorators: [withQServerSim(defaultQServer, {
    runDurationMs: 8000
  })]
}`,...(W=(U=d.parameters)==null?void 0:U.docs)==null?void 0:W.source},description:{story:"Eight-second runs, for watching a single plan progress without it finishing immediately.",...(K=(J=d.parameters)==null?void 0:J.docs)==null?void 0:K.description}}};var O,V,X,Y,Z;m.parameters={...m.parameters,docs:{...(O=m.parameters)==null?void 0:O.docs,source:{originalSource:`{
  decorators: [withQServerSim(defaultQServer, {
    latencyMs: 400
  })]
}`,...(X=(V=m.parameters)==null?void 0:V.docs)==null?void 0:X.source},description:{story:`400 ms of simulated latency on every response.

Latency delays the response only — the simulator's state changes immediately — so this is a way
to see how the UI behaves on a slow link without desynchronizing anything.`,...(Z=(Y=m.parameters)==null?void 0:Y.docs)==null?void 0:Z.description}}};const _e=["Default","Empty","Running","Paused","Failing","SlowRuns","SlowNetwork"];export{n as Default,a as Empty,u as Failing,c as Paused,i as Running,m as SlowNetwork,d as SlowRuns,_e as __namedExportsOrder,ge as default};
