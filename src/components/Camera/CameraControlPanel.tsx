//import ButtonWithIcon from "../library/ButtonWithIcon";
import ButtonWithIcon from '../ButtonWithIcon';
import { phosphorIcons } from '../../assets/icons';
import { Device } from '@/types/deviceControllerTypes';

type CameraControlPanelProps = {
    /** Live device object for the `cam1:Acquire` PV, containing `connected`, `value`, and `enum_strs` fields. */
    cameraControlPV: Device;
    /** Callback to start image acquisition (sets `cam1:Acquire` to 1). */
    startAcquire: () => void;
    /** Callback to stop image acquisition (sets `cam1:Acquire` to 0). */
    stopAcquire: () => void;
};
export default function CameraControlPanel({
    cameraControlPV,
    startAcquire,
    stopAcquire,
}: CameraControlPanelProps) {
    if (!cameraControlPV) return;

    let text = 'PV Not Connected';
    if (cameraControlPV.connected) {
        if (cameraControlPV.enum_strs && cameraControlPV.value !== undefined) {
            text = cameraControlPV.enum_strs[cameraControlPV.value as number];
        }
    }

    return (
        <section className="w-full flex flex-col">
            <p className="text-center text-black text-sm py-1">Acquisition Status: {text}</p>
            <div
                className={`flex justify-center space-x-8 group ${!cameraControlPV.connected && 'opacity-50'}`}
            >
                <ButtonWithIcon
                    cb={startAcquire}
                    text="Acquire"
                    disabled={!cameraControlPV.connected}
                    icon={phosphorIcons.camera}
                />
                <ButtonWithIcon
                    cb={stopAcquire}
                    text="Pause"
                    disabled={!cameraControlPV.connected}
                    icon={phosphorIcons.cameraSlash}
                    isSecondary={true}
                />
            </div>
        </section>
    );
}
