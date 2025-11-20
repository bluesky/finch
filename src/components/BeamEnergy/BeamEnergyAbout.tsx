import { Device, OphydDevice } from "@/types/deviceControllerTypes"
type BeamEnergyAboutProps = {
    device: Device | OphydDevice
}
export default function BeamEnergyAbout({device}: BeamEnergyAboutProps) {
    return (
        <pre className="text-xs">{JSON.stringify(device, null, 2)}</pre>
    )
}