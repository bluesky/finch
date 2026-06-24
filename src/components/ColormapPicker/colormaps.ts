export type ColormapDef = {
    id: string;
    label: string;
    stops: string;
};

/** Colorscale names and stops matched to Plotly's built-in colorscales.
 *  The `id` of each entry is the exact string to pass as Plotly's `colorscale` prop. */
export const COLORMAPSPLOTLY: ColormapDef[] = [
    /*visually uniform*/
    { id: 'Viridis', label: 'Viridis', stops: '#440154,#3b528b,#21918c,#5ec962,#fde725' },
    { id: 'Greys', label: 'Greys', stops: '#000000,#ffffff' },
    { id: 'Magma', label: 'Magma', stops: '#000004,#3b0f70,#8c2981,#de4968,#fde0dd' },
    { id: 'Plasma', label: 'Plasma', stops: '#0d0887,#7e03a8,#cc4778,#f89540,#f0f921' },
    { id: 'Cividis', label: 'Cividis', stops: '#00224e,#2c4470,#566b8b,#9c9678,#fde737' },
    { id: 'Inferno', label: 'Inferno', stops: '#000004,#420a68,#932667,#dd513a,#fca50a,#f8df25' },
    { id: 'Hot', label: 'Hot', stops: '#000000,#900000,#ff5500,#ffff00,#ffffff' },
    /*diverging*/
    { id: 'RdBu', label: 'RdBu', stops: '#b2182b,#ef8a62,#fddbc7,#f7f7f7,#d1e5f0,#67a9cf,#2166ac' },
    /*legacy/other*/
    { id: 'Jet', label: 'Jet', stops: '#000080,#0000ff,#00ffff,#00ff00,#ffff00,#ff0000,#800000' },
    {
        id: 'Turbo',
        label: 'Turbo',
        stops: '#23171b,#4076f6,#27d7c4,#94fb9a,#f6d63b,#f54623,#900c00',
    },
];

export const COLORMAPS: ColormapDef[] = [
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
];
