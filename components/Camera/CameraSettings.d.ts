type CameraSettingsProps = {
    enableSettings?: boolean;
    settings: {
        title: string;
        prefix: string | null;
        inputs: {
            suffix: string;
            label: string;
            type: 'enum' | 'float' | 'integer' | 'string' | 'boolean';
            min?: number;
            max?: number;
            enums?: string[];
        }[];
    }[];
    prefix?: string;
    cameraSettingsPVs: {
        [key: string]: any;
    };
    onSubmit?: (pv: string, value: string | boolean | number) => void;
};
export default function CameraSettings({ enableSettings, settings, prefix, cameraSettingsPVs, onSubmit }: CameraSettingsProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=CameraSettings.d.ts.map