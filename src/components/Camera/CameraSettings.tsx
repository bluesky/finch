import InputGroup from './InputGroup';
import { cn } from '@/lib/utils';

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
        }[]
    }[];
    prefix?: string;
    cameraSettingsPVs: {[key:string]: any};
    onSubmit?: (pv:string, value:string | boolean | number) => void,
    styles?: string;
}
export default function CameraSettings({enableSettings=true, settings=[], prefix='13SIM1:cam1', cameraSettingsPVs={}, onSubmit=()=>{}, styles}: CameraSettingsProps) {

    return (
        <section className={cn("w-full h-full min-w-[30rem] px-4 py-2 bg-slate-100 rounded-md shadow-lg", styles)}>
            <div>
                {settings.map((group) => <InputGroup key={group.title} settingsGroup={group} prefix={prefix} cameraSettingsPVs={cameraSettingsPVs} onSubmit={onSubmit}/>)}
            </div>
        </section>
    )
}