import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import HistogramRange from '../../components/HistogramRange/HistogramRange';
import type { HistogramRangeProps } from '../../components/HistogramRange/HistogramRange';

/** Ten bins with edges 0..10, so edge indices equal data values. */
const COUNTS = [1, 2, 3, 4, 5, 5, 4, 3, 2, 1];
const EDGES = Array.from({ length: 11 }, (_, i) => i);

/** Plot geometry the pointer maths is driven against; jsdom reports zeros otherwise. */
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

function setup(props: Partial<HistogramRangeProps> = {}) {
    const onChange = vi.fn();
    const onChangeCommitted = vi.fn();
    const all: HistogramRangeProps = {
        counts: COUNTS,
        binEdges: EDGES,
        value: [2, 5],
        onChange,
        onChangeCommitted,
        ...props,
    };
    const utils = render(<HistogramRange {...all} />);
    return { ...utils, onChange, onChangeCommitted, props: all };
}

const sliders = () => screen.getAllByRole('slider');
const valueNow = (el: HTMLElement) => Number(el.getAttribute('aria-valuenow'));
const plot = () => screen.getByRole('group', { name: 'Histogram range' });
const band = (c: HTMLElement) => c.querySelector('[data-role="band"]') as HTMLElement;
const handleEl = (c: HTMLElement, which: 'lo' | 'hi') =>
    c.querySelector(`[data-role="handle-${which}"]`) as HTMLElement;
/** A horizontal pointer x that lands on edge `idx` of a ten-bin, 0..10 plot. */
const xFor = (idx: number) => (idx / 10) * RECT.width;
/** A vertical pointer y that lands on edge `idx` (low values at the bottom). */
const yFor = (idx: number) => RECT.height - (idx / 10) * RECT.height;

/** Bar runs read back from the SVG: faded flag and their extent in view-box units (0..1000). */
function runs(c: HTMLElement) {
    return [...c.querySelectorAll('svg path')].map((p) => {
        const d = p.getAttribute('d') ?? '';
        const xs = [...d.matchAll(/[MH](-?[\d.]+)/g)].map((m) => Number(m[1]));
        return { faded: p.hasAttribute('data-faded'), from: xs[0], to: xs[xs.length - 1], d };
    });
}

const press = (el: Element, x: number, y = 50) =>
    fireEvent.pointerDown(el, { clientX: x, clientY: y, pointerId: 1 });
const move = (x: number, y = 50) =>
    fireEvent.pointerMove(plot(), { clientX: x, clientY: y, pointerId: 1 });
const release = (x: number, y = 50) =>
    fireEvent.pointerUp(plot(), { clientX: x, clientY: y, pointerId: 1 });

