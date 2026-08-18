import type { AxiosInstance } from 'axios';
import type { InterceptorHandle } from '../types/common';

type Installer = (client: AxiosInstance) => InterceptorHandle;

interface RegistryEntry {
    handle: InterceptorHandle;
    install: Installer;
}

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
export class InterceptorRegistry {
    private builtins: RegistryEntry[] = [];
    private users: RegistryEntry[] = [];

    /** Install and remember a built-in interceptor. Never removed by `clearUsers`. */
    registerBuiltin(client: AxiosInstance, install: Installer): InterceptorHandle {
        const handle = install(client);
        this.builtins.push({ handle, install });
        return handle;
    }

    /** Install and remember a caller-supplied interceptor. */
    registerUser(client: AxiosInstance, install: Installer): InterceptorHandle {
        const handle = install(client);
        this.users.push({ handle, install });
        return handle;
    }

    /** Remove one caller-supplied interceptor. Built-ins and unknown handles are ignored. */
    ejectUser(client: AxiosInstance, handle: InterceptorHandle): boolean {
        const index = this.users.findIndex(
            (entry) => entry.handle.id === handle.id && entry.handle.kind === handle.kind,
        );
        if (index === -1) return false;
        this.users.splice(index, 1);
        eject(client, handle);
        return true;
    }

    /** Remove every caller-supplied interceptor, optionally of one kind only. */
    clearUsers(client: AxiosInstance, kind?: 'request' | 'response'): void {
        const remaining: RegistryEntry[] = [];
        for (const entry of this.users) {
            if (kind && entry.handle.kind !== kind) {
                remaining.push(entry);
                continue;
            }
            eject(client, entry.handle);
        }
        this.users = remaining;
    }

    /** Handles of caller-supplied interceptors, in registration order. */
    listUsers(): readonly InterceptorHandle[] {
        return this.users.map((entry) => entry.handle);
    }

    /**
     * Re-install every remembered interceptor onto a replacement instance, built-ins first
     * so that ordering semantics are preserved.
     */
    reinstallOn(client: AxiosInstance): void {
        this.builtins = this.builtins.map((entry) => ({
            handle: entry.install(client),
            install: entry.install,
        }));
        this.users = this.users.map((entry) => ({
            handle: entry.install(client),
            install: entry.install,
        }));
    }
}

function eject(client: AxiosInstance, handle: InterceptorHandle): void {
    if (handle.kind === 'request') client.interceptors.request.eject(handle.id);
    else client.interceptors.response.eject(handle.id);
}
