import { act, render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MaskOverlayCanvas from '../../components/MaskOverlayCanvas/MaskOverlayCanvas';

/**
 * `useResizeObserver` is stubbed out to a no-op in the shared test setup, so the
 * component would otherwise measure 0x0 and never paint.
 */
const CONTAINER = { width: 200, height: 200 };
vi.mock('../../hooks/useResizeObserver', () => ({
    default: () => ({ containerRef: { current: containerEl }, dimensions: CONTAINER }),
}));

let containerEl: HTMLElement | null = null;

/** A 4x4 label field: class 1 on the top row, class 2 on the third row, background elsewhere. */
const LABELS = [1, 1, 1, 1, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0];
const SHAPE: [number, number] = [4, 4];

type ContextSpy = {
    setTransform: ReturnType<typeof vi.fn>;
    clearRect: ReturnType<typeof vi.fn>;
    drawImage: ReturnType<typeof vi.fn>;
    putImageData: ReturnType<typeof vi.fn>;
    imageSmoothingEnabled: boolean;
    globalAlpha: number;
};

let contexts: ContextSpy[] = [];

beforeEach(() => {
    contexts = [];
    // The test DOM provides no 2D context, no ImageData and no layout box.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
        const ctx: ContextSpy = {
            setTransform: vi.fn(),
            clearRect: vi.fn(),
            drawImage: vi.fn(),
            putImageData: vi.fn(),
            imageSmoothingEnabled: true,
            globalAlpha: 1,
        };
        contexts.push(ctx);
        return ctx as unknown as CanvasRenderingContext2D;
    });
    vi.stubGlobal(
        'ImageData',
        class {
            data: Uint8ClampedArray;
            width: number;
            height: number;
            constructor(data: Uint8ClampedArray, width: number, height: number) {
                this.data = data;
                this.width = width;
                this.height = height;
            }
        },
    );
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
        width: CONTAINER.width,
        height: CONTAINER.height,
        left: 0,
        top: 0,
    } as DOMRect);
    HTMLElement.prototype.setPointerCapture = vi.fn();
    HTMLElement.prototype.releasePointerCapture = vi.fn();
    HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    containerEl = null;
});

/** The base and mask contexts from the most recent paint, in that order. */
function lastPainted(): [ContextSpy, ContextSpy] {
    const painted = contexts.filter((c) => c.setTransform.mock.calls.length > 0);
    return [painted[painted.length - 2], painted[painted.length - 1]];
}

/**
 * The scale of the most recent mask-layer draw transform. The mask layer is read
 * because these renders have no base image, so the base layer only ever receives
 * the identity reset.
 */
function lastScale(): number {
    const [, mask] = lastPainted();
    const calls = mask.setTransform.mock.calls;
    return calls[calls.length - 1][0] as number;
}

/** The element that receives pointer and wheel input. */
const surface = () => screen.getByTestId('mask-overlay-base-canvas').parentElement as HTMLElement;

/** Renders and wires the mocked resize-observer ref to the real canvas wrapper. */
function renderOverlay(ui: React.ReactElement) {
    const result = render(ui);
    containerEl = result.container.querySelector('.relative') as HTMLElement;
    result.rerender(ui);
    return result;
}

