import type {
    ActionRequestSubscribe,
    ActionRequestUnsubscribe,
    ActionRequestSet,
    ActionRequestRefresh,
    MessageResponse,
    ErrorResponse,
    ValueUpdateResponse,
    MetaUpdateResponse,
} from '@/api/ophyd/ophydPVSocketTypes';

export type OphydPVOutgoingMessage =
    | ActionRequestSubscribe
    | ActionRequestUnsubscribe
    | ActionRequestSet
    | ActionRequestRefresh;

export type OphydPVIncomingMessage =
    | MessageResponse
    | ErrorResponse
    | ValueUpdateResponse
    | MetaUpdateResponse;

export type OphydTransportStatus = 'connecting' | 'open' | 'closed' | 'error';

export type OphydPVMessageListener = (message: OphydPVIncomingMessage) => void;
export type OphydTransportStatusListener = (status: OphydTransportStatus) => void;
export type Unsubscribe = () => void;

/**
 * Abstraction over the wire used by useOphydPVSocket.
 *
 * Implementations route the existing PV-socket message protocol to either a
 * real WebSocket backend or an in-process simulator. Hooks consume a transport
 * from context; per-call lifecycle (open/close) is owned by the transport, not
 * the hook.
 */
export interface OphydPVTransport {
    send(message: OphydPVOutgoingMessage): void;
    onMessage(listener: OphydPVMessageListener): Unsubscribe;
    onStatus(listener: OphydTransportStatusListener): Unsubscribe;
    close(): void;
}
