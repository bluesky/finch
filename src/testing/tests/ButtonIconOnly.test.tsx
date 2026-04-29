import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ButtonIconOnly from '../../components/ButtonIconOnly';

// Mock icon component for testing
const TestIcon = () => <svg data-testid="test-icon">test</svg>;

describe('ButtonIconOnly Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<ButtonIconOnly icon={<TestIcon />} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('displays the provided icon', () => {
    render(<ButtonIconOnly icon={<TestIcon />} />);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('calls onClick function when clicked', () => {
    const mockOnClick = vi.fn();
    render(<ButtonIconOnly icon={<TestIcon />} onClick={mockOnClick} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<ButtonIconOnly icon={<TestIcon />} disabled={true} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('does not call onClick when disabled and clicked', () => {
    const mockOnClick = vi.fn();
    render(<ButtonIconOnly icon={<TestIcon />} onClick={mockOnClick} disabled={true} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('applies primary styling by default', () => {
    const { container } = render(<ButtonIconOnly icon={<TestIcon />} />);
    const button = container.firstChild;
    
    expect(button).toHaveClass('bg-sky-500');
    expect(button).not.toHaveClass('bg-white', 'border-slate-300', 'border');
  });

  it('applies secondary styling when isSecondary is true', () => {
    const { container } = render(<ButtonIconOnly icon={<TestIcon />} isSecondary={true} />);
    const button = container.firstChild;
    
    expect(button).toHaveClass('bg-white', 'border-slate-300', 'border');
    expect(button).not.toHaveClass('bg-sky-500');
  });

  it('applies primary icon styling by default', () => {
    render(<ButtonIconOnly icon={<TestIcon />} />);
    
    const iconSpan = screen.getByTestId('test-icon').parentElement;
    expect(iconSpan).toHaveClass('text-white');
    expect(iconSpan).not.toHaveClass('text-black');
  });

  it('applies secondary icon styling when isSecondary is true', () => {
    render(<ButtonIconOnly icon={<TestIcon />} isSecondary={true} />);
    
    const iconSpan = screen.getByTestId('test-icon').parentElement;
    expect(iconSpan).toHaveClass('text-black');
    expect(iconSpan).not.toHaveClass('text-white');
  });

  it('applies default button classes', () => {
    const { container } = render(<ButtonIconOnly icon={<TestIcon />} />);
    const button = container.firstChild;
    
    expect(button).toHaveClass('rounded-sm', 'px-2', 'py-1');
  });

  it('merges custom className with default classes', () => {
    const customClass = 'custom-test-class';
    const { container } = render(<ButtonIconOnly icon={<TestIcon />} className={customClass} />);
    const button = container.firstChild;
    
    expect(button).toHaveClass(customClass);
    expect(button).toHaveClass('rounded-sm', 'px-2', 'py-1');
  });

  it('applies custom icon className', () => {
    const customIconClass = 'custom-icon-class';
    render(<ButtonIconOnly icon={<TestIcon />} classNameIcon={customIconClass} />);
    
    const iconSpan = screen.getByTestId('test-icon').parentElement;
    expect(iconSpan).toHaveClass(customIconClass);
  });

  it('handles hover states correctly for primary button', () => {
    const { container } = render(<ButtonIconOnly icon={<TestIcon />} />);
    const button = container.firstChild;
    
    expect(button).toHaveClass('hover:bg-sky-600');
  });

  it('handles hover states correctly for secondary button', () => {
    const { container } = render(<ButtonIconOnly icon={<TestIcon />} isSecondary={true} />);
    const button = container.firstChild;
    
    expect(button).toHaveClass('hover:bg-slate-100');
  });

  it('renders as a button element', () => {
    render(<ButtonIconOnly icon={<TestIcon />} />);
    const button = screen.getByRole('button');
    expect(button.nodeName).toBe('BUTTON');
  });

  it('handles complex icons', () => {
    const ComplexIcon = () => (
      <div data-testid="complex-icon">
        <svg><circle cx="50" cy="50" r="40" /></svg>
        <span>Text</span>
      </div>
    );
    
    render(<ButtonIconOnly icon={<ComplexIcon />} />);
    expect(screen.getByTestId('complex-icon')).toBeInTheDocument();
  });

  it('handles no onClick gracefully', () => {
    render(<ButtonIconOnly icon={<TestIcon />} />);
    const button = screen.getByRole('button');
    
    expect(() => fireEvent.click(button)).not.toThrow();
  });

  it('maintains icon aspect ratio and positioning', () => {
    render(<ButtonIconOnly icon={<TestIcon />} />);

    const button = screen.getByRole('button');
    const iconSpan = screen.getByTestId('test-icon').parentElement;

    // Check that icon is properly contained within button
    expect(button).toContainElement(iconSpan);
    expect(iconSpan?.tagName).toBe('SPAN');
  });

  it('applies active styling when active is true', () => {
    const { container } = render(<ButtonIconOnly icon={<TestIcon />} active={true} />);
    const button = container.firstChild;

    expect(button).toHaveClass('bg-sky-700', 'border-sky-700', 'border', 'hover:bg-sky-800');
    expect(button).not.toHaveClass('bg-sky-500', 'bg-white');
  });

  it('applies white icon color when active', () => {
    render(<ButtonIconOnly icon={<TestIcon />} active={true} />);

    const iconSpan = screen.getByTestId('test-icon').parentElement;
    expect(iconSpan).toHaveClass('text-white');
    expect(iconSpan).not.toHaveClass('text-black');
  });

  it('active overrides isSecondary styling', () => {
    const { container } = render(<ButtonIconOnly icon={<TestIcon />} active={true} isSecondary={true} />);
    const button = container.firstChild;

    expect(button).toHaveClass('bg-sky-700');
    expect(button).not.toHaveClass('bg-white', 'border-slate-300');
  });
});