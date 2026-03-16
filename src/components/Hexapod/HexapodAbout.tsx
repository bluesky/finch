import { Device, OphydDevice } from "@/types/deviceControllerTypes";
import { cn } from "@/lib/utils";
export type HexapodAboutProps = {
    device: Device | OphydDevice;
    className?: string;
}
export default function HexapodAbout({ device, className }: HexapodAboutProps) {
    return (
        <pre className={cn("text-xs", className)}>{JSON.stringify(device, null, 2)}</pre>
    )
}