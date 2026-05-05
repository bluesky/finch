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

function renderWithState(args: ColormapPickerProps) {
    const [value, setValue] = useState(args.value);
    return <ColormapPicker {...args} value={value} onChange={setValue} />;
}

export const Default: Story = {
    render: renderWithState,
    args: {
        value: 'viridis',
        className: 'w-56',
    },
};

export const GraySelected: Story = {
    render: renderWithState,
    args: {
        value: 'gray',
        className: 'w-56',
    },
};

export const Scrollable: Story = {
    render: renderWithState,
    args: {
        value: 'viridis',
        className: 'w-56 max-h-40',
    },
};

export const FilteredColormaps: Story = {
    render: renderWithState,
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
        colormaps: COLORMAPS.filter(c => ['viridis', 'magma', 'gray'].includes(c.id)),
    },
};

export const PlotlyColormaps: Story = {
    render: renderWithState,
    parameters: {
        docs: {
            description: {
                story: 'Colorscales matched to Plotly\'s built-in names. The selected `id` can be passed directly to Plotly\'s `colorscale` prop without any mapping.',
            },
        },
    },
    args: {
        value: 'Viridis',
        className: 'w-56',
        colormaps: COLORMAPSPLOTLY,
    },
};

export const CustomColormaps: Story = {
    render: renderWithState,
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
            { id: 'bw',       label: 'B+W',      stops: '#000000,#ffffff' },
        ],
    },
};
