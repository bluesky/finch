import { OphydPVTransport } from './transport/types';
import { OphydDeviceTransport } from './transport/deviceTypes';
import { CameraSocketFactory } from '../../lib/ophyd-sim';
export declare const PVTransportContext: import('../../../node_modules/react').Context<OphydPVTransport | null>;
export declare const DeviceTransportContext: import('../../../node_modules/react').Context<OphydDeviceTransport | null>;
export declare const CameraSocketFactoryContext: import('../../../node_modules/react').Context<CameraSocketFactory | null>;
/**
 * Read the PV-socket transport from context, or construct a default
 * WebSocket transport pointed at the configured ophyd backend.
 *
 * The fallback transport is memoized per URL so re-renders of consumers
 * don't churn connections.
 */
export declare function useOphydPVTransport(overrideUrl?: string): OphydPVTransport;
export declare function useOphydDeviceTransport(overrideUrl?: string): OphydDeviceTransport;
/**
 * Read the camera socket factory from context, or fall back to one that wraps
 * the real browser `WebSocket`. Unlike the transport hooks this never throws —
 * a default always exists, so cameras work with no provider present.
 */
export declare function useCameraSocketFactory(): CameraSocketFactory;
//# sourceMappingURL=OphydTransportContext.d.ts.map