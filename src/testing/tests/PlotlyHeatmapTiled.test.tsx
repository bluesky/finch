import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PlotlyHeatmapTiled from '../../components/PlotlyHeatmapTiled';

vi.mock('../../components/PlotlyHeatmap', () => ({
    default: () => <div data-testid="plotly-heatmap" />,
}));

function createInt32Buffer(count: number, fill = 100): ArrayBuffer {
    const buffer = new ArrayBuffer(count * 4);
    const view = new DataView(buffer);
    for (let i = 0; i < count; i++) view.setInt32(i * 4, fill, true);
    return buffer;
}

const metadata2D = {
    data: {
        id: 'test-image',
        attributes: { structure: { shape: [4, 4] } },
        links: { full: '/api/full' },
    },
};

const metadata3D = {
    data: {
        id: 'test-volume',
        attributes: { structure: { shape: [5, 4, 4] } },
        links: { full: '/api/full' },
    },
};

describe('PlotlyHeatmapTiled Component', () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        fetchMock = vi.fn();
        global.fetch = fetchMock as typeof fetch;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // --- null URL ---

    it('renders placeholder when url is null', () => {
        render(<PlotlyHeatmapTiled url={null} />);
        expect(screen.getByText('Tiled Heatmap Display')).toBeInTheDocument();
        expect(screen.getByText(/No URL provided/)).toBeInTheDocument();
    });

    it('does not call fetch when url is null', () => {
        render(<PlotlyHeatmapTiled url={null} />);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    // --- 2D data ---

    it('renders heatmap after loading 2D data', async () => {
        const buf = createInt32Buffer(16);
        fetchMock
            .mockResolvedValueOnce({ ok: true, json: async () => metadata2D })
            .mockResolvedValueOnce({ ok: true, arrayBuffer: async () => buf });

        render(<PlotlyHeatmapTiled url="/api/v1/metadata/test" />);
        await waitFor(() => expect(screen.getByTestId('plotly-heatmap')).toBeInTheDocument());
    });

    it('shows metadata id as label for 2D data', async () => {
        const buf = createInt32Buffer(16);
        fetchMock
            .mockResolvedValueOnce({ ok: true, json: async () => metadata2D })
            .mockResolvedValueOnce({ ok: true, arrayBuffer: async () => buf });

        render(<PlotlyHeatmapTiled url="/api/v1/metadata/test" />);
        await waitFor(() => expect(screen.getByText('test-image')).toBeInTheDocument());
    });

    it('does not show slider for 2D array', async () => {
        const buf = createInt32Buffer(16);
        fetchMock
            .mockResolvedValueOnce({ ok: true, json: async () => metadata2D })
            .mockResolvedValueOnce({ ok: true, arrayBuffer: async () => buf });

        render(<PlotlyHeatmapTiled url="/api/v1/metadata/test" />);
        await waitFor(() => expect(screen.getByTestId('plotly-heatmap')).toBeInTheDocument());
        expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    });

    // --- 3D data ---

    it('shows slider for 3D array with multiple frames', async () => {
        const buf = createInt32Buffer(16);
        fetchMock
            .mockResolvedValueOnce({ ok: true, json: async () => metadata3D })
            .mockResolvedValueOnce({ ok: true, arrayBuffer: async () => buf });

        render(<PlotlyHeatmapTiled url="/api/v1/metadata/test" />);
        await waitFor(() => expect(screen.getByRole('slider')).toBeInTheDocument());
    });

    it('shows z-slice label for 3D data', async () => {
        const buf = createInt32Buffer(16);
        fetchMock
            .mockResolvedValueOnce({ ok: true, json: async () => metadata3D })
            .mockResolvedValueOnce({ ok: true, arrayBuffer: async () => buf });

        render(<PlotlyHeatmapTiled url="/api/v1/metadata/test" />);
        await waitFor(() => expect(screen.getByText(/Z-slice: 0 of 4/)).toBeInTheDocument());
    });

    it('slider has correct min/max for 3D shape', async () => {
        const buf = createInt32Buffer(16);
        fetchMock
            .mockResolvedValueOnce({ ok: true, json: async () => metadata3D })
            .mockResolvedValueOnce({ ok: true, arrayBuffer: async () => buf });

        render(<PlotlyHeatmapTiled url="/api/v1/metadata/test" />);
        await waitFor(() => expect(screen.getByRole('slider')).toBeInTheDocument());
        const slider = screen.getByRole('slider') as HTMLInputElement;
        expect(slider.min).toBe('0');
        expect(slider.max).toBe('4'); // shape[0] - 1 = 5 - 1
    });

    // --- Error states ---

    it('shows error when metadata fetch fails', async () => {
        fetchMock.mockRejectedValueOnce(new Error('Network error'));
        render(<PlotlyHeatmapTiled url="/api/v1/metadata/test" />);
        await waitFor(() =>
            expect(screen.getByText(/Failed to load metadata/)).toBeInTheDocument(),
        );
    });

    it('shows error when metadata shape is missing', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: { attributes: {}, links: {} } }),
        });
        render(<PlotlyHeatmapTiled url="/api/v1/metadata/test" />);
        await waitFor(() =>
            expect(screen.getByText(/Invalid metadata response/)).toBeInTheDocument(),
        );
    });

    // --- Polling ---

    it('shows auto-updating text when enablePolling=true and slider not moved', async () => {
        const buf = createInt32Buffer(16);
        fetchMock
            .mockResolvedValueOnce({ ok: true, json: async () => metadata3D })
            .mockResolvedValueOnce({ ok: true, arrayBuffer: async () => buf });

        render(<PlotlyHeatmapTiled url="/api/v1/metadata/test" enablePolling={true} />);
        await waitFor(() => expect(screen.getByText('(Auto-updating)')).toBeInTheDocument());
    });

    it('hides auto-updating text after user moves slider', async () => {
        const buf = createInt32Buffer(16);
        fetchMock.mockResolvedValue({
            ok: true,
            json: async () => metadata3D,
            arrayBuffer: async () => buf,
        });

        render(<PlotlyHeatmapTiled url="/api/v1/metadata/test" enablePolling={true} />);
        await waitFor(() => expect(screen.getByRole('slider')).toBeInTheDocument());

        fireEvent.change(screen.getByRole('slider'), { target: { value: '2' } });

        await waitFor(() => expect(screen.queryByText('(Auto-updating)')).not.toBeInTheDocument());
    });

    // --- Size prop ---

    it('applies medium size class by default', () => {
        render(<PlotlyHeatmapTiled url={null} />);
        expect(document.querySelector('section')).toHaveClass('w-[700px]');
    });

    it('applies small size class', () => {
        render(<PlotlyHeatmapTiled url={null} size="small" />);
        expect(document.querySelector('section')).toHaveClass('w-[400px]');
    });

    it('applies large size class', () => {
        render(<PlotlyHeatmapTiled url={null} size="large" />);
        expect(document.querySelector('section')).toHaveClass('w-[1000px]');
    });

    // --- className ---

    it('applies custom className', () => {
        render(<PlotlyHeatmapTiled url={null} className="my-custom-class" />);
        expect(document.querySelector('section')).toHaveClass('my-custom-class');
    });
});
