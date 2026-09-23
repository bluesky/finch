import { AxiosInstance } from 'axios';
import { InterceptorHandle } from '../types/common';
type Installer = (client: AxiosInstance) => InterceptorHandle;
/**
 * Tracks which axios interceptors the client installed itself versus which a caller
 * registered, so that:
 *
 * - `clearInterceptors()` can never remove the built-in auth or refresh handlers, and
 * - `setAxiosClient()` can re-install everything onto a replacement instance in the
 *   original registration order.
 *
 * Each interceptor is stored together with the closure that installs it, because axios
 * interceptor ids are per-instance and are reassigned on re-installation.
 */
export declare class InterceptorRegistry {
    private builtins;
    private users;
    /** Install and remember a built-in interceptor. Never removed by `clearUsers`. */
    registerBuiltin(client: AxiosInstance, install: Installer): InterceptorHandle;
    /** Install and remember a caller-supplied interceptor. */
    registerUser(client: AxiosInstance, install: Installer): InterceptorHandle;
    /** Remove one caller-supplied interceptor. Built-ins and unknown handles are ignored. */
    ejectUser(client: AxiosInstance, handle: InterceptorHandle): boolean;
    /** Remove every caller-supplied interceptor, optionally of one kind only. */
    clearUsers(client: AxiosInstance, kind?: 'request' | 'response'): void;
    /** Handles of caller-supplied interceptors, in registration order. */
    listUsers(): readonly InterceptorHandle[];
    /**
     * Re-install every remembered interceptor onto a replacement instance, built-ins first
     * so that ordering semantics are preserved.
     */
    reinstallOn(client: AxiosInstance): void;
}
export {};
//# sourceMappingURL=interceptorRegistry.d.ts.map