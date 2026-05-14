import { Device, OphydDevice } from '@/types/deviceControllerTypes';
import { cn } from '@/lib/utils';
export type HexapodAboutProps = {
    /** The device object whose raw fields are pretty-printed as JSON. */
    device: Device | OphydDevice;
    /** Additional CSS class names to apply to the pre element. */
    className?: string;
};
export default function HexapodAbout({ device, className }: HexapodAboutProps) {
    return <pre className={cn('text-xs', className)}>{JSON.stringify(device, null, 2)}</pre>;
}
