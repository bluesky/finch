import { render, screen, within } from '@testing-library/react';
import { composeStories } from '@storybook/react';
import { expect, test, beforeAll } from 'vitest';
import * as stories from '@/stories/Tiled.stories';

// Setup MSW for testing
beforeAll(async () => {
    const { setupServer } = await import('msw/node');
    const { tiledHandlers } = await import('./mocks/handlers');

    const server = setupServer(...tiledHandlers);
    server.listen({ onUnhandledRequest: 'warn' });

    return () => server.close();
});

const { Primary } = composeStories(stories);

test('Primary story renders correctly', async () => {
    const { container } = render(<Primary />);

    expect(screen.getByText('Tiled')).toBeInTheDocument();

    // Run the play function manually if needed
    if (Primary.play) {
        const canvas = within(container);
        await Primary.play({
            canvasElement: container,
            canvas,
            args: Primary.args || {},
            step: () => Promise.resolve(),
            context: {
                loaded: {},
                mount: () => Promise.resolve(within(container)),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any,
        });
    }
});
