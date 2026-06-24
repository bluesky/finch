import { Devices } from '@/types/deviceControllerTypes';
import InputGroup from './InputGroup';
import { cn } from '@/lib/utils';

type CameraSettingsProps = {
    /** When `false`, the settings panel is hidden entirely. Defaults to `true`. */
    enableSettings?: boolean;
    /** Array of grouped detector settings, each describing a title, PV sub-prefix, and a list of inputs. */
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
    /** EPICS PV prefix prepended to each input suffix when constructing full PV names. */
    prefix?: string;
    /** Map of full PV names to their live device objects, used to display current values and connection state. */
    cameraSettingsPVs: Devices;
    /** Callback invoked when the user submits a new value for a PV. Receives the full PV name and new value. */
    onSubmit?: (pv: string, value: string | boolean | number) => void;
    /** Additional Tailwind class names applied to the settings panel container. */
    styles?: string;
};
export default function CameraSettings({
    enableSettings = true,
    settings = [],
    prefix = '13SIM1:cam1',
    cameraSettingsPVs = {},
    onSubmit = () => {},
    styles,
}: CameraSettingsProps) {
    if (enableSettings) {
        return (
            <section
                className={cn(
                    'w-full h-full min-w-[30rem] px-4 py-2 bg-slate-100 rounded-md shadow-lg',
                    styles,
                )}
            >
                <div>
                    {settings.map((group) => (
                        <InputGroup
                            key={group.title}
                            settingsGroup={group}
                            prefix={prefix}
                            cameraSettingsPVs={cameraSettingsPVs}
                            onSubmit={onSubmit}
                        />
                    ))}
                </div>
            </section>
        );
    } else {
        return <></>;
    }
}
