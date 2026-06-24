import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { createContext, useContext } from 'react';
import SelectDropdown from '../../components/SelectDropdown';

const SelectContext = createContext<{ onValueChange?: (v: string) => void }>({});

vi.mock('@/components/ui/select', () => ({
    Select: ({
        children,
        onValueChange,
        defaultValue,
    }: {
        children?: React.ReactNode;
        onValueChange?: (v: string) => void;
        defaultValue?: string;
    }) => (
        <SelectContext.Provider value={{ onValueChange }}>
            <div data-testid="select" data-default-value={defaultValue ?? ''}>
                {children}
            </div>
        </SelectContext.Provider>
    ),
    SelectTrigger: ({
        children,
        className,
    }: {
        children?: React.ReactNode;
        className?: string;
    }) => (
        <button data-testid="select-trigger" className={className}>
            {children}
        </button>
    ),
    SelectValue: ({ placeholder }: { placeholder?: string }) => (
        <span data-testid="select-value">{placeholder}</span>
    ),
    SelectContent: ({
        children,
        className,
    }: {
        children?: React.ReactNode;
        className?: string;
    }) => (
        <div data-testid="select-content" className={className}>
            {children}
        </div>
    ),
    SelectGroup: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    SelectItem: ({
        children,
        value,
        className,
    }: {
        children?: React.ReactNode;
        value: string;
        className?: string;
    }) => {
        const { onValueChange } = useContext(SelectContext);
        return (
            <div
                data-testid="select-item"
                data-value={value}
                className={className}
                onClick={() => onValueChange?.(value)}
            >
                {children}
            </div>
        );
    },
    SelectLabel: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

const items = ['Option A', 'Option B', 'Option C'];

describe('SelectDropdown Component', () => {
    it('renders without crashing', () => {
        const { container } = render(<SelectDropdown listItems={items} />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders all list items', () => {
        render(<SelectDropdown listItems={items} />);
        const rendered = screen.getAllByTestId('select-item');
        expect(rendered).toHaveLength(3);
    });

    it('renders correct item labels', () => {
        render(<SelectDropdown listItems={items} />);
        expect(screen.getByText('Option A')).toBeInTheDocument();
        expect(screen.getByText('Option B')).toBeInTheDocument();
        expect(screen.getByText('Option C')).toBeInTheDocument();
    });

    it('renders placeholder text', () => {
        render(<SelectDropdown listItems={items} placeholder="Pick one" />);
        expect(screen.getByText('Pick one')).toBeInTheDocument();
    });

    it('passes initialSelectedItem as default value', () => {
        render(<SelectDropdown listItems={items} initialSelectedItem="Option B" />);
        expect(screen.getByTestId('select')).toHaveAttribute('data-default-value', 'Option B');
    });

    it('calls onValueChange when an item is clicked', () => {
        const onValueChange = vi.fn();
        render(<SelectDropdown listItems={items} onValueChange={onValueChange} />);
        fireEvent.click(screen.getByText('Option C'));
        expect(onValueChange).toHaveBeenCalledWith('Option C');
    });

    it('applies triggerClassName to the trigger', () => {
        render(<SelectDropdown listItems={items} triggerClassName="my-trigger" />);
        expect(screen.getByTestId('select-trigger')).toHaveClass('my-trigger');
    });

    it('applies contentClassName to the content panel', () => {
        render(<SelectDropdown listItems={items} contentClassName="my-content" />);
        expect(screen.getByTestId('select-content')).toHaveClass('my-content');
    });
});
