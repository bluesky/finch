import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InputStringBoxRounded from '../../components/InputStringBoxRounded';

describe('InputStringBoxRounded Component', () => {
    it('renders without crashing', () => {
        const { container } = render(<InputStringBoxRounded cb={vi.fn()} value="" />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders a text input', () => {
        render(<InputStringBoxRounded cb={vi.fn()} value="" />);
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with the initial value', () => {
        render(<InputStringBoxRounded cb={vi.fn()} value="hello" />);
        expect(screen.getByRole('textbox')).toHaveValue('hello');
    });

    it('renders the label', () => {
        render(<InputStringBoxRounded cb={vi.fn()} value="" label="Name" />);
        expect(screen.getByText(/Name/)).toBeInTheDocument();
    });

    it('shows "(required)" when required is true', () => {
        render(<InputStringBoxRounded cb={vi.fn()} value="" label="Name" required={true} />);
        expect(screen.getByText(/required/)).toBeInTheDocument();
    });

    it('shows "(optional)" when required is false', () => {
        render(<InputStringBoxRounded cb={vi.fn()} value="" label="Name" required={false} />);
        expect(screen.getByText(/optional/)).toBeInTheDocument();
    });

    it('calls cb on every keystroke', () => {
        const cb = vi.fn();
        render(<InputStringBoxRounded cb={cb} value="" />);
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'abc' } });
        expect(cb).toHaveBeenCalledWith('abc');
    });

    it('calls cb with empty string when input is cleared', () => {
        const cb = vi.fn();
        render(<InputStringBoxRounded cb={cb} value="existing" />);
        fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
        expect(cb).toHaveBeenCalledWith('');
    });

    it('shows warning border on blur when required and empty', () => {
        const { container } = render(
            <InputStringBoxRounded cb={vi.fn()} value="" required={true} />,
        );
        fireEvent.blur(screen.getByRole('textbox'));
        expect(container.firstChild).toHaveClass('border-red-500');
    });

    it('does not show warning border when not required and empty on blur', () => {
        const { container } = render(
            <InputStringBoxRounded cb={vi.fn()} value="" required={false} />,
        );
        fireEvent.blur(screen.getByRole('textbox'));
        expect(container.firstChild).not.toHaveClass('border-red-500');
    });

    it('shows warning border when showWarningGlobal is true', () => {
        const { container } = render(
            <InputStringBoxRounded cb={vi.fn()} value="" showWarningGlobal={true} />,
        );
        expect(container.firstChild).toHaveClass('border-red-500');
    });

    it('clears the warning when user starts typing after blur warning', () => {
        const { container } = render(
            <InputStringBoxRounded cb={vi.fn()} value="" required={true} />,
        );
        fireEvent.blur(screen.getByRole('textbox'));
        expect(container.firstChild).toHaveClass('border-red-500');
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'x' } });
        expect(container.firstChild).not.toHaveClass('border-red-500');
    });

    it('applies a custom className to the root container', () => {
        const { container } = render(
            <InputStringBoxRounded cb={vi.fn()} value="" className="my-class" />,
        );
        expect(container.firstChild).toHaveClass('my-class');
    });
});