describe('MaskOverlayCanvas', () => {
    it('renders without crashing', () => {
        const { container } = renderOverlay(
            <MaskOverlayCanvas labels={LABELS} labelsShape={SHAPE} />,
        );
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a base canvas and a mask canvas', () => {
        renderOverlay(<MaskOverlayCanvas labels={LABELS} labelsShape={SHAPE} />);
        expect(screen.getByTestId('mask-overlay-base-canvas')).toBeInTheDocument();
        expect(screen.getByTestId('mask-overlay-mask-canvas')).toBeInTheDocument();
    });

    it('derives one legend entry per distinct non-zero label when classes are omitted', () => {
        renderOverlay(<MaskOverlayCanvas labels={LABELS} labelsShape={SHAPE} />);
        expect(screen.getByRole('list', { name: 'Mask classes' })).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(2);
        expect(screen.getByText('Class 1')).toBeInTheDocument();
        expect(screen.getByText('Class 2')).toBeInTheDocument();
    });

    it('uses supplied class labels and colors', () => {
        renderOverlay(
            <MaskOverlayCanvas
                labels={LABELS}
                labelsShape={SHAPE}
                classes={[
                    { id: 1, label: 'Sample', color: '#ff0000' },
                    { id: 2, label: 'Substrate', color: '#00ff00' },
                ]}
            />,
        );
        expect(screen.getByText('Sample')).toBeInTheDocument();
        expect(screen.getByText('Substrate')).toBeInTheDocument();
        const swatches = screen
            .getAllByRole('listitem')
            .map((li) => li.querySelector('span') as HTMLElement);
        expect(swatches[0]).toHaveStyle({ backgroundColor: '#ff0000' });
        expect(swatches[1]).toHaveStyle({ backgroundColor: '#00ff00' });
    });

    it('derives classes from maskLayers when no labels are given', () => {
        renderOverlay(
            <MaskOverlayCanvas
                labelsShape={SHAPE}
                maskLayers={[
                    { classId: 3, data: new Array(16).fill(0) },
                    { classId: 7, data: new Array(16).fill(1) },
                ]}
            />,
        );
        expect(screen.getByText('Class 3')).toBeInTheDocument();
        expect(screen.getByText('Class 7')).toBeInTheDocument();
    });

    it('hides the legend when showLegend is false', () => {
        renderOverlay(<MaskOverlayCanvas labels={LABELS} labelsShape={SHAPE} showLegend={false} />);
        expect(screen.queryByRole('list', { name: 'Mask classes' })).not.toBeInTheDocument();
    });

    it('toggles visibility internally and fires the callback when uncontrolled', () => {
        const onClassVisibilityChange = vi.fn();
        renderOverlay(
            <MaskOverlayCanvas
                labels={LABELS}
                labelsShape={SHAPE}
                onClassVisibilityChange={onClassVisibilityChange}
            />,
        );
        const toggle = screen.getByRole('button', { name: 'Class 1 visible' });
        expect(toggle).toHaveAttribute('aria-pressed', 'true');
        fireEvent.click(toggle);

        expect(onClassVisibilityChange).toHaveBeenCalledWith(1, false);
        // Uncontrolled: the row state actually changes.
        expect(screen.getByRole('button', { name: 'Class 1 visible' })).toHaveAttribute(
            'aria-pressed',
            'false',
        );
    });

    it('fires the callback but does not change state when visibility is controlled', () => {
        const onClassVisibilityChange = vi.fn();
        renderOverlay(
            <MaskOverlayCanvas
                labels={LABELS}
                labelsShape={SHAPE}
                classes={[
                    { id: 1, visible: true },
                    { id: 2, visible: true },
                ]}
                onClassVisibilityChange={onClassVisibilityChange}
            />,
        );
        fireEvent.click(screen.getByRole('button', { name: 'Class 1 visible' }));

        expect(onClassVisibilityChange).toHaveBeenCalledWith(1, false);
        // Controlled: the prop still says visible, so the row is unchanged.
        expect(screen.getByRole('button', { name: 'Class 1 visible' })).toHaveAttribute(
            'aria-pressed',
            'true',
        );
    });

    it('reflects a controlled hidden class in the legend', () => {
        renderOverlay(
            <MaskOverlayCanvas
                labels={LABELS}
                labelsShape={SHAPE}
                classes={[
                    { id: 1, visible: false },
                    { id: 2, visible: true },
                ]}
            />,
        );
        expect(screen.getByRole('button', { name: 'Class 1 visible' })).toHaveAttribute(
            'aria-pressed',
            'false',
        );
        expect(screen.getByRole('button', { name: 'Class 2 visible' })).toHaveAttribute(
            'aria-pressed',
            'true',
        );
    });

    it('reports the class under the pointer via onHover', async () => {
        const onHover = vi.fn();
        renderOverlay(
            <MaskOverlayCanvas
                labels={LABELS}
                labelsShape={SHAPE}
                fit="none"
                showTooltip={false}
                onHover={onHover}
            />,
        );
        const surface = screen.getByTestId('mask-overlay-base-canvas').parentElement as HTMLElement;

        // fit="none" makes the view transform the identity, so client coords are image pixels.
        fireEvent.pointerMove(surface, { clientX: 2, clientY: 0 });
        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
        expect(onHover).toHaveBeenLastCalledWith(
            expect.objectContaining({ x: 2, y: 0, classId: 1, label: 'Class 1' }),
        );

        fireEvent.pointerMove(surface, { clientX: 1, clientY: 2 });
        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
        expect(onHover).toHaveBeenLastCalledWith(
            expect.objectContaining({ x: 1, y: 2, classId: 2 }),
        );
    });

    it('reports a null classId over background', async () => {
        const onHover = vi.fn();
        renderOverlay(
            <MaskOverlayCanvas
                labels={LABELS}
                labelsShape={SHAPE}
                fit="none"
                showTooltip={false}
                onHover={onHover}
            />,
        );
        const surface = screen.getByTestId('mask-overlay-base-canvas').parentElement as HTMLElement;
        fireEvent.pointerMove(surface, { clientX: 0, clientY: 1 });
        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
        expect(onHover).toHaveBeenLastCalledWith(expect.objectContaining({ classId: null }));
    });

    it('calls onHover with null when the pointer leaves', () => {
        const onHover = vi.fn();
        renderOverlay(
            <MaskOverlayCanvas labels={LABELS} labelsShape={SHAPE} fit="none" onHover={onHover} />,
        );
        const surface = screen.getByTestId('mask-overlay-base-canvas').parentElement as HTMLElement;
        fireEvent.pointerLeave(surface);
        expect(onHover).toHaveBeenLastCalledWith(null);
    });

    it('reports a hidden class as background when picking', async () => {
        const onHover = vi.fn();
        renderOverlay(
            <MaskOverlayCanvas
                labels={LABELS}
                labelsShape={SHAPE}
                fit="none"
                showTooltip={false}
                classes={[{ id: 1, visible: false }]}
                onHover={onHover}
            />,
        );
        const surface = screen.getByTestId('mask-overlay-base-canvas').parentElement as HTMLElement;
        fireEvent.pointerMove(surface, { clientX: 2, clientY: 0 });
        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
        expect(onHover).toHaveBeenLastCalledWith(expect.objectContaining({ classId: null }));
    });

    it('calls onClick with the picked class', () => {
        const onClick = vi.fn();
        renderOverlay(
            <MaskOverlayCanvas labels={LABELS} labelsShape={SHAPE} fit="none" onClick={onClick} />,
        );
        const surface = screen.getByTestId('mask-overlay-base-canvas').parentElement as HTMLElement;
        fireEvent.click(surface, { clientX: 0, clientY: 0 });
        expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ x: 0, y: 0, classId: 1 }));
    });

    it('does not pick outside the image bounds', () => {
        const onClick = vi.fn();
        renderOverlay(
            <MaskOverlayCanvas labels={LABELS} labelsShape={SHAPE} fit="none" onClick={onClick} />,
        );
        const surface = screen.getByTestId('mask-overlay-base-canvas').parentElement as HTMLElement;
        fireEvent.click(surface, { clientX: 99, clientY: 99 });
        expect(onClick).not.toHaveBeenCalled();
    });

    it('shows a tooltip naming the class under the pointer', () => {
        renderOverlay(<MaskOverlayCanvas labels={LABELS} labelsShape={SHAPE} fit="none" />);
        const surface = screen.getByTestId('mask-overlay-base-canvas').parentElement as HTMLElement;
        fireEvent.pointerMove(surface, { clientX: 0, clientY: 0 });
        expect(screen.getByRole('status')).toHaveTextContent('Class 1');
    });

    it('does not show a tooltip when showTooltip is false', () => {
        renderOverlay(
            <MaskOverlayCanvas
                labels={LABELS}
                labelsShape={SHAPE}
                fit="none"
                showTooltip={false}
            />,
        );
        const surface = screen.getByTestId('mask-overlay-base-canvas').parentElement as HTMLElement;
        fireEvent.pointerMove(surface, { clientX: 0, clientY: 0 });
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('applies maskOpacity as globalAlpha on the mask layer only', () => {
        renderOverlay(<MaskOverlayCanvas labels={LABELS} labelsShape={SHAPE} maskOpacity={0.25} />);
        // The last two contexts belong to the two visible canvases: base, then mask.
        const painted = contexts.filter((c) => c.setTransform.mock.calls.length > 0);
        const base = painted[painted.length - 2];
        const mask = painted[painted.length - 1];
        expect(base.globalAlpha).toBe(1);
        expect(mask.globalAlpha).toBe(0.25);
    });

    it('draws the mask nearest-neighbour so class boundaries stay hard', () => {
        renderOverlay(<MaskOverlayCanvas labels={LABELS} labelsShape={SHAPE} />);
        const [, mask] = lastPainted();
        expect(mask.imageSmoothingEnabled).toBe(false);
    });

    it('smooths the base image only when it is drawn smaller than native by default', () => {
        // A 400x400 frame in a 200x200 box is drawn at half scale.
        const big = new Float32Array(400 * 400);
        const { rerender } = renderOverlay(
            <MaskOverlayCanvas
                image={big}
                imageShape={[400, 400]}
                labels={LABELS}
                labelsShape={SHAPE}
            />,
        );
        const [base, mask] = lastPainted();
        expect(base.imageSmoothingEnabled).toBe(true);
        expect(mask.imageSmoothingEnabled).toBe(false);

        // A 4x4 frame in the same box is magnified, so pixels stay crisp.
        rerender(<MaskOverlayCanvas image={new Float32Array(16)} imageShape={[4, 4]} />);
        expect(lastPainted()[0].imageSmoothingEnabled).toBe(false);
    });

    it('lets imageSmoothing force base smoothing on or off', () => {
        const small = new Float32Array(16);
        const { rerender } = renderOverlay(
            <MaskOverlayCanvas image={small} imageShape={[4, 4]} imageSmoothing />,
        );
        expect(lastPainted()[0].imageSmoothingEnabled).toBe(true);
        rerender(
            <MaskOverlayCanvas
                image={new Float32Array(400 * 400)}
                imageShape={[400, 400]}
                imageSmoothing={false}
            />,
        );
        expect(lastPainted()[0].imageSmoothingEnabled).toBe(false);
    });

    it('rasterizes the mask through putImageData', () => {
        renderOverlay(<MaskOverlayCanvas labels={LABELS} labelsShape={SHAPE} />);
        expect(contexts.some((c) => c.putImageData.mock.calls.length > 0)).toBe(true);
    });

    it('color-maps a raw image array without an imageUrl', () => {
        renderOverlay(
            <MaskOverlayCanvas
                image={[
                    [0, 10],
                    [20, 30],
                ]}
                labels={[0, 1, 0, 1]}
                labelsShape={[2, 2]}
                imageColormap="viridis"
            />,
        );
        expect(screen.getByTestId('mask-overlay-base-canvas')).toBeInTheDocument();
        expect(contexts.some((c) => c.drawImage.mock.calls.length > 0)).toBe(true);
    });

    describe('log under-range pixels', () => {
        /** RGBA of each pixel in the last base-image raster (rendered without a mask). */
        const basePixels = () => {
            const calls = contexts.flatMap((c) => c.putImageData.mock.calls);
            const { data } = calls[calls.length - 1][0] as { data: Uint8ClampedArray };
            return Array.from({ length: data.length / 4 }, (_, i) => [
                ...data.slice(i * 4, i * 4 + 4),
            ]);
        };
        const IMAGE_WITH_ZEROS = [0, -2, 1, 100];

        it('leaves non-positive pixels transparent by default', () => {
            renderOverlay(
                <MaskOverlayCanvas image={IMAGE_WITH_ZEROS} imageShape={[2, 2]} imageLogScale />,
            );
            const [zero, negative, one] = basePixels();
            expect(zero).toEqual([0, 0, 0, 0]);
            expect(negative).toEqual([0, 0, 0, 0]);
            expect(one[3]).toBe(255);
        });

        it('paints non-positive pixels with a custom underRangeColor', () => {
            renderOverlay(
                <MaskOverlayCanvas
                    image={IMAGE_WITH_ZEROS}
                    imageShape={[2, 2]}
                    imageLogScale
                    underRangeColor={[255, 0, 255, 255]}
                />,
            );
            const [zero, negative, one, hundred] = basePixels();
            expect(zero).toEqual([255, 0, 255, 255]);
            expect(negative).toEqual([255, 0, 255, 255]);
            expect(one).not.toEqual([255, 0, 255, 255]);
            expect(hundred).not.toEqual([255, 0, 255, 255]);
        });

        it('ignores underRangeColor without imageLogScale', () => {
            renderOverlay(
                <MaskOverlayCanvas
                    image={IMAGE_WITH_ZEROS}
                    imageShape={[2, 2]}
                    underRangeColor={[255, 0, 255, 255]}
                />,
            );
            for (const px of basePixels()) {
                expect(px).not.toEqual([255, 0, 255, 255]);
                expect(px[3]).toBe(255);
            }
        });

        it('does not re-rasterize for an equal inline underRangeColor', () => {
            const image = new Float32Array(IMAGE_WITH_ZEROS);
            const ui = () => (
                <MaskOverlayCanvas
                    image={image}
                    imageShape={[2, 2]}
                    imageLogScale
                    underRangeColor={[255, 0, 255, 255]}
                />
            );
            const { rerender } = renderOverlay(ui());
            const count = () =>
                contexts.reduce((sum, c) => sum + c.putImageData.mock.calls.length, 0);
            const before = count();
            rerender(ui());
            expect(count()).toBe(before);
        });
    });

    it('accepts nested row arrays for labels and infers the shape', () => {
        renderOverlay(
            <MaskOverlayCanvas
                labels={[
                    [1, 1],
                    [0, 2],
                ]}
            />,
        );
        expect(screen.getByText('Class 1')).toBeInTheDocument();
        expect(screen.getByText('Class 2')).toBeInTheDocument();
    });

    it('accepts a pre-rendered mask image url', () => {
        renderOverlay(
            <MaskOverlayCanvas
                imageUrl="https://example.test/base.png"
                maskImageUrl="https://example.test/mask.png"
                classes={[{ id: 1, label: 'Mask', color: '#ff00ff' }]}
            />,
        );
        expect(screen.getByText('Mask')).toBeInTheDocument();
        expect(screen.getByTestId('mask-overlay-mask-canvas')).toBeInTheDocument();
    });

    it('renders with no mask at all', () => {
        const { container } = renderOverlay(
            <MaskOverlayCanvas imageUrl="https://example.test/base.png" />,
        );
        expect(container.firstChild).toBeInTheDocument();
        expect(screen.queryByRole('list', { name: 'Mask classes' })).not.toBeInTheDocument();
    });

    it('places the legend below the canvas when legendPosition is bottom', () => {
        const { container } = renderOverlay(
            <MaskOverlayCanvas labels={LABELS} labelsShape={SHAPE} legendPosition="bottom" />,
        );
        expect(container.firstChild).toHaveClass('flex-col');
    });

    describe('size', () => {
        const box = () => screen.getByTestId('mask-overlay-canvas-box');

        it('gives a square image a square box of the preset length', () => {
            renderOverlay(<MaskOverlayCanvas labels={LABELS} labelsShape={SHAPE} size="small" />);
            expect(box()).toHaveStyle({ width: '16rem', height: '16rem' });
        });

        it('matches a landscape image ratio, with the width at the preset length', () => {
            renderOverlay(<MaskOverlayCanvas labels={new Array(8).fill(1)} labelsShape={[2, 4]} />);
            expect(box()).toHaveStyle({ width: '24rem', height: '12rem' });
        });

        it('matches a portrait image ratio, with the height at the preset length', () => {
            renderOverlay(
                <MaskOverlayCanvas
                    labels={new Array(8).fill(1)}
                    labelsShape={[4, 2]}
                    size="large"
                />,
            );
            expect(box()).toHaveStyle({ width: '20rem', height: '40rem' });
        });

        it('follows the base image shape when the image and mask differ in resolution', () => {
            renderOverlay(
                <MaskOverlayCanvas
                    image={new Float32Array(300 * 100)}
                    imageShape={[100, 300]}
                    labels={LABELS}
                    labelsShape={SHAPE}
                    size="small"
                />,
            );
            expect(box().style.width).toBe('16rem');
            expect(parseFloat(box().style.height)).toBeCloseTo(16 / 3, 10);
        });

        it('uses a square box until the image dimensions are known', () => {
            renderOverlay(<MaskOverlayCanvas imageUrl="https://example.test/pending.png" />);
            expect(box()).toHaveStyle({ width: '24rem', height: '24rem' });
        });

        it('shrinks the root to its content for fixed sizes', () => {
            const { container } = renderOverlay(
                <MaskOverlayCanvas labels={LABELS} labelsShape={SHAPE} size="small" />,
            );
            expect(container.firstChild).toHaveClass('w-fit');
        });

        it('wraps a bottom legend at the canvas width', () => {
            renderOverlay(
                <MaskOverlayCanvas
                    labels={new Array(8).fill(1)}
                    labelsShape={[2, 4]}
                    legendPosition="bottom"
                />,
            );
            expect(screen.getByRole('list', { name: 'Mask classes' })).toHaveStyle({
                width: '24rem',
            });
        });

        it('fills the parent with size="full" and sets no fixed box', () => {
            const { container } = renderOverlay(
                <MaskOverlayCanvas labels={LABELS} labelsShape={SHAPE} size="full" />,
            );
            expect(container.firstChild).toHaveClass('w-full', 'h-full');
            expect(box()).toHaveClass('flex-1');
            expect(box().style.width).toBe('');
        });
    });

    it('applies className, classNameCanvas and classNameLegend', () => {
        const { container } = renderOverlay(
            <MaskOverlayCanvas
                labels={LABELS}
                labelsShape={SHAPE}
                className="root-class"
                classNameCanvas="canvas-class"
                classNameLegend="legend-class"
            />,
        );
        expect(container.firstChild).toHaveClass('root-class');
        expect(container.querySelector('.canvas-class')).toBeInTheDocument();
        expect(screen.getByRole('list', { name: 'Mask classes' })).toHaveClass('legend-class');
    });

    it('passes arbitrary props through to the root element', () => {
        renderOverlay(
            <MaskOverlayCanvas labels={LABELS} labelsShape={SHAPE} data-testid="mask-overlay" />,
        );
        expect(screen.getByTestId('mask-overlay')).toBeInTheDocument();
    });

    it('defaults to the medium size so it renders sensibly standalone', () => {
        const { container } = renderOverlay(
            <MaskOverlayCanvas labels={LABELS} labelsShape={SHAPE} />,
        );
        expect(container.firstChild).toHaveClass('w-fit');
        expect(screen.getByTestId('mask-overlay-canvas-box')).toHaveStyle({
            width: '24rem',
            height: '24rem',
        });
    });

    it('marks the canvas as grabbable only when zoomable', () => {
        const { container, rerender } = renderOverlay(
            <MaskOverlayCanvas labels={LABELS} labelsShape={SHAPE} />,
        );
        expect(container.querySelector('.cursor-grab')).not.toBeInTheDocument();
        rerender(<MaskOverlayCanvas labels={LABELS} labelsShape={SHAPE} zoomable />);
        expect(container.querySelector('.cursor-grab')).toBeInTheDocument();
    });

    describe('zoom and pan', () => {
        it('cancels the page scroll for a wheel over a zoomable canvas', () => {
            renderOverlay(<MaskOverlayCanvas labels={LABELS} labelsShape={SHAPE} zoomable />);
            // fireEvent returns false when the default action was prevented.
            expect(fireEvent.wheel(surface(), { deltaY: -100, clientX: 100, clientY: 100 })).toBe(
                false,
            );
        });

        it('leaves the page scroll alone when not zoomable', () => {
            renderOverlay(<MaskOverlayCanvas labels={LABELS} labelsShape={SHAPE} />);
            expect(fireEvent.wheel(surface(), { deltaY: -100 })).toBe(true);
        });

        it('zooms in on a wheel notch', () => {
            renderOverlay(<MaskOverlayCanvas labels={LABELS} labelsShape={SHAPE} zoomable />);
            // A 4x4 image contained in a 200x200 box starts at 50 px per image pixel.
            expect(lastScale()).toBeCloseTo(50, 10);
            fireEvent.wheel(surface(), { deltaY: -100, clientX: 100, clientY: 100 });
            expect(lastScale()).toBeCloseTo(50 * 1.15, 10);
        });

        it('does not fire onClick at the end of a pan drag', () => {
            const onClick = vi.fn();
            renderOverlay(
                <MaskOverlayCanvas
                    labels={LABELS}
                    labelsShape={SHAPE}
                    zoomable
                    onClick={onClick}
                />,
            );
            fireEvent.pointerDown(surface(), { clientX: 60, clientY: 60, pointerId: 1 });
            fireEvent.pointerMove(surface(), { clientX: 90, clientY: 90, pointerId: 1 });
            fireEvent.pointerUp(surface(), { clientX: 90, clientY: 90, pointerId: 1 });
            fireEvent.click(surface(), { clientX: 90, clientY: 90 });
            expect(onClick).not.toHaveBeenCalled();
        });

        it('still fires onClick for a press that does not move', () => {
            const onClick = vi.fn();
            renderOverlay(
                <MaskOverlayCanvas
                    labels={LABELS}
                    labelsShape={SHAPE}
                    zoomable
                    onClick={onClick}
                />,
            );
            fireEvent.pointerDown(surface(), { clientX: 60, clientY: 60, pointerId: 1 });
            fireEvent.pointerMove(surface(), { clientX: 61, clientY: 61, pointerId: 1 });
            fireEvent.pointerUp(surface(), { clientX: 61, clientY: 61, pointerId: 1 });
            fireEvent.click(surface(), { clientX: 61, clientY: 61 });
            expect(onClick).toHaveBeenCalledOnce();
        });

        it('keeps the view for a same-sized image and resets it when the size changes', () => {
            const { rerender } = renderOverlay(
                <MaskOverlayCanvas labels={LABELS} labelsShape={SHAPE} zoomable />,
            );
            fireEvent.wheel(surface(), { deltaY: -100, clientX: 100, clientY: 100 });
            expect(lastScale()).toBeCloseTo(57.5, 10);

            // Different content, same 4x4 size: the viewport is preserved.
            rerender(
                <MaskOverlayCanvas labels={new Array(16).fill(2)} labelsShape={[4, 4]} zoomable />,
            );
            expect(lastScale()).toBeCloseTo(57.5, 10);

            // An 8x8 mask changes the coordinate space, so the view resets to fit.
            rerender(
                <MaskOverlayCanvas labels={new Array(64).fill(1)} labelsShape={[8, 8]} zoomable />,
            );
            expect(lastScale()).toBeCloseTo(25, 10);
        });
    });

    describe('image loading', () => {
        type FakeImage = {
            src: string;
            crossOrigin: string | null;
            onload: (() => void) | null;
            onerror: (() => void) | null;
        };
        let images: FakeImage[];

        beforeEach(() => {
            images = [];
            vi.stubGlobal(
                'Image',
                class {
                    crossOrigin: string | null = null;
                    onload: (() => void) | null = null;
                    onerror: (() => void) | null = null;
                    private url = '';
                    constructor() {
                        images.push(this as unknown as FakeImage);
                    }
                    get src() {
                        return this.url;
                    }
                    set src(value: string) {
                        this.url = value;
                    }
                },
            );
        });

        it('reports a failed load through onError and shows a message', async () => {
            const onError = vi.fn();
            renderOverlay(
                <MaskOverlayCanvas imageUrl="https://example.test/missing.png" onError={onError} />,
            );
            const img = images.find((i) => i.src === 'https://example.test/missing.png');
            expect(img).toBeDefined();
            act(() => img?.onerror?.());

            expect(onError).toHaveBeenCalledWith(
                'Failed to load https://example.test/missing.png',
                'image',
            );
            expect(await screen.findByRole('alert')).toHaveTextContent(
                'Error: failed to load image',
            );
        });

        it('strips the query string from the onError message', () => {
            const onError = vi.fn();
            const url = 'https://tiled.example.test/api/v1/array/full/scan?api_key=secret#frag';
            renderOverlay(<MaskOverlayCanvas imageUrl={url} onError={onError} />);
            const img = images.find((i) => i.src === url);
            act(() => img?.onerror?.());

            const [message] = onError.mock.calls[0];
            expect(message).toBe(
                'Failed to load https://tiled.example.test/api/v1/array/full/scan',
            );
            expect(message).not.toContain('api_key');
            expect(message).not.toContain('secret');
        });

        it('labels a mask load failure as the mask layer', () => {
            const onError = vi.fn();
            renderOverlay(
                <MaskOverlayCanvas
                    maskImageUrl="https://example.test/mask.png"
                    onError={onError}
                />,
            );
            const img = images.find((i) => i.src === 'https://example.test/mask.png');
            act(() => img?.onerror?.());
            expect(onError).toHaveBeenCalledWith(expect.any(String), 'mask');
            expect(screen.getByRole('alert')).toHaveTextContent('Error: failed to load mask');
        });

        it('leaves crossOrigin unset by default and applies it when given', () => {
            const { rerender } = renderOverlay(
                <MaskOverlayCanvas imageUrl="https://example.test/a.png" />,
            );
            expect(images.find((i) => i.src.endsWith('a.png'))?.crossOrigin).toBeNull();
            rerender(
                <MaskOverlayCanvas imageUrl="https://example.test/b.png" crossOrigin="anonymous" />,
            );
            expect(images.find((i) => i.src.endsWith('b.png'))?.crossOrigin).toBe('anonymous');
        });
    });

    describe('render stability', () => {
        const putCount = () =>
            contexts.reduce((sum, c) => sum + c.putImageData.mock.calls.length, 0);

        it('does not re-rasterize when shapes and classes are passed as fresh inline literals', () => {
            const image = new Float32Array(16);
            const ui = () => (
                <MaskOverlayCanvas
                    image={image}
                    imageShape={[4, 4]}
                    labels={LABELS}
                    labelsShape={[4, 4]}
                    classes={[
                        { id: 1, label: 'A', color: '#ff0000' },
                        { id: 2, label: 'B', color: '#00ff00' },
                    ]}
                />
            );
            const { rerender } = renderOverlay(ui());
            const before = putCount();
            expect(before).toBeGreaterThan(0);
            rerender(ui());
            rerender(ui());
            expect(putCount()).toBe(before);
        });

        it('re-rasterizes when a class actually changes', () => {
            const ui = (color: string) => (
                <MaskOverlayCanvas
                    labels={LABELS}
                    labelsShape={[4, 4]}
                    classes={[{ id: 1, label: 'A', color }]}
                />
            );
            const { rerender } = renderOverlay(ui('#ff0000'));
            const before = putCount();
            rerender(ui('#0000ff'));
            expect(putCount()).toBeGreaterThan(before);
        });
    });
});
