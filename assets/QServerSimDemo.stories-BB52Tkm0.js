import{Q as X}from"./QServerSimDemo-2_zD5cGH.js";import{c as d,B as c,i as m,j as p,k as Y,w as r,l}from"./withQServerSim-Bc1FqFEc.js";import"./index-BlmOqGMO.js";import"./jsx-runtime-Cf8x2fCZ.js";import"./index-yBjzXJbu.js";import"./apiUtils-CrwNbuDx.js";import"./FinchConfigProvider-CTKpkgTV.js";function Z(e={}){return d({...c,queue:[],history:[],environmentState:"closed",...e})}function $(e={}){return d({...c,queue:p,history:m,environmentState:"idle",running:{itemIndex:0},...e})}function ee(e={}){const V=e.runDurationMs??c.runDurationMs??3e3;return d({...c,queue:p,history:m,environmentState:"idle",running:{itemIndex:0,elapsedMs:Math.round(V/3),paused:!0},...e})}function re(e={}){return d({...c,queue:[p[0]],history:[...m,Y],environmentState:"idle",failNextRun:!0,failMessage:"Simulated plan failure: device 'det' timed out.",...e})}const ce={title:"Bluesky Components/QServerSimDemo",component:X,tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:`A minimal exercise of the queue-server API client, running entirely against
**qserver-sim** — no RE Manager, no network.

It shows what is queued, what has run, and lets you queue and start a plan. The component only
uses the client from \`QServerApiProvider\`, so what you see here is what it would do against a
real server.

Each story gets its own simulator via the \`withQServerSim\` decorator, so they never interfere.
Runs progress on a real timer while a story is mounted (3 s each by default), and the component
polls once a second, so the tables move on their own.`}}},decorators:[r(l)]},t={},s={decorators:[r(Z)]},o={decorators:[r($)]},n={decorators:[r(ee)]},a={decorators:[r(re)]},i={decorators:[r(l,{runDurationMs:8e3})]},u={decorators:[r(l,{latencyMs:400})]};var h,S,y,v,w;t.parameters={...t.parameters,docs:{...(h=t.parameters)==null?void 0:h.docs,source:{originalSource:"{}",...(y=(S=t.parameters)==null?void 0:S.docs)==null?void 0:y.source},description:{story:"Environment open and idle, three plans queued and two in history.",...(w=(v=t.parameters)==null?void 0:v.docs)==null?void 0:w.description}}};var g,f,Q,q,M;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  decorators: [withQServerSim(emptyQServer)]
}`,...(Q=(f=s.parameters)==null?void 0:f.docs)==null?void 0:Q.source},description:{story:`A closed environment with an empty queue.

"Run plan" queues the item but cannot start it — open the environment first, which is exactly
what a real server insists on.`,...(M=(q=s.parameters)==null?void 0:q.docs)==null?void 0:M.description}}};var x,D,E,R,A;o.parameters={...o.parameters,docs:{...(x=o.parameters)==null?void 0:x.docs,source:{originalSource:`{
  decorators: [withQServerSim(runningQServer)]
}`,...(E=(D=o.parameters)==null?void 0:D.docs)==null?void 0:E.source},description:{story:"A plan already executing, with two more queued behind it. Watch it drain.",...(A=(R=o.parameters)==null?void 0:R.docs)==null?void 0:A.description}}};var I,b,k,N,P;n.parameters={...n.parameters,docs:{...(I=n.parameters)==null?void 0:I.docs,source:{originalSource:`{
  decorators: [withQServerSim(pausedQServer)]
}`,...(k=(b=n.parameters)==null?void 0:b.docs)==null?void 0:k.source},description:{story:"A paused plan: progress is frozen until something resumes, stops, aborts or halts it.",...(P=(N=n.parameters)==null?void 0:N.docs)==null?void 0:P.description}}};var _,O,B,T,z;a.parameters={...a.parameters,docs:{...(_=a.parameters)==null?void 0:_.docs,source:{originalSource:`{
  decorators: [withQServerSim(errorQServer)]
}`,...(B=(O=a.parameters)==null?void 0:O.docs)==null?void 0:B.source},description:{story:"The next run is armed to fail. Start the queue and it lands in history with\n`exit_status: 'failed'`, the item returns to the front of the queue, and the queue stops.",...(z=(T=a.parameters)==null?void 0:T.docs)==null?void 0:z.description}}};var C,F,H,j,L;i.parameters={...i.parameters,docs:{...(C=i.parameters)==null?void 0:C.docs,source:{originalSource:`{
  decorators: [withQServerSim(defaultQServer, {
    runDurationMs: 8000
  })]
}`,...(H=(F=i.parameters)==null?void 0:F.docs)==null?void 0:H.source},description:{story:"Eight-second runs, for watching a single plan progress without it finishing immediately.",...(L=(j=i.parameters)==null?void 0:j.docs)==null?void 0:L.description}}};var U,W,G,J,K;u.parameters={...u.parameters,docs:{...(U=u.parameters)==null?void 0:U.docs,source:{originalSource:`{
  decorators: [withQServerSim(defaultQServer, {
    latencyMs: 400
  })]
}`,...(G=(W=u.parameters)==null?void 0:W.docs)==null?void 0:G.source},description:{story:`400 ms of simulated latency on every response.

Latency delays the response only — the simulator's state changes immediately — so this is a way
to see how the UI behaves on a slow link without desynchronizing anything.`,...(K=(J=u.parameters)==null?void 0:J.docs)==null?void 0:K.description}}};const de=["Default","Empty","Running","Paused","Failing","SlowRuns","SlowNetwork"];export{t as Default,s as Empty,a as Failing,n as Paused,o as Running,u as SlowNetwork,i as SlowRuns,de as __namedExportsOrder,ce as default};
