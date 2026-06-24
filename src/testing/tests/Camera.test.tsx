import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@/assets/icons', () => ({
    phosphorIcons: {
        eye: null,
        eyeSlash: null,
        plugs: null,
        plugsConnected: null,
        camera: null,
        cameraSlash: null,
    },
    tailwindIcons: { chevronUp: '▲', chevronDown: '▼' },
}));

vi.mock('../../components/ButtonWithIcon', () => ({
    default: ({ text, cb, disabled }: { text?: string; cb?: () => void; disabled?: boolean }) => (
        <button data-testid="button-with-icon" onClick={cb} disabled={disabled}>
            {text}
        </button>
    ),
}));

// CameraCanvas/TIFFCanvas connect WebSocket on mount — mock the hooks instead
vi.mock('../../components/Camera/hooks/useCameraCanvas', () => ({
    useCameraCanvas: vi.fn(() => ({
        canvasRef: { current: null },
        fps: '30',
        socketStatus: 'closed',
        isImageLogScale: true,
        sizeDict: { small: 256, medium: 512, large: 1024, automatic: 512 },
        startWebSocket: vi.fn(),
        closeWebSocket: vi.fn(),
        toggleLogScale: vi.fn(),
    })),
}));

vi.mock('../../components/Camera/hooks/useTIFFCanvas', () => ({
    useTIFFCanvas: vi.fn(() => ({
        canvasRef: { current: null },
        fps: '24',
        socketStatus: 'closed',
        isImageLogScale: false,
        sizeDict: { small: 256, medium: 512, large: 1024, automatic: 512 },
        startWebSocket: vi.fn(),
        closeWebSocket: vi.fn(),
        toggleLogScale: vi.fn(),
    })),
}));

vi.mock('../../components/Camera/hooks/useCameraDraw', () => ({
    useCameraDraw: vi.fn(() => ({
        isDrawingMode: false,
        strokes: [],
        currentStroke: [],
        drawingAreaRef: { current: null },
        toggleDrawingMode: vi.fn(),
        eraseAllStrokes: vi.fn(),
        handleMouseDown: vi.fn(),
        handleMouseMove: vi.fn(),
        handleMouseUp: vi.fn(),
        createStrokePath: vi.fn(() => null),
    })),
}));

vi.mock('@/hooks/useOphydSocket', () => ({
    default: vi.fn(() => ({
        devices: {},
        handleSetValueRequest: vi.fn(),
        toggleExpand: vi.fn(),
        toggleDeviceLock: vi.fn(),
    })),
}));

// Mocked only for use inside CameraContainer/TIFFContainer
vi.mock('../../components/Camera/CameraCanvas', () => ({
    default: () => <div data-testid="camera-canvas" />,
}));

vi.mock('../../components/Camera/TIFFCanvas', () => ({
    default: () => <div data-testid="tiff-canvas" />,
}));

// Mocked form inputs used by CameraCustomSetup
vi.mock('../../components/Button', () => ({
    default: ({ text, cb }: { text?: string; cb?: () => void }) => (
        <button data-testid="button" onClick={cb}>
            {text}
        </button>
    ),
}));

vi.mock('../../components/InputStringBoxRounded', () => ({
    default: ({ label, cb }: { label?: string; cb?: (value: string) => void }) => (
        <input data-testid={`input-${label}`} onChange={(e) => cb?.(e.target.value)} />
    ),
}));

vi.mock('../../components/InputEnumBoxRounded', () => ({
    default: ({
        label,
        enums,
        cb,
    }: {
        label?: string;
        enums?: string[];
        cb?: (value: string) => void;
    }) => (
        <select data-testid={`enum-${label}`} onChange={(e) => cb?.(e.target.value)}>
            {(enums || []).map((e: string) => (
                <option key={e} value={e}>
                    {e}
                </option>
            ))}
        </select>
    ),
}));

vi.mock('../../components/InputCheckBox', () => ({
    default: ({
        label,
        isChecked,
        cb,
    }: {
        label?: string | boolean;
        isChecked?: boolean;
        cb?: (checked: boolean) => void;
    }) => (
        <input
            type="checkbox"
            aria-label={typeof label === 'string' ? label : undefined}
            checked={isChecked}
            onChange={(e) => cb?.(e.target.checked)}
        />
    ),
}));

vi.mock('../../components/Camera/utils/apiClient', () => ({
    getDefaultCameraUrl: vi.fn(() => 'ws://localhost/api/camera'),
    getDefaultTiffUrl: vi.fn(() => 'ws://localhost/api/tiff'),
}));

