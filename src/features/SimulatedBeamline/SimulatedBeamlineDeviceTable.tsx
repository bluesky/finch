import useOphydPVSocket from '@/api/ophyd/useOphydPVSocket';
import TableDeviceControllerWithRBV from '@/components/TableDeviceControllerWithRBV';

/**
 * Beam energy, sample X/Y, and beamstop X/Y — the writable beamline devices,
 * driven through the same sim transport that feeds EndstationDisplay and the
 * camera, so moves made here update those views live.
 */
const BEAMLINE_DEVICES = [
    'bl531_xps2:beamstop_x_mm',
    'bl531_xps2:beamstop_y_mm',
    'bl531:sample_x_mm',
    'bl531:sample_y_mm',
    'bl531:mono_energy_eV',
];
const BEAMLINE_DEVICES_RBV = [
    'bl531_xps2:beamstop_x_mm.RBV',
    'bl531_xps2:beamstop_y_mm.RBV',
    'bl531:sample_x_mm.RBV',
    'bl531:sample_y_mm.RBV',
    'bl531:mono_energy_eV.RBV',
];

type SimulatedBeamlineDeviceTableProps = {
    /** Additional CSS classes applied to the device table (e.g. a shared panel height). */
    className?: string;
};

export default function SimulatedBeamlineDeviceTable({
    className,
}: SimulatedBeamlineDeviceTableProps) {
    const { devices, handleSetValueRequest, toggleDeviceLock, toggleExpand } =
        useOphydPVSocket(BEAMLINE_DEVICES);

    const { devices: devicesRBV } = useOphydPVSocket(BEAMLINE_DEVICES_RBV);
    return (
        <TableDeviceControllerWithRBV
            devices={devices}
            devicesRBV={devicesRBV}
            handleSetValueRequest={handleSetValueRequest}
            toggleDeviceLock={toggleDeviceLock}
            toggleExpand={toggleExpand}
            collapsibleRelativeMove
            className={className}
        />
    );
}