describe('HistogramRange', () => {
    describe('threshold semantics', () => {
        it('selects from the left edge of the first included bin to the right edge of the last', () => {
            const { container } = setup({ value: [1, 3] });
            const [lo, hi] = sliders();
            expect(valueNow(lo)).toBe(1);
            expect(valueNow(hi)).toBe(3);
            // Bins 1 and 2 are drawn as included; bin 0 and bins 3..9 are faded.
            expect(runs(container).map(({ faded, from, to }) => [faded, from, to])).toEqual([
                [true, 0, 100],
                [false, 100, 300],
                [true, 300, 1000],
            ]);
            // The selection area, a styling hook like data-faded, spans the same edges.
            const selection = container.querySelector('[data-selection]');
            expect(Number(selection?.getAttribute('x'))).toBeCloseTo(100, 6);
            expect(Number(selection?.getAttribute('width'))).toBeCloseTo(200, 6);
        });

        it('reports the supplied edges exactly, on a linear or a log axis', () => {
            const binEdges = [3, 7.3, 21.9, 123.456, 987.65];
            for (const valueScale of ['linear', 'log'] as const) {
                const { onChange, unmount } = setup({
                    counts: [1, 1, 1, 1],
                    binEdges,
                    value: null,
                    valueScale,
                });
                fireEvent.keyDown(sliders()[0], { key: 'ArrowRight' });
                fireEvent.keyDown(sliders()[1], { key: 'ArrowLeft' });
                expect(onChange.mock.calls[0][0]).toEqual([7.3, 987.65]);
                expect(onChange.mock.calls[1][0]).toEqual([3, 123.456]);
                for (const [range] of onChange.mock.calls) {
                    for (const v of range) expect(binEdges).toContain(v);
                }
                unmount();
            }
        });

        it('reports the percentage of the population below each edge', () => {
            const { onChange } = setup({
                counts: [1, 1, 1, 1],
                binEdges: [0, 1, 2, 3, 4],
                value: null,
            });
            fireEvent.keyDown(sliders()[0], { key: 'ArrowRight' });
            expect(onChange).toHaveBeenCalledWith([1, 4], [25, 100]);
            fireEvent.keyDown(sliders()[1], { key: 'Home' });
            expect(onChange).toHaveBeenLastCalledWith([0, 1], [0, 25]);
        });

        it('reports the share of bins when every count is zero, so a full span is still [0, 100]', () => {
            const { onChange } = setup({
                counts: [0, 0, 0, 0],
                binEdges: [0, 1, 2, 3, 4],
                value: null,
            });
            fireEvent.keyDown(sliders()[0], { key: 'ArrowRight' });
            expect(onChange).toHaveBeenCalledWith([1, 4], [25, 100]);
        });

        it('leaves negative and NaN counts out of the percentiles and draws them as zero', () => {
            const { onChange, container } = setup({
                counts: [-5, NaN, 4],
                binEdges: [0, 1, 2, 3],
                value: [1, 3],
            });
            fireEvent.keyDown(sliders()[0], { key: 'ArrowRight' });
            expect(onChange).toHaveBeenCalledWith([2, 3], [0, 100]);
            expect(runs(container)[0].d).toContain('V1000 H333');
        });
    });

    describe('controlled value', () => {
        it('snaps a value between edges to the nearest edge, rounding exactly halfway up', () => {
            setup({ value: [1.5, 3.4] });
            expect(sliders().map(valueNow)).toEqual([2, 3]);
        });

        it('snaps on the display scale: arithmetic on linear edges, geometric under log', () => {
            const props = { counts: [1, 1], binEdges: [10, 100, 1000] };
            setup({ ...props, value: [31, 33] });
            expect(sliders().map(valueNow)).toEqual([10, 10]);
            document.body.innerHTML = '';
            // The geometric midpoint of 10 and 100 is 31.6.
            setup({ ...props, value: [31, 33], valueScale: 'log' });
            expect(sliders().map(valueNow)).toEqual([10, 100]);
        });

        it('snaps on irregular edges', () => {
            setup({ counts: [1, 1, 1, 1], binEdges: [0, 1, 4, 9, 16], value: [2.4, 2.6] });
            expect(sliders().map(valueNow)).toEqual([1, 4]);
        });

        it('sorts a reversed value and clamps it to the domain', () => {
            const { rerender, props } = setup({ value: [8, 2] });
            expect(sliders().map(valueNow)).toEqual([2, 8]);
            rerender(<HistogramRange {...props} value={[-5, 50]} />);
            expect(sliders().map(valueNow)).toEqual([0, 10]);
        });

        it('selects the whole domain for null', () => {
            setup({ value: null });
            expect(sliders().map(valueNow)).toEqual([0, 10]);
        });

        it('re-snaps the value when the histogram changes after mount', () => {
            const { rerender, props } = setup({ value: [2, 6] });
            rerender(<HistogramRange {...props} counts={[1, 1]} binEdges={[0, 5, 10]} />);
            expect(sliders().map(valueNow)).toEqual([0, 5]);
        });
    });

    describe('data validation', () => {
        it('renders "No data" without warning while counts and edges are both empty', () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            setup({ counts: [], binEdges: [], value: null });
            expect(screen.getByText('No data')).toBeInTheDocument();
            expect(screen.queryAllByRole('slider')).toHaveLength(0);
            expect(warn).not.toHaveBeenCalled();
        });

        it('warns once and draws nothing when binEdges does not have counts.length + 1 entries', () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const { rerender, props } = setup({ counts: [1, 2], binEdges: [0, 1] });
            rerender(<HistogramRange {...props} />);
            expect(screen.getByText('No data')).toBeInTheDocument();
            expect(warn).toHaveBeenCalledTimes(1);
            expect(warn.mock.calls[0][0]).toContain('expected counts.length + 1 = 3');
        });

        it('starts a log axis at the first positive edge and does not draw the bins before it', () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const { container, onChange } = setup({
                counts: [5, 1, 1, 1],
                binEdges: [0, 1, 10, 100, 1000],
                value: null,
                valueScale: 'log',
            });
            // Bin 0 ([0, 1), five dead pixels) is not drawn; bins 1..3 fill the axis in thirds.
            const [run] = runs(container);
            expect(runs(container)).toHaveLength(1);
            expect(run.d.startsWith('M0,1000')).toBe(true);
            const xs = [...run.d.matchAll(/H([\d.]+)/g)].map((m) => Number(m[1]));
            expect(xs).toHaveLength(3);
            expect(xs[0]).toBeCloseTo(333.33, 1);
            // It still counts in the percentiles, and its edge is still a threshold.
            fireEvent.keyDown(sliders()[1], { key: 'ArrowLeft' });
            expect(onChange).toHaveBeenLastCalledWith([0, 100], [0, 87.5]);
            fireEvent.keyDown(sliders()[0], { key: 'ArrowRight' });
            expect(onChange).toHaveBeenLastCalledWith([1, 1000], [62.5, 100]);
            expect(warn).not.toHaveBeenCalled();
        });

        it('never picks an undrawn edge with the pointer', () => {
            const { onChange, container } = setup({
                counts: [5, 1, 1, 1],
                binEdges: [0, 1, 10, 100, 1000],
                value: [10, 1000],
                valueScale: 'log',
            });
            press(plot(), 0);
            expect(onChange).toHaveBeenLastCalledWith([1, 1000], expect.any(Array));
            release(0);
            press(band(container), 100);
            move(0);
            expect(onChange).not.toHaveBeenLastCalledWith(
                [0, expect.any(Number)],
                expect.any(Array),
            );
        });

        it('warns once and draws a linear axis when fewer than two edges are positive', () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const { container, onChange } = setup({
                counts: [1, 1, 1],
                binEdges: [-2, -1, 0, 1],
                value: null,
                valueScale: 'log',
            });
            expect(warn).toHaveBeenCalledTimes(1);
            expect(warn.mock.calls[0][0]).toContain('at least two strictly positive binEdges');
            expect(runs(container)[0].d).toMatch(/H333\.\d+ .*H666\.\d+ .*H1000/);
            fireEvent.keyDown(sliders()[0], { key: 'ArrowRight' });
            expect(onChange).toHaveBeenCalledWith([-1, 1], [expect.closeTo(100 / 3, 9), 100]);
        });
    });

    describe('geometry', () => {
        it('draws irregular bins at their true widths', () => {
            const { container } = setup({
                counts: [1, 1, 1],
                binEdges: [0, 1, 3, 10],
                value: null,
            });
            const [run] = runs(container);
            expect(run.d).toMatch(/H100 .*H300 .*H1000/);
        });

        it('draws log-spaced bins equally wide under valueScale="log"', () => {
            const { container } = setup({
                counts: [1, 1, 1],
                binEdges: [1, 10, 100, 1000],
                value: null,
                valueScale: 'log',
            });
            const xs = [...runs(container)[0].d.matchAll(/H([\d.]+)/g)].map((m) => Number(m[1]));
            expect(xs[0]).toBeCloseTo(333.33, 1);
            expect(xs[1]).toBeCloseTo(666.67, 1);
            expect(xs[2]).toBeCloseTo(1000, 6);
        });

        it('compresses linear bins toward the top of a log axis', () => {
            const { container } = setup({
                counts: [1, 1],
                binEdges: [1, 500.5, 1000],
                value: null,
                valueScale: 'log',
            });
            const [first] = [...runs(container)[0].d.matchAll(/H([\d.]+)/g)].map((m) =>
                Number(m[1]),
            );
            expect(first).toBeCloseTo((Math.log10(500.5) / 3) * 1000, 1);
        });

        it('draws the reference range at its exact data positions, compared by value', () => {
            const { container, rerender, props } = setup({
                value: null,
                referenceRange: [2.5, 7.25],
            });
            const rect = container.querySelector('[data-testid="histogram-range-reference"]');
            expect(rect).toHaveAttribute('x', '250');
            expect(rect).toHaveAttribute('width', '475');
            rerender(<HistogramRange {...props} referenceRange={[2.5, 7.25]} />);
            expect(container.querySelector('[data-testid="histogram-range-reference"]')).toBe(rect);
            rerender(<HistogramRange {...props} referenceRange={[-5, 20]} />);
            expect(rect).toHaveAttribute('x', '0');
            expect(rect).toHaveAttribute('width', '1000');
            // Amber (#fbbf24) by default; referenceColor tints it instead.
            expect((rect as SVGRectElement).style.fill).toMatch(/#fbbf24|rgb\(251, 191, 36\)/);
            expect((rect as SVGRectElement).style.fillOpacity).toBe('0.25');
            rerender(
                <HistogramRange
                    {...props}
                    referenceRange={[2.5, 7.25]}
                    referenceColor="rgb(124, 58, 237)"
                />,
            );
            expect((rect as SVGRectElement).style.fill).toBe('rgb(124, 58, 237)');
            expect((rect as SVGRectElement).style.fillOpacity).toBe('0.25');
        });
    });

    describe('axes', () => {
        const labels = (testId: string) =>
            [...screen.getByTestId(testId).querySelectorAll('span.absolute')].map(
                (s) => s.textContent,
            );

        it('draws both axes linear by default', () => {
            setup({ counts: [0, 10, 4], binEdges: [0, 1, 2, 3], value: null });
            expect(labels('histogram-range-side-axis')).toEqual(['0', '2', '4', '6', '8', '10']);
        });

        it('labels a linear value axis in data units and a log1p count axis at decades', () => {
            setup({
                counts: [0, 5000, 20, 1],
                binEdges: [0, 250, 500, 750, 1000],
                value: null,
                countScale: 'log',
                valueAxisTitle: 'Intensity',
            });
            expect(labels('histogram-range-bottom-axis')).toEqual([
                '0',
                '200',
                '400',
                '600',
                '800',
                '1000',
            ]);
            // Labelled like a log value axis, with unlabelled minor ticks at 2–9 x each decade.
            const countTicks = labels('histogram-range-side-axis');
            expect(countTicks.filter(Boolean)).toEqual(['0', '1', '10', '100', '1e+3']);
            expect(countTicks.filter((l) => l === '')).toHaveLength(8 * 3 + 4);
            expect(screen.getByText('Intensity')).toBeInTheDocument();
            expect(screen.getByText('Counts')).toBeInTheDocument();
        });

        it('labels a log value axis at decades, independent of a linear count axis', () => {
            setup({
                counts: [1, 10, 4],
                binEdges: [1, 10, 100, 1000],
                value: null,
                valueScale: 'log',
                countScale: 'linear',
                countAxisTitle: 'Pixels',
            });
            expect(labels('histogram-range-bottom-axis').filter(Boolean)).toEqual([
                '1',
                '10',
                '100',
                '1e+3',
            ]);
            expect(labels('histogram-range-side-axis')).toEqual(['0', '2', '4', '6', '8', '10']);
            expect(screen.getByText('Pixels')).toBeInTheDocument();
        });

        it('puts the value axis at the side when vertical', () => {
            setup({ orientation: 'vertical', value: null });
            expect(labels('histogram-range-side-axis')).toEqual(['0', '2', '4', '6', '8', '10']);
        });

        it('prints plain numbers on linear axes below a million, and 3 digits from there', () => {
            setup({ counts: [25000, 1], binEdges: [0, 6000, 12000], value: null });
            expect(labels('histogram-range-bottom-axis')).toEqual([
                '0',
                '2000',
                '4000',
                '6000',
                '8000',
                '10000',
                '12000',
            ]);
            expect(labels('histogram-range-side-axis')).toEqual([
                '0',
                '5000',
                '10000',
                '15000',
                '20000',
                '25000',
            ]);
            document.body.innerHTML = '';
            setup({ counts: [1, 1], binEdges: [0, 2e6, 4e6], value: null });
            expect(labels('histogram-range-bottom-axis')).toContain('2e+6');
        });
    });

    describe('pointer', () => {
        it('drags a handle by the pointer offset, so grabbing it off-centre does not jump', () => {
            const { container, onChange } = setup();
            press(handleEl(container, 'lo'), xFor(2) + 6);
            expect(onChange).not.toHaveBeenCalled();
            move(xFor(2) + 6 + xFor(2));
            expect(onChange).toHaveBeenLastCalledWith([4, 5], expect.any(Array));
        });

        it('keeps a dragged handle at least one bin from the other', () => {
            const { container, onChange } = setup();
            press(handleEl(container, 'lo'), xFor(2));
            move(xFor(9));
            expect(onChange).toHaveBeenLastCalledWith([4, 5], expect.any(Array));
        });

        it('pans the band at fixed width and clamps it at both ends', () => {
            const { container, onChange } = setup();
            press(band(container), xFor(3));
            move(xFor(5));
            expect(onChange).toHaveBeenLastCalledWith([4, 7], expect.any(Array));
            move(xFor(10));
            expect(onChange).toHaveBeenLastCalledWith([7, 10], expect.any(Array));
            move(0);
            expect(onChange).toHaveBeenLastCalledWith([0, 3], expect.any(Array));
        });

        it('jumps the nearest handle to a press on the bare track', () => {
            const { onChange } = setup();
            press(plot(), xFor(9));
            expect(onChange).toHaveBeenLastCalledWith([2, 9], expect.any(Array));
        });

        it('has no band to pan when the whole domain is selected', () => {
            const { container, onChange } = setup({ value: null });
            expect(band(container)).toBeNull();
            press(plot(), xFor(3));
            expect(onChange).toHaveBeenLastCalledWith([3, 10], expect.any(Array));
        });

        it('inverts the pointer mapping when vertical', () => {
            const { onChange } = setup({ orientation: 'vertical' });
            press(plot(), 50, yFor(8));
            expect(onChange).toHaveBeenLastCalledWith([2, 8], expect.any(Array));
        });

        it('does not repeat onChange for the same edges and commits once, after it', () => {
            const { container, onChange, onChangeCommitted } = setup();
            press(handleEl(container, 'hi'), xFor(5));
            move(xFor(5) + 3);
            move(xFor(7));
            move(xFor(7) + 3);
            release(xFor(7) + 3);
            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toHaveBeenCalledWith([2, 7], expect.any(Array));
            expect(onChangeCommitted).toHaveBeenCalledTimes(1);
            expect(onChangeCommitted).toHaveBeenCalledWith([2, 7], expect.any(Array));
            expect(onChange.mock.invocationCallOrder[0]).toBeLessThan(
                onChangeCommitted.mock.invocationCallOrder[0],
            );
        });

        it('ends a drag when pointer capture is lost', () => {
            const { container, onChangeCommitted } = setup();
            press(band(container), xFor(3));
            expect(plot()).toHaveClass('cursor-grabbing');
            fireEvent.lostPointerCapture(plot(), { pointerId: 1 });
            expect(onChangeCommitted).toHaveBeenCalledTimes(1);
            expect(plot()).not.toHaveClass('cursor-grabbing');
        });

        it('shows resize cursors on the handles and the hand only on the band', () => {
            const { container, rerender, props } = setup();
            expect(handleEl(container, 'lo')).toHaveClass('cursor-col-resize');
            expect(handleEl(container, 'hi')).toHaveClass('cursor-col-resize');
            expect(band(container)).toHaveClass('cursor-grab');
            expect(plot().className).not.toMatch(/cursor-/);
            rerender(<HistogramRange {...props} orientation="vertical" />);
            expect(handleEl(container, 'lo')).toHaveClass('cursor-row-resize');
        });
    });

    describe('keyboard', () => {
        it('moves a handle one bin, ten with Shift, to the ends with Home/End, never past the other', () => {
            const { onChange, onChangeCommitted } = setup();
            const [lo, hi] = sliders();
            fireEvent.keyDown(lo, { key: 'ArrowRight' });
            expect(onChange).toHaveBeenLastCalledWith([3, 5], expect.any(Array));
            fireEvent.keyDown(lo, { key: 'ArrowRight', shiftKey: true });
            expect(onChange).toHaveBeenLastCalledWith([4, 5], expect.any(Array));
            fireEvent.keyDown(lo, { key: 'Home' });
            expect(onChange).toHaveBeenLastCalledWith([0, 5], expect.any(Array));
            fireEvent.keyDown(hi, { key: 'End' });
            expect(onChange).toHaveBeenLastCalledWith([2, 10], expect.any(Array));
            fireEvent.keyDown(hi, { key: 'ArrowDown' });
            expect(onChange).toHaveBeenLastCalledWith([2, 4], expect.any(Array));
            expect(onChangeCommitted).toHaveBeenCalledTimes(5);
            expect(onChange.mock.invocationCallOrder[4]).toBeLessThan(
                onChangeCommitted.mock.invocationCallOrder[4],
            );
        });

        it('ignores other keys and moves that change nothing', () => {
            const { onChange } = setup({ value: [0, 10] });
            fireEvent.keyDown(sliders()[0], { key: 'a' });
            fireEvent.keyDown(sliders()[0], { key: 'ArrowLeft' });
            fireEvent.keyDown(sliders()[1], { key: 'End' });
            expect(onChange).not.toHaveBeenCalled();
        });
    });

    describe('consumer mappings', () => {
        /**
         * An application that stores 8-bit levels as an inclusive [lo, hi] over 0..255.
         * Bins are 0..255 with edges 0..256, so a level window maps to edges [lo, hi + 1].
         */
        function InclusiveLevels({ initial }: { initial: [number, number] }) {
            const [levels, setLevels] = useState(initial);
            return (
                <>
                    <HistogramRange
                        counts={Array.from({ length: 256 }, () => 1)}
                        binEdges={Array.from({ length: 257 }, (_, i) => i)}
                        value={[levels[0], levels[1] + 1]}
                        onChange={([a, b]) => setLevels([a, b - 1])}
                    />
                    <output data-testid="levels">{levels.join(',')}</output>
                </>
            );
        }

        it('round-trips inclusive 8-bit levels at both ends of the range', () => {
            render(<InclusiveLevels initial={[10, 200]} />);
            expect(sliders().map(valueNow)).toEqual([10, 201]);
            fireEvent.keyDown(sliders()[0], { key: 'Home' });
            fireEvent.keyDown(sliders()[1], { key: 'End' });
            expect(screen.getByTestId('levels').textContent).toBe('0,255');
            expect(sliders().map(valueNow)).toEqual([0, 256]);
            fireEvent.keyDown(sliders()[0], { key: 'ArrowRight' });
            fireEvent.keyDown(sliders()[1], { key: 'ArrowLeft' });
            expect(screen.getByTestId('levels').textContent).toBe('1,254');
        });
    });

    describe('rendering', () => {
        it('names the group and both sliders', () => {
            const { container } = setup({ 'aria-label': 'Levels' });
            expect(screen.getByRole('group', { name: 'Histogram range' })).toBeInTheDocument();
            expect(
                screen.getByRole('slider', { name: 'Histogram range minimum' }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole('slider', { name: 'Histogram range maximum' }),
            ).toBeInTheDocument();
            // An application's own name goes on the root element.
            expect(container.firstElementChild).toHaveAttribute('aria-label', 'Levels');
        });

        it('colours the bars, the selection and the handles with one color', () => {
            const green = 'rgb(22, 163, 74)';
            const { container, rerender, props } = setup({ value: [1, 3], color: green });
            const [faded, inside] = [...container.querySelectorAll<SVGPathElement>('svg path')];
            expect(faded).toHaveAttribute('data-faded');
            expect(faded.style.fill).toBe(green);
            expect(faded.style.fillOpacity).toBe('0.3');
            expect(inside.style.fill).toBe(green);
            expect(inside.style.fillOpacity).toBe('1');
            const selection = container.querySelector<SVGRectElement>('[data-selection]');
            expect(selection?.style.fill).toBe(green);
            expect(selection?.style.fillOpacity).toBe('0.15');
            for (const part of handleEl(container, 'lo').querySelectorAll('span')) {
                expect(part.style.backgroundColor).toBe(green);
            }
            // Without it, the default classes are left to style everything.
            rerender(<HistogramRange {...props} color={undefined} />);
            expect(container.querySelectorAll('[style*="fill"]')).toHaveLength(0);
            expect(handleEl(container, 'lo').querySelector('span')?.style.backgroundColor).toBe('');
        });

        it('renders the title, size, className and other div props', () => {
            const { container } = setup({
                title: 'Mask threshold',
                size: 'small',
                className: 'extra',
                id: 'h',
            });
            expect(screen.getByRole('heading', { name: 'Mask threshold' })).toBeInTheDocument();
            const root = container.firstElementChild as HTMLElement;
            expect(root).toHaveClass('w-60', 'h-32', 'extra');
            expect(root).toHaveAttribute('id', 'h');
        });
    });
});
