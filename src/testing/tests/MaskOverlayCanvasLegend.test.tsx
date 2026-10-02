import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MaskOverlayCanvasLegend from '../../components/MaskOverlayCanvas/MaskOverlayCanvasLegend';
import type { ResolvedMaskClass } from '../../components/MaskOverlayCanvas/types';

const CLASSES: ResolvedMaskClass[] = [
    { id: 1, label: 'Sample', color: '#ff0000', visible: true, opacity: 1 },
    { id: 2, label: 'Substrate', color: '#00ff00', visible: false, opacity: 1 },
];

describe('MaskOverlayCanvasLegend', () => {
    it('renders without crashing', () => {
        const { container } = render(<MaskOverlayCanvasLegend classes={CLASSES} />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders one row per class with its label', () => {
        render(<MaskOverlayCanvasLegend classes={CLASSES} />);
        expect(screen.getByRole('list', { name: 'Mask classes' })).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(2);
        expect(screen.getByText('Sample')).toBeInTheDocument();
        expect(screen.getByText('Substrate')).toBeInTheDocument();
    });

    it('colors each swatch with its class color', () => {
        render(<MaskOverlayCanvasLegend classes={CLASSES} />);
        const swatches = screen.getAllByTestId('mask-legend-swatch');
        expect(swatches[0]).toHaveStyle({ backgroundColor: 'rgb(255, 0, 0)' });
        expect(swatches[1]).toHaveStyle({ backgroundColor: 'rgb(0, 255, 0)' });
    });

    it('shows the same magenta fallback as the raster for an unparseable color', () => {
        render(
            <MaskOverlayCanvasLegend
                classes={[{ id: 1, label: 'Bad', color: 'nope', visible: true, opacity: 1 }]}
            />,
        );
        expect(screen.getByTestId('mask-legend-swatch')).toHaveStyle({
            backgroundColor: 'rgb(255, 0, 255)',
        });
    });

    it('labels each toggle with a fixed name and reports visibility as pressed', () => {
        render(<MaskOverlayCanvasLegend classes={CLASSES} />);
        expect(screen.getByRole('button', { name: 'Sample visible' })).toHaveAttribute(
            'aria-pressed',
            'true',
        );
        expect(screen.getByRole('button', { name: 'Substrate visible' })).toHaveAttribute(
            'aria-pressed',
            'false',
        );
    });

    it('calls onToggle with the class id and its next visibility', () => {
        const onToggle = vi.fn();
        render(<MaskOverlayCanvasLegend classes={CLASSES} onToggle={onToggle} />);
        fireEvent.click(screen.getByRole('button', { name: 'Sample visible' }));
        expect(onToggle).toHaveBeenLastCalledWith(1, false);
        fireEvent.click(screen.getByRole('button', { name: 'Substrate visible' }));
        expect(onToggle).toHaveBeenLastCalledWith(2, true);
    });

    it('does not throw when toggled without an onToggle handler', () => {
        render(<MaskOverlayCanvasLegend classes={CLASSES} />);
        expect(() =>
            fireEvent.click(screen.getByRole('button', { name: 'Sample visible' })),
        ).not.toThrow();
    });

    it('de-emphasises the label of a hidden class', () => {
        render(<MaskOverlayCanvasLegend classes={CLASSES} />);
        expect(screen.getByText('Substrate')).toHaveClass('text-slate-400');
        expect(screen.getByText('Sample')).toHaveClass('text-slate-700');
    });

    it('renders labels only, without toggles, when interactive is false', () => {
        render(<MaskOverlayCanvasLegend classes={CLASSES} interactive={false} />);
        expect(screen.queryAllByRole('button')).toHaveLength(0);
        expect(screen.getByText('Sample')).toBeInTheDocument();
    });

    it('renders an empty list for no classes', () => {
        render(<MaskOverlayCanvasLegend classes={[]} />);
        expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    });

    it('applies className to the list and classNameRow to each row', () => {
        render(
            <MaskOverlayCanvasLegend
                classes={CLASSES}
                className="list-class"
                classNameRow="row-class"
            />,
        );
        expect(screen.getByRole('list', { name: 'Mask classes' })).toHaveClass('list-class');
        screen.getAllByRole('listitem').forEach((row) => expect(row).toHaveClass('row-class'));
    });

    it('passes arbitrary props through to the list element', () => {
        render(<MaskOverlayCanvasLegend classes={CLASSES} data-testid="legend" />);
        expect(screen.getByTestId('legend').tagName).toBe('UL');
    });
});
