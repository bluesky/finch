import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import DocsPageWithoutPrimaryCopy from './DocsPageWithoutPrimaryCopy';

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
            // Controls drive the story at the top; see the helper for why the
            // Stories list does not repeat it.
            page: DocsPageWithoutPrimaryCopy,
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

This is a display component: no editing tools, and no network requests beyond loading
the image URLs it is given.

**Loading images.** \`imageUrl\` and \`maskImageUrl\` load without CORS by default,
like a plain \`<img>\`. Set \`crossOrigin="anonymous"\` only when you need an untainted
canvas; servers that send no CORS headers, including Tiled URLs carrying an
\`api_key\` query parameter, then fail to load. A failed load calls
\`onError(message, layer)\` and shows a message over the canvas.

**Scaling.** With \`imageSmoothing="auto"\` (the default) the base image is smoothed
when it is drawn smaller than its native size, avoiding moiré on large frames, and kept
crisp when zoomed in. The mask layer is always nearest-neighbour.

**Zoom.** With \`zoomable\`, the wheel zooms without scrolling the page and a drag pans
without firing \`onClick\`. The view resets when the image dimensions change; a new
image of the same size keeps the current viewport.

**Props.** Shapes and \`classes\` are compared by value, so inline literals such as
\`imageShape={[h, w]}\` do not trigger a re-raster on every render.

**Size.** \`"small"\`, \`"medium"\` (the default) and \`"large"\` size the image area to
the image's aspect ratio, with the longer side at 16, 24 or 40 rem. \`"full"\` fills the
parent and letterboxes the image inside it; it needs a parent with a real height. The
stories below use the default, so each box matches its image; pick \`"full"\` in the
controls to see it fill a fixed frame instead.
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

/*
 * The sample scene: a diffraction-style ring with two features overlaid on it — a
 * bright spot on the upper left and a radial streak on the lower right, each
 * crossing the ring. The image is the sum of the three profiles below, and each
 * mask is the same profile thresholded at half its peak, so every mask boundary
 * follows a contour that is visible in the image.
 */
const CENTER = DESIGN_SIZE / 2;
const RING_RADIUS = 44;

/** Unit-peak intensity profiles, in design-grid coordinates. */
const PROFILES = {
    ring: (u: number, v: number) =>
        Math.exp(-((Math.hypot(u - CENTER, v - CENTER) - RING_RADIUS) ** 2) / 220),
    spot: (u: number, v: number) => Math.exp(-((u - 48) ** 2 + (v - 50) ** 2) / 500),
    streak: (u: number, v: number) => {
        // An ellipse centred on the ring, long axis pointing away from the centre.
        const cu = 113;
        const cv = 108;
        const len = Math.hypot(cu - CENTER, cv - CENTER);
        const [ru, rv] = [(cu - CENTER) / len, (cv - CENTER) / len];
        const along = (u - cu) * ru + (v - cv) * rv;
        const across = -(u - cu) * rv + (v - cv) * ru;
        return Math.exp(-(along ** 2 / 900 + across ** 2 / 60));
    },
};

/** Peak brightness of each feature in the rendered image. */
const AMPLITUDE = { ring: 400, spot: 700, streak: 550 };

/** A profile counts as "inside" its mask above half its peak. */
const IN_MASK = 0.5;

/** Calls `fn` with the design-grid coordinates of every pixel, row-major. */
function mapPixels<T>(fn: (u: number, v: number) => T): T[] {
    const out = new Array<T>(WIDTH * HEIGHT);
    for (let y = 0; y < HEIGHT; y += 1) {
        for (let x = 0; x < WIDTH; x += 1) out[y * WIDTH + x] = fn(...toDesign(x, y));
    }
    return out;
}

/** The ring and both overlaid features, on a noise floor. */
function sampleImage(): number[] {
    return mapPixels(
        (u, v) =>
            AMPLITUDE.ring * PROFILES.ring(u, v) +
            AMPLITUDE.spot * PROFILES.spot(u, v) +
            AMPLITUDE.streak * PROFILES.streak(u, v) +
            18 +
            Math.random() * 12,
    );
}

/**
 * The scene as a label array: 1 ring, 2 spot, 3 streak, 0 background. A label
 * array holds one class per pixel, so the overlaid features take precedence over
 * the ring where they cross it.
 */
function sampleLabels(): number[] {
    return mapPixels((u, v) => {
        if (PROFILES.spot(u, v) > IN_MASK) return 2;
        if (PROFILES.streak(u, v) > IN_MASK) return 3;
        if (PROFILES.ring(u, v) > IN_MASK) return 1;
        return 0;
    });
}

/** One feature's own binary mask, which may overlap the others. */
const featureMask = (profile: (u: number, v: number) => number) =>
    mapPixels((u, v) => (profile(u, v) > IN_MASK ? 1 : 0));

/**
 * The sample scene as a background-subtracted detector frame: a vertical gap
 * between detector modules reads exactly 0 and cuts through the ring, and a patch
 * in the upper right is slightly negative where the background was over-subtracted.
 * Both are outside the log domain, so they show the under-range treatment.
 */
function sampleImageWithUnderRange(image: number[]): number[] {
    const under = mapPixels((u, v) => {
        if (u >= 96 && u < 104) return 0;
        if (u > 128 && v < 32) return -(1 + Math.random() * 4);
        return null;
    });
    return image.map((value, i) => under[i] ?? value);
}

const IMAGE = sampleImage();
const IMAGE_WITH_UNDER_RANGE = sampleImageWithUnderRange(IMAGE);
const LABELS = sampleLabels();
/** Just the ring, as a single boolean mask. */
const RING_MASK = featureMask(PROFILES.ring);
const SHAPE: [number, number] = [HEIGHT, WIDTH];

/** Places each row of `data` next to itself, giving a 2:1 landscape version. */
const sideBySide = (data: number[]) =>
    Array.from({ length: HEIGHT }, (_, y) => {
        const row = data.slice(y * WIDTH, (y + 1) * WIDTH);
        return [...row, ...row];
    }).flat();
const WIDE_IMAGE = sideBySide(IMAGE);
const WIDE_LABELS = sideBySide(LABELS);
const WIDE_SHAPE: [number, number] = [HEIGHT, WIDTH * 2];

const NAMED_CLASSES = [
    { id: 1, label: 'Ring' },
    { id: 2, label: 'Spot' },
    { id: 3, label: 'Streak' },
];

/**
 * A fixed box for `size="full"`, which fills its parent and needs a real height.
 * Fixed sizes set their own dimensions, so they render unwrapped; wrapping them
 * would clip a large canvas and make the Docs preview scroll.
 */
function Frame({
    size,
    children,
}: {
    size: MaskOverlayCanvasProps['size'];
    children: React.ReactNode;
}) {
    if (size !== 'full') return <>{children}</>;
    return <div className="h-80 w-[28rem]">{children}</div>;
}

/**
 * A light checkerboard behind the canvas, replacing its dark default background,
 * so transparent pixels are not mistaken for the dark low end of a colormap.
 */
const CHECKERBOARD =
    'bg-[repeating-conic-gradient(theme(colors.slate.300)_0%_25%,theme(colors.slate.50)_0%_50%)] bg-[length:1rem_1rem]';

function RenderWithHoverReadout(args: MaskOverlayCanvasProps) {
    const [info, setInfo] = useState<MaskPickInfo | null>(null);
    return (
        <div className="flex w-fit flex-col gap-2">
            <Frame size={args.size}>
                <MaskOverlayCanvas {...args} onHover={setInfo} showTooltip={false} />
            </Frame>
            <p className="text-xs font-light text-slate-600">
                {info
                    ? `(${info.x}, ${info.y}) — ${info.label ?? 'background'}`
                    : 'Move the pointer over the image'}
            </p>
        </div>
    );
}

function RenderWithErrorReadout(args: MaskOverlayCanvasProps) {
    const [error, setError] = useState<string | null>(null);
    return (
        <div className="flex w-fit flex-col gap-2">
            <Frame size={args.size}>
                <MaskOverlayCanvas
                    {...args}
                    onError={(message, layer) => setError(`${layer}: ${message}`)}
                />
            </Frame>
            <p className="text-xs font-light text-slate-600">
                {error ? `onError → ${error}` : 'Loading…'}
            </p>
        </div>
    );
}

function RenderWithControlledVisibility(args: MaskOverlayCanvasProps) {
    const [hidden, setHidden] = useState<number[]>([2]);
    return (
        <Frame size={args.size}>
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
}

export const Default: Story = {
    render: (args: MaskOverlayCanvasProps) => (
        <Frame size={args.size}>
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
        <Frame size={args.size}>
            <MaskOverlayCanvas {...args} />
        </Frame>
    ),
    parameters: {
        docs: {
            description: {
                story: `
