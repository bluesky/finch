import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { useQueueServer } from '../../components/QServer/hooks/useQueueServer';
import type { CopiedPlan } from '../../components/QServer/types/types';
import type {
    GetHistoryResponse,
    GetQueueResponse,
    GetStatusResponse,
    QueueItem,
    RunningQueueItem,
} from '../../api/qServer/types';
import type { QueryObserverResult } from '@tanstack/react-query';

// ── Mocks ─────────────────────────────────────────────────────────────────────

// Covers both `@/assets/icons` and `src/assets/icons` (same resolved file)
vi.mock('@/assets/icons', () => ({
    tailwindIcons: {
        plus: <span data-testid="icon-plus" />,
        commandLine: <span data-testid="icon-cmd" />,
        cog: <span data-testid="icon-cog" />,
        minus: <span data-testid="icon-minus" />,
        arrowsPointingIn: <span data-testid="icon-arrows-in" />,
        arrowsPointingOut: <span data-testid="icon-arrows-out" />,
    },
    customIcons: {
        rectangles: <span data-testid="icon-rects" />,
        waitingRoom: <span data-testid="icon-wait" />,
    },
}));

const useQueueServerMock = vi.fn(
    (): ReturnType<typeof useQueueServer> => ({
        currentQueue: null,
        queueHistory: null,
        isREToggleOn: false,
        runningItem: null,
        setIsREToggleOn: vi.fn(),
        processConsoleMessage: vi.fn(),
        globalMetadata: {},
        updateGlobalMetadata: vi.fn(),
        removeDuplicateMetadata: vi.fn((plan: CopiedPlan) => plan as CopiedPlan),
        isGlobalMetadataChecked: true,
        handleGlobalMetadataCheckboxChange: vi.fn(),
        apiStatus: null,

        // Add the missing properties
        runEngineToggleRef: { current: true },
        handleQueueDataResponse: vi.fn(),
        handleQueueHistoryResponse: vi.fn(),
        refetchQueue: vi.fn(() =>
            Promise.resolve({} as QueryObserverResult<GetQueueResponse, Error>),
        ),
        refetchStatus: vi.fn(() =>
            Promise.resolve({} as QueryObserverResult<GetStatusResponse, Error>),
        ),
        refetchHistory: vi.fn(() =>
            Promise.resolve({} as QueryObserverResult<GetHistoryResponse, Error>),
        ),
    }),
);
vi.mock('../../components/QServer/hooks/useQueueServer', () => ({
    useQueueServer: () => useQueueServerMock(),
}));

vi.mock('@/api/qServer/hooks', () => ({
    useStatusQuery: vi.fn(() => ({ data: null, error: null })),
    useOpenEnvironmentMutation: vi.fn(() => ({ mutate: vi.fn() })),
}));

// Mock the two QSList instances — distinguish by `type` prop for targeted clicks
const QSListMock = vi.fn(
    ({ handleQItemClick, type }: { handleQItemClick: (item: QueueItem) => void; type: string }) => (
        <button
            data-testid={`qs-list-${type}`}
            onClick={() =>
                handleQItemClick({
                    name: 'test_plan',
                    item_uid: 'uid-1',
                    kwargs: {},
                    user: '',
                    user_group: '',
                    item_type: 'plan',
                })
            }
        >
            {type} item
        </button>
    ),
);
vi.mock('../../components/QServer/QSList', () => ({
    default: (props: unknown) => QSListMock(props as Parameters<typeof QSListMock>[0]),
}));

const QItemPopupMock = vi.fn(
    ({
        handleQItemPopupClose,
        isItemDeleteButtonVisible,
    }: {
        handleQItemPopupClose: () => void;
        isItemDeleteButtonVisible: boolean;
    }) => (
        <div data-testid="q-item-popup">
            <span data-testid="popup-delete-flag">{String(isItemDeleteButtonVisible)}</span>
            <button data-testid="popup-close" onClick={handleQItemPopupClose}>
                Close
            </button>
        </div>
    ),
);
vi.mock('../../components/QServer/QItemPopup', () => ({
    default: (props: unknown) => QItemPopupMock(props as Parameters<typeof QItemPopupMock>[0]),
}));

vi.mock('../../components/QServer/QSRunEngineWorker', () => ({
    default: ({ handleItemClick }: { handleItemClick: (item: RunningQueueItem) => void }) => (
        <button
            data-testid="re-worker-item"
            onClick={() =>
                handleItemClick({
                    item_uid: 'run-1',
                    name: 'running_plan',
                    kwargs: {},
                    user: '',
                    user_group: '',
                    item_type: 'plan',
                    properties: { time_start: 0 },
                })
            }
        >
            running item
        </button>
    ),
}));

