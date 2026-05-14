import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router';
import HubMainContent from '../../components/HubMainContent';
import { RouteItem } from '../../types/navigationRouterTypes';

const mockRoutes: RouteItem[] = [
    { path: '/home', label: 'Home', element: <div>Home Page</div> },
    { path: '/settings', label: 'Settings', element: <div>Settings Page</div> },
];

function renderContent(initialPath = '/home', props = {}) {
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <HubMainContent routes={mockRoutes} {...props} />
        </MemoryRouter>,
    );
}

describe('HubMainContent Component', () => {
    it('renders without crashing', () => {
        const { container } = renderContent();
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders the matched route element', () => {
        renderContent('/home');
        expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    it('renders a different matched route element', () => {
        renderContent('/settings');
        expect(screen.getByText('Settings Page')).toBeInTheDocument();
    });

    it('does not render a non-active route element', () => {
        renderContent('/home');
        expect(screen.queryByText('Settings Page')).not.toBeInTheDocument();
    });

    it('renders nothing for an unmatched path', () => {
        renderContent('/unknown');
        expect(screen.queryByText('Home Page')).not.toBeInTheDocument();
        expect(screen.queryByText('Settings Page')).not.toBeInTheDocument();
    });

    it('applies a custom className to the main element', () => {
        const { container } = renderContent('/home', { className: 'my-main-class' });
        expect(container.querySelector('main')).toHaveClass('my-main-class');
    });

    it('renders a main element as the root', () => {
        const { container } = renderContent();
        expect(container.querySelector('main')).toBeInTheDocument();
    });
});