Named classes with explicit colors. Toggle any class off in the legend; a hidden
class is excluded from the raster.

\`\`\`tsx
<MaskOverlayCanvas
  image={frame}
  imageShape={[height, width]}
  labels={labelArray}
  labelsShape={[height, width]}
  classes={[
    { id: 1, label: 'Ring', color: '#1f77b4' },
    { id: 2, label: 'Spot', color: '#ff7f0e' },
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
        <Frame size={args.size}>
            <MaskOverlayCanvas {...args} />
        </Frame>
    ),
    parameters: {
        docs: {
            description: {
                story: `
The single-class case: one boolean mask in one flat color. Here it marks only the
ring, and the spot and streak in the image are left unmasked. Any 0/1 array works as
\`labels\`, with a single class for the value 1.

\`\`\`tsx
<MaskOverlayCanvas
  image={frame}
  imageShape={shape}
  labels={booleanMask}
  labelsShape={shape}
  classes={[{ id: 1, label: 'Ring', color: '#ff00ff' }]}
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
        labels: RING_MASK,
        labelsShape: SHAPE,
        classes: [{ id: 1, label: 'Ring', color: '#ff00ff' }],
        maskOpacity: 0.6,
    },
};

export const BinaryMaskLayers: Story = {
    render: (args: MaskOverlayCanvasProps) => (
        <Frame size={args.size}>
            <MaskOverlayCanvas {...args} />
        </Frame>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Per-class binary masks instead of a combined label array. Unlike a label array, layers may overlap: here the ring mask runs continuously underneath the spot and the streak, and later layers draw on top where they meet. Hide the spot or the streak in the legend to see the ring beneath.',
            },
        },
    },
    args: {
        image: IMAGE,
        imageShape: SHAPE,
        labelsShape: SHAPE,
        maskLayers: [
            { classId: 1, data: RING_MASK },
            { classId: 2, data: featureMask(PROFILES.spot) },
            { classId: 3, data: featureMask(PROFILES.streak) },
        ],
        classes: [
            { id: 1, label: 'Ring', color: '#2ca02c' },
            { id: 2, label: 'Spot', color: '#d62728' },
            { id: 3, label: 'Streak', color: '#9467bd' },
        ],
    },
};

export const LogScaledImage: Story = {
    render: (args: MaskOverlayCanvasProps) => (
        <Frame size={args.size}>
            <MaskOverlayCanvas {...args} />
        </Frame>
    ),
    parameters: {
        docs: {
            description: {
                story: `
