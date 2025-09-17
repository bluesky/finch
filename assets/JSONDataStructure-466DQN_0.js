import{j as n}from"./jsx-runtime-Cf8x2fCZ.js";import{useMDXComponents as i}from"./index-DI2gBlDf.js";import"./blocks-DEIdJQrx.js";import{ap as s,aq as a}from"./index-CYzEN2cS.js";import"./index-yBjzXJbu.js";import"./index-BlmOqGMO.js";import"./iframe-CPXyMpUS.js";import"../sb-preview/runtime.js";import"./index-DLqyiFW5.js";import"./index-fNjTmf9T.js";import"./index-CXQShRbs.js";import"./index-DrFu-skq.js";const o=`ReactEDM uses a common data structure to render the react components, making it simple to support new file formats in the future. The actual interface defining the data structure is in \`ReactEDM/types/UIEntry\` (seen below). It takes in var_type, location, size and name everytime, along with several optional parameters to account for the needs of different widgets. As new widgets are supported, this data structure can be adjusted to allow for new parameters

\`\`\`javascript
export interface Entry {
  var_type: string;  
  location: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  name: string;    
  label?: string;
  press_msg?: string;
  children?: Entry[]
  comp_file?: string;
  format?: string;
  dynamic_attribute?: {
    vis: string
    calc: string
    chan: string
  }
  display?: {
    label: string
    file: string
    args: Record<string, string>
  }[]
  align?: string
};

\`\`\`

Currently, the var_types that are supported are:
- entry
- update
- text
- rectangle
- display
- menu
- button
- related display
- composite


## Example of conversion
Here is what a button looks like before and after conversion:

Original ADL widget:
\`\`\`
"message button" {
	object {
		x=180
		y=230
		width=59
		height=20
	}
	control {
		chan="$(P)$(R)Acquire"
		clr=14
		bclr=51
	}
	label="Start"
	press_msg="1"
}
\`\`\`
And here is the button converted to an Entry:

\`\`\`javascript
  {
    "var_type": "button",
    "location": {
      "x": 180,
      "y": 230
    },
    "size": {
      "width": 59,
      "height": 20
    },
    "name": "$(P)$(R)Acquire",
    "label": "Start",
    "press_msg": "1"
  }
\`\`\`

Conversion is done through parser files, currently there is only \`BobParser\` and \`ADLParse\`

## What each optional parameter is used for

### label
Used in widgets that have a label, like a button. 

### press_msg
Used in buttons, it's the value sent to epics, like 1 or 0. 

### children
Used in composites/groups, it's the widgets inside a composite. 

### format
Used in entry widgets, determines if it's a string format or a number format. 

### dynamic_attribute
Used in text widget. Sometimes, text widgets only show based off of a condition. For example, when aquiring from an area detector, there is text that shows when the acquisition is done or not.

### display
Used in the display widget, which jut defines the args for the actual window of the control screen. 

### align
Used in text widget, how the widget should align, left, right or middle. `;function r(t){return n.jsxs(n.Fragment,{children:[n.jsx(s,{title:"Bluesky Components/ReactEDM/Developer Notes/Entry Data Structure"}),`
`,n.jsx(a,{children:o})]})}function x(t={}){const{wrapper:e}={...i(),...t.components};return e?n.jsx(e,{...t,children:n.jsx(r,{...t})}):r()}export{x as default};
