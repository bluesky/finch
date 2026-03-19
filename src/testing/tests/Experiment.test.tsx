import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(() => ({ data: [], isSuccess: true })),
}));

vi.mock('../../components/QServer/utils/apiClient', () => ({
  getPlansAllowedPromise: vi.fn(() => Promise.resolve({ success: true, plans_allowed: { count: {}, angle_scan: {}, energy_scan: {} } })),
  executeItemPromise: vi.fn(() => Promise.resolve({ success: true, item: { item_uid: 'test-uid' }, msg: '' })),
  getQueuePromise: vi.fn(() => Promise.resolve({ success: true, running_item: {}, items: [], plan_queue_uid: 'q1' })),
}));

vi.mock('../../components/QServer/utils/qServerApiUtils', () => ({
  getBlueskyRunList: vi.fn(() => Promise.resolve([])),
}));

vi.mock('@/components/Tiled/TiledWriterScatterPlot', () => ({
  default: () => <div data-testid="scatter-plot" />,
}));

vi.mock('../../components/Tiled/TiledWriterDetImageHeatmap', () => ({
  default: () => <div data-testid="heatmap" />,
}));

vi.mock('../../components/QServer/hooks/useQSAddItem', () => ({
  useQSAddItem: vi.fn(() => ({
    allowedDevices: {},
    parameters: null,
    resetInputsTrigger: 0,
    setParameters: vi.fn(),
    updateBodyKwargs: vi.fn(),
  })),
}));

vi.mock('../../components/QServer/QSParameterInput', () => ({
  default: () => <div data-testid="qs-param-input" />,
}));

vi.mock('@blueskyproject/tiled', () => ({
  getSearchResults: vi.fn(() => Promise.resolve(null)),
}));

vi.mock('../../components/Button', () => ({
  default: ({ text, cb, disabled }: { text?: string; cb?: () => void; disabled?: boolean }) => (
    <button data-testid="plan-button" onClick={cb} disabled={disabled}>{text}</button>
  ),
}));

// ── Imports (after mocks) ──────────────────────────────────────────────────────

import ExperimentAngleScan from '../../components/Experiment/ExperimentAngleScan';
import ExperimentEnergyScan from '../../components/Experiment/ExperimentEnergyScan';
import ExperimentHistory from '../../components/Experiment/ExperimentHistory';
import ExperimentExecutePlanButton from '../../components/Experiment/ExperimentExecutePlanButton';
import ExperimentExecutePlanButtonGeneric from '../../components/Experiment/ExperimentExecutePlanButtonGeneric';
import ExperimentPlanSettings from '../../components/Experiment/ExperimentPlanSettings';
import { getSearchResults } from '@blueskyproject/tiled';
import { getPlansAllowedPromise, getQueuePromise } from '../../components/QServer/utils/apiClient';
import { useQSAddItem } from '../../components/QServer/hooks/useQSAddItem';

// ── ExperimentAngleScan ───────────────────────────────────────────────────────