Set \`imageLogScale\` for high-dynamic-range frames where a linear ramp shows only the
brightest features.

Values \`<= 0\` are outside the log domain. They are left transparent rather than
drawn as the low end of the colormap, so a zero-count pixel never shares a color with
a one-count pixel. This frame has a vertical module gap that reads exactly 0 and a
slightly negative, over-subtracted patch in the upper right; both show the
checkerboard set behind the canvas with \`classNameCanvas\`. On the default dark
background they would be hard to tell apart from low intensities.

\`\`\`tsx
<MaskOverlayCanvas
  image={frame}
  imageShape={[height, width]}
  imageColormap="magma"
  imageLogScale
/>
\`\`\`
                `,
            },
        },
    },
    args: {
        image: IMAGE_WITH_UNDER_RANGE,
        imageShape: SHAPE,
        imageColormap: 'magma',
        imageLogScale: true,
        labels: LABELS,
        labelsShape: SHAPE,
        classes: NAMED_CLASSES,
        classNameCanvas: CHECKERBOARD,
    },
};

export const LogUnderRangeColor: Story = {
    render: (args: MaskOverlayCanvasProps) => (
        <Frame size={args.size}>
            <MaskOverlayCanvas {...args} />
        </Frame>
    ),
    parameters: {
        docs: {
            description: {
                story: `
Set \`underRangeColor\` to paint values outside the log domain (\`<= 0\`) in a fixed
RGBA color instead of leaving them transparent. Here the module gap and the
over-subtracted patch are cyan, which stands out against \`magma\`. It applies only to
\`image\` with \`imageLogScale\`; labels, mask layers and image URLs are not log-scaled.

\`\`\`tsx
<MaskOverlayCanvas
  image={frame}
  imageShape={[height, width]}
  imageColormap="magma"
  imageLogScale
  underRangeColor={[0, 255, 255, 255]}
/>
\`\`\`
                `,
            },
        },
    },
    args: {
        image: IMAGE_WITH_UNDER_RANGE,
        imageShape: SHAPE,
        imageColormap: 'magma',
        imageLogScale: true,
        underRangeColor: [0, 255, 255, 255],
        labels: LABELS,
        labelsShape: SHAPE,
        classes: NAMED_CLASSES,
    },
};

