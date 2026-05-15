import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InputCheckbox from '../../components/InputCheckBox';

describe('InputCheckbox Component', () => {
    it('renders without crashing', () => {
        const { container } = render(<InputCheckbox cb={vi.fn()} />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a checkbox input', () => {
        render(<InputCheckbox cb={vi.fn()} />);
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('renders a label when label is a string', () => {
        render(<InputCheckbox cb={vi.fn()} label="Enable feature" />);
        expect(screen.getByText('Enable feature')).toBeInTheDocument();
    });

    it('does not render a label when label is false', () => {
        const { container } = render(<InputCheckbox cb={vi.fn()} label={false} />);
        expect(container.querySelector('label')).not.toBeInTheDocument();
    });

    it('does not render a label when label is omitted', () => {
        const { container } = render(<InputCheckbox cb={vi.fn()} />);
        expect(container.querySelector('label')).not.toBeInTheDocument();
    });

    it('checkbox is unchecked by default', () => {
        render(<InputCheckbox cb={vi.fn()} />);
        expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('checkbox reflects the isChecked prop', () => {
        render(<InputCheckbox cb={vi.fn()} isChecked={true} />);
        expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('renders checkmark SVG when isChecked is true', () => {
        const { container } = render(<InputCheckbox cb={vi.fn()} isChecked={true} />);
        expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('does not render checkmark SVG when isChecked is false', () => {
        const { container } = render(<InputCheckbox cb={vi.fn()} isChecked={false} />);
        expect(container.querySelector('svg')).not.toBeInTheDocument();
    });

    it('calls cb with true when unchecked checkbox is toggled', () => {
        const cb = vi.fn();
        render(<InputCheckbox cb={cb} isChecked={false} />);
        fireEvent.click(screen.getByRole('checkbox'));
        expect(cb).toHaveBeenCalledWith(true);
    });

    it('calls cb with false when checked checkbox is toggled', () => {
        const cb = vi.fn();
        render(<InputCheckbox cb={cb} isChecked={true} />);
        fireEvent.click(screen.getByRole('checkbox'));
        expect(cb).toHaveBeenCalledWith(false);
    });

    it('calls cb when the label is clicked', () => {
        const cb = vi.fn();
        render(<InputCheckbox cb={cb} isChecked={false} label="Click me" />);
        fireEvent.click(screen.getByText('Click me'));
        expect(cb).toHaveBeenCalledWith(true);
    });

    it('applies a custom className to the root element', () => {
        const { container } = render(<InputCheckbox cb={vi.fn()} className="my-class" />);
        expect(container.firstChild).toHaveClass('my-class');
    });
});
