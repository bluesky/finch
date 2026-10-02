import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import HistogramRange from '../../components/HistogramRange';

/** Ten bins, so the default edges are 0..10 and edge indices equal data values. */
const COUNTS = [1, 2, 3, 4, 5, 5, 4, 3, 2, 1];

/** Track geometry the pointer maths is driven against; jsdom reports zeros otherwise. */
const RECT = { width: 200, height: 100, left: 0, top: 0 } as DOMRect;

beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(RECT);
    // Pointer capture is not implemented in the test DOM.
    HTMLElement.prototype.setPointerCapture = vi.fn();
    HTMLElement.prototype.releasePointerCapture = vi.fn();
    HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
});

afterEach(() => {
    vi.restoreAllMocks();
});

/** Horizontal: an x offset that lands on the given edge index of a ten-bin plot. */
const xFor = (idx: number, bins = 10) => (idx / bins) * RECT.width;
/** Vertical: a y offset that lands on the given edge index (low values at the bottom). */
const yFor = (idx: number) => RECT.height - (idx / 10) * RECT.height;

/** Bin indices drawn in a given bar path, read back from its `M{i},...` subpaths. */
const binsIn = (d: string | null) =>
    [...(d ?? '').matchAll(/M(\d+),/g)].map((m) => Number(m[1])).sort((a, b) => a - b);

const getTrack = () => screen.getByRole('group', { name: 'Histogram range' });

