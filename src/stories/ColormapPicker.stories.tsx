import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import ColormapPicker from '../components/ColormapPicker/ColormapPicker';
import type { ColormapPickerProps } from '../components/ColormapPicker/ColormapPicker';
import { COLORMAPS, COLORMAPSPLOTLY } from '../components/ColormapPicker/colormaps';

const meta = {
    title: 'General Components/ColormapPicker',
    component: ColormapPicker,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
    },
} satisfies Meta<typeof ColormapPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

function RenderWithState(args: ColormapPickerProps) {
    const [value, setValue] = useState(args.value);
    return <ColormapPicker {...args} value={value} onChange={setValue} />;
}

export const Default: Story = {
    render: RenderWithState,
    args: {
        value: 'viridis',
        className: 'w-56',
    },
};

export const GraySelected: Story = {
    render: RenderWithState,
    args: {
        value: 'gray',
        className: 'w-56',
    },
};

export const Scrollable: Story = {
    render: RenderWithState,
    args: {
        value: 'viridis',
        className: 'w-56 max-h-40',
    },
};

export const FilteredColormaps: Story = {
    render: RenderWithState,
    parameters: {
        docs: {
            description: {
                story: `
Pass a filtered slice of \`COLORMAPS\` to show only the options relevant to your use case:

\`\`\`tsx
import { ColormapPicker, COLORMAPS } from '@blueskyproject/finch';

<ColormapPicker
  colormaps={COLORMAPS.filter(c => ['viridis', 'magma', 'gray'].includes(c.id))}
  value={cmap}
  onChange={setCmap}
/>
\`\`\`
                `,
            },
        },
    },
    args: {
        value: 'viridis',
        className: 'w-56',
        colormaps: COLORMAPS.filter((c) => ['viridis', 'magma', 'gray'].includes(c.id)),
    },
};

export const PlotlyColormaps: Story = {
    render: RenderWithState,
    parameters: {
        docs: {
            description: {
                story: "Colorscales matched to Plotly's built-in names. The selected `id` can be passed directly to Plotly's `colorscale` prop without any mapping.",
            },
        },
    },
    args: {
        value: 'Viridis',
        className: 'w-56',
        colormaps: COLORMAPSPLOTLY,
    },
};

export const LongLabels: Story = {
    render: RenderWithState,
    parameters: {
        docs: {
            description: {
                story: 'Labels that exceed the fixed `w-14` span are clipped with a trailing ellipsis (`truncate`). The gradient swatch is never obscured.',
            },
        },
    },
    args: {
        value: 'short',
        className: 'w-56',
        colormaps: [
            { id: 'short', label: 'Short', stops: '#440154,#fde725' },
            { id: 'medium', label: 'Medium Length', stops: '#0d0887,#f0f921' },
            { id: 'very-long', label: 'A Very Long Colormap Name', stops: '#000004,#fde0dd' },
        ],
    },
};

export const CustomColormaps: Story = {
    render: RenderWithState,
    parameters: {
        docs: {
            description: {
                story: `
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
                `,
            },
        },
    },
    args: {
        value: 'red-blue',
        className: 'w-56',
        colormaps: [
            { id: 'red-blue', label: 'Red-Blue', stops: '#d73027,#f46d43,#74add1,#4575b4' },
            { id: 'bw', label: 'B+W', stops: '#000000,#ffffff' },
        ],
    },
};
