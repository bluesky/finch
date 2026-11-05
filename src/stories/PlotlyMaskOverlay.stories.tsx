import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import DocsPageWithoutPrimaryCopy from './DocsPageWithoutPrimaryCopy';

import PlotlyMaskOverlay from '../components/PlotlyMaskOverlay/PlotlyMaskOverlay';
import type { PlotlyMaskOverlayProps } from '../components/PlotlyMaskOverlay/PlotlyMaskOverlay';
import type {
    Annotation,
    DrawEvent,
    MaskClass,
    OverlayPickInfo,
} from '../components/PlotlyMaskOverlay/types';
import {
    CELLS,
    CLASSES,
    IMAGE,
    IMAGE_WITH_NAN,
    LABELS,
    MASK_LAYERS,
    renderedUrls,
    SHAPE,
    W,
} from './PlotlyMaskOverlaySampleData';

const meta = {
    title: 'General Components/PlotlyMaskOverlay',
    component: PlotlyMaskOverlay,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        // The required `image` first, then the rest alphabetically, in Controls and in the docs table.
        controls: { sort: 'requiredFirst' },
        docs: {
            page: DocsPageWithoutPrimaryCopy,
            // Story-only args stay in the canvas Controls panel but out of the API table.
            controls: {
                sort: 'requiredFirst',
                exclude: [
                    'classes',
                    'colormap',
                    'logScale',
                    'maskFormat',
                    'maskOpacity',
                    'missingColor',
                    'source',
                ],
            },
            // Shown after the stories: an integration note, not an example of its own.
            footer: `
### Using it with Tiled

Finch's Tiled hooks return 2D arrays that \`PlotlyMaskOverlay\` can use directly. Configure 
\`FinchConfigProvider\` (with a \`tiledApiUrl\` ending in \`/api/v1\`) and a TanStack
\`QueryClientProvider\` at the application root.

\`\`\`tsx
import { PlotlyMaskOverlay, useTiledArrayAsJSONQuery } from '@blueskyproject/finch';

function ImageWithMask() {
    // Frame 0 of an image stack and its label array, both number[][].
    const image = useTiledArrayAsJSONQuery('path/to/images', { stack: [0] });
    const labels = useTiledArrayAsJSONQuery('path/to/labels', { stack: [0] });
    if (!image.data || !labels.data) return <p>Loading…</p>;

    return (
        <PlotlyMaskOverlay
            image={{ type: 'array', data: image.data }}
            mask={{ type: 'labels', data: labels.data }}
        />
    );
}
\`\`\`

Note: Image and mask arrays must have matching dimensions and pixel alignment. If Tiled downsamples
one response (e.g., through \`maxBytesAllowed\`), they may no longer align.
`,
            description: {
                component: `
Displays a scientific image with masks, regions of interest and points drawn on top, with zoom,
pan, and pixel-level hover and click.

The \`image\` is either numeric values that Finch renders, or a picture your application has
already rendered, passed by URL. A \`mask\` passed as arrays gets class colours, a legend and the
class under the pointer; it must have the image's exact dimensions, as Finch never resamples it.
A mask that is already a picture goes in \`imageLayers\` and is shown as it is.
                `,
            },
        },
    },
    argTypes: {
        // Data props are documented in the table but come from each story, not Controls.
        image: { control: false },
        mask: { control: false },
        imageLayers: { control: false },
        annotations: { control: false },
        pointLayers: { control: false },
        extraTraces: { control: false },
        layout: { control: false },
        config: { control: false },
    },
    args: {
        size: 'large',
        // The component's defaults, so Controls show the state each story starts in.
        dragMode: 'zoom',
        zoomable: true,
        showAxes: true,
        showLegend: true,
        editableAnnotations: false,
        // Shown in the Actions panel; stories that use a callback themselves pass their own.
        onClick: fn(),
        onDragModeChange: fn(),
        onLoadStateChange: fn(),
        onClassVisibilityChange: fn(),
    },
} satisfies Meta<typeof PlotlyMaskOverlay>;

export default meta;

const sizeArg = { control: 'inline-radio', options: ['small', 'medium', 'large', 'full'] } as const;
const colormapArg = {
    description: "The array image's `colormap`",
    control: 'inline-radio',
    options: ['gray', 'viridis', 'magma', 'cividis'],
} as const;
const logScaleArg = { description: "The array image's `logScale`" } as const;

/** Story controls for the options that live inside `image={{ type: 'array' }}`. */
type ArrayImageArgs = { colormap: string; logScale: boolean };

