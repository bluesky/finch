//import ButtonWithIcon from "../library/ButtonWithIcon";
import ButtonWithIcon from "../ButtonWithIcon";
import { phosphorIcons } from "../../assets/icons";

type CameraControlPanelProps = {
    cameraControlPV: {
        [key: string]: any;
    };
    startAcquire: () => void;
    stopAcquire: () => void;
}
export default function CameraControlPanel({ cameraControlPV, startAcquire, stopAcquire}:CameraControlPanelProps) {
    
    const sampleAcquirePV = {
        "value": 0,
        "lastUpdate": "03:10:25 PM",
        "pv": "13SIM1:cam1:Acquire",
        "isConnected": true,
        "type": "update",
        "vtype": "VEnum",
        "labels": [
            "Done",
            "Acquire"
        ],
        "severity": "NONE",
        "text": "Done",
        "readonly": false,
        "seconds": 1729544045,
        "nanos": 563411000
    }
    

    if (!cameraControlPV) return;

    let text= 'PV Not Connected';
    if (cameraControlPV.connected) {
        text = cameraControlPV.enum_strs[cameraControlPV.value];
    }

    return (
        <section className="w-full flex flex-col">
            <p className="text-center text-black text-sm py-1">Acquisition Status: {text}</p>
            <div className={`flex justify-center space-x-8 group ${!cameraControlPV.connected && 'opacity-50'}`}>
                <ButtonWithIcon cb={startAcquire} text="Acquire" disabled={!cameraControlPV.connected} icon={phosphorIcons.camera} />
                <ButtonWithIcon cb={stopAcquire} text="Pause" disabled={!cameraControlPV.connected} icon={phosphorIcons.cameraSlash} isSecondary={true}/>
            </div>
        </section>
    )
}