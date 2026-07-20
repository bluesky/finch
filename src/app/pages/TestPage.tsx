import { OphydTransportProvider } from '@/api/ophyd/OphydTransportProvider';
import {
    OphydSimProvider,
    createOphydSimTransport,
    beamstopBeamline,
    beamstopCurrentModel,
    simDetectorConfig,
    createSimDetectorCameraSocketFactory,
    SHUTTER_OPEN_VALUE,
} from '@/lib/ophyd-sim';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import useOphydPVSocket from '@/api/ophyd/useOphydPVSocket';
import CameraCanvas from '@/components/Camera/CameraCanvas';
import Shutter from '@/components/Shutter';
import TableDeviceController from '@/components/TableDeviceController';
import SignalMonitorPlotPV from '@/components/SignalMonitorPlotPV';
import EnergyVsCurrentPlotPV from '@/components/EnergyVsCurrentPlotPV';
import Button from '@/components/Button';
import { HUB_HEADER_RIGHT_SLOT_ID } from '@/components/HubHeader';
import EndstationDisplay from '@/components/EndstationDisplay/EndstationDisplay';
import TableDeviceControllerWithRBV from '@/components/TableDeviceControllerWithRBV';

const BEAMSTOP_CURRENT = 'bl201-beamstop:current';
const BEAMSTOP_X = 'bl531_xps2:beamstop_x_mm';
const BEAMSTOP_Y = 'bl531_xps2:beamstop_y_mm';
const BEAMSTOP_ENERGY = 'bl531:mono_energy_eV';
/** Shared height for the device table and the beamstop-current plot beside it,
 *  so the two panels line up. Sized to fit the table's fixed five rows. */
const PANEL_HEIGHT = 'h-[280px]';
/** Beamstop motor travel (mm); both axes are symmetric [-LIMIT, +LIMIT]. */
const BEAMSTOP_LIMIT_MM = 10;

/**
 * Grid-search the noise-free current model for the beamstop X/Y that maximizes
 * |diode current| at a given energy — i.e. the beam center. Two passes: a coarse
 * sweep across the full travel, then a fine sweep around the coarse winner.
 */
function findPeakPosition(energyEV: number) {
    const search = (
        xMin: number,
        xMax: number,
        yMin: number,
        yMax: number,
        step: number,
    ) => {
        let best = { x: 0, y: 0, current: -Infinity };
        for (let x = xMin; x <= xMax + 1e-9; x += step) {
            for (let y = yMin; y <= yMax + 1e-9; y += step) {
                const current = Math.abs(beamstopCurrentModel({ x, y, energyEV }));
                if (current > best.current) best = { x, y, current };
            }
        }
        return best;
    };

    const L = BEAMSTOP_LIMIT_MM;
    const coarse = search(-L, L, -L, L, 0.25);
    const clamp = (v: number) => Math.max(-L, Math.min(L, v));
    return search(
        clamp(coarse.x - 0.25),
        clamp(coarse.x + 0.25),
        clamp(coarse.y - 0.25),
        clamp(coarse.y + 0.25),
        0.01,
    );
}

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

function BeamlineDeviceTable() {
    const { devices, handleSetValueRequest, toggleDeviceLock, toggleExpand } =
        useOphydPVSocket(BEAMLINE_DEVICES);

    const { devices:devicesRBV} =
        useOphydPVSocket(BEAMLINE_DEVICES_RBV);
    return (
        <TableDeviceControllerWithRBV
            devices={devices}
            devicesRBV={devicesRBV}
            handleSetValueRequest={handleSetValueRequest}
            toggleDeviceLock={toggleDeviceLock}
            toggleExpand={toggleExpand}
            collapsibleRelativeMove
            className={PANEL_HEIGHT}
        />
    );
}

/**
 * Computes the beamstop X/Y that maximizes the diode current for the current
 * beam energy (the beam center), and drives the beamstop there on demand.
 * The optimum is recomputed whenever the energy changes, since the beam's
 * vertical position tracks energy.
 */
function BeamstopBestOption() {
    const deviceList = useMemo(
        () => [BEAMSTOP_CURRENT, BEAMSTOP_X, BEAMSTOP_Y, BEAMSTOP_ENERGY],
        [],
    );
    const { devices, handleSetValueRequest } = useOphydPVSocket(deviceList);

    const energyEV =
        typeof devices[BEAMSTOP_ENERGY]?.value === 'number'
            ? (devices[BEAMSTOP_ENERGY].value as number)
            : null;

    const peak = useMemo(() => (energyEV === null ? null : findPeakPosition(energyEV)), [energyEV]);

    const goToBest = () => {
        if (!peak) return;
        handleSetValueRequest(BEAMSTOP_X, Number(peak.x.toFixed(3)));
        handleSetValueRequest(BEAMSTOP_Y, Number(peak.y.toFixed(3)));
    };

    const currentUnits = devices[BEAMSTOP_CURRENT]?.units ?? 'A';
    const xUnits = devices[BEAMSTOP_X]?.units ?? 'mm';
    const yUnits = devices[BEAMSTOP_Y]?.units ?? 'mm';

    return (
        <div className="flex flex-col items-center gap-2 text-slate-800">
            <p>
                Optimal Beamstop X: {peak ? peak.x.toPrecision(4) : 'N/A'} {xUnits}
            </p>
            <p>
                Optimal Beamstop Y: {peak ? peak.y.toPrecision(4) : 'N/A'} {yUnits}
            </p>
            <p>
                Expected Current: {peak ? peak.current.toPrecision(5) : 'N/A'} {currentUnits}
            </p>
            <Button cb={goToBest} text="Go To Best" disabled={!peak} />
        </div>
    );
}

