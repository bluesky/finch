import { render, screen, fireEvent } from '@testing-library/react';
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
        const toggle = screen.getByRole('button', { name: 'Hide Class 1' });
        fireEvent.click(toggle);

        expect(onClassVisibilityChange).toHaveBeenCalledWith(1, false);
        // Uncontrolled: the row state actually changes.
        expect(screen.getByRole('button', { name: 'Show Class 1' })).toBeInTheDocument();
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
        fireEvent.click(screen.getByRole('button', { name: 'Hide Class 1' }));

        expect(onClassVisibilityChange).toHaveBeenCalledWith(1, false);
        // Controlled: the prop still says visible, so the row is unchanged.
        expect(screen.getByRole('button', { name: 'Hide Class 1' })).toBeInTheDocument();
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
        expect(screen.getByRole('button', { name: 'Show Class 1' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Hide Class 2' })).toBeInTheDocument();
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

    it('disables image smoothing so class boundaries stay hard', () => {
        renderOverlay(<MaskOverlayCanvas labels={LABELS} labelsShape={SHAPE} />);
        const painted = contexts.filter((c) => c.setTransform.mock.calls.length > 0);
        expect(painted[painted.length - 1].imageSmoothingEnabled).toBe(false);
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

    it('applies the size prop to the root element', () => {
        const { container } = renderOverlay(
            <MaskOverlayCanvas labels={LABELS} labelsShape={SHAPE} size="small" />,
        );
        expect(container.firstChild).toHaveClass('w-64', 'h-64');
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

    it('marks the canvas as grabbable only when zoomable', () => {
        const { container, rerender } = renderOverlay(
            <MaskOverlayCanvas labels={LABELS} labelsShape={SHAPE} />,
        );
        expect(container.querySelector('.cursor-grab')).not.toBeInTheDocument();
        rerender(<MaskOverlayCanvas labels={LABELS} labelsShape={SHAPE} zoomable />);
        expect(container.querySelector('.cursor-grab')).toBeInTheDocument();
    });
});
