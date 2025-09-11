import { default as React } from '../../../../../node_modules/react';
import { ComponentConfig } from '../../types/ComponentConfig';
interface ControlPanelProps {
    onAxisHover: (axis: 'X' | 'Y' | 'Z', dirSign: 1 | -1) => void;
    onAxisUnhover: () => void;
    panelOpen: boolean;
    togglePanel: () => void;
    configs: ComponentConfig[];
    setConfigs: React.Dispatch<React.SetStateAction<ComponentConfig[]>>;
    isPlaying: boolean;
    handlePlayPause: () => void;
    playAngle: number;
    handleManualAngleChange: (val: number) => void;
    cameraX: number;
    setCameraX: (val: number) => void;
    motorX: number;
    motorY: number;
    motorZ: number;
    horizX: number;
    horizY: number;
    horizZ: number;
    handleCenteringStageXChange: (val: number) => void;
    handleCenteringStageYChange: (val: number) => void;
    handleCenteringStageZChange: (val: number) => void;
    handleStageXChange: (val: number) => void;
    handleStageYChange: (val: number) => void;
    handleStageZChange: (val: number) => void;
    handleToggleVisibility: (id: string) => void;
    controlLayout: {
        common?: {
            camera?: boolean;
            beam?: boolean;
            shutter?: boolean;
        };
        stages?: any[];
        sample?: any;
    };
}
declare const ControlPanel: React.FC<ControlPanelProps>;
export default ControlPanel;
//# sourceMappingURL=ControlPanel.d.ts.map