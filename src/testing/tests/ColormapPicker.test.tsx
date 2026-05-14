import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ColormapPicker from '../../components/ColormapPicker/ColormapPicker';
import { COLORMAPS } from '../../components/ColormapPicker/colormaps';

describe('ColormapPicker', () => {
    it('renders without crashing', () => {
        const { container } = render(<ColormapPicker value="viridis" onChange={vi.fn()} />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a button for each colormap in the default set', () => {
        render(<ColormapPicker value="viridis" onChange={vi.fn()} />);
        const buttons = screen.getAllByRole('radio');
        expect(buttons).toHaveLength(COLORMAPS.length);
    });

    it('has radiogroup role with aria-label and marks the selected item as checked', () => {
        render(<ColormapPicker value="magma" onChange={vi.fn()} />);
        expect(screen.getByRole('radiogroup', { name: 'Colormap' })).toBeInTheDocument();
        const magma = screen.getByRole('radio', { name: /magma/i });
        const viridis = screen.getByRole('radio', { name: /viridis/i });
        expect(magma).toHaveAttribute('aria-checked', 'true');
        expect(viridis).toHaveAttribute('aria-checked', 'false');
    });

    it('calls onChange with the correct id when a button is clicked', () => {
        const onChange = vi.fn();
        render(<ColormapPicker value="viridis" onChange={onChange} />);
        fireEvent.click(screen.getByText('Gray'));
        expect(onChange).toHaveBeenCalledOnce();
        expect(onChange).toHaveBeenCalledWith('gray');
    });

    it('applies active styles to the selected colormap button', () => {
        render(<ColormapPicker value="magma" onChange={vi.fn()} />);
        const buttons = screen.getAllByRole('radio');
        const magmaButton = buttons.find((b) => b.textContent?.includes('Magma'));
        const viridisButton = buttons.find((b) => b.textContent?.includes('Viridis'));
        expect(magmaButton).toHaveClass('border-sky-700', 'bg-sky-50');
        expect(viridisButton).not.toHaveClass('border-sky-700');
    });

    it('updates active styles when value prop changes', () => {
        const { rerender } = render(<ColormapPicker value="magma" onChange={vi.fn()} />);
        const buttons = () => screen.getAllByRole('radio');
        expect(buttons().find((b) => b.textContent?.includes('Magma'))).toHaveClass(
            'border-sky-700',
        );
        expect(buttons().find((b) => b.textContent?.includes('Viridis'))).not.toHaveClass(
            'border-sky-700',
        );

        rerender(<ColormapPicker value="viridis" onChange={vi.fn()} />);
        expect(buttons().find((b) => b.textContent?.includes('Viridis'))).toHaveClass(
            'border-sky-700',
        );
        expect(buttons().find((b) => b.textContent?.includes('Magma'))).not.toHaveClass(
            'border-sky-700',
        );
    });

    it('renders only the colormaps passed via the colormaps prop', () => {
        const custom = [
            { id: 'red-blue', label: 'Red-Blue', stops: '#d73027,#4575b4' },
            { id: 'bw', label: 'B+W', stops: '#000000,#ffffff' },
        ];
        render(<ColormapPicker value="bw" onChange={vi.fn()} colormaps={custom} />);
        const buttons = screen.getAllByRole('radio');
        expect(buttons).toHaveLength(2);
        expect(screen.getByText('Red-Blue')).toBeInTheDocument();
        expect(screen.getByText('B+W')).toBeInTheDocument();
        expect(screen.queryByText('Viridis')).not.toBeInTheDocument();
    });

    it('applies the className prop to the container', () => {
        const { container } = render(
            <ColormapPicker value="viridis" onChange={vi.fn()} className="test-class" />,
        );
        expect(container.firstChild).toHaveClass('test-class');
    });

    it('applies truncate to label spans to prevent overflow into the gradient swatch', () => {
        render(<ColormapPicker value="viridis" onChange={vi.fn()} />);
        const labelSpans = screen.getAllByRole('radio').map((btn) => btn.querySelector('span'));
        labelSpans.forEach((span) => expect(span).toHaveClass('truncate'));
    });

    it('constrains height and scrolls when max-h class is passed via className', () => {
        const { container } = render(
            <ColormapPicker value="viridis" onChange={vi.fn()} className="max-h-40" />,
        );
        expect(container.firstChild).toHaveClass('max-h-40', 'overflow-y-auto');
    });
});
