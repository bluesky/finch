import type {
    OphydDeviceTransport,
    OphydDeviceMessageListener,
} from '@/api/ophyd/transport/deviceTypes';
import type { MetaUpdateResponse, ValueUpdateResponse } from '@/api/ophyd/ophydDeviceSocketTypes';
import type { OphydTransportStatus } from '@/api/ophyd/transport/types';

/**
 * Per-device configuration for {@link createMockDeviceTransport}.
 *
 * ophyd-sim only implements a *PV* transport, so the device-socket components
 * (`BeamEnergyOphyd`, `SignalMonitorPlotOphyd`) can't be driven by it. This tiny
 * in-memory transport stands in for a device-socket backend in Storybook: it
 * reports every configured device as connected, answers `set` writes, and — when
 * `animate` is given — streams a live, changing value so plots move.
 */
export type MockDeviceConfig = {
    /** Value emitted on subscribe (and the starting point for `animate`). */
    initialValue: number;
    units?: string;
    min?: number;
    max?: number;
    /** Whether the device reports `write_access`. Defaults to false. */
    writable?: boolean;
    /**
     * When set, the value is recomputed every `periodMs` from the elapsed time
     * (seconds) and the previous value, and a fresh value update is emitted.
     */
    animate?: (elapsedSeconds: number, current: number) => number;
    /** Emit interval for `animate`, in ms. Defaults to 500. */
    periodMs?: number;
};

/** Build a mock {@link OphydDeviceTransport} serving the given devices. */
export function createMockDeviceTransport(
    devices: Record<string, MockDeviceConfig>,
): OphydDeviceTransport {
    const listeners = new Set<OphydDeviceMessageListener>();
    const values: Record<string, number> = {};
    const timers: Record<string, ReturnType<typeof setInterval>> = {};
    const start = Date.now();

    for (const [name, cfg] of Object.entries(devices)) values[name] = cfg.initialValue;

    const emit = (msg: ValueUpdateResponse | MetaUpdateResponse) =>
        listeners.forEach((listener) => listener(msg));

    const valueMessage = (name: string): ValueUpdateResponse => ({
        device: name,
        value: values[name],
        timestamp: Date.now() / 1000,
        connected: true,
        read_access: true,
        write_access: devices[name].writable ?? false,
    });

    const metaMessage = (name: string): MetaUpdateResponse => {
        const cfg = devices[name];
        return {
            ...valueMessage(name),
            sub_type: 'meta',
            status: 0,
            severity: 0,
            precision: 3,
            setpoint_timestamp: null,
            setpoint_status: null,
            setpoint_severity: null,
            lower_ctrl_limit: cfg.min ?? null,
            upper_ctrl_limit: cfg.max ?? null,
            units: cfg.units ?? '',
            enum_strs: null,
            setpoint_precision: null,
        };
    };

    return {
        send(message) {
            const name = 'device' in message ? message.device : undefined;
            if (!name || !(name in values)) return;

            if (
                message.action === 'subscribe' ||
                message.action === 'subscribeSafely' ||
                message.action === 'subscribeReadOnly'
            ) {
                // Meta first so the device shows connected, then the value.
                emit(metaMessage(name));
                emit(valueMessage(name));
                const cfg = devices[name];
                if (cfg.animate && !timers[name]) {
                    timers[name] = setInterval(() => {
                        values[name] = cfg.animate!((Date.now() - start) / 1000, values[name]);
                        emit(valueMessage(name));
                    }, cfg.periodMs ?? 500);
                }
            } else if (message.action === 'set') {
                values[name] = Number(message.value);
                emit(valueMessage(name));
            } else if (message.action === 'unsubscribe') {
                if (timers[name]) {
                    clearInterval(timers[name]);
                    delete timers[name];
                }
            }
        },
        onMessage(listener) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        onStatus(listener) {
            listener('open' satisfies OphydTransportStatus);
            return () => {};
        },
        close() {
            Object.values(timers).forEach(clearInterval);
            listeners.clear();
        },
    };
}
