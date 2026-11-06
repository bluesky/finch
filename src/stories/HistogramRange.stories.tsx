import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import DocsPageWithoutPrimaryCopy from './DocsPageWithoutPrimaryCopy';

import HistogramRange from '../components/HistogramRange/HistogramRange';
import type { HistogramRangeProps } from '../components/HistogramRange/HistogramRange';
import {
    computeHistogram,
    cumulativeCounts,
    edgeAtPercentile,
    percentileBelowEdge,
} from '../utils/histogramUtils';

// ---------------------------------------------------------------------------
// Deterministic sample data
// ---------------------------------------------------------------------------

/** 128 even bins over 0–1000: two populations plus a sparse bright tail. */
const BINS = 128;
const EDGES = Array.from({ length: BINS + 1 }, (_, i) => (i * 1000) / BINS);
const COUNTS = Array.from({ length: BINS }, (_, i) => {
    const c = (EDGES[i] + EDGES[i + 1]) / 2;
    return Math.round(
        6000 * Math.exp(-0.5 * ((c - 280) / 55) ** 2) +
            1800 * Math.exp(-0.5 * ((c - 640) / 80) ** 2) +
            40 * Math.exp(-c / 400) +
            (c > 880 ? 3 : 0),
    );
});

/** Seeded PRNG, so the log-scale story looks the same on every load. */
function mulberry32(seed: number) {
    let s = seed;
    return () => {
        s = (s + 0x6d2b79f5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
const rand = mulberry32(7);
const gauss = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());

/**
 * A detector-like frame: a background around 120 counts, 2% bright pixels with a long tail up to
 * about 1.3e4, and 1% pixels with value 0. Binned linearly; the data is not log-transformed, so
 * on a log value axis the first bin (lower edge 0) is not drawn.
 */
const FRAME = Float64Array.from({ length: 60000 }, (_, i) =>
    i % 100 === 1
        ? 0
        : i % 50 === 0
          ? 300 - 1500 * Math.log(1 - rand())
          : Math.max(1, 120 + 25 * gauss()),
);
const FRAME_HIST = computeHistogram(FRAME, { bins: 512 });

/** The 1st and 99th percentiles of the sample histogram, as an application would mark them. */
const REFERENCE: [number, number] = (() => {
    const { cumulative, total } = cumulativeCounts(COUNTS);
    return [
        edgeAtPercentile(1, EDGES, cumulative, total),
        edgeAtPercentile(99, EDGES, cumulative, total),
    ];
})();
/** The first edge at or above 500 counts, so the bright pixels start selected at any bin count. */
const BRIGHT_FROM = FRAME_HIST.binEdges.find((e) => e >= 500) ?? FRAME_HIST.binEdges[0];

function percentilesAt(counts: number[], edges: number[], range: [number, number] | null) {
    if (!range) return null;
    const { cumulative, total } = cumulativeCounts(counts);
    const idx = range.map((v) => edges.indexOf(v));
    if (idx.some((i) => i < 0)) return null;
    return idx.map((i) => percentileBelowEdge(i, cumulative, total)) as [number, number];
}

const fmt = (v: number) =>
    Math.abs(v) >= 1e4 ? v.toExponential(2) : String(Number(v.toPrecision(4)));

// ---------------------------------------------------------------------------
// Controlled wrapper with a readout
// ---------------------------------------------------------------------------

type DemoProps = Omit<HistogramRangeProps, 'value'> & {
    initial: [number, number] | null;
    frame: string;
};

/**
 * The selected edges and the population below each. Fixed width, one line: the stories are
 * centred, so a readout that grew and shrank with its numbers would slide the histogram sideways.
 */
function Readout({
    value,
    percentiles,
}: {
    value: [number, number] | null;
    percentiles: [number, number] | null;
}) {
    return (
        <p className="w-[30rem] whitespace-nowrap text-xs tabular-nums text-slate-600">
            {value ? (
                <>
                    Range <span className="font-medium text-slate-800">{fmt(value[0])}</span> –{' '}
                    <span className="font-medium text-slate-800">{fmt(value[1])}</span>
                </>
            ) : (
                'Whole domain'
            )}
            {percentiles && (
                <>
                    {' '}
                    · {percentiles[0].toFixed(1)}% below the lower edge, {percentiles[1].toFixed(1)}
                    % below the upper
                </>
            )}
        </p>
    );
}

function Demo({ initial, frame, onChange, ...props }: DemoProps) {
    const [value, setValue] = useState(initial);
    const [percentiles, setPercentiles] = useState(() =>
        percentilesAt(props.counts, props.binEdges, initial),
    );
    return (
        <div className="flex flex-col gap-2">
            <div className={frame}>
                <HistogramRange
                    {...props}
                    value={value}
                    onChange={(range, pct) => {
                        setValue(range);
                        setPercentiles(pct);
                        onChange(range, pct);
                    }}
                />
            </div>
            <Readout value={value} percentiles={percentiles} />
        </div>
    );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
    title: 'General Components/HistogramRange',
    component: HistogramRange,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            page: DocsPageWithoutPrimaryCopy,
            description: {
                component: `
A histogram with an interactive range for selecting thresholds or display limits on scientific data.

Provide binned \`counts\` and \`binEdges\`, or use \`computeHistogram\` to bin raw data. Thresholds snap 
to bin edges and are reported in the original data units, along with cumulative percentages.

Drag a handle to adjust one limit, or drag the selected range to move both. Use arrow keys to move a 
focused handle by one bin, or hold Shift for ten-bin steps. Home/End move to the bounds.
Display scales affect visualization only, not the underlying data.

`,
            },
        },
    },
    argTypes: {
        // Data and callbacks are documented in the table but come from each story, not Controls.
        counts: { control: false },
        binEdges: { control: false },
        value: { control: false },
        onChange: { control: false },
        onChangeCommitted: { control: false },
        referenceRange: { control: false },
        valueScale: { control: 'inline-radio', options: ['linear', 'log'] },
        countScale: { control: 'inline-radio', options: ['linear', 'log'] },
        orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
        size: { control: 'select', options: ['small', 'medium', 'large', 'full'] },
        color: { control: 'color' },
        referenceColor: { control: 'color' },
    },
    args: {
        counts: [],
        binEdges: [],
        value: null,
        onChange: fn(),
        onChangeCommitted: fn(),
        size: 'medium',
        orientation: 'horizontal',
        // Both axes start linear; switch either to log in Controls.
        valueScale: 'linear',
        countScale: 'linear',
    },
} satisfies Meta<typeof HistogramRange>;