describe('ExperimentAngleScan', () => {
  it('renders without crashing', () => {
    const { container } = render(<ExperimentAngleScan />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('shows the "Angle Scan" heading', () => {
    render(<ExperimentAngleScan />);
    expect(screen.getByText('Angle Scan')).toBeInTheDocument();
  });

  it('renders start angle, stop angle, and num points labels', () => {
    render(<ExperimentAngleScan />);
    expect(screen.getByText(/Start Angle/i)).toBeInTheDocument();
    expect(screen.getByText(/Stop Angle/i)).toBeInTheDocument();
    expect(screen.getByText(/Number of Points/i)).toBeInTheDocument();
  });

  it('applies className to the root element', () => {
    const { container } = render(<ExperimentAngleScan className="my-class" />);
    expect(container.firstChild).toHaveClass('my-class');
  });

  it('shows history view when History tab is clicked', () => {
    render(<ExperimentAngleScan />);
    fireEvent.click(screen.getByTitle('View scan history'));
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    expect(screen.queryByText(/Start Angle/i)).not.toBeInTheDocument();
  });

  it('returns to form view when Run tab is clicked', () => {
    render(<ExperimentAngleScan />);
    fireEvent.click(screen.getByTitle('View scan history'));
    fireEvent.click(screen.getByTitle('Run new scan'));
    expect(screen.getByText(/Start Angle/i)).toBeInTheDocument();
  });

  it('shows the execute button', () => {
    render(<ExperimentAngleScan />);
    expect(screen.getByTestId('plan-button')).toBeInTheDocument();
  });
});

// ── ExperimentEnergyScan ──────────────────────────────────────────────────────

describe('ExperimentEnergyScan', () => {
  it('renders without crashing', () => {
    const { container } = render(<ExperimentEnergyScan />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('shows the "Energy Scan" heading', () => {
    render(<ExperimentEnergyScan />);
    expect(screen.getByText('Energy Scan')).toBeInTheDocument();
  });

  it('renders start energy, stop energy, and num points labels', () => {
    render(<ExperimentEnergyScan />);
    expect(screen.getByText(/Start Energy/i)).toBeInTheDocument();
    expect(screen.getByText(/Stop Energy/i)).toBeInTheDocument();
    expect(screen.getByText(/Number of Points/i)).toBeInTheDocument();
  });

  it('shows history view when History tab is clicked', () => {
    render(<ExperimentEnergyScan />);
    fireEvent.click(screen.getByTitle('View scan history'));
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('applies className to the root element', () => {
    const { container } = render(<ExperimentEnergyScan className="my-class" />);
    expect(container.firstChild).toHaveClass('my-class');
  });
});

// ── ExperimentHistory ─────────────────────────────────────────────────────────

describe('ExperimentHistory', () => {
  beforeEach(() => {
    vi.mocked(getSearchResults).mockReset();
  });

  it('shows a loading spinner while results are pending', () => {
    // Never resolves — stays in loading state
    vi.mocked(getSearchResults).mockReturnValue(new Promise(() => {}));
    render(<ExperimentHistory />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('shows the results table once data is available', async () => {
    vi.mocked(getSearchResults).mockResolvedValue({
      data: [
        {
          id: 'run-1',
          attributes: {
            metadata: {
              start: { time: 1700000000 },
              stop: { time: 1700000060, exit_status: 'success' },
            },
          },
        },
      ],
    } as unknown as Awaited<ReturnType<typeof getSearchResults>>);
    render(<ExperimentHistory />);
    await waitFor(() => expect(screen.getByText('success')).toBeInTheDocument());
    expect(screen.getByText('run-1')).toBeInTheDocument();
  });

  it('calls onItemClick when a row is clicked', async () => {
    const onItemClick = vi.fn();
    const mockItem = {
      id: 'run-2',
      attributes: { metadata: { start: { time: 1700000000 }, stop: { time: 1700000030, exit_status: 'success' } } },
    };
    vi.mocked(getSearchResults).mockResolvedValue({ data: [mockItem] } as unknown as Awaited<ReturnType<typeof getSearchResults>>);
    render(<ExperimentHistory onItemClick={onItemClick} />);
    await waitFor(() => screen.getByText('run-2'));
    fireEvent.click(screen.getByText('run-2'));
    expect(onItemClick).toHaveBeenCalledWith(mockItem);
  });

  it('shows user filter text when metadataFulltextSearch is provided', async () => {
    vi.mocked(getSearchResults).mockResolvedValue({ data: [] } as unknown as Awaited<ReturnType<typeof getSearchResults>>);
    render(<ExperimentHistory metadataFulltextSearch="alice" />);
    await waitFor(() => expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument());
    expect(screen.getByText(/alice/)).toBeInTheDocument();
  });
});

// ── ExperimentExecutePlanButton ───────────────────────────────────────────────

describe('ExperimentExecutePlanButton', () => {
  it('renders without crashing', () => {
    const { container } = render(<ExperimentExecutePlanButton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('shows "Loading..." while checking plan availability', () => {
    // Override to never resolve so we catch the loading state
    vi.mocked(getPlansAllowedPromise).mockReturnValueOnce(new Promise(() => {}));
    render(<ExperimentExecutePlanButton />);
    expect(screen.getByTestId('plan-button')).toHaveTextContent('Loading...');
  });

  it('shows "Execute Count Plan" once plan is available', async () => {
    render(<ExperimentExecutePlanButton />);
    await waitFor(() =>
      expect(screen.getByTestId('plan-button')).toHaveTextContent('Execute Count Plan'),
    );
  });
});

// ── ExperimentExecutePlanButtonGeneric ────────────────────────────────────────

describe('ExperimentExecutePlanButtonGeneric', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <ExperimentExecutePlanButtonGeneric planName="energy_scan" kwargs={{}} />,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('shows "Execute energy_scan Plan" once plan is available', async () => {
    render(<ExperimentExecutePlanButtonGeneric planName="energy_scan" kwargs={{}} />);
    await waitFor(() =>
      expect(screen.getByTestId('plan-button')).toHaveTextContent('Execute energy_scan Plan'),
    );
  });

  it('shows "Queue server busy" text when queue is busy', async () => {
    vi.mocked(getQueuePromise).mockResolvedValueOnce({
      success: true,
      running_item: { item_uid: 'running-1', name: 'some_plan' },
      items: [],
      plan_queue_uid: 'q1',
    } as unknown as Awaited<ReturnType<typeof getQueuePromise>>);
    render(<ExperimentExecutePlanButtonGeneric planName="energy_scan" kwargs={{}} />);
    await waitFor(() => expect(screen.getByText('Queue server busy')).toBeInTheDocument());
  });
});

// ── ExperimentPlanSettings ────────────────────────────────────────────────────

describe('ExperimentPlanSettings', () => {
  it('renders without crashing', () => {
    const { container } = render(<ExperimentPlanSettings />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('shows the "Experiment Plan Settings" heading', () => {
    render(<ExperimentPlanSettings />);
    expect(screen.getByText('Experiment Plan Settings')).toBeInTheDocument();
  });

  it('renders parameter inputs when parameters are available', () => {
    vi.mocked(useQSAddItem).mockReturnValueOnce({
      allowedDevices: {},
      parameters: { det: { name: 'det', value: '', required: true } },
      resetInputsTrigger: 0,
      setParameters: vi.fn(),
      updateBodyKwargs: vi.fn(),
    } as unknown as ReturnType<typeof useQSAddItem>);
    render(<ExperimentPlanSettings />);
    expect(screen.getByTestId('qs-param-input')).toBeInTheDocument();
  });
});
