import { QServerApiClient } from '../../api/qServer';
export interface InterceptorPlaygroundProps {
    client: QServerApiClient;
}
/**
 * Exercises the interceptor utilities.
 *
 * Worth checking by hand: after "Clear all", requests still authenticate — the built-in auth
 * and refresh handlers are tracked separately and survive `clearInterceptors()`.
 */
export default function InterceptorPlayground({ client }: InterceptorPlaygroundProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=InterceptorPlayground.d.ts.map