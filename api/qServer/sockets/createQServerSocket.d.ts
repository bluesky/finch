import { QServerSocketOptions, QServerSocketTransport } from './types';
/**
 * Connect to one of the queue server's send-only websockets.
 *
 * Behaviour worth knowing:
 *
 * - **No outbound traffic** after the optional auth frame. The server ignores client frames
 *   and implements no application-level ping/pong, so inventing keepalives would be noise.
 * - **Auth failures do not reconnect.** Close codes 4401/4001 mean the credentials are
 *   wrong; retrying would hammer the server with the same bad key.
 * - **Frames may be missing.** The server's per-client queue holds 1000 messages and drops
 *   the oldest on overflow, so consumers must tolerate gaps.
 */
export declare function createQServerSocket<TFrame>(options: QServerSocketOptions<TFrame>): QServerSocketTransport<TFrame>;
//# sourceMappingURL=createQServerSocket.d.ts.map