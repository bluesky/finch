import useOphydSocket from "@/hooks/useOphydSocket";
import { computeEnergyFromMonoAngle } from "@/utils/computeEnergyFromMonoAngle";
import { useMemo } from "react";
import { beamlineIcons } from "@/assets/icons";

export type BeamEnergyProps = {
    pv?: string
}
export default function BeamEnergy({pv="bl531_xps1:mono_angle_deg"}:BeamEnergyProps) {
    const deviceList = useMemo(()=> [pv], [pv]);
    const { devices } = useOphydSocket(deviceList);
    const formattedEnergy = devices[pv] ? computeEnergyFromMonoAngle(devices[pv].value as number).toPrecision(6) : 'N/A'
    return (
        <section className="relative w-fit h-fit">
            {beamlineIcons.mono}
            <p className="absolute bottom-1 left-1/2 -translate-x-1/2 font-medium text-slate-700 z-10">{formattedEnergy} ev</p>
        </section>
    )
}