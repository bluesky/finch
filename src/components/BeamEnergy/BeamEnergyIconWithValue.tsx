import useOphydSocket from '@/api/ophyd/useOphydSocket';
import { computeEnergyFromMonoAngle } from '@/components/BeamEnergy/utils/computeEnergyFromMonoAngle';
import { useMemo } from 'react';
import { beamlineIcons } from '@/assets/icons';

export type BeamEnergyIconWithValueProps = {
    /** EPICS PV for the monochromator angle. A '.RBV' suffix is appended automatically if not already present. Defaults to 'bl531_xps1:mono_angle_deg'. */
    pv?: string;
};
export default function BeamEnergy({
    pv = 'bl531_xps1:mono_angle_deg',
}: BeamEnergyIconWithValueProps) {
    let formattedPv = pv;
    if (!pv.endsWith('.RBV')) {
        formattedPv = `${pv}.RBV`;
    }
    const deviceList = useMemo(() => [formattedPv], [formattedPv]);
    const { devices } = useOphydSocket(deviceList);
    const formattedEnergy = devices[formattedPv]
        ? computeEnergyFromMonoAngle(devices[formattedPv].value as number).toPrecision(6)
        : 'N/A';
    return (
        <section className="relative w-fit h-fit">
            {beamlineIcons.mono}
            <p className="absolute bottom-1 left-1/2 -translate-x-1/2 font-medium text-slate-700 z-10">
                {formattedEnergy} ev
            </p>
        </section>
    );
}