/** A fixed box for `size="full"`, which fills its parent. Fixed sizes render unwrapped. */
function Frame({ size, children }: { size?: string; children: React.ReactNode }) {
    if (size !== 'full') return <>{children}</>;
    return <div className="h-80 w-[30rem]">{children}</div>;
}

/** The readout under a story. With an image overlay as the mask there is no class to report. */
function describePixel(info: OverlayPickInfo | null, overlay = false) {
    if (!info) return 'Hover the image';
    const value =
        info.value === undefined
            ? ''
            : `  ·  ${Number.isNaN(info.value) ? 'no data (NaN)' : `value ${Math.round(info.value)}`}`;
    const cls = overlay
        ? '  ·  no class: this is an image overlay'
        : info.label
          ? `  ·  ${info.label}`
          : '';
    return `Pixel (${info.x}, ${info.y})${cls}${value}`;
}

/** The overlay with a one-line readout under it, and an optional note below that. */
function WithReadout({
    text,
    note,
    ...args
}: PlotlyMaskOverlayProps & { text: string; note?: React.ReactNode }) {
    return (
        <div className="flex w-fit flex-col gap-2">
            <Frame size={args.size}>
                <PlotlyMaskOverlay {...args} />
            </Frame>
            <p className="text-xs font-light text-slate-600">{text}</p>
            {note}
        </div>
    );
}

function RenderWithHover({ note, ...args }: PlotlyMaskOverlayProps & { note?: React.ReactNode }) {
    const [info, setInfo] = useState<OverlayPickInfo | null>(null);
    return <WithReadout {...args} onHover={setInfo} text={describePixel(info)} note={note} />;
}

// ---------------------------------------------------------------------------
// 1. Mask overlays
// ---------------------------------------------------------------------------

type MaskArgs = PlotlyMaskOverlayProps &
    ArrayImageArgs & {
        maskFormat: 'Label array' | 'Binary masks';
        maskOpacity: number;
        missingColor: string;
        classes: MaskClass[];
    };

export const MaskOverlay: StoryObj<MaskArgs> = {
    parameters: {
        docs: {
            description: {
                story: `A segmentation drawn over the image: cells, nuclei and debris, each class with its own
colour and transparency. Click a class in the legend to hide it. The mask can be one label
array (one class per pixel) or one binary mask per class, which may overlap. Switch
**maskFormat** in the story's Controls panel and hide *Nucleus*: with a label array the nuclei
leave holes, because those pixels belong to no other class; with binary masks the cell mask
underneath is still there. The Controls panel also edits the classes and **maskOpacity**, and
**missingColor** sets the background shown through pixels with NaN values.`,
            },
        },
    },
    render: ({ maskFormat, maskOpacity, missingColor, colormap, logScale, classes, ...args }) => (
        <RenderWithHover
            {...args}
            image={{ type: 'array', data: IMAGE_WITH_NAN, shape: SHAPE, colormap, logScale }}
            mask={
                maskFormat === 'Label array'
                    ? { type: 'labels', data: LABELS, classes, opacity: maskOpacity }
                    : { type: 'layers', layers: MASK_LAYERS, classes, opacity: maskOpacity }
            }
            layout={{ plot_bgcolor: missingColor }}
            note={
                <p className="flex items-center gap-1.5 text-xs font-light text-slate-600">
                    <span
                        className="inline-block h-2.5 w-2.5 rounded-sm"
                        style={{ background: missingColor }}
                    />
                    Background: pixels with NaN values (no data), and outside the image when zoomed
                    out
                </p>
            }
        />
    ),
    args: {
        size: 'full',
        maskFormat: 'Label array',
        colormap: 'gray',
        logScale: false,
        missingColor: '#ef4444',
        maskOpacity: 0.6,
        showLegend: true,
        classes: [
            { id: 1, label: 'Cell', color: '#22c55e', opacity: 0.6 },
            { id: 2, label: 'Nucleus', color: '#3b82f6', opacity: 1 },
            { id: 3, label: 'Debris', color: '#eab308', opacity: 1 },
        ],
    },
    argTypes: {
        size: sizeArg,
        maskFormat: {
            description: 'Pass the mask as a label array or as per-class binary masks',
            control: 'inline-radio',
            options: ['Label array', 'Binary masks'],
        },
        maskOpacity: {
            description: "The mask's `opacity`",
            control: { type: 'range', min: 0, max: 1, step: 0.05 },
        },
        classes: { description: "The mask's `classes`" },
        missingColor: {
            description: 'Background color shown through pixels with NaN values',
            control: 'color',
        },
        colormap: colormapArg,
        logScale: logScaleArg,
    },
};

