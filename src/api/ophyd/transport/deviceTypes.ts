import type {
    ActionRequestSubscribe,
    ActionRequestUnsubscribe,
    ActionRequestSet,
    ActionRequestRefresh,
    MessageResponse,
    ErrorResponse,
    ValueUpdateResponse,
    MetaUpdateResponse,
} from '@/api/ophyd/ophydDeviceSocketTypes';
import type { OphydTransportStatus, Unsubscribe } from './types';

export type OphydDeviceOutgoingMessage =
    | ActionRequestSubscribe
    | ActionRequestUnsubscribe
    | ActionRequestSet
    | ActionRequestRefresh;

export type OphydDeviceIncomingMessage =
    | MessageResponse
    | ErrorResponse
    | ValueUpdateResponse
    | MetaUpdateResponse;

export type OphydDeviceMessageListener = (message: OphydDeviceIncomingMessage) => void;

export interface OphydDeviceTransport {
    send(message: OphydDeviceOutgoingMessage): void;
    onMessage(listener: OphydDeviceMessageListener): Unsubscribe;
    onStatus(listener: (status: OphydTransportStatus) => void): Unsubscribe;
    close(): void;
}
