import { Device, OphydDevice } from '@/types/deviceControllerTypes';
import { cn } from '@/lib/utils';
type BeamEnergyAboutProps = {
    /** The device object whose raw fields are pretty-printed as JSON. */
    device: Device | OphydDevice;
    className?: string;
};
export default function BeamEnergyAbout({ device, className }: BeamEnergyAboutProps) {
    return <pre className={cn('text-xs', className)}>{JSON.stringify(device, null, 2)}</pre>;
}
