import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import MaskOverlayCanvas from '../components/MaskOverlayCanvas/MaskOverlayCanvas';
import type { MaskOverlayCanvasProps } from '../components/MaskOverlayCanvas/MaskOverlayCanvas';
import type { MaskPickInfo } from '../components/MaskOverlayCanvas/types';
import { CLASS_PALETTE_COLORBLIND } from '../utils/colorUtils';

const meta = {
    title: 'General Components/MaskOverlayCanvas',
    component: MaskOverlayCanvas,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: `
An image with one or more segmentation masks drawn over it.

The base image and the mask are rasterized onto separate stacked canvases that share
a single view transform, so they stay registered under zoom and pan. Masks are given
as a label array (one integer per pixel, \`0\` for background) or as per-class binary
masks — the forms segmentation backends already persist. A pre-rendered RGBA mask
image is accepted too, for pipelines that color-map server-side.

Global opacity is applied once when the mask layer is composited rather than baked
into each pixel, so overlapping regions of one class read as a uniform wash instead of
darkening where they meet.

This is a display component: no editing tools, no network requests.

> The default \`size="full"\` fills its parent, so give the parent a real height.
                `,
            },
        },
    },
} satisfies Meta<typeof MaskOverlayCanvas>;

export default meta;
type Story = StoryObj<typeof meta>;

const WIDTH = 48;
const HEIGHT = 48;
// The sample features below are laid out on a 160 × 160 design grid; each pixel is
// mapped onto it so the picture stays the same at any WIDTH/HEIGHT. Kept small because
// every array arg gets one row per entry in the Docs controls.
const DESIGN_SIZE = 160;
const toDesign = (x: number, y: number): [number, number] => [
    ((x + 0.5) * DESIGN_SIZE) / WIDTH,
    ((y + 0.5) * DESIGN_SIZE) / HEIGHT,
];

/** A smooth synthetic frame with a couple of bright features and a noise floor. */
function sampleImage(): number[] {
    const out = new Array(WIDTH * HEIGHT);
    for (let y = 0; y < HEIGHT; y += 1) {
        for (let x = 0; x < WIDTH; x += 1) {
            const [u, v] = toDesign(x, y);
            const ring = Math.hypot(u - DESIGN_SIZE / 2, v - DESIGN_SIZE / 2);
            const value =
                400 * Math.exp(-((ring - 44) ** 2) / 220) +
                700 * Math.exp(-((u - 50) ** 2 + (v - 54) ** 2) / 500) +
                120 * Math.exp(-((u - 112) ** 2 + (v - 104) ** 2) / 900) +
                18 +
                Math.random() * 12;
            out[y * WIDTH + x] = value;
        }
    }
    return out;
}

/** Three overlapping blobs plus a band, as a label array. */
function sampleLabels(): number[] {
    const out = new Array(WIDTH * HEIGHT).fill(0);
    for (let y = 0; y < HEIGHT; y += 1) {
        for (let x = 0; x < WIDTH; x += 1) {
            const i = y * WIDTH + x;
            const [u, v] = toDesign(x, y);
            if (Math.hypot(u - 50, v - 54) < 26) out[i] = 1;
            else if (Math.hypot(u - 112, v - 104) < 22) out[i] = 2;
            else if (v > 132 && v < 150) out[i] = 3;
        }
    }
    return out;
}

/** A single-class boolean mask, the shape a calibration detector mask takes. */
function sampleSingleClassLabels(): number[] {
    const out = new Array(WIDTH * HEIGHT).fill(0);
    for (let y = 0; y < HEIGHT; y += 1) {
        for (let x = 0; x < WIDTH; x += 1) {
            // A detector gap plus a beamstop shadow.
            const [u, v] = toDesign(x, y);
            if ((u > 76 && u < 84) || Math.hypot(u - DESIGN_SIZE / 2, v - DESIGN_SIZE / 2) < 14) {
                out[y * WIDTH + x] = 1;
            }
        }
    }
    return out;
}

const IMAGE = sampleImage();
const LABELS = sampleLabels();
const SINGLE_CLASS = sampleSingleClassLabels();
const SHAPE: [number, number] = [HEIGHT, WIDTH];

const NAMED_CLASSES = [
    { id: 1, label: 'Class 1' },
    { id: 2, label: 'Class 2' },
    { id: 3, label: 'Class 3' },
];

function Frame({ children }: { children: React.ReactNode }) {
    return <div className="h-80 w-[28rem]">{children}</div>;
}

export const Default: Story = {
    render: (args: MaskOverlayCanvasProps) => (
        <Frame>
            <MaskOverlayCanvas {...args} />
        </Frame>
    ),
    args: {
        image: IMAGE,
        imageShape: SHAPE,
        imageColormap: 'viridis',
        labels: LABELS,
        labelsShape: SHAPE,
    },
};