describe('HistogramRange', () => {
    it('renders without crashing', () => {
        const { container } = render(<HistogramRange counts={COUNTS} />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders two sliders spanning the full domain by default', () => {
        render(<HistogramRange counts={COUNTS} />);
        const sliders = screen.getAllByRole('slider');
        expect(sliders).toHaveLength(2);
        expect(sliders[0]).toHaveAttribute('aria-valuenow', '0');
        expect(sliders[1]).toHaveAttribute('aria-valuenow', '10');
        expect(sliders[0]).toHaveAttribute('aria-valuemin', '0');
        expect(sliders[0]).toHaveAttribute('aria-valuemax', '10');
    });

    it('renders a title when given one', () => {
        render(<HistogramRange counts={COUNTS} title="Intensity" />);
        expect(screen.getByText('Intensity')).toBeInTheDocument();
    });

    it('derives edges half a bin outside the first and last binCenters', () => {
        const binCenters = COUNTS.map((_, i) => i * 100);
        render(<HistogramRange counts={COUNTS} binCenters={binCenters} />);
        const sliders = screen.getAllByRole('slider');
        expect(sliders[0]).toHaveAttribute('aria-valuenow', '-50');
        expect(sliders[1]).toHaveAttribute('aria-valuenow', '950');
    });

    it('bins raw values and spans the full domain, not just the bin centers', () => {
        render(
            <HistogramRange values={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]} bins={5} domain={[0, 10]} />,
        );
        const sliders = screen.getAllByRole('slider');
        // Five bins over 0..10 have edges 0, 2, 4, 6, 8, 10.
        expect(sliders[0]).toHaveAttribute('aria-valuemin', '0');
        expect(sliders[0]).toHaveAttribute('aria-valuemax', '10');
    });

    it('uses binEdges for the domain and reported values', () => {
        render(<HistogramRange counts={[1, 1, 1]} binEdges={[-5, 0, 2.5, 100]} />);
        const sliders = screen.getAllByRole('slider');
        expect(sliders[0]).toHaveAttribute('aria-valuemin', '-5');
        expect(sliders[0]).toHaveAttribute('aria-valuemax', '100');
        expect(sliders[0]).toHaveAttribute('aria-valuenow', '-5');
        expect(sliders[1]).toHaveAttribute('aria-valuenow', '100');
    });

    it('ignores binEdges of the wrong length', () => {
        render(<HistogramRange counts={[1, 1, 1]} binEdges={[0, 1]} />);
        expect(screen.getAllByRole('slider')[1]).toHaveAttribute('aria-valuenow', '3');
    });

    describe('threshold semantics', () => {
        const EDGES = [0, 1, 2, 3, 4];
        const FLAT = [1, 1, 1, 1];

        it('reports the left edge of the first and the right edge of the last included bin', () => {
            const { container } = render(
                <HistogramRange counts={FLAT} binEdges={EDGES} value={[1, 3]} />,
            );
            const sliders = screen.getAllByRole('slider');
            expect(sliders[0]).toHaveAttribute('aria-valuenow', '1');
            expect(sliders[1]).toHaveAttribute('aria-valuenow', '3');
            // Selection [1, 3] covers bins 1 and 2 only.
            const unfaded = container.querySelector('path[data-faded="false"]');
            const faded = container.querySelectorAll('path[data-faded="true"]');
            expect(binsIn(unfaded?.getAttribute('d') ?? null)).toEqual([1, 2]);
            expect(binsIn([...faded].map((p) => p.getAttribute('d')).join(''))).toEqual([0, 3]);
        });

        it('reports [1, 3] when bins 1 and 2 are selected by dragging', () => {
            const onChangeCommitted = vi.fn();
            render(
                <HistogramRange
                    counts={FLAT}
                    binEdges={EDGES}
                    onChangeCommitted={onChangeCommitted}
                />,
            );
            const track = getTrack();
            // Lower handle onto edge 1, then upper handle onto edge 3.
            fireEvent.pointerDown(track, { clientX: xFor(1, 4), clientY: 0, pointerId: 1 });
            fireEvent.pointerUp(track, { clientX: xFor(1, 4), clientY: 0, pointerId: 1 });
            fireEvent.pointerDown(track, { clientX: xFor(3, 4), clientY: 0, pointerId: 1 });
            fireEvent.pointerUp(track, { clientX: xFor(3, 4), clientY: 0, pointerId: 1 });

            const [range, percentiles] = onChangeCommitted.mock.calls[1];
            expect(range).toEqual([1, 3]);
            // One of four bins lies below edge 1, three of four below edge 3.
            expect(percentiles).toEqual([25, 75]);
        });

        it('rounds a value exactly halfway between edges up, deterministically', () => {
            render(<HistogramRange counts={FLAT} binEdges={EDGES} value={[0.5, 2.5]} />);
            const sliders = screen.getAllByRole('slider');
            expect(sliders[0]).toHaveAttribute('aria-valuenow', '1');
            expect(sliders[1]).toHaveAttribute('aria-valuenow', '3');
        });

        it('snaps values to the nearest edge for irregular binCenters', () => {
            // Centers 1, 2, 4, 8 give edges 0.5, 1.5, 3, 6, 10.
            render(<HistogramRange counts={FLAT} binCenters={[1, 2, 4, 8]} value={[2.9, 6.1]} />);
            const sliders = screen.getAllByRole('slider');
            expect(sliders[0]).toHaveAttribute('aria-valuemin', '0.5');
            expect(sliders[0]).toHaveAttribute('aria-valuemax', '10');
            expect(sliders[0]).toHaveAttribute('aria-valuenow', '3');
            expect(sliders[1]).toHaveAttribute('aria-valuenow', '6');
        });
    });

    it('prefers counts over values when both are supplied', () => {
        render(<HistogramRange counts={COUNTS} values={[0, 0, 0]} bins={2} />);
        expect(screen.getAllByRole('slider')[1]).toHaveAttribute('aria-valuenow', '10');
    });

    it('honours defaultValue', () => {
        render(<HistogramRange counts={COUNTS} defaultValue={[2, 8]} />);
        const sliders = screen.getAllByRole('slider');
        expect(sliders[0]).toHaveAttribute('aria-valuenow', '2');
        expect(sliders[1]).toHaveAttribute('aria-valuenow', '8');
    });

    it('is controlled when value is supplied', () => {
        const { rerender } = render(<HistogramRange counts={COUNTS} value={[3, 7]} />);
        expect(screen.getAllByRole('slider')[0]).toHaveAttribute('aria-valuenow', '3');

        // An interaction must not move a controlled handle on its own.
        fireEvent.pointerDown(getTrack(), { clientX: xFor(5), clientY: 0, pointerId: 1 });
        expect(screen.getAllByRole('slider')[0]).toHaveAttribute('aria-valuenow', '3');

        rerender(<HistogramRange counts={COUNTS} value={[1, 9]} />);
        expect(screen.getAllByRole('slider')[0]).toHaveAttribute('aria-valuenow', '1');
    });

    it('calls onChange and onChangeCommitted with data units when a handle is dragged', () => {
        const onChange = vi.fn();
        const onChangeCommitted = vi.fn();
        render(
            <HistogramRange
                counts={COUNTS}
                onChange={onChange}
                onChangeCommitted={onChangeCommitted}
            />,
        );
        const track = getTrack();
        fireEvent.pointerDown(track, { clientX: xFor(3), clientY: 0, pointerId: 1 });
        fireEvent.pointerUp(track, { clientX: xFor(3), clientY: 0, pointerId: 1 });

        expect(onChange).toHaveBeenCalled();
        expect(onChange.mock.calls[onChange.mock.calls.length - 1][0]).toEqual([3, 10]);
        expect(onChangeCommitted).toHaveBeenCalledOnce();
        expect(onChangeCommitted.mock.calls[0][0]).toEqual([3, 10]);
    });

    it('reports percentiles of the distribution as the second callback argument', () => {
        const onChangeCommitted = vi.fn();
        // A flat distribution makes the expected percentile easy to state.
        const flat = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
        render(<HistogramRange counts={flat} onChangeCommitted={onChangeCommitted} />);
        const track = getTrack();
        fireEvent.pointerDown(track, { clientX: xFor(4), clientY: 0, pointerId: 1 });
        fireEvent.pointerUp(track, { clientX: xFor(4), clientY: 0, pointerId: 1 });

        const [, percentiles] = onChangeCommitted.mock.calls[0];
        // Four of ten bins lie below edge 4.
        expect(percentiles[0]).toBeCloseTo(40, 10);
        expect(percentiles[1]).toBe(100);
    });

    it('drags the upper handle when the pointer is nearer to it', () => {
        const onChangeCommitted = vi.fn();
        render(<HistogramRange counts={COUNTS} onChangeCommitted={onChangeCommitted} />);
        const track = getTrack();
        fireEvent.pointerDown(track, { clientX: xFor(8), clientY: 0, pointerId: 1 });
        fireEvent.pointerUp(track, { clientX: xFor(8), clientY: 0, pointerId: 1 });
        expect(onChangeCommitted.mock.calls[0][0]).toEqual([0, 8]);
    });

    it('pans the whole band when the pointer starts well inside the selection', () => {
        const onChangeCommitted = vi.fn();
        render(
            <HistogramRange
                counts={COUNTS}
                defaultValue={[2, 8]}
                onChangeCommitted={onChangeCommitted}
            />,
        );
        const track = getTrack();
        fireEvent.pointerDown(track, { clientX: xFor(5), clientY: 0, pointerId: 1 });
        fireEvent.pointerMove(track, { clientX: xFor(6), clientY: 0, pointerId: 1 });
        fireEvent.pointerUp(track, { clientX: xFor(6), clientY: 0, pointerId: 1 });
        // The window keeps its width of six bins and shifts by one.
        expect(onChangeCommitted.mock.calls[0][0]).toEqual([3, 9]);
    });

    it('clamps a band drag so the window stays inside the domain', () => {
        const onChangeCommitted = vi.fn();
        render(
            <HistogramRange
                counts={COUNTS}
                defaultValue={[2, 8]}
                onChangeCommitted={onChangeCommitted}
            />,
        );
        const track = getTrack();
        fireEvent.pointerDown(track, { clientX: xFor(5), clientY: 0, pointerId: 1 });
        fireEvent.pointerMove(track, { clientX: xFor(10), clientY: 0, pointerId: 1 });
        fireEvent.pointerUp(track, { clientX: xFor(10), clientY: 0, pointerId: 1 });
        expect(onChangeCommitted.mock.calls[0][0]).toEqual([4, 10]);
    });

    it('enforces minBinSeparation between the handles', () => {
        const onChangeCommitted = vi.fn();
        render(
            <HistogramRange
                counts={COUNTS}
                defaultValue={[0, 4]}
                minBinSeparation={3}
                onChangeCommitted={onChangeCommitted}
            />,
        );
        const track = getTrack();
        // Aiming the lower handle at bin 2 must stop three bins short of the upper one.
        fireEvent.pointerDown(track, { clientX: xFor(2), clientY: 0, pointerId: 1 });
        fireEvent.pointerUp(track, { clientX: xFor(2), clientY: 0, pointerId: 1 });
        expect(onChangeCommitted.mock.calls[0][0]).toEqual([1, 4]);
    });

    it('grabs whichever handle the pointer is nearest, not always the lower one', () => {
        const onChangeCommitted = vi.fn();
        render(<HistogramRange counts={COUNTS} onChangeCommitted={onChangeCommitted} />);
        const track = getTrack();
        fireEvent.pointerDown(track, { clientX: xFor(9), clientY: 0, pointerId: 1 });
        fireEvent.pointerUp(track, { clientX: xFor(9), clientY: 0, pointerId: 1 });
        expect(onChangeCommitted.mock.calls[0][0]).toEqual([0, 9]);
    });

    it('moves the focused handle with arrow keys and Shift for a larger step', () => {
        const onChangeCommitted = vi.fn();
        render(<HistogramRange counts={COUNTS} onChangeCommitted={onChangeCommitted} />);
        const [lo] = screen.getAllByRole('slider');

        fireEvent.keyDown(lo, { key: 'ArrowRight' });
        expect(screen.getAllByRole('slider')[0]).toHaveAttribute('aria-valuenow', '1');

        fireEvent.keyDown(screen.getAllByRole('slider')[0], { key: 'ArrowRight', shiftKey: true });
        expect(screen.getAllByRole('slider')[0]).toHaveAttribute('aria-valuenow', '9');
        expect(onChangeCommitted).toHaveBeenCalledTimes(2);
    });

    it('moves the upper handle with Home and End', () => {
        render(<HistogramRange counts={COUNTS} defaultValue={[0, 5]} />);
        const hi = screen.getAllByRole('slider')[1];
        fireEvent.keyDown(hi, { key: 'End' });
        expect(screen.getAllByRole('slider')[1]).toHaveAttribute('aria-valuenow', '10');
        fireEvent.keyDown(screen.getAllByRole('slider')[1], { key: 'Home' });
        // Cannot cross the lower handle, so it stops one bin above it.
        expect(screen.getAllByRole('slider')[1]).toHaveAttribute('aria-valuenow', '1');
    });

    it('ignores unrelated keys', () => {
        const onChangeCommitted = vi.fn();
        render(<HistogramRange counts={COUNTS} onChangeCommitted={onChangeCommitted} />);
        fireEvent.keyDown(screen.getAllByRole('slider')[0], { key: 'a' });
        expect(onChangeCommitted).not.toHaveBeenCalled();
    });

    it('inverts the pointer mapping when vertical', () => {
        const onChangeCommitted = vi.fn();
        render(
            <HistogramRange
                counts={COUNTS}
                orientation="vertical"
                onChangeCommitted={onChangeCommitted}
            />,
        );
        const track = getTrack();
        // Near the bottom of a vertical plot is a low value.
        fireEvent.pointerDown(track, { clientX: 0, clientY: yFor(2), pointerId: 1 });
        fireEvent.pointerUp(track, { clientX: 0, clientY: yFor(2), pointerId: 1 });
        expect(onChangeCommitted.mock.calls[0][0]).toEqual([2, 10]);
        expect(screen.getAllByRole('slider')[0]).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('hides the handles and ignores pointer input when readOnly', () => {
        const onChange = vi.fn();
        render(<HistogramRange counts={COUNTS} readOnly onChange={onChange} />);
        expect(screen.queryAllByRole('slider')).toHaveLength(0);
        fireEvent.pointerDown(getTrack(), { clientX: xFor(5), clientY: 0, pointerId: 1 });
        expect(onChange).not.toHaveBeenCalled();
    });

    it('renders faded and unfaded bar runs when the selection is partial', () => {
        const { container } = render(<HistogramRange counts={COUNTS} defaultValue={[3, 7]} />);
        const paths = container.querySelectorAll('path');
        expect(paths.length).toBeGreaterThan(1);
        expect(container.querySelector('path.fill-slate-300')).toBeInTheDocument();
        expect(container.querySelector('path.fill-slate-500')).toBeInTheDocument();
    });

    it('draws bars as filled one-bin rectangles rather than hairline strokes', () => {
        const { container } = render(<HistogramRange counts={COUNTS} />);
        const path = container.querySelector('path') as SVGPathElement;
        expect(path.getAttribute('class')).not.toMatch(/stroke-/);
        expect(path).not.toHaveAttribute('vector-effect');
        // Each bar is a closed one-unit-wide rectangle starting at its bin index.
        expect(path.getAttribute('d')).toMatch(/^M0,44h1v-[\d.]+h-1z/);
        expect(binsIn(path.getAttribute('d'))).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('draws a single unfaded run when fadeOutsideSelection is false', () => {
        const { container } = render(
            <HistogramRange counts={COUNTS} defaultValue={[3, 7]} fadeOutsideSelection={false} />,
        );
        expect(container.querySelectorAll('path')).toHaveLength(1);
        expect(container.querySelector('path.fill-slate-300')).not.toBeInTheDocument();
    });

    it('renders bars for a linear count axis without crashing', () => {
        const { container } = render(<HistogramRange counts={COUNTS} logCounts={false} />);
        expect(container.querySelector('path')).toBeInTheDocument();
    });

    it('renders an empty plot for empty counts without crashing', () => {
        const { container } = render(<HistogramRange counts={[]} />);
        expect(container.firstChild).toBeInTheDocument();
        expect(screen.queryAllByRole('slider')).toHaveLength(0);
    });

    it('applies a custom aria-label to the group and both handles', () => {
        render(<HistogramRange counts={COUNTS} ariaLabel="Display levels" />);
        expect(screen.getByRole('group', { name: 'Display levels' })).toBeInTheDocument();
        expect(screen.getByRole('slider', { name: 'Display levels minimum' })).toBeInTheDocument();
        expect(screen.getByRole('slider', { name: 'Display levels maximum' })).toBeInTheDocument();
    });

    it('applies the size prop to the root element', () => {
        const { container } = render(<HistogramRange counts={COUNTS} size="small" />);
        expect(container.firstChild).toHaveClass('w-48', 'h-24');
    });

    it('defaults to the medium size so it renders sensibly standalone', () => {
        const { container } = render(<HistogramRange counts={COUNTS} />);
        expect(container.firstChild).toHaveClass('w-80', 'h-32');
    });

    it('applies classNameSelection to the selection highlight', () => {
        const { container } = render(
            <HistogramRange counts={COUNTS} classNameSelection="selection-class" />,
        );
        expect(container.querySelector('rect')).toHaveClass('selection-class');
    });

    it('applies className, classNamePlot, classNameHandle and classNameTitle', () => {
        const { container } = render(
            <HistogramRange
                counts={COUNTS}
                title="Levels"
                className="root-class"
                classNamePlot="plot-class"
                classNameHandle="handle-class"
                classNameTitle="title-class"
            />,
        );
        expect(container.firstChild).toHaveClass('root-class');
        expect(getTrack()).toHaveClass('plot-class');
        expect(screen.getAllByRole('slider')[0]).toHaveClass('handle-class');
        expect(screen.getByText('Levels')).toHaveClass('title-class');
    });

    it('passes arbitrary props through to the root element', () => {
        render(<HistogramRange counts={COUNTS} data-testid="histogram-range" />);
        expect(screen.getByTestId('histogram-range')).toBeInTheDocument();
    });

    describe('animation-frame throttling', () => {
        let frames: Map<number, FrameRequestCallback>;
        let nextId: number;

        beforeEach(() => {
            frames = new Map();
            nextId = 1;
            vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
                const id = nextId++;
                frames.set(id, cb);
                return id;
            });
            vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
                frames.delete(id);
            });
        });

        const flushFrames = () => {
            const pending = [...frames.values()];
            frames.clear();
            pending.forEach((cb) => cb(performance.now()));
        };

        it('coalesces a burst of pointer moves into one onChange per frame', () => {
            const onChange = vi.fn();
            render(<HistogramRange counts={COUNTS} onChange={onChange} />);
            const track = getTrack();
            fireEvent.pointerDown(track, { clientX: xFor(1), clientY: 0, pointerId: 1 });
            fireEvent.pointerMove(track, { clientX: xFor(2), clientY: 0, pointerId: 1 });
            fireEvent.pointerMove(track, { clientX: xFor(3), clientY: 0, pointerId: 1 });
            fireEvent.pointerMove(track, { clientX: xFor(4), clientY: 0, pointerId: 1 });

            expect(onChange).not.toHaveBeenCalled();
            flushFrames();
            expect(onChange).toHaveBeenCalledTimes(1);
            // The frame reports the latest position, not the first.
            expect(onChange.mock.calls[0][0]).toEqual([4, 10]);
        });

        it('flushes the pending frame on pointer-up before committing', () => {
            const onChange = vi.fn();
            const onChangeCommitted = vi.fn();
            render(
                <HistogramRange
                    counts={COUNTS}
                    onChange={onChange}
                    onChangeCommitted={onChangeCommitted}
                />,
            );
            const track = getTrack();
            fireEvent.pointerDown(track, { clientX: xFor(1), clientY: 0, pointerId: 1 });
            fireEvent.pointerMove(track, { clientX: xFor(5), clientY: 0, pointerId: 1 });
            fireEvent.pointerUp(track, { clientX: xFor(5), clientY: 0, pointerId: 1 });

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange.mock.calls[0][0]).toEqual([5, 10]);
            expect(onChangeCommitted).toHaveBeenCalledWith([5, 10], expect.any(Array));
            expect(onChange.mock.invocationCallOrder[0]).toBeLessThan(
                onChangeCommitted.mock.invocationCallOrder[0],
            );
            // The queued frame was cancelled, so flushing adds no extra call.
            flushFrames();
            expect(onChange).toHaveBeenCalledTimes(1);
        });

        it('does not repeat onChange on pointer-up when the frame already ran', () => {
            const onChange = vi.fn();
            const onChangeCommitted = vi.fn();
            render(
                <HistogramRange
                    counts={COUNTS}
                    onChange={onChange}
                    onChangeCommitted={onChangeCommitted}
                />,
            );
            const track = getTrack();
            fireEvent.pointerDown(track, { clientX: xFor(1), clientY: 0, pointerId: 1 });
            fireEvent.pointerMove(track, { clientX: xFor(5), clientY: 0, pointerId: 1 });
            flushFrames();
            expect(onChange).toHaveBeenCalledTimes(1);

            fireEvent.pointerUp(track, { clientX: xFor(5), clientY: 0, pointerId: 1 });

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChangeCommitted).toHaveBeenCalledOnce();
            expect(onChangeCommitted.mock.calls[0][0]).toEqual([5, 10]);
        });
    });
});
