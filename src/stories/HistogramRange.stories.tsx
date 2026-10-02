import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import DocsPageWithoutPrimaryCopy from './DocsPageWithoutPrimaryCopy';

import HistogramRange from '../components/HistogramRange';
import type { HistogramRangeProps } from '../components/HistogramRange';

const meta = {
    title: 'General Components/HistogramRange',
    component: HistogramRange,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            // Controls drive the story at the top; see the helper for why the
            // Stories list does not repeat it.
            page: DocsPageWithoutPrimaryCopy,
            description: {
                component: `
An interactive histogram with a draggable range selection.

Either handle can be dragged, or the band between them can be dragged to pan the
window while keeping its width. Handles are keyboard accessible: arrow keys nudge
by one bin, Shift+arrow by ten, and Home/End jump to the limits.

Accepts pre-binned \`counts\` with \`binEdges\` (or \`binCenters\`, from which edges
are derived), or raw \`values\`, binned internally. It is agnostic to the data type and
to where the histogram was computed.

**Thresholds sit on bin edges.** Bin \`i\` spans \`binEdges[i]\` to \`binEdges[i + 1]\`.
The lower handle is the left edge of the first included bin and the upper handle is
the right edge of the last included bin, so the full selection spans the whole data
domain. With edges \`[0, 1, 2, 3, 4]\`, selecting bins 1 and 2 reports \`[1, 3]\`.

The selection is reported in data units. The second \`onChange\` argument gives the
percentage of the population lying below each edge, so a companion percentile control
can stay in sync without a round-trip.

> The default \`size\` is \`"medium"\`. The stories below pass \`size="full"\` to fill a
> sized container; \`"full"\` needs a parent with a real height.
                `,
            },
        },
    },
    // Every story below draws into a sized container, so they fill it.
    args: { size: 'full' },
} satisfies Meta<typeof HistogramRange>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A bimodal intensity distribution used as sample data. */
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
/** Evenly spaced edges over 0–1000: one more entry than there are bins. */
const BIN_EDGES = Array.from({ length: COUNTS.length + 1 }, (_, i) => (i / COUNTS.length) * 1000);
const VALUES = sampleValues();

function RenderWithState(args: HistogramRangeProps) {
    const [value, setValue] = useState<[number, number] | null>(
        args.value ?? args.defaultValue ?? null,
    );
    return (
        <Frame size={args.size} vertical={args.orientation === 'vertical'}>
            <HistogramRange {...args} value={value} onChange={(range) => setValue(range)} />
        </Frame>
    );
}

function RenderWithPercentileReadout(args: HistogramRangeProps) {
    const [range, setRange] = useState<[number, number]>([200, 700]);
    const [percentiles, setPercentiles] = useState<[number, number]>([0, 100]);
    return (
        <div className="flex w-fit flex-col gap-2">
            <Frame size={args.size}>
                <HistogramRange
                    {...args}
                    value={range}
                    onChange={(next, nextPercentiles) => {
                        setRange(next);
                        setPercentiles(nextPercentiles);
                    }}
                />
            </Frame>
            <p className="text-xs font-light text-slate-600">
                {`Range ${range[0].toFixed(1)} – ${range[1].toFixed(1)}`}
                {`  ·  Percentile ${percentiles[0].toFixed(1)}% – ${percentiles[1].toFixed(1)}%`}
            </p>
        </div>
    );
}

/**
 * A fixed box for `size="full"`, which fills its parent and needs a real height.
 * Fixed sizes set their own dimensions, so they render unwrapped; wrapping them
 * would clip the larger sizes and make the Docs preview scroll.
 */
function Frame({
    size,
    vertical = false,
    children,
}: {
    size: HistogramRangeProps['size'];
    vertical?: boolean;
    children: React.ReactNode;
}) {
    if (size !== 'full') return <>{children}</>;
    return <div className={vertical ? 'h-80 w-24' : 'h-32 w-[32rem]'}>{children}</div>;
}

export const Default: Story = {
    render: RenderWithState,
    args: {
        counts: COUNTS,
        binEdges: BIN_EDGES,
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
        binEdges: BIN_EDGES,
        orientation: 'vertical',
        defaultValue: [150, 800],
    },
};

export const ReadOnly: Story = {
    render: RenderWithState,
    parameters: {
        docs: {
            description: {
                story: 'With `readOnly` the handles are hidden and the component is a distribution plot. The selection highlight and fading still apply, so it can display a range chosen elsewhere.',
            },
        },
    },
    args: {
        counts: COUNTS,
        binEdges: BIN_EDGES,
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
        binEdges: BIN_EDGES,
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
        binEdges: BIN_EDGES,
        fadeOutsideSelection: false,
        defaultValue: [300, 600],
    },
};

export const WithPercentileReadout: Story = {
    parameters: {
        docs: {
            description: {
                story: `
\`onChange\` supplies, alongside the data-unit range, the percentage of the population
lying below each threshold, computed from the cumulative counts. Use it to keep a
percentile control in sync without a server round-trip.
Use \`edgeAtPercentile\` for the reverse direction when the percentile is the stored
state.

\`\`\`tsx
<HistogramRange
  counts={counts}
  binEdges={binEdges}
  onChange={([min, max], [pBelowMin, pBelowMax]) => {
    setRange([min, max]);
    setPercentiles([pBelowMin, pBelowMax]);
  }}
/>
\`\`\`
                `,
            },
        },
    },
    render: RenderWithPercentileReadout,
    args: {
        counts: COUNTS,
        binEdges: BIN_EDGES,
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
        binEdges: BIN_EDGES,
        minBinSeparation: 20,
        defaultValue: [300, 600],
        title: 'At least 20 bins',
    },
};

export const Sizes: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Fixed sizes for laying out next to other controls. The default is `medium`; `full` fills its parent. Bars stay solid at any bin count and width.',
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
        binEdges: BIN_EDGES,
        defaultValue: [200, 700],
    },
};