export const MultiClass: Story = {
    render: (args: MaskOverlayCanvasProps) => (
        <Frame>
            <MaskOverlayCanvas {...args} />
        </Frame>
    ),
    parameters: {
        docs: {
            description: {
                story: `
Named classes with explicit colors. Toggle any class off in the legend — a hidden
class is excluded from the raster, so it costs nothing to leave off.

\`\`\`tsx
<MaskOverlayCanvas
  image={frame}
  imageShape={[height, width]}
  labels={labelArray}
  labelsShape={[height, width]}
  classes={[
    { id: 1, label: 'Class 1', color: '#1f77b4' },
    { id: 2, label: 'Class 2', color: '#ff7f0e' },
  ]}
/>
\`\`\`
                `,
            },
        },
    },
    args: {
        image: IMAGE,
        imageShape: SHAPE,
        imageColormap: 'gray',
        labels: LABELS,
        labelsShape: SHAPE,
        classes: NAMED_CLASSES,
        maskOpacity: 0.55,
    },
};

export const SingleClassOverlay: Story = {
    render: (args: MaskOverlayCanvasProps) => (
        <Frame>
            <MaskOverlayCanvas {...args} />
        </Frame>
    ),
    parameters: {
        docs: {
            description: {
                story: `
The single-class case: a boolean detector mask in one flat color. This is how a
calibration-style mask (detector gaps, beamstop shadow) maps onto the component.

\`\`\`tsx
<MaskOverlayCanvas
  image={frame}
  imageShape={shape}
  labels={booleanMask}
  labelsShape={shape}
  classes={[{ id: 1, label: 'Masked', color: '#ff00ff' }]}
  maskOpacity={0.5}
  showLegend={false}
/>
\`\`\`
                `,
            },
        },
    },
    args: {
        image: IMAGE,
        imageShape: SHAPE,
        imageColormap: 'viridis',
        labels: SINGLE_CLASS,
        labelsShape: SHAPE,
        classes: [{ id: 1, label: 'Masked', color: '#ff00ff' }],
        maskOpacity: 0.6,
    },
};

export const BinaryMaskLayers: Story = {
    render: (args: MaskOverlayCanvasProps) => (
        <Frame>
            <MaskOverlayCanvas {...args} />
        </Frame>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Per-class binary masks instead of a combined label array. Later layers draw on top where they overlap.',
            },
        },
    },
    args: {
        image: IMAGE,
        imageShape: SHAPE,
        labelsShape: SHAPE,
        maskLayers: [
            { classId: 1, data: LABELS.map((v) => (v === 1 ? 1 : 0)) },
            { classId: 2, data: LABELS.map((v) => (v === 2 ? 1 : 0)) },
        ],
        classes: [
            { id: 1, label: 'Class 1', color: '#2ca02c' },
            { id: 2, label: 'Class 2', color: '#d62728' },
        ],
    },
};

export const LogScaledImage: Story = {
    render: (args: MaskOverlayCanvasProps) => (
        <Frame>
            <MaskOverlayCanvas {...args} />
        </Frame>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Set `imageLogScale` for high-dynamic-range frames where a linear ramp collapses everything but the brightest feature.',
            },
        },
    },
    args: {
        image: IMAGE,
        imageShape: SHAPE,
        imageColormap: 'magma',
        imageLogScale: true,
        labels: LABELS,
        labelsShape: SHAPE,
        classes: NAMED_CLASSES,
    },
};

export const WithoutLegend: Story = {
    render: (args: MaskOverlayCanvasProps) => (
        <Frame>
            <MaskOverlayCanvas {...args} />
        </Frame>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Drop the legend when the classes are named elsewhere, or when the overlay is a thumbnail. `MaskOverlayCanvasLegend` is exported separately if you want it in a sidebar.',
            },
        },
    },
    args: {
        image: IMAGE,
        imageShape: SHAPE,
        imageColormap: 'viridis',
        labels: LABELS,
        labelsShape: SHAPE,
        showLegend: false,
    },
};

export const LegendBelow: Story = {
    render: (args: MaskOverlayCanvasProps) => (
        <Frame>
            <MaskOverlayCanvas {...args} />
        </Frame>
    ),
    args: {
        image: IMAGE,
        imageShape: SHAPE,
        labels: LABELS,
        labelsShape: SHAPE,
        classes: NAMED_CLASSES,
        legendPosition: 'bottom',
    },
};