// ---------------------------------------------------------------------------
// 2. Regions of interest
// ---------------------------------------------------------------------------

const REGION_COLOR = '#facc15';

/** The axis-aligned box around a (rotated) cell, with a pixel of margin. */
function around(c: (typeof CELLS)[number]) {
    const t = (c.angle * Math.PI) / 180;
    const hx = Math.hypot(c.rx * Math.cos(t), c.ry * Math.sin(t)) + 1;
    const hy = Math.hypot(c.rx * Math.sin(t), c.ry * Math.cos(t)) + 1;
    return { x0: c.x - hx, y0: c.y - hy, x1: c.x + hx, y1: c.y + hy };
}

const INITIAL_REGIONS: Annotation[] = [
    { type: 'ellipse', id: 'Cell 1', ...around(CELLS[0]) },
    { type: 'rect', id: 'Cell 2', ...around(CELLS[1]) },
];

type RegionArgs = PlotlyMaskOverlayProps & ArrayImageArgs;

/** A shape with no area, such as a drag with no vertical travel, is not a region. */
function hasArea(g: DrawEvent) {
    if (g.type === 'polygon') return new Set(g.points.map(([x, y]) => `${x},${y}`)).size >= 3;
    return g.x0 !== g.x1 && g.y0 !== g.y1;
}

function RenderRegions({ colormap, logScale, ...args }: RegionArgs) {
    const [regions, setRegions] = useState<Annotation[]>(INITIAL_REGIONS);
    const [selected, setSelected] = useState<number | null>(null);
    const styled = regions.map((r, i) => ({
        ...r,
        stroke: REGION_COLOR,
        // Thick enough to click easily: Plotly takes clicks on a translucent shape's outline.
        strokeWidth: i === selected ? 4 : 3,
        fill: i === selected ? REGION_COLOR : undefined,
        fillOpacity: 0.15,
    }));
    const name = (i: number) => String(regions[i]?.id ?? `Region ${i + 1}`);
    return (
        <WithReadout
            {...args}
            image={{ type: 'array', data: IMAGE, shape: SHAPE, colormap, logScale }}
            annotations={styled}
            drawStyle={{ stroke: REGION_COLOR, strokeWidth: 2 }}
            onDrawComplete={(g) => {
                if (!hasArea(g)) return;
                setSelected(regions.length);
                setRegions([...regions, { ...g, id: `Region ${regions.length + 1}` }]);
            }}
            onAnnotationChange={(list) => {
                setRegions(list);
                setSelected(null);
            }}
            onClick={(info) => setSelected(info.annotation?.index ?? null)}
            text={`${regions.length} regions${selected === null ? '' : `  ·  selected: ${name(selected)}`}`}
        />
    );
}

export const RegionsOfInterest: StoryObj<RegionArgs> = {
    parameters: {
        docs: {
            description: {
                story: `Regions of interest drawn over the image. Drag on the image to draw an ellipse; a shape with
no area is discarded. Click a region to select it, and click the empty image to clear the
selection; where regions overlap, the one drawn last is selected. To edit a region, pick zoom
or pan in the toolbar and click its outline to show its handles: drag it to move it, drag a
handle to resize it, or remove it with the eraser in the toolbar. Your application keeps the
list of regions.`,
            },
        },
    },
    render: (args) => <RenderRegions {...args} />,
    args: {
        size: 'large',
        colormap: 'gray',
        logScale: false,
        dragMode: 'ellipse',
        editableAnnotations: true,
    },
    argTypes: {
        size: sizeArg,
        colormap: colormapArg,
        logScale: logScaleArg,
        dragMode: {
            control: 'inline-radio',
            options: ['zoom', 'pan', 'rect', 'ellipse', 'lasso'],
        },
    },
};

// ---------------------------------------------------------------------------
// 3. Rendered images
// ---------------------------------------------------------------------------

type Source = 'Raw values and mask arrays' | 'Rendered PNGs';
type RenderedArgs = PlotlyMaskOverlayProps & ArrayImageArgs & { source: Source };

function RenderRendered({ source, colormap, logScale, ...args }: RenderedArgs) {
    const [info, setInfo] = useState<OverlayPickInfo | null>(null);
    const urls = renderedUrls();
    const overlay = source === 'Rendered PNGs';
    const props: PlotlyMaskOverlayProps = overlay
        ? {
              ...args,
              onHover: setInfo,
              image: {
                  type: 'url',
                  url: urls.image,
                  shape: SHAPE,
                  // Hover values still come from the data, not from the PNG.
                  resolveValue: (x, y) => IMAGE[y * W + x],
              },
              // Pictures in list order: a second channel, then the mask outline on top.
              imageLayers: [
                  { id: 'puncta', url: urls.puncta },
                  { id: 'mask', url: urls.mask },
              ],
          }
        : {
              ...args,
              onHover: setInfo,
              image: { type: 'array', data: IMAGE, shape: SHAPE, colormap, logScale },
              mask: { type: 'labels', data: LABELS, classes: CLASSES },
          };
    return <WithReadout key={source} {...props} text={describePixel(info, overlay)} />;
}