// ── Imports (after mocks) ──────────────────────────────────────────────────────

import { Device, Devices } from '../../types/deviceControllerTypes';
import InputFloat from '../../components/Camera/InputFloat';
import InputInteger from '../../components/Camera/InputInteger';
import InputString from '../../components/Camera/InputString';
import InputEnum from '../../components/Camera/InputEnum';
import InputField from '../../components/Camera/InputField';
import InputGroup from '../../components/Camera/InputGroup';
import CameraControlPanel from '../../components/Camera/CameraControlPanel';
import CameraSettings from '../../components/Camera/CameraSettings';
import CameraCanvasFeatures from '../../components/Camera/CameraCanvasFeatures';
import CameraContainer from '../../components/Camera/CameraContainer';
import TIFFContainer from '../../components/Camera/TIFFContainer';
import CameraCustomSetup from '../../components/Camera/CameraCustomSetup';

// ── InputFloat ────────────────────────────────────────────────────────────────

describe('InputFloat', () => {
    it('renders without crashing', () => {
        const { container } = render(<InputFloat />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('displays the label', () => {
        render(<InputFloat label="Gain" />);
        expect(screen.getByText('Gain')).toBeInTheDocument();
    });

    it('renders a number input', () => {
        render(<InputFloat />);
        expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    it('calls onSubmit with float value on Enter', () => {
        const onSubmit = vi.fn();
        render(<InputFloat label="Test" onSubmit={onSubmit} />);
        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '3.14' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onSubmit).toHaveBeenCalledWith(3.14);
    });

    it('is disabled when isDisabled is true', () => {
        render(<InputFloat isDisabled={true} />);
        expect(screen.getByRole('spinbutton')).toBeDisabled();
    });
});

// ── InputInteger ──────────────────────────────────────────────────────────────

describe('InputInteger', () => {
    it('renders without crashing', () => {
        const { container } = render(<InputInteger />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('displays the label', () => {
        render(<InputInteger label="Exposure" />);
        expect(screen.getByText('Exposure')).toBeInTheDocument();
    });

    it('calls onSubmit with integer value on Enter', () => {
        const onSubmit = vi.fn();
        render(<InputInteger label="Test" onSubmit={onSubmit} />);
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: '42' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onSubmit).toHaveBeenCalledWith(42);
    });

    it('is disabled when isDisabled is true', () => {
        render(<InputInteger isDisabled={true} />);
        expect(screen.getByRole('textbox')).toBeDisabled();
    });
});

// ── InputString ───────────────────────────────────────────────────────────────

describe('InputString', () => {
    it('renders without crashing', () => {
        const { container } = render(<InputString />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('calls onSubmit with string value on Enter', () => {
        const onSubmit = vi.fn();
        render(<InputString onSubmit={onSubmit} />);
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'hello' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onSubmit).toHaveBeenCalledWith('hello');
    });

    it('is disabled when isDisabled is true', () => {
        render(<InputString isDisabled={true} />);
        expect(screen.getByRole('textbox')).toBeDisabled();
    });
});

// ── InputEnum ─────────────────────────────────────────────────────────────────

describe('InputEnum', () => {
    it('renders without crashing', () => {
        const { container } = render(<InputEnum />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('displays the label', () => {
        render(<InputEnum label="Mode" enums={['A', 'B']} />);
        expect(screen.getByText(/Mode/)).toBeInTheDocument();
    });

    it('opens dropdown on click', () => {
        render(<InputEnum label="Mode" enums={['Option1', 'Option2']} />);
        fireEvent.click(screen.getByText('▼').parentElement!.parentElement!);
        expect(screen.getByText('Option1')).toBeInTheDocument();
        expect(screen.getByText('Option2')).toBeInTheDocument();
    });

    it('calls onSubmit when an option is selected', () => {
        const onSubmit = vi.fn();
        render(<InputEnum label="Mode" enums={['Alpha', 'Beta']} onSubmit={onSubmit} />);
        fireEvent.click(screen.getByText('▼').parentElement!.parentElement!);
        fireEvent.click(screen.getByText('Alpha'));
        expect(onSubmit).toHaveBeenCalledWith('Alpha');
    });

    it('does not open dropdown when disabled', () => {
        render(<InputEnum label="Mode" enums={['A', 'B']} isDisabled={true} />);
        fireEvent.click(screen.getByText('▼').parentElement!.parentElement!);
        expect(screen.queryByText('A')).not.toBeInTheDocument();
    });
});

// ── InputField ────────────────────────────────────────────────────────────────

describe('InputField', () => {
    it('renders without crashing', () => {
        const { container } = render(
            <InputField
                onSubmit={vi.fn()}
                pv="test:pv"
                input={{ suffix: 'AcquireTime', label: 'Acquire Time', type: 'float' }}
                cameraSettingsPVs={{}}
            />,
        );
        expect(container.firstChild).toBeInTheDocument();
    });

    it('shows "Not Connected" when PV is absent from cameraSettingsPVs', () => {
        render(
            <InputField
                onSubmit={vi.fn()}
                pv="missing:pv"
                input={{ suffix: 'AcquireTime', label: 'Acquire Time', type: 'float' }}
                cameraSettingsPVs={{}}
            />,
        );
        expect(screen.getByText('Not Connected')).toBeInTheDocument();
    });

    it('shows current value when PV is connected', () => {
        render(
            <InputField
                onSubmit={vi.fn()}
                pv="test:pv"
                input={{ suffix: 'AcquireTime', label: 'Acquire Time', type: 'float' }}
                cameraSettingsPVs={
                    { 'test:pv': { connected: true, value: 0.5 } } as unknown as Devices
                }
            />,
        );
        expect(screen.getByText('0.5')).toBeInTheDocument();
    });
});

// ── InputGroup ────────────────────────────────────────────────────────────────

describe('InputGroup', () => {
    const group = {
        title: 'Acquisition Settings',
        prefix: 'cam1',
        inputs: [{ suffix: 'AcquireTime', label: 'Acquire Time', type: 'float' as const }],
    };

    it('renders without crashing', () => {
        const { container } = render(
            <InputGroup
                settingsGroup={group}
                prefix="13SIM1"
                cameraSettingsPVs={{}}
                onSubmit={vi.fn()}
            />,
        );
        expect(container.firstChild).toBeInTheDocument();
    });

    it('shows the group title', () => {
        render(
            <InputGroup
                settingsGroup={group}
                prefix="13SIM1"
                cameraSettingsPVs={{}}
                onSubmit={vi.fn()}
            />,
        );
        expect(screen.getByText('Acquisition Settings')).toBeInTheDocument();
    });

    it('collapses inputs when title is clicked', () => {
        render(
            <InputGroup
                settingsGroup={group}
                prefix="13SIM1"
                cameraSettingsPVs={{}}
                onSubmit={vi.fn()}
            />,
        );
        const list = screen.getByRole('list');
        expect(list).not.toHaveClass('hidden');
        fireEvent.click(screen.getByText('Acquisition Settings'));
        expect(list).toHaveClass('hidden');
    });
});

// ── CameraControlPanel ────────────────────────────────────────────────────────

describe('CameraControlPanel', () => {
    const connectedPV: Device = {
        connected: true,
        value: 0,
        enum_strs: ['Done', 'Acquire'],
        name: 'cam1:Acquire',
        read_access: true,
        write_access: true,
        timestamp: 0,
        locked: false,
        expanded: false,
        pv: 'cam1:Acquire',
    };
    const disconnectedPV: Device = {
        connected: false,
        value: 0,
        enum_strs: undefined,
        name: 'cam1:Acquire',
        read_access: false,
        write_access: false,
        timestamp: 0,
        locked: false,
        expanded: false,
        pv: 'cam1:Acquire',
    };

    it('renders without crashing', () => {
        const { container } = render(
            <CameraControlPanel
                cameraControlPV={connectedPV}
                startAcquire={vi.fn()}
                stopAcquire={vi.fn()}
            />,
        );
        expect(container.firstChild).toBeInTheDocument();
    });

    it('shows current acquisition status', () => {
        render(
            <CameraControlPanel
                cameraControlPV={connectedPV}
                startAcquire={vi.fn()}
                stopAcquire={vi.fn()}
            />,
        );
        expect(screen.getByText(/Acquisition Status: Done/)).toBeInTheDocument();
    });

    it('disables buttons when PV is not connected', () => {
        render(
            <CameraControlPanel
                cameraControlPV={disconnectedPV}
                startAcquire={vi.fn()}
                stopAcquire={vi.fn()}
            />,
        );
        screen.getAllByTestId('button-with-icon').forEach((btn) => expect(btn).toBeDisabled());
    });

    it('calls startAcquire when Acquire button is clicked', () => {
        const startAcquire = vi.fn();
        render(
            <CameraControlPanel
                cameraControlPV={connectedPV}
                startAcquire={startAcquire}
                stopAcquire={vi.fn()}
            />,
        );
        fireEvent.click(screen.getByText('Acquire'));
        expect(startAcquire).toHaveBeenCalled();
    });
});

// ── CameraSettings ────────────────────────────────────────────────────────────

describe('CameraSettings', () => {
    const settings = [
        {
            title: 'Acquisition Settings',
            prefix: 'cam1',
            inputs: [{ suffix: 'AcquireTime', label: 'Acquire Time', type: 'float' as const }],
        },
    ];

    it('renders without crashing', () => {
        const { container } = render(<CameraSettings settings={settings} cameraSettingsPVs={{}} />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders each settings group title', () => {
        render(<CameraSettings settings={settings} cameraSettingsPVs={{}} />);
        expect(screen.getByText('Acquisition Settings')).toBeInTheDocument();
    });
});

// ── CameraCanvasFeatures ──────────────────────────────────────────────────────

describe('CameraCanvasFeatures', () => {
    it('renders without crashing', () => {
        const { container } = render(
            <CameraCanvasFeatures
                socketStatus="closed"
                isImageLogScale={false}
                onToggleConnection={vi.fn()}
                onToggleLogScale={vi.fn()}
            />,
        );
        expect(container.firstChild).not.toBeNull();
    });

    it('shows "Log Scale" title when not in log scale', () => {
        render(
            <CameraCanvasFeatures
                socketStatus="open"
                isImageLogScale={false}
                onToggleConnection={vi.fn()}
                onToggleLogScale={vi.fn()}
            />,
        );
        expect(screen.getByTitle('Log Scale')).toBeInTheDocument();
    });

    it('shows "Linear Scale" title when in log scale', () => {
        render(
            <CameraCanvasFeatures
                socketStatus="open"
                isImageLogScale={true}
                onToggleConnection={vi.fn()}
                onToggleLogScale={vi.fn()}
            />,
        );
        expect(screen.getByTitle('Linear Scale')).toBeInTheDocument();
    });

    it('calls onToggleLogScale when the scale icon is clicked', () => {
        const onToggleLogScale = vi.fn();
        render(
            <CameraCanvasFeatures
                socketStatus="open"
                isImageLogScale={false}
                onToggleConnection={vi.fn()}
                onToggleLogScale={onToggleLogScale}
            />,
        );
        fireEvent.click(screen.getByTitle('Log Scale'));
        expect(onToggleLogScale).toHaveBeenCalled();
    });

    it('calls onToggleConnection when the connection icon is clicked', () => {
        const onToggleConnection = vi.fn();
        render(
            <CameraCanvasFeatures
                socketStatus="open"
                isImageLogScale={false}
                onToggleConnection={onToggleConnection}
                onToggleLogScale={vi.fn()}
            />,
        );
        fireEvent.click(screen.getByTitle('Disconnect'));
        expect(onToggleConnection).toHaveBeenCalled();
    });
});

// ── CameraContainer ───────────────────────────────────────────────────────────

describe('CameraContainer', () => {
    it('renders without crashing', () => {
        const { container } = render(<CameraContainer prefix="13SIM1" />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders the camera canvas', () => {
        render(<CameraContainer prefix="13SIM1" />);
        expect(screen.getByTestId('camera-canvas')).toBeInTheDocument();
    });
});

// ── TIFFContainer ─────────────────────────────────────────────────────────────

describe('TIFFContainer', () => {
    it('renders without crashing', () => {
        const { container } = render(<TIFFContainer prefix="13SIM1" />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('renders the TIFF canvas', () => {
        render(<TIFFContainer prefix="13SIM1" />);
        expect(screen.getByTestId('tiff-canvas')).toBeInTheDocument();
    });
});

// ── CameraCustomSetup ─────────────────────────────────────────────────────────

describe('CameraCustomSetup', () => {
    it('renders without crashing', () => {
        const { container } = render(<CameraCustomSetup />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('shows the "Custom Camera Setup" heading', () => {
        render(<CameraCustomSetup />);
        expect(screen.getByText('Custom Camera Setup')).toBeInTheDocument();
    });

    it('shows a warning when Connect is clicked without a prefix', () => {
        render(<CameraCustomSetup />);
        fireEvent.click(screen.getByTestId('button'));
        expect(screen.getByText(/Please confirm all inputs/)).toBeInTheDocument();
    });

    it('transitions to CameraContainer after a valid prefix is submitted', () => {
        render(<CameraCustomSetup />);
        fireEvent.change(screen.getByTestId('input-PV prefix'), { target: { value: '13SIM1' } });
        fireEvent.click(screen.getByTestId('button'));
        expect(screen.getByTestId('camera-canvas')).toBeInTheDocument();
    });
});
