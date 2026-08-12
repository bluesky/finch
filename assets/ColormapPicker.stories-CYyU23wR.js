import{j as r}from"./jsx-runtime-Cf8x2fCZ.js";import{r as _}from"./index-BlmOqGMO.js";import{c as u}from"./utils-DuMXYCiK.js";import"./index-yBjzXJbu.js";const G=[{id:"Viridis",label:"Viridis",stops:"#440154,#3b528b,#21918c,#5ec962,#fde725"},{id:"Greys",label:"Greys",stops:"#000000,#ffffff"},{id:"Magma",label:"Magma",stops:"#000004,#3b0f70,#8c2981,#de4968,#fde0dd"},{id:"Plasma",label:"Plasma",stops:"#0d0887,#7e03a8,#cc4778,#f89540,#f0f921"},{id:"Cividis",label:"Cividis",stops:"#00224e,#2c4470,#566b8b,#9c9678,#fde737"},{id:"Inferno",label:"Inferno",stops:"#000004,#420a68,#932667,#dd513a,#fca50a,#f8df25"},{id:"Hot",label:"Hot",stops:"#000000,#900000,#ff5500,#ffff00,#ffffff"},{id:"RdBu",label:"RdBu",stops:"#b2182b,#ef8a62,#fddbc7,#f7f7f7,#d1e5f0,#67a9cf,#2166ac"},{id:"Jet",label:"Jet",stops:"#000080,#0000ff,#00ffff,#00ff00,#ffff00,#ff0000,#800000"},{id:"Turbo",label:"Turbo",stops:"#23171b,#4076f6,#27d7c4,#94fb9a,#f6d63b,#f54623,#900c00"}],W=[{id:"viridis",label:"Viridis",stops:"#440154,#3b528b,#21918c,#5ec962,#fde725"},{id:"gray",label:"Gray",stops:"#000000,#ffffff"},{id:"magma",label:"Magma",stops:"#000004,#3b0f70,#8c2981,#de4968,#fde0dd"},{id:"cividis",label:"Cividis",stops:"#00224e,#2c4470,#566b8b,#9c9678,#fde737"},{id:"plasma",label:"Plasma",stops:"#0d0887,#7e03a8,#cc4778,#f89540,#f0f921"},{id:"hot",label:"Hot",stops:"#000000,#900000,#ff5500,#ffff00,#ffffff"},{id:"rdbu",label:"RdBu",stops:"#b2182b,#ef8a62,#fddbc7,#f7f7f7,#d1e5f0,#67a9cf,#2166ac"},{id:"tab10",label:"Tab10",stops:"#1f77b4 10%,#ff7f0e 10% 20%,#2ca02c 20% 30%,#d62728 30% 40%,#9467bd 40% 50%,#8c564b 50% 60%,#e377c2 60% 70%,#7f7f7f 70% 80%,#bcbd22 80% 90%,#17becf 90%"},{id:"twilight",label:"Twilight",stops:"#e2d9e2,#5f6cb5,#0b1b2b,#a63a58,#e2d9e2"}];function p({value:e,onChange:m,colormaps:f=W,className:j}){return r.jsx("div",{role:"radiogroup","aria-label":"Colormap",className:u("px-3 py-3 space-y-1.5 overflow-y-auto w-52 min-w-40",j),children:f.map(s=>r.jsxs("button",{role:"radio","aria-checked":e===s.id,onClick:()=>m(s.id),className:u("w-full flex items-center gap-2 px-2 py-1.5 rounded border hover:cursor-pointer",e===s.id?"border-sky-700 bg-sky-50":"border-slate-200 hover:bg-slate-50"),children:[r.jsx("span",{className:"font-mono text-xs text-muted-foreground w-14 text-left shrink-0 truncate",children:s.label}),r.jsx("span",{className:"h-3 flex-1 rounded",style:{background:`linear-gradient(90deg, ${s.stops})`}})]},s.id))})}try{p.displayName="ColormapPicker",p.__docgenInfo={description:"A palette-style colormap selector. Renders a scrollable list of gradient swatches\nand calls `onChange` with the selected colormap's `id` string.\n\nThis component is renderer-agnostic — the `id` values from `COLORMAPS` do not\nnecessarily match the colorscale names expected by a specific renderer. For Plotly,\nuse `COLORMAPSPLOTLY` instead: its `id` values are the exact strings Plotly expects\nfor its `colorscale` prop, so the selected value can be passed through directly.",displayName:"ColormapPicker",props:{value:{defaultValue:null,description:"The id of the currently selected colormap",name:"value",required:!0,type:{name:"string"}},onChange:{defaultValue:null,description:"Called with the id of the colormap the user selects",name:"onChange",required:!0,type:{name:"(id: string) => void"}},colormaps:{defaultValue:{value:`[
    /*visually uniform maps*/
    { id: 'viridis', label: 'Viridis', stops: '#440154,#3b528b,#21918c,#5ec962,#fde725' },
    { id: 'gray', label: 'Gray', stops: '#000000,#ffffff' },
    { id: 'magma', label: 'Magma', stops: '#000004,#3b0f70,#8c2981,#de4968,#fde0dd' },
    { id: 'cividis', label: 'Cividis', stops: '#00224e,#2c4470,#566b8b,#9c9678,#fde737' },
    { id: 'plasma', label: 'Plasma', stops: '#0d0887,#7e03a8,#cc4778,#f89540,#f0f921' },
    { id: 'hot', label: 'Hot', stops: '#000000,#900000,#ff5500,#ffff00,#ffffff' },
    /*diverging maps*/
    { id: 'rdbu', label: 'RdBu', stops: '#b2182b,#ef8a62,#fddbc7,#f7f7f7,#d1e5f0,#67a9cf,#2166ac' },
    /*sequential maps*/
    {
        id: 'tab10',
        label: 'Tab10',
        stops: '#1f77b4 10%,#ff7f0e 10% 20%,#2ca02c 20% 30%,#d62728 30% 40%,#9467bd 40% 50%,#8c564b 50% 60%,#e377c2 60% 70%,#7f7f7f 70% 80%,#bcbd22 80% 90%,#17becf 90%',
    },
    /*cyclic maps*/
    { id: 'twilight', label: 'Twilight', stops: '#e2d9e2,#5f6cb5,#0b1b2b,#a63a58,#e2d9e2' },
]`},description:`Override the list of available colormaps; defaults to the built-in set.
The default list is exported as COLORMAPS and can be filtered:
\`colormaps={COLORMAPS.filter(c => ['viridis', 'magma'].includes(c.id))}\`
See the ColormapPicker Storybook docs for how to define a custom colormap.`,name:"colormaps",required:!1,type:{name:"ColormapDef[]"}},className:{defaultValue:null,description:'Additional CSS classes applied to the container (e.g. "max-h-48" to constrain height and enable scroll)',name:"className",required:!1,type:{name:"string"}}}}}catch{}const I={title:"General Components/ColormapPicker",component:p,tags:["autodocs"],parameters:{layout:"centered"}};function a(e){const[m,f]=_.useState(e.value);return r.jsx(p,{...e,value:m,onChange:f})}const o={render:a,args:{value:"viridis",className:"w-56"}},t={render:a,args:{value:"gray",className:"w-56"}},l={render:a,args:{value:"viridis",className:"w-56 max-h-40"}},n={render:a,parameters:{docs:{description:{story:`
Pass a filtered slice of \`COLORMAPS\` to show only the options relevant to your use case:

\`\`\`tsx
import { ColormapPicker, COLORMAPS } from '@blueskyproject/finch';

<ColormapPicker
  colormaps={COLORMAPS.filter(c => ['viridis', 'magma', 'gray'].includes(c.id))}
  value={cmap}
  onChange={setCmap}
/>
\`\`\`
                `}}},args:{value:"viridis",className:"w-56",colormaps:W.filter(e=>["viridis","magma","gray"].includes(e.id))}},d={render:a,parameters:{docs:{description:{story:"Colorscales matched to Plotly's built-in names. The selected `id` can be passed directly to Plotly's `colorscale` prop without any mapping."}}},args:{value:"Viridis",className:"w-56",colormaps:G}},i={render:a,parameters:{docs:{description:{story:"Labels that exceed the fixed `w-14` span are clipped with a trailing ellipsis (`truncate`). The gradient swatch is never obscured."}}},args:{value:"short",className:"w-56",colormaps:[{id:"short",label:"Short",stops:"#440154,#fde725"},{id:"medium",label:"Medium Length",stops:"#0d0887,#f0f921"},{id:"very-long",label:"A Very Long Colormap Name",stops:"#000004,#fde0dd"}]}},c={render:a,parameters:{docs:{description:{story:`
### Creating Custom Colormaps

Pass an array of \`ColormapDef\` objects to the \`colormaps\` prop:

\`\`\`tsx
const customColormaps = [
  { id: 'my-colormap', label: 'My Colormap', stops: '#FF0000,#00FF00,#0000FF' },
];

<ColormapPicker value="my-colormap" onChange={setColormap} colormaps={customColormaps} />
\`\`\`

**Color stops format:** A comma-separated string of hex color codes. The gradient interpolates between them.

- \`'#FF0000,#0000FF'\` — Red to Blue
- \`'#d73027,#f46d43,#74add1,#4575b4'\` — Red-Orange-Blue
- \`'#000000,#FFFFFF'\` — Black to White
                `}}},args:{value:"red-blue",className:"w-56",colormaps:[{id:"red-blue",label:"Red-Blue",stops:"#d73027,#f46d43,#74add1,#4575b4"},{id:"bw",label:"B+W",stops:"#000000,#ffffff"}]}};var b,h,g;o.parameters={...o.parameters,docs:{...(b=o.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: RenderWithState,
  args: {
    value: 'viridis',
    className: 'w-56'
  }
}`,...(g=(h=o.parameters)==null?void 0:h.docs)==null?void 0:g.source}}};var y,C,v;t.parameters={...t.parameters,docs:{...(y=t.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: RenderWithState,
  args: {
    value: 'gray',
    className: 'w-56'
  }
}`,...(v=(C=t.parameters)==null?void 0:C.docs)==null?void 0:v.source}}};var P,w,S;l.parameters={...l.parameters,docs:{...(P=l.parameters)==null?void 0:P.docs,source:{originalSource:`{
  render: RenderWithState,
  args: {
    value: 'viridis',
    className: 'w-56 max-h-40'
  }
}`,...(S=(w=l.parameters)==null?void 0:w.docs)==null?void 0:S.source}}};var x,F,O;n.parameters={...n.parameters,docs:{...(x=n.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: RenderWithState,
  parameters: {
    docs: {
      description: {
        story: \`
Pass a filtered slice of \\\`COLORMAPS\\\` to show only the options relevant to your use case:

\\\`\\\`\\\`tsx
import { ColormapPicker, COLORMAPS } from '@blueskyproject/finch';

<ColormapPicker
  colormaps={COLORMAPS.filter(c => ['viridis', 'magma', 'gray'].includes(c.id))}
  value={cmap}
  onChange={setCmap}
/>
\\\`\\\`\\\`
                \`
      }
    }
  },
  args: {
    value: 'viridis',
    className: 'w-56',
    colormaps: COLORMAPS.filter(c => ['viridis', 'magma', 'gray'].includes(c.id))
  }
}`,...(O=(F=n.parameters)==null?void 0:F.docs)==null?void 0:O.source}}};var R,L,N;d.parameters={...d.parameters,docs:{...(R=d.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: RenderWithState,
  parameters: {
    docs: {
      description: {
        story: "Colorscales matched to Plotly's built-in names. The selected \`id\` can be passed directly to Plotly's \`colorscale\` prop without any mapping."
      }
    }
  },
  args: {
    value: 'Viridis',
    className: 'w-56',
    colormaps: COLORMAPSPLOTLY
  }
}`,...(N=(L=d.parameters)==null?void 0:L.docs)==null?void 0:N.source}}};var k,M,A;i.parameters={...i.parameters,docs:{...(k=i.parameters)==null?void 0:k.docs,source:{originalSource:`{
  render: RenderWithState,
  parameters: {
    docs: {
      description: {
        story: 'Labels that exceed the fixed \`w-14\` span are clipped with a trailing ellipsis (\`truncate\`). The gradient swatch is never obscured.'
      }
    }
  },
  args: {
    value: 'short',
    className: 'w-56',
    colormaps: [{
      id: 'short',
      label: 'Short',
      stops: '#440154,#fde725'
    }, {
      id: 'medium',
      label: 'Medium Length',
      stops: '#0d0887,#f0f921'
    }, {
      id: 'very-long',
      label: 'A Very Long Colormap Name',
      stops: '#000004,#fde0dd'
    }]
  }
}`,...(A=(M=i.parameters)==null?void 0:M.docs)==null?void 0:A.source}}};var T,B,V;c.parameters={...c.parameters,docs:{...(T=c.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: RenderWithState,
  parameters: {
    docs: {
      description: {
        story: \`
### Creating Custom Colormaps

Pass an array of \\\`ColormapDef\\\` objects to the \\\`colormaps\\\` prop:

\\\`\\\`\\\`tsx
const customColormaps = [
  { id: 'my-colormap', label: 'My Colormap', stops: '#FF0000,#00FF00,#0000FF' },
];

<ColormapPicker value="my-colormap" onChange={setColormap} colormaps={customColormaps} />
\\\`\\\`\\\`

**Color stops format:** A comma-separated string of hex color codes. The gradient interpolates between them.

- \\\`'#FF0000,#0000FF'\\\` — Red to Blue
- \\\`'#d73027,#f46d43,#74add1,#4575b4'\\\` — Red-Orange-Blue
- \\\`'#000000,#FFFFFF'\\\` — Black to White
                \`
      }
    }
  },
  args: {
    value: 'red-blue',
    className: 'w-56',
    colormaps: [{
      id: 'red-blue',
      label: 'Red-Blue',
      stops: '#d73027,#f46d43,#74add1,#4575b4'
    }, {
      id: 'bw',
      label: 'B+W',
      stops: '#000000,#ffffff'
    }]
  }
}`,...(V=(B=c.parameters)==null?void 0:B.docs)==null?void 0:V.source}}};const Y=["Default","GraySelected","Scrollable","FilteredColormaps","PlotlyColormaps","LongLabels","CustomColormaps"];export{c as CustomColormaps,o as Default,n as FilteredColormaps,t as GraySelected,i as LongLabels,d as PlotlyColormaps,l as Scrollable,Y as __namedExportsOrder,I as default};