export default meta;
type Story = StoryObj<typeof meta>;

const HORIZONTAL_FRAME = 'h-52 w-[36rem]';

/** Select a range of bins; the readout shows the reported edges and the population below each. */
export const Threshold: Story = {
    args: { title: 'Intensity histogram', valueAxisTitle: 'Intensity' },
    render: (args) => (
        <Demo
            {...args}
            counts={COUNTS}
            binEdges={EDGES}
            initial={[EDGES[30], EDGES[90]]}
            frame={args.size === 'full' ? HORIZONTAL_FRAME : ''}
        />
    ),
};

export const ReferenceRange: Story = {
    args: {
        title: 'Reference range (1st–99th percentile)',
        valueAxisTitle: 'Intensity',
        referenceRange: REFERENCE,
    },
    render: (args) => (
        <Demo
            {...args}
            counts={COUNTS}
            binEdges={EDGES}
            initial={[EDGES[110], EDGES[128]]}
            frame={args.size === 'full' ? HORIZONTAL_FRAME : ''}
        />
    ),
};

export const Vertical: Story = {
    args: { title: 'Vertical histogram', valueAxisTitle: 'Intensity', orientation: 'vertical' },
    render: (args) => (
        <Demo
            {...args}
            counts={COUNTS}
            binEdges={EDGES}
            initial={[EDGES[16], EDGES[104]]}
            frame={args.size === 'full' ? 'h-[26rem] w-56' : ''}
        />
    ),
};

export const CustomColor: Story = {
    args: {
        title: 'Green histogram with magenta reference',
        valueAxisTitle: 'Intensity',
        color: '#16a34a',
        referenceRange: REFERENCE,
        referenceColor: '#dc267f',
    },
    render: (args) => (
        <Demo
            {...args}
            counts={COUNTS}
            binEdges={EDGES}
            initial={[EDGES[30], EDGES[90]]}
            frame={args.size === 'full' ? HORIZONTAL_FRAME : ''}
        />
    ),
};

/** The four scale combinations compared side by side. */
const LOG_SCALE_PANELS = [
    { title: 'Linear value, linear count', valueScale: 'linear', countScale: 'linear' },
    { title: 'Log value, linear count', valueScale: 'log', countScale: 'linear' },
    { title: 'Linear value, log count', valueScale: 'linear', countScale: 'log' },
    { title: 'Log value, log count', valueScale: 'log', countScale: 'log' },
] as const;

/** The same histogram on each scale combination, sharing one selection and one readout. */
function LogScaleDemo({ initial, frame, onChange, ...props }: DemoProps) {
    const [value, setValue] = useState(initial);
    const [percentiles, setPercentiles] = useState(() =>
        percentilesAt(props.counts, props.binEdges, initial),
    );
    return (
        <div className="flex flex-col gap-2">
            <div className="grid grid-cols-1 gap-4 justify-items-center md:grid-cols-2">
                {LOG_SCALE_PANELS.map((panel) => (
                    <div key={panel.title} className={frame}>
                        <HistogramRange
                            {...props}
                            {...panel}
                            value={value}
                            onChange={(range, pct) => {
                                setValue(range);
                                setPercentiles(pct);
                                onChange(range, pct);
                            }}
                        />
                    </div>
                ))}
            </div>
            <Readout value={value} percentiles={percentiles} />
        </div>
    );
}

export const LogScale: Story = {
    parameters: {
        docs: {
            description: {
                story: `Compares the same histogram across four combinations of linear and logarithmic scales.
\`valueScale\` controls the value axis and \`countScale\` controls bar heights. All four panels
share the same selection and thresholds, since only the display changes.

A log value axis cannot place a bin whose lower edge is 0 or below, so those bins are not drawn
and an ≤0 marker says how many there are. They still count in the percentiles.`,
            },
        },
    },
    // Four panels in a grid, each filling a compact frame.
    args: { valueAxisTitle: 'Intensity (counts)', size: 'full' },
    // Each panel fixes its own scales, so they are left out of the Controls panel.
    argTypes: {
        valueScale: { table: { disable: true } },
        countScale: { table: { disable: true } },
        title: { table: { disable: true } },
    },
    render: (args) => (
        <LogScaleDemo
            {...args}
            counts={FRAME_HIST.counts}
            binEdges={FRAME_HIST.binEdges}
            initial={[BRIGHT_FROM, FRAME_HIST.binEdges[FRAME_HIST.binEdges.length - 1]]}
            frame={args.size === 'full' ? 'h-52 w-72' : ''}
        />
    ),
};
