import type { Meta, StoryObj } from '@storybook/react';
import TiledWrapper from '../components/Tiled/Tiled';
import '@blueskyproject/tiled/style.css'; // Import the Tiled styles

const meta = {
    title: 'Bluesky Components/Tiled',
    component: TiledWrapper,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
    argTypes: {},
} satisfies Meta<typeof TiledWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
    args: {
        reverseSort: false,
        enableStartupScreen: false,
        size: 'medium',
        tiledBaseUrl: 'https://tiled-demo.nsls2.bnl.gov/api/v1',
        onSelectCallback: (links) => console.log('Selected Tiled link:', links.self),
        isButtonMode: false,
        isPopup: false,
        singleColumnMode: false,
        isFullWidth: false,
        buttonModeText: undefined,
        apiKey: undefined,
        bearerToken: undefined,
        closeOnSelect: false,
        backgroundClassName: undefined,
        buttonClassName: undefined,
        contentClassName: undefined,
        displayMode: 'columns',
        expandedContentClassName: undefined,
        initialPath: undefined,
        oidcRedirectUrl: undefined,
        pageLimit: undefined,
        showPlanName: true,
        showPlanStartTime: true,
        reloadLastItemOnStartup: false,
        inButtonModeShowApiKeyInput: false,
        inButtonModeShowReverseSortInput: false,
        inButtonModeShowSelectedData: false,
        includeAuthTokensInSelectCallback: false,
    },
};

export const SingleListMode: Story = {
    args: {
        tiledBaseUrl: 'https://tiled-demo.nsls2.bnl.gov/api/v1',
        displayMode: 'rows',
        size: 'medium',
    },
};

export const LocalHostUrl: Story = {
    args: {
        size: 'medium',
    },
};

export const CustomUrl: Story = {
    args: {
        enableStartupScreen: true,
        size: 'medium',
    },
};

export const ButtonMode: Story = {
    args: {
        isButtonMode: true,
        size: 'medium',
        tiledBaseUrl: 'https://tiled-demo.nsls2.bnl.gov/api/v1',
        reverseSort: false,
    },
};