export const Zoomable: Story = {
    render: (args: MaskOverlayCanvasProps) => (
        <Frame>
            <MaskOverlayCanvas {...args} />
        </Frame>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Scroll to zoom (anchored on the pointer) and drag to pan. Nearest-neighbour sampling keeps class boundaries hard at any magnification.',
            },
        },
    },
    args: {
        image: IMAGE,
        imageShape: SHAPE,
        imageColormap: 'viridis',
        labels: LABELS,
        labelsShape: SHAPE,
        classes: NAMED_CLASSES,
        zoomable: true,
    },
};

export const ColorblindPalette: Story = {
    render: (args: MaskOverlayCanvasProps) => (
        <Frame>
            <MaskOverlayCanvas {...args} />
        </Frame>
    ),
    parameters: {
        docs: {
            description: {
                story: `
Colors come from \`CLASS_PALETTE\` (matplotlib tab20) by default. Pass explicit colors
to use another palette — \`CLASS_PALETTE_COLORBLIND\` is exported for this.

\`\`\`tsx
import { CLASS_PALETTE_COLORBLIND } from '@blueskyproject/finch';

const classes = names.map((label, i) => ({
  id: i + 1,
  label,
  color: CLASS_PALETTE_COLORBLIND[i % CLASS_PALETTE_COLORBLIND.length],
}));
\`\`\`
                `,
            },
        },
    },
    args: {
        image: IMAGE,
        imageShape: SHAPE,
        labels: LABELS,
        labelsShape: SHAPE,
        classes: NAMED_CLASSES.map((c, i) => ({
            ...c,
            color: CLASS_PALETTE_COLORBLIND[i % CLASS_PALETTE_COLORBLIND.length],
        })),
    },
};

export const PerClassOpacity: Story = {
    render: (args: MaskOverlayCanvasProps) => (
        <Frame>
            <MaskOverlayCanvas {...args} />
        </Frame>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Each class can carry its own opacity multiplier, applied on top of the global `maskOpacity` — useful for pushing a context class into the background.',
            },
        },
    },
    args: {
        image: IMAGE,
        imageShape: SHAPE,
        labels: LABELS,
        labelsShape: SHAPE,
        maskOpacity: 0.8,
        classes: [
            { id: 1, label: 'Class 1', color: '#1f77b4', opacity: 1 },
            { id: 2, label: 'Class 2', color: '#ff7f0e', opacity: 0.6 },
            { id: 3, label: 'Class 3', color: '#2ca02c', opacity: 0.25 },
        ],
    },
};

export const HoverReadout: Story = {
    parameters: {
        docs: {
            description: {
                story: `
\`onHover\` reports the pixel coordinate and the class beneath the pointer, picked
directly from the source array rather than by reading back canvas pixels — so it is
exact at any zoom and never trips over a cross-origin base image.

\`\`\`tsx
<MaskOverlayCanvas
  labels={labelArray}
  labelsShape={shape}
  onHover={(info) => setStatus(info)}
/>
\`\`\`
                `,
            },
        },
    },
    render: (args: MaskOverlayCanvasProps) => {
        const [info, setInfo] = useState<MaskPickInfo | null>(null);
        return (
            <div className="flex w-[28rem] flex-col gap-2">
                <div className="h-80">
                    <MaskOverlayCanvas {...args} onHover={setInfo} showTooltip={false} />
                </div>
                <p className="text-xs font-light text-slate-600">
                    {info
                        ? `(${info.x}, ${info.y}) — ${info.label ?? 'background'}`
                        : 'Move the pointer over the image'}
                </p>
            </div>
        );
    },
    args: {
        image: IMAGE,
        imageShape: SHAPE,
        imageColormap: 'viridis',
        labels: LABELS,
        labelsShape: SHAPE,
        classes: NAMED_CLASSES,
    },
};

export const ControlledVisibility: Story = {
    parameters: {
        docs: {
            description: {
                story: `
Setting \`visible\` on any class makes visibility a controlled prop: the component
stops tracking it internally and only reports toggles through
\`onClassVisibilityChange\`. Leave \`visible\` unset on every class to let the component
manage it.
                `,
            },
        },
    },
    render: (args: MaskOverlayCanvasProps) => {
        const [hidden, setHidden] = useState<number[]>([2]);
        return (
            <Frame>
                <MaskOverlayCanvas
                    {...args}
                    classes={NAMED_CLASSES.map((c) => ({
                        ...c,
                        visible: !hidden.includes(c.id),
                    }))}
                    onClassVisibilityChange={(classId, visible) =>
                        setHidden((prev) =>
                            visible ? prev.filter((id) => id !== classId) : [...prev, classId],
                        )
                    }
                />
            </Frame>
        );
    },
    args: {
        image: IMAGE,
        imageShape: SHAPE,
        labels: LABELS,
        labelsShape: SHAPE,
    },
};
