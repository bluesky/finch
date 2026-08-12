import type {
    OphydPVIncomingMessage,
    OphydPVMessageListener,
    OphydPVOutgoingMessage,
    OphydPVTransport,
    OphydTransportStatusListener,
    Unsubscribe,
} from '@/api/ophyd/transport/types';
import type { MetaUpdateResponse } from '@/api/ophyd/ophydPVSocketTypes';
import type { OphydSim, SimValue, PVMetadata } from '../core/types';

/**
 * Adapt an OphydSim instance to the OphydPVTransport interface, speaking the
 * existing PV-socket wire protocol.
 *
 * On `subscribe`, immediately emits a synthesized `meta` message so finch
 * shows the device as connected, then forwards every value change as a
 * value-update message. `set` writes to the sim. `unsubscribe` drops the
 * subscription. The transport reports `'open'` synchronously on first status
 * listener attach — there's no real handshake to wait for.
 *
 * Multiple subscribe messages for the same PV install independent listeners
 * (each gets its own value stream); unsubscribe drops the most recent
 * listener for that PV, matching how the existing hook expects to operate.
 */
export function createOphydSimTransport(sim: OphydSim): OphydPVTransport {
    const messageListeners = new Set<OphydPVMessageListener>();
    const statusListeners = new Set<OphydTransportStatusListener>();
    const pvSubscriptions = new Map<string, Unsubscribe[]>();
    let closed = false;

    const emit = (message: OphydPVIncomingMessage): void => {
        for (const listener of messageListeners) {
            try {
                listener(message);
            } catch (err) {
                console.error('[ophyd-sim] transport message listener threw:', err);
            }
        }
    };

    const send = (message: OphydPVOutgoingMessage): void => {
        if (closed) return;
        switch (message.action) {
            case 'subscribe':
            case 'subscribeSafely':
            case 'subscribeReadOnly': {
                const pv = message.pv;
                emit(buildMetaMessage(pv, sim));
                const unsub = sim.subscribe(pv, (event) => {
                    emit(buildValueMessage(pv, event.value, event.timestamp, sim));
                });
                const list = pvSubscriptions.get(pv) ?? [];
                list.push(unsub);
                pvSubscriptions.set(pv, list);
                break;
            }
            case 'unsubscribe': {
                const pv = message.pv;
                const list = pvSubscriptions.get(pv);
                const popped = list?.pop();
                if (popped) popped();
                if (list && list.length === 0) pvSubscriptions.delete(pv);
                break;
            }
            case 'set': {
                sim.set(message.pv, message.value);
                break;
            }
            case 'refresh': {
                // Replay every active subscription's latest value.
                for (const pv of pvSubscriptions.keys()) {
                    const v = sim.get(pv);
                    if (v !== undefined) {
                        emit(buildValueMessage(pv, v, Date.now(), sim));
                    }
                }
                break;
            }
        }
    };

    return {
        send,
        onMessage(listener) {
            messageListeners.add(listener);
            return () => messageListeners.delete(listener);
        },
        onStatus(listener) {
            statusListeners.add(listener);
            // Sim transport is always open from the consumer's perspective —
            // emit synchronously so hook subscribers see the connection.
            listener(closed ? 'closed' : 'open');
            return () => statusListeners.delete(listener);
        },
        close() {
            if (closed) return;
            closed = true;
            for (const list of pvSubscriptions.values()) {
                for (const u of list) u();
            }
            pvSubscriptions.clear();
            for (const l of statusListeners) {
                try {
                    l('closed');
                } catch (err) {
                    console.error('[ophyd-sim] status listener threw on close:', err);
                }
            }
        },
    };
}

function metadataToFields(metadata: PVMetadata | undefined): {
    units: string;
    lower_ctrl_limit: number | null;
    upper_ctrl_limit: number | null;
    precision: number;
    enum_strs: null | string[];
    read_access: boolean;
    write_access: boolean;
} {
    return {
        units: metadata?.units ?? '',
        lower_ctrl_limit: metadata?.lower_ctrl_limit ?? null,
        upper_ctrl_limit: metadata?.upper_ctrl_limit ?? null,
        precision: metadata?.precision ?? 0,
        enum_strs: metadata?.enum_strs ?? null,
        read_access: metadata?.read_access ?? true,
        write_access: metadata?.write_access ?? false,
    };
}

function buildMetaMessage(pv: string, sim: OphydSim): MetaUpdateResponse {
    const value = sim.get(pv);
    const meta = metadataToFields(sim.metadata(pv));
    return {
        sub_type: 'meta',
        pv,
        value: (value ?? 0) as SimValue,
        timestamp: Date.now(),
        connected: value !== undefined,
        status: 0,
        severity: 0,
        setpoint_timestamp: null,
        setpoint_status: null,
        setpoint_severity: null,
        setpoint_precision: null,
        ...meta,
    };
}

function buildValueMessage(
    pv: string,
    value: SimValue,
    timestamp: number,
    sim: OphydSim,
): {
    pv: string;
    value: SimValue;
    timestamp: number;
    connected: boolean;
    read_access: boolean;
    write_access: boolean;
} {
    const meta = sim.metadata(pv);
    return {
        pv,
        value,
        timestamp,
        connected: true,
        read_access: meta?.read_access ?? true,
        write_access: meta?.write_access ?? false,
    };
}