/** Shutter analog-output PV (0 V open / 5 V closed) — matches the <Shutter /> default. */
const SHUTTER_PV = 'bl531:LJT4:1:AO0';

/**
 * Simulated detector, paused whenever the beam shutter is not open. Subscribes
 * to the shutter PV and hands `CameraCanvas` a controlled `paused` flag so the
 * stream stops when the shutter closes and resumes when it reopens.
 */
function SimulatedDetector() {
    const deviceList = useMemo(() => [SHUTTER_PV], []);
    const { devices } = useOphydPVSocket(deviceList);
    const shutterOpen = Number(devices[SHUTTER_PV]?.value) === SHUTTER_OPEN_VALUE;
    return (
        <div className="[&_canvas]:h-[340px] [&_canvas]:w-[340px]">
            <CameraCanvas prefix="13SIM1" canvasSize="medium" paused={!shutterOpen} />
        </div>
    );
}

/**
 * Renders the shutter control into the app header's right-side slot. It stays
 * inside TestPage's Ophyd sim providers (so it keeps driving the simulated
 * beamline) while appearing in the global "Finch Dev Mode" header.
 */
function HeaderShutter() {
    const [slot, setSlot] = useState<HTMLElement | null>(null);
    useEffect(() => {
        setSlot(document.getElementById(HUB_HEADER_RIGHT_SLOT_ID));
    }, []);
    if (!slot) return null;
    // Drives bl531:LJT4:1:AO0 in beamstopBeamline; closing it (5 V) zeroes the diode.
    return createPortal(<Shutter className="w-72 scale-90" classNameContent="py-0.5" />, slot);
}

function TestPageBody() {
    return (
        <div className="flex flex-col gap-6 p-4">
            <HeaderShutter />
            {/* Top row: endstation graphic top-left, simulated detector to its
             * right, both image panels pinned to the same height (IMAGE_H). The
             * graphic's width follows from its 485/215 aspect ratio; the detector
             * canvas is scaled to match via the child selector. Wraps on narrow
             * screens. */}
            <div className="flex flex-wrap items-start gap-6">
                {/* Layered view of the beamline; reacts to the shutter + beamstop PVs. */}
                <EndstationDisplay className="h-[340px] w-auto max-w-full rounded" />
                {/* Simulated detector — scaled to the shared height and paused
                 * while the shutter is closed. No socketFactory prop — the sim
                 * factory is supplied via context below. */}
                <SimulatedDetector />
            </div>
            {/* Device table with the live beamstop-current trend to its side. */}
            <div className="flex flex-wrap items-start gap-6">
                {/* Beam energy, sample X/Y, and beamstop X/Y controls in one table. */}
                <BeamlineDeviceTable />
                {/* Beamstop current over time. */}
                <SignalMonitorPlotPV
                    pv="bl201-beamstop:current"
                    className={`${PANEL_HEIGHT} min-w-96 flex-1`}
                    numVisiblePoints={200}
                    tickTextIntervalSeconds={30}
                />
            </div>
            {/* Energy sweep plot and peak-finder. */}
            <div className="flex flex-wrap items-start gap-6">
                {/* Beamstop current vs. selected beam energy, keyed by beamstop X/Y position. */}
                <EnergyVsCurrentPlotPV
                    energyPv="bl531:mono_energy_eV"
                    currentPv="bl201-beamstop:current"
                    beamstopXRbvPv="bl531_xps2:beamstop_x_mm.RBV"
                    beamstopYRbvPv="bl531_xps2:beamstop_y_mm.RBV"
                    className="min-w-96"
                />
                {/* Finds the peak-current beamstop position and jumps there. */}
                <BeamstopBestOption />
            </div>
        </div>
    );
}

export default function TestPage() {
    const transport = useMemo(() => createOphydSimTransport(beamstopBeamline), []);
    // Camera frames are driven by the '13SIM1' detector in the same sim, so the
    // energy control in the device table modulates the image opacity live.
    const cameraSocketFactory = useMemo(
        () => createSimDetectorCameraSocketFactory(beamstopBeamline, simDetectorConfig),
        [],
    );
    return (
        <OphydSimProvider sim={beamstopBeamline}>
            <OphydTransportProvider transport={transport} cameraSocketFactory={cameraSocketFactory}>
                <TestPageBody />
            </OphydTransportProvider>
        </OphydSimProvider>
    );
}
