/**
 * Runtime wiring for the queue-server API: the client-agnostic provider boundary.
 *
 * Kept separate from `@/api/qServer_new` (which is the real HTTP implementation) and from
 * `@/lib/qserver-sim` (which is a simulator), so neither has to know about the other.
 */

export { QSERVER_CLIENT_LIKE_METHODS } from './clientLike';
export type { QServerClientLike } from './clientLike';
export {
    QServerApiProvider,
    useQServerApiClient,
    useQServerApiClientOptional,
    useQServerSocketFactory,
} from './QServerApiProvider';
export type { QServerApiProviderProps, QServerSocketFactory } from './QServerApiProvider';
