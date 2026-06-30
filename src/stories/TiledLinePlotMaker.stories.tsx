import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TiledLinePlotMaker from '../features/TiledLinePlotMaker';

const queryClient = new QueryClient();

const meta = {
    title: 'Features/TiledLinePlotMaker',
    component: TiledLinePlotMaker,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <QueryClientProvider client={queryClient}>
                <Story />
            </QueryClientProvider>
        ),
    ],
} satisfies Meta<typeof TiledLinePlotMaker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        tiledBaseUrl: 'https://tiled-demo.nsls2.bnl.gov/api/v1',
        tiledInitialPath: 'bmm',
        classNameContainer: 'flex-wrap justify-center',
        classNameInnerContainer: 'border-r-0',
        classNamePlot: 'w-92',
    },
};
