import { default as React, CSSProperties } from '../../../../../node_modules/react';
import { ComponentConfig } from '../../types/ComponentConfig';
interface StageLayout {
    id: string;
    type: string;
}
interface ControlLayout {
    common?: {
        camera?: boolean;
        beam?: boolean;
        shutter?: boolean;
    };
    stages?: StageLayout[];
    sample?: any;
}
interface ControlModulesProps {
    configs: ComponentConfig[];
    setConfigs: React.Dispatch<React.SetStateAction<ComponentConfig[]>>;
    playAngle: number;
    handleManualAngleChange: (val: number) => void;
    handleStageXChange: (val: number) => void;
    handleStageYChange: (val: number) => void;
    handleStageZChange: (val: number) => void;
    motorX: number;
    motorY: number;
    motorZ: number;
    handleCenteringStageXChange: (val: number) => void;
    handleCenteringStageYChange: (val: number) => void;
    handleCenteringStageZChange: (val: number) => void;
    cameraX: number;
    setCameraX: (val: number) => void;
    buttonStyle: CSSProperties;
    sectionStyle: CSSProperties;
    labelStyle: CSSProperties;
    sliderStyle: CSSProperties;
    controlLayout: ControlLayout;
}
declare const ControlModules: React.FC<ControlModulesProps>;
export default ControlModules;
//# sourceMappingURL=ControlModules.d.ts.map