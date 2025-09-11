import{j as n}from"./jsx-runtime-Cf8x2fCZ.js";import{useMDXComponents as i}from"./index-DI2gBlDf.js";import"./blocks-qd6djiaP.js";import{ap as s,aq as r}from"./index-2z_kEcIj.js";import"./index-yBjzXJbu.js";import"./index-BlmOqGMO.js";import"./iframe-C9HYSyIG.js";import"../sb-preview/runtime.js";import"./index-DLqyiFW5.js";import"./index-fNjTmf9T.js";import"./index-CXQShRbs.js";import"./index-DrFu-skq.js";const o=`ReactEDM supports simple custom styling via TailWind classes. Define custom variants in \`ReactEDM/styles.json\` in this simple data structure:

\`\`\`javascript
{
    "variants": {
        "variant1": {
            "button": [
                "bg-[#00B5E2]"
            ],
            "related_disp": [
                "bg-[#00B5E2]"
            ],
            "input_num": [
                "bg-[#C0F0FF] rounded-[0.15em]"
            ],
            "input_enum": [
                "bg-white",
                "text-center"
            ],
            "input_text": [
                "bg-white",
                "rounded-[0.15em]"
            ],
            "text_update": [
                "text-[#006BA6]"
            ],
            "text": [
                "text-black"
            ],
            "rectangle": [
                "border-[#B1B3B3] border-[0.07em]"
            ],
            "display": [
                "bg-[#E9E9E9]"
            ]
        }
    }
}
\`\`\`

To make a new variant, simply add a new variant in the \`variants\` object, and for each widget, add whatever tailwind classes you like. These can be entered on the same line or added individually as separate array elements.

## Note: Use \`em\` units exclusively for all custom styling. This ensures the component can be easily resized when applied.`;function a(e){return n.jsxs(n.Fragment,{children:[n.jsx(s,{title:"Bluesky Components/ReactEDM/Developer Notes/Custom Styling"}),`
`,n.jsx(r,{children:o})]})}function j(e={}){const{wrapper:t}={...i(),...e.components};return t?n.jsx(t,{...e,children:n.jsx(a,{...e})}):a()}export{j as default};
