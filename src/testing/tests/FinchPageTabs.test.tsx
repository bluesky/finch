import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router';
import FinchPageTabs from '../../components/FinchAppLayout/FinchPageTabs';
import { RouteTab } from '../../types/navigationRouterTypes';

const mockTabs: RouteTab[] = [
    { path: 'live', label: 'Live', element: <div /> },
    { path: 'explore', label: 'Explore', element: <div /> },
    { path: 'replay', label: 'Replay', element: <div /> },
];

function renderTabs(initialPath = '/explorer/live', props = {}) {
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <FinchPageTabs basePath="/explorer" tabs={mockTabs} {...props} />
        </MemoryRouter>,
    );
}

describe('FinchPageTabs Component', () => {
    it('renders a link for each tab', () => {
        renderTabs();
        expect(screen.getByText('Live')).toBeInTheDocument();
        expect(screen.getByText('Explore')).toBeInTheDocument();
        expect(screen.getByText('Replay')).toBeInTheDocument();
    });

    it('links each tab to its path beneath the base path', () => {
        renderTabs();
        const links = screen.getAllByRole('link');
        expect(links[0]).toHaveAttribute('href', '/explorer/live');
        expect(links[1]).toHaveAttribute('href', '/explorer/explore');
        expect(links[2]).toHaveAttribute('href', '/explorer/replay');
    });

    it('applies the active class to the tab matching the current path', () => {
        renderTabs('/explorer/explore', { classNameActiveTab: 'active-test-class' });
        expect(screen.getByText('Explore').closest('a')).toHaveClass('active-test-class');
    });

    it('does not apply the active class to the other tabs', () => {
        renderTabs('/explorer/explore', { classNameActiveTab: 'active-test-class' });
        expect(screen.getByText('Live').closest('a')).not.toHaveClass('active-test-class');
    });

    it('applies classNameInactiveTab only to inactive tabs', () => {
        renderTabs('/explorer/explore', { classNameInactiveTab: 'inactive-test-class' });
        expect(screen.getByText('Live').closest('a')).toHaveClass('inactive-test-class');
        expect(screen.getByText('Explore').closest('a')).not.toHaveClass('inactive-test-class');
    });

    it('applies a custom className to the nav element', () => {
        const { container } = renderTabs('/explorer/live', { className: 'my-tabs-class' });
        expect(container.querySelector('nav')).toHaveClass('my-tabs-class');
    });

    it('renders a nav as the root element', () => {
        const { container } = renderTabs();
        expect(container.querySelector('nav')).toBeInTheDocument();
    });

    it('links a root route tab beneath the reserved dash segment', () => {
        renderTabs('/-/live', { basePath: '/' });
        expect(screen.getByText('Live').closest('a')).toHaveAttribute('href', '/-/live');
    });

    it('marks only the exact tab active when another tab nests beneath it', () => {
        const nestedTabs: RouteTab[] = [
            { path: 'live', label: 'Live', element: <div /> },
            { path: 'live/detail', label: 'Detail', element: <div /> },
        ];
        renderTabs('/explorer/live/detail', {
            tabs: nestedTabs,
            classNameActiveTab: 'active-test-class',
        });
        expect(screen.getByText('Detail').closest('a')).toHaveClass('active-test-class');
        expect(screen.getByText('Live').closest('a')).not.toHaveClass('active-test-class');
    });

    it('links a tab to the same url whether or not its path carries a leading slash', () => {
        const slashedTabs: RouteTab[] = mockTabs.map((tab) => ({ ...tab, path: `/${tab.path}` }));
        renderTabs('/explorer/live', { tabs: slashedTabs });
        const links = screen.getAllByRole('link');
        expect(links[0]).toHaveAttribute('href', '/explorer/live');
        expect(links[1]).toHaveAttribute('href', '/explorer/explore');
    });

    it('renders no links when tabs is an empty array', () => {
        render(
            <MemoryRouter initialEntries={['/explorer']}>
                <FinchPageTabs basePath="/explorer" tabs={[]} />
            </MemoryRouter>,
        );
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
});
