import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import HistogramRange from '../components/HistogramRange';
import type { HistogramRangeProps } from '../components/HistogramRange';

const meta = {
    title: 'General Components/HistogramRange',
    component: HistogramRange,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: `
An interactive histogram with a draggable range selection.

Either handle can be dragged, or the band between them can be dragged to pan the
window while keeping its width. Handles are keyboard accessible: arrow keys nudge
by one bin, Shift+arrow by ten, and Home/End jump to the limits.

Accepts pre-binned \`counts\` or raw \`values\` (binned internally). The selection is
reported in data units, with percentiles of the distribution supplied as a second
argument so a companion percentile control can stay in sync without a round-trip.

> The default \`size="full"\` fills its parent, so give the parent a real height —
> every story below is wrapped in a sized container.
                `,
            },
        },
    },
} satisfies Meta<typeof HistogramRange>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A bimodal intensity distribution, the shape a detector frame usually produces. */
function sampleCounts(bins = 128): number[] {
    const gaussian = (x: number, mu: number, sigma: number) =>
        Math.exp(-((x - mu) ** 2) / (2 * sigma ** 2));
    return Array.from({ length: bins }, (_, i) => {
        const x = i / (bins - 1);
        return Math.round(4000 * gaussian(x, 0.22, 0.06) + 1200 * gaussian(x, 0.62, 0.11) + 12);
    });
}

/** Raw samples drawn from the same two peaks, for the values-in story. */
function sampleValues(count = 20000): number[] {
    const out: number[] = [];
    for (let i = 0; i < count; i += 1) {
        // Box-Muller, mapped onto a 0-1000 intensity range.
        const u = Math.max(Number.EPSILON, Math.random());
        const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
        const peak = i % 3 === 0 ? 620 : 220;
        const spread = i % 3 === 0 ? 110 : 60;
        out.push(Math.max(0, Math.min(1000, peak + z * spread)));
    }
    return out;
}

const COUNTS = sampleCounts();
const BIN_CENTERS = COUNTS.map((_, i) => (i / (COUNTS.length - 1)) * 1000);
const VALUES = sampleValues();

function RenderWithState(args: HistogramRangeProps) {
    const [value, setValue] = useState<[number, number] | null>(
        args.value ?? args.defaultValue ?? null,
    );
    const vertical = args.orientation === 'vertical';
    return (
        <div className={vertical ? 'h-80 w-24' : 'h-32 w-[32rem]'}>
            <HistogramRange {...args} value={value} onChange={(range) => setValue(range)} />
        </div>
    );
}

export const Default: Story = {
    render: RenderWithState,
    args: {
        counts: COUNTS,
        binCenters: BIN_CENTERS,
        title: 'Intensity',
        defaultValue: [200, 700],
    },
};

export const FromRawValues: Story = {
    render: RenderWithState,
    parameters: {
        docs: {
            description: {
                story: `
Pass raw samples and let the component bin them. Useful when the data is already in
the browser and no server-side histogram endpoint exists.

\`\`\`tsx
<HistogramRange values={pixelValues} bins={128} domain={[0, 1000]} onChange={setRange} />
\`\`\`
                `,
            },
        },
    },
    args: {
        values: VALUES,
        bins: 128,
        domain: [0, 1000],
        title: 'Binned from raw values',
    },
};

export const Vertical: Story = {
    render: RenderWithState,
    parameters: {
        docs: {
            description: {
                story: 'Low values sit at the bottom. This is the orientation used for display-level (clim) controls placed beside an image.',
            },
        },
    },
    args: {
        counts: COUNTS,
        binCenters: BIN_CENTERS,
        orientation: 'vertical',
        defaultValue: [150, 800],
    },
};

export const ReadOnly: Story = {
    render: RenderWithState,
    parameters: {
        docs: {
            description: {
                story: 'Without handles the component is just a distribution plot. The selection highlight and fading still apply, so it can display a range chosen elsewhere.',
            },
        },
    },
    args: {
        counts: COUNTS,
        binCenters: BIN_CENTERS,
        readOnly: true,
        defaultValue: [250, 650],
        title: 'Distribution',
    },
};

export const LinearCounts: Story = {
    render: RenderWithState,
    parameters: {
        docs: {
            description: {
                story: 'The count axis is log-scaled by default, because intensity histograms are strongly peaked and a linear axis hides the tails. Set `logCounts={false}` for a linear axis.',
            },
        },
    },
    args: {
        counts: COUNTS,
        binCenters: BIN_CENTERS,
        logCounts: false,
        title: 'Linear count axis',
    },
};

export const NoFading: Story = {
    render: RenderWithState,
    parameters: {
        docs: {
            description: {
                story: 'With `fadeOutsideSelection={false}` every bin is drawn in the same color and only the highlight marks the selection.',
            },
        },
    },
    args: {
        counts: COUNTS,
        binCenters: BIN_CENTERS,
        fadeOutsideSelection: false,
        defaultValue: [300, 600],
    },
};

export const WithPercentileReadout: Story = {
    parameters: {
        docs: {
            description: {
                story: `
\`onChange\` supplies percentiles alongside the data-unit range, computed from the
cumulative counts. That lets a percentile-based control track the histogram without
asking the server to convert.

\`\`\`tsx
<HistogramRange
  counts={counts}
  binCenters={binCenters}
  onChange={([min, max], [pMin, pMax]) => {
    setRange([min, max]);
    setPercentiles([pMin, pMax]);
  }}
/>
\`\`\`
                `,
            },
        },
    },
    render: (args: HistogramRangeProps) => {
        const [range, setRange] = useState<[number, number]>([200, 700]);
        const [percentiles, setPercentiles] = useState<[number, number]>([0, 100]);
        return (
            <div className="flex w-[32rem] flex-col gap-2">
                <div className="h-32">
                    <HistogramRange
                        {...args}
                        value={range}
                        onChange={(next, nextPercentiles) => {
                            setRange(next);
                            setPercentiles(nextPercentiles);
                        }}
                    />
                </div>
                <p className="text-xs font-light text-slate-600">
                    {`Range ${range[0].toFixed(1)} – ${range[1].toFixed(1)}`}
                    {`  ·  Percentile ${percentiles[0].toFixed(1)}% – ${percentiles[1].toFixed(1)}%`}
                </p>
            </div>
        );
    },
    args: {
        counts: COUNTS,
        binCenters: BIN_CENTERS,
        title: 'Intensity',
    },
};

export const MinimumSeparation: Story = {
    render: RenderWithState,
    parameters: {
        docs: {
            description: {
                story: 'Raise `minBinSeparation` to stop the handles from collapsing onto each other, so the selection always covers a usable number of bins.',
            },
        },
    },
    args: {
        counts: COUNTS,
        binCenters: BIN_CENTERS,
        minBinSeparation: 20,
        defaultValue: [300, 600],
        title: 'At least 20 bins',
    },
};

export const Sizes: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Fixed sizes for laying out next to other controls. The default, `full`, fills whatever box you put it in.',
            },
        },
    },
    render: (args: HistogramRangeProps) => (
        <div className="flex flex-col gap-4">
            {(['small', 'medium', 'large'] as const).map((size) => (
                <HistogramRange key={size} {...args} size={size} title={size} />
            ))}
        </div>
    ),
    args: {
        counts: COUNTS,
        binCenters: BIN_CENTERS,
        defaultValue: [200, 700],
    },
};