vi.mock('../../components/QServer/QSAddItem', () => ({
    default: ({ title }: { title?: string }) => <div data-testid="qs-add-item">{title}</div>,
}));
vi.mock('../../components/QServer/QSConsole', () => ({
    default: ({ title }: { title?: string }) => <div data-testid="qs-console">{title}</div>,
}));
vi.mock('../../components/QServer/SettingsContainer', () => ({
    default: ({ title }: { title?: string }) => <div data-testid="qs-settings">{title}</div>,
}));

// ── Imports (after mocks) ──────────────────────────────────────────────────────

import ContainerQServer from '../../components/QServer/QueueServer';

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
    QSListMock.mockClear();
    QItemPopupMock.mockClear();
    useQueueServerMock.mockClear();
});

describe('ContainerQServer', () => {
    it('renders without crashing', () => {
        const { container } = render(<ContainerQServer />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('applies className prop to the root element', () => {
        const { container } = render(<ContainerQServer className="my-class" />);
        expect(container.firstChild).toHaveClass('my-class');
    });

    it('shows "Queue" section heading', () => {
        render(<ContainerQServer />);
        expect(screen.getByText('Queue')).toBeInTheDocument();
    });

    it('shows "History" section heading', () => {
        render(<ContainerQServer />);
        expect(screen.getByText('History')).toBeInTheDocument();
    });

    it('shows "Run Engine" section heading', () => {
        render(<ContainerQServer />);
        expect(screen.getByText('Run Engine')).toBeInTheDocument();
    });

    it('shows widget titles for Add Item, Console Output, and Settings', () => {
        render(<ContainerQServer />);
        // Each title appears in both the Widget header and the mocked child stub
        expect(screen.getAllByText('Add Item').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Console Output').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Settings').length).toBeGreaterThanOrEqual(1);
    });

    it('does not show the item popup on initial render', () => {
        render(<ContainerQServer />);
        expect(screen.queryByTestId('q-item-popup')).not.toBeInTheDocument();
    });

    it('shows the popup with delete button when a queue item is clicked', () => {
        render(<ContainerQServer />);
        fireEvent.click(screen.getByTestId('qs-list-short'));
        expect(screen.getByTestId('q-item-popup')).toBeInTheDocument();
        expect(screen.getByTestId('popup-delete-flag').textContent).toBe('true');
    });

    it('shows the popup without delete button when a history item is clicked', () => {
        render(<ContainerQServer />);
        fireEvent.click(screen.getByTestId('qs-list-history'));
        expect(screen.getByTestId('q-item-popup')).toBeInTheDocument();
        expect(screen.getByTestId('popup-delete-flag').textContent).toBe('false');
    });

    it('shows the popup without delete button when the running RE item is clicked', () => {
        render(<ContainerQServer />);
        fireEvent.click(screen.getByTestId('re-worker-item'));
        expect(screen.getByTestId('q-item-popup')).toBeInTheDocument();
        expect(screen.getByTestId('popup-delete-flag').textContent).toBe('false');
    });

    it('closes the popup when the close button is clicked', () => {
        render(<ContainerQServer />);
        fireEvent.click(screen.getByTestId('qs-list-short'));
        expect(screen.getByTestId('q-item-popup')).toBeInTheDocument();
        fireEvent.click(screen.getByTestId('popup-close'));
        expect(screen.queryByTestId('q-item-popup')).not.toBeInTheDocument();
    });

    it('expands the side panel when the expand icon is clicked', () => {
        const { container } = render(<ContainerQServer />);
        // The side panel wrapper is the first child div of the root main
        const sidePanelWrapper = container.querySelector('main > div:first-child')!;
        expect(sidePanelWrapper).toHaveClass('w-1/5');
        // The SidePanel expand icon is the first icon-arrows-out in the DOM (Widget headers also use it)
        fireEvent.click(screen.getAllByTestId('icon-arrows-out')[0]);
        expect(sidePanelWrapper).toHaveClass('w-4/5');
    });

    it('collapses the side panel when the expand icon is clicked again', () => {
        const { container } = render(<ContainerQServer />);
        const sidePanelWrapper = container.querySelector('main > div:first-child')!;
        fireEvent.click(screen.getAllByTestId('icon-arrows-out')[0]);
        expect(sidePanelWrapper).toHaveClass('w-4/5');
        // After expanding, the SidePanel icon switches to icon-arrows-in (unique in the DOM)
        fireEvent.click(screen.getByTestId('icon-arrows-in'));
        expect(sidePanelWrapper).toHaveClass('w-1/5');
    });

    it('shows queue item count from currentQueue', () => {
        useQueueServerMock.mockReturnValueOnce({
            currentQueue: {
                msg: '',
                items: [
                    {
                        item_uid: '1',
                        name: 'test_plan_1',
                        item_type: 'plan',
                        args: [],
                        kwargs: {},
                        user: 'test_user',
                        user_group: 'test_group',
                    },
                    {
                        item_uid: '2',
                        name: 'test_plan_2',
                        item_type: 'plan',
                        args: [],
                        kwargs: {},
                        user: 'test_user',
                        user_group: 'test_group',
                    },
                ],
                plan_queue_uid: 'q1',
                running_item: {},
                success: true,
            },
            queueHistory: null,
            isREToggleOn: false,
            runningItem: null,
            setIsREToggleOn: vi.fn(),
            processConsoleMessage: vi.fn(),
            globalMetadata: {},
            updateGlobalMetadata: vi.fn(),
            removeDuplicateMetadata: vi.fn((p: CopiedPlan) => p),
            isGlobalMetadataChecked: true,
            handleGlobalMetadataCheckboxChange: vi.fn(),
            apiStatus: null,
            runEngineToggleRef: { current: true },
            handleQueueDataResponse: vi.fn(),
            handleQueueHistoryResponse: vi.fn(),
            refetchQueue: vi.fn(() =>
                Promise.resolve({} as QueryObserverResult<GetQueueResponse, Error>),
            ),
            refetchStatus: vi.fn(() =>
                Promise.resolve({} as QueryObserverResult<GetStatusResponse, Error>),
            ),
            refetchHistory: vi.fn(() =>
                Promise.resolve({} as QueryObserverResult<GetHistoryResponse, Error>),
            ),
        });
        render(<ContainerQServer />);
        expect(screen.getByText('2')).toBeInTheDocument(); // queue count
    });

    it('shows history item count from queueHistory', () => {
        useQueueServerMock.mockReturnValueOnce({
            currentQueue: null,
            queueHistory: {
                msg: '',
                items: [
                    {
                        item_uid: 'h1',
                        name: 'history_plan_1',
                        item_type: 'plan',
                        args: [],
                        kwargs: {},
                        user: 'test_user',
                        user_group: 'test_group',
                        result: {
                            exit_status: 'completed',
                            run_uids: ['run_1'],
                            scan_ids: [1],
                            time_start: 0,
                            time_stop: 1,
                            msg: '',
                            traceback: '',
                        },
                    },
                    {
                        item_uid: 'h2',
                        name: 'history_plan_2',
                        item_type: 'plan',
                        args: [],
                        kwargs: {},
                        user: 'test_user',
                        user_group: 'test_group',
                        result: {
                            exit_status: 'completed',
                            run_uids: ['run_2'],
                            scan_ids: [2],
                            time_start: 0,
                            time_stop: 1,
                            msg: '',
                            traceback: '',
                        },
                    },
                    {
                        item_uid: 'h3',
                        name: 'history_plan_3',
                        item_type: 'plan',
                        args: [],
                        kwargs: {},
                        user: 'test_user',
                        user_group: 'test_group',
                        result: {
                            exit_status: 'completed',
                            run_uids: ['run_3'],
                            scan_ids: [3],
                            time_start: 0,
                            time_stop: 1,
                            msg: '',
                            traceback: '',
                        },
                    },
                ],
                plan_history_uid: 'hist1',
                success: true,
            },
            isREToggleOn: false,
            runningItem: null,
            setIsREToggleOn: vi.fn(),
            processConsoleMessage: vi.fn(),
            globalMetadata: {},
            updateGlobalMetadata: vi.fn(),
            removeDuplicateMetadata: vi.fn((p: CopiedPlan) => p),
            isGlobalMetadataChecked: true,
            handleGlobalMetadataCheckboxChange: vi.fn(),
            apiStatus: null,
            runEngineToggleRef: { current: true },
            handleQueueDataResponse: vi.fn(),
            handleQueueHistoryResponse: vi.fn(),
            refetchQueue: vi.fn(() =>
                Promise.resolve({} as QueryObserverResult<GetQueueResponse, Error>),
            ),
            refetchStatus: vi.fn(() =>
                Promise.resolve({} as QueryObserverResult<GetStatusResponse, Error>),
            ),
            refetchHistory: vi.fn(() =>
                Promise.resolve({} as QueryObserverResult<GetHistoryResponse, Error>),
            ),
        });
        render(<ContainerQServer />);
        expect(screen.getByText('3')).toBeInTheDocument(); // history count
    });
});