export const WithoutLegend: Story = {
    render: (args: MaskOverlayCanvasProps) => (
        <Frame size={args.size}>
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
        <Frame size={args.size}>
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
        <Frame size={args.size}>
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
        <Frame size={args.size}>
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
        <Frame size={args.size}>
            <MaskOverlayCanvas {...args} />
        </Frame>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Each class can carry its own opacity multiplier, applied on top of the global `maskOpacity`, for example to de-emphasize a context class.',
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
            { id: 1, label: 'Ring', color: '#1f77b4', opacity: 0.25 },
            { id: 2, label: 'Spot', color: '#ff7f0e', opacity: 1 },
            { id: 3, label: 'Streak', color: '#2ca02c', opacity: 0.6 },
        ],
    },
};

export const HoverReadout: Story = {
    parameters: {
        docs: {
            description: {
                story: `
\`onHover\` reports the pixel coordinate and the class beneath the pointer, picked
directly from the source array rather than by reading back canvas pixels, so it is
exact at any zoom and works with a cross-origin base image.

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
    render: RenderWithHoverReadout,
    args: {
        image: IMAGE,
        imageShape: SHAPE,
        imageColormap: 'viridis',
        labels: LABELS,
        labelsShape: SHAPE,
        classes: NAMED_CLASSES,
    },
};

export const AspectRatio: Story = {
    parameters: {
        docs: {
            description: {
                story: `
The fixed sizes give the image's longer side 16, 24 or 40 rem and scale the shorter
side to match, so a non-square image fills its box with no letterboxing. Here a 2:1
frame is shown at each size; a portrait frame would keep the preset height instead.
\`size="full"\` fills the parent and letterboxes inside it.
                `,
            },
        },
    },
    render: (args: MaskOverlayCanvasProps) => (
        <div className="flex flex-col items-start gap-4">
            {(['small', 'medium', 'large'] as const).map((size) => (
                <MaskOverlayCanvas key={size} {...args} size={size} />
            ))}
        </div>
    ),
    args: {
        image: WIDE_IMAGE,
        imageShape: WIDE_SHAPE,
        imageColormap: 'viridis',
        labels: WIDE_LABELS,
        labelsShape: WIDE_SHAPE,
        classes: NAMED_CLASSES,
        legendPosition: 'bottom',
    },
};

export const ImageLoadError: Story = {
    parameters: {
        docs: {
            description: {
                story: `
A base image URL that fails to load. The component shows a message over the canvas and
reports the failure through \`onError\`, so the consumer can surface it as well.

\`\`\`tsx
<MaskOverlayCanvas
  imageUrl={url}
  onError={(message, layer) => setError(\`\${layer}: \${message}\`)}
/>
\`\`\`
                `,
            },
        },
    },
    render: RenderWithErrorReadout,
    args: {
        imageUrl: '/this-image-does-not-exist.png',
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
    render: RenderWithControlledVisibility,
    args: {
        image: IMAGE,
        imageShape: SHAPE,
        labels: LABELS,
        labelsShape: SHAPE,
    },
};
