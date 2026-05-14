import { deviceIcons } from '@/assets/icons';

export type BeamEnergyTitleIconProps = {
    /** Title text to display below the icon. */
    title: string;
    /** Subtitle text (e.g. EPICS PV name) to display below the title. */
    pv: string;
    showIcon?: boolean; // Optional prop to control whether the icon is displayed
};
export default function BeamEnergyTitleIcon({
    title,
    pv,
    showIcon = true,
}: BeamEnergyTitleIconProps) {
    return (
        <div className="flex flex-col items-center justify-start">
            <h2 className="text-sky-900 font-semibold text-md">{title}</h2>
            <h3 className="text-sky-900 font-extralight -mt-2">{pv}</h3>
            {showIcon && <span className="w-36 mt-2 h-auto">{deviceIcons.monoLargeNoArrows}</span>}
        </div>
    );
}
