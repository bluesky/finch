import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ComponentViewer from '../../features/ComponentViewer/ComponentViewer';
import { TestItemCollection } from '../../features/ComponentViewer/types';

const testItems: TestItemCollection = {
    item1: { name: 'Alpha', element: <div>Alpha content</div> },
    item2: { name: 'Beta', element: <div>Beta content</div>, command: 'npm start' },
    item3: {
        name: 'Gamma',
        element: <div>Gamma content</div>,
        info: 'Some info',
        link: 'https://example.com',
    },
};

describe('ComponentViewer', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.spyOn(console, 'log').mockImplementation(() => {});
        Object.assign(navigator, {
            clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
        });
    });

    it('renders the summary table with all test names', () => {
        render(<ComponentViewer testItems={testItems} />);

        expect(screen.getByText('Alpha')).toBeInTheDocument();
        expect(screen.getByText('Beta')).toBeInTheDocument();
        expect(screen.getByText('Gamma')).toBeInTheDocument();
    });

    it('renders table headers', () => {
        render(<ComponentViewer testItems={testItems} />);

        expect(screen.getByText('ID')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Comment')).toBeInTheDocument();
    });

    it('shows the first test item by default', () => {
        render(<ComponentViewer testItems={testItems} />);
        expect(screen.getByText('Alpha content')).toBeInTheDocument();
    });

    it('shows pagination count', () => {
        render(<ComponentViewer testItems={testItems} />);
        expect(screen.getByText('1 of 3')).toBeInTheDocument();
    });

    it('navigates to next test on next button click', () => {
        render(<ComponentViewer testItems={testItems} />);

        // Use caret buttons — prev is disabled at index 0, next is enabled
        const [, nextButton] = screen
            .getAllByRole('button')
            .filter((b) => b.className.includes('px-3 py-2'));

        fireEvent.click(nextButton);
        expect(screen.getByText('Beta content')).toBeInTheDocument();
        expect(screen.getByText('2 of 3')).toBeInTheDocument();
    });

    it('prev button is disabled on first test', () => {
        render(<ComponentViewer testItems={testItems} />);
        const [prevBtn] = screen
            .getAllByRole('button')
            .filter((b) => b.className.includes('px-3 py-2'));
        expect(prevBtn).toBeDisabled();
    });

    it('next button is disabled on last test', () => {
        render(<ComponentViewer testItems={testItems} />);
        const getNextBtn = () =>
            screen.getAllByRole('button').filter((b) => b.className.includes('px-3 py-2'))[1];

        fireEvent.click(getNextBtn());
        fireEvent.click(getNextBtn());

        expect(getNextBtn()).toBeDisabled();
    });

    it('clicking a table row switches to that test', () => {
        render(<ComponentViewer testItems={testItems} />);
        fireEvent.click(screen.getByText('Beta'));
        expect(screen.getByText('Beta content')).toBeInTheDocument();
    });

    it('shows a textarea for comments', () => {
        render(<ComponentViewer testItems={testItems} />);
        expect(screen.getByPlaceholderText('Enter your test comments here...')).toBeInTheDocument();
    });

    it('shows command and copy button when test has a command', () => {
        render(<ComponentViewer testItems={testItems} />);
        // Navigate to item2 which has a command
        fireEvent.click(screen.getByText('Beta'));
        expect(screen.getByText('npm start')).toBeInTheDocument();
        expect(screen.getByText('Copy')).toBeInTheDocument();
    });

    it('shows info text when test has info', () => {
        render(<ComponentViewer testItems={testItems} />);
        fireEvent.click(screen.getByText('Gamma'));
        expect(screen.getByText(/Some info/)).toBeInTheDocument();
    });

    it('shows pass/fail toggle', () => {
        render(<ComponentViewer testItems={testItems} />);
        expect(screen.getByText('Failing')).toBeInTheDocument();
        expect(screen.getByText('Passing')).toBeInTheDocument();
    });

    it('toggles test status when checkbox is clicked', () => {
        render(<ComponentViewer testItems={testItems} />);
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();
        fireEvent.change(checkbox, { target: { checked: true } });
        expect(checkbox).toBeChecked();
    });
});