export const RenderedImages: StoryObj<RenderedArgs> = {
    parameters: {
        docs: {
            description: {
                story: `This example compares two ways to display an image with overlays:

- **Raw arrays:** Finch renders numerical data and overlays a mask with class colors, a legend, and hover information.
- **Rendered images:** Finch displays a base image with additional images layered on top, such as mask outlines or other visual features.

Each image layer shares the base image's pixel coordinates, even when its resolution differs. Rendered images do not provide original pixel values or mask classes; use \`resolveValue\` to retrieve pixel values.

Images in \`imageLayers\` are drawn in list order, with later layers on top.`,
            },
        },
    },
    render: (args) => <RenderRendered {...args} />,
    args: {
        size: 'large',
        source: 'Rendered PNGs',
        colormap: 'gray',
        logScale: false,
    },
    argTypes: {
        size: sizeArg,
        source: {
            description: 'Where the image and mask come from',
            control: 'inline-radio',
            options: ['Raw values and mask arrays', 'Rendered PNGs'],
        },
        colormap: colormapArg,
        logScale: logScaleArg,
    },
};

// ---------------------------------------------------------------------------
// 4. Broken image URLs
// ---------------------------------------------------------------------------

/** One overlay with a title, its load error and, while the image is usable, the pixel under the pointer. */
function FailurePanel({
    title,
    hover = false,
    ...args
}: PlotlyMaskOverlayProps & { title: string; hover?: boolean }) {
    const [error, setError] = useState('');
    const [info, setInfo] = useState<OverlayPickInfo | null>(null);
    return (
        <div className="flex min-w-0 flex-col gap-2">
            <p className="text-sm font-medium text-slate-700">{title}</p>
            {/* The plot fills its column, at the image's 3:2 shape. */}
            <div className="aspect-[3/2] w-full">
                <PlotlyMaskOverlay
                    {...args}
                    size="full"
                    onHover={setInfo}
                    onLoadStateChange={(layer, state) => {
                        args.onLoadStateChange?.(layer, state);
                        if (state.status === 'error') setError(`${layer}: ${state.message}`);
                    }}
                />
            </div>
            <p className="break-words text-xs font-light text-slate-600">
                {error ? `Load error, ${error}` : 'Loading'}
            </p>
            {hover && <p className="text-xs font-light text-slate-600">{describePixel(info)}</p>}
        </div>
    );
}

function RenderBroken(args: PlotlyMaskOverlayProps) {
    const urls = renderedUrls();
    const resolveValue = (x: number, y: number) => IMAGE[y * W + x];
    return (
        <div className="mx-auto grid w-full max-w-[52rem] grid-cols-2 gap-6">
            <FailurePanel
                {...args}
                title="Failed image"
                image={{ type: 'url', url: '/does-not-exist.png', shape: SHAPE, resolveValue }}
                imageLayers={[
                    { id: 'puncta', url: urls.puncta },
                    { id: 'mask', url: urls.mask },
                ]}
            />
            <FailurePanel
                {...args}
                title="Failed image layer"
                hover
                // Greyscale, so nothing on screen can be mistaken for a layer.
                image={{ type: 'url', url: urls.grayImage, shape: SHAPE, resolveValue }}
                imageLayers={[{ id: 'mask', url: '/does-not-exist-mask.png' }]}
            />
        </div>
    );
}

export const BrokenImageUrls: StoryObj<PlotlyMaskOverlayProps> = {
    name: 'Broken Image URLs',
    parameters: {
        // Both plots share the row's width, so the story has no size of its own. The padded
        // layout gives the row the full width of the box, so it can never overflow it.
        layout: 'padded',
        controls: { exclude: ['size'] },
        docs: {
            description: {
                story: `What happens when a URL fails to load, reported through \`onLoadStateChange\`. When the image
fails, an error takes its place and nothing is drawn over it, since overlays without their
image would mislead. When an image layer fails, the image stays visible and usable, and the
failed layer is named in a small note in its corner.`,
            },
        },
    },
    render: (args) => <RenderBroken {...args} />,
    args: { showLegend: false },
};
