import { QServerSocketChannel } from '../../api/qServer';
export interface SocketPaneProps {
    channel: QServerSocketChannel;
    baseUrl: string;
    apiKey: string | null;
}
/**
 * One live websocket, with a switch for both auth mechanisms.
 *
 * `query` mode puts the key in the URL (the only option a browser has at handshake time);
 * `message` mode connects bare and sends `{"type":"auth", …}` as the first frame.
 */
export default function SocketPane({ channel, baseUrl, apiKey }: SocketPaneProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=SocketPane.d.ts.map