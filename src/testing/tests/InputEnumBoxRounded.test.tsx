import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InputEnumBoxRounded from '../../components/InputEnumBoxRounded';

const defaultProps = {
    cb: vi.fn(),
    value: 'Option A',
    enums: ['Option A', 'Option B', 'Option C'],
};

describe('InputEnumBoxRounded Component', () => {
    it('renders without crashing', () => {
        const { container } = render(<InputEnumBoxRounded {...defaultProps} />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders the current value', () => {
        render(<InputEnumBoxRounded {...defaultProps} />);
        expect(screen.getByText('Option A')).toBeInTheDocument();
    });

    it('renders the label', () => {
        render(<InputEnumBoxRounded {...defaultProps} label="Mode" />);
        expect(screen.getByText(/Mode/)).toBeInTheDocument();
    });

    it('shows "(required)" when required is true', () => {
        render(<InputEnumBoxRounded {...defaultProps} label="Mode" required={true} />);
        expect(screen.getByText(/required/)).toBeInTheDocument();
    });

    it('shows "(optional)" when required is false', () => {
        render(<InputEnumBoxRounded {...defaultProps} label="Mode" required={false} />);
        expect(screen.getByText(/optional/)).toBeInTheDocument();
    });

    it('dropdown is hidden initially', () => {
        render(<InputEnumBoxRounded {...defaultProps} />);
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('clicking the control opens the dropdown', () => {
        const { container } = render(<InputEnumBoxRounded {...defaultProps} />);
        const control = container.querySelector('.hover\\:cursor-pointer')!;
        fireEvent.click(control);
        expect(screen.getByRole('list')).toBeInTheDocument();
    });

    it('all enum options are shown when dropdown is open', () => {
        const { container } = render(<InputEnumBoxRounded {...defaultProps} />);
        const control = container.querySelector('.hover\\:cursor-pointer')!;
        fireEvent.click(control);
        expect(screen.getByText('Option B')).toBeInTheDocument();
        expect(screen.getByText('Option C')).toBeInTheDocument();
    });

    it('calls cb with the selected value when an option is clicked', () => {
        const cb = vi.fn();
        const { container } = render(<InputEnumBoxRounded {...defaultProps} cb={cb} />);
        const control = container.querySelector('.hover\\:cursor-pointer')!;
        fireEvent.click(control);
        fireEvent.click(screen.getByText('Option B'));
        expect(cb).toHaveBeenCalledWith('Option B');
    });

    it('does not call cb when the already-selected value is clicked', () => {
        const cb = vi.fn();
        const { container } = render(
            <InputEnumBoxRounded {...defaultProps} cb={cb} value="Option A" />,
        );
        const control = container.querySelector('.hover\\:cursor-pointer')!;
        fireEvent.click(control);
        fireEvent.click(screen.getAllByText('Option A')[0]);
        expect(cb).not.toHaveBeenCalled();
    });

    it('closes the dropdown after selecting an option', () => {
        const { container } = render(<InputEnumBoxRounded {...defaultProps} />);
        const control = container.querySelector('.hover\\:cursor-pointer')!;
        fireEvent.click(control);
        fireEvent.click(screen.getByText('Option B'));
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('applies a custom className to the root container', () => {
        const { container } = render(
            <InputEnumBoxRounded {...defaultProps} className="my-class" />,
        );
        expect(container.firstChild).toHaveClass('my-class');
    });
});
