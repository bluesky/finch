import { describe, expect, it } from 'vitest';
import spec from '../../api/qServer/openapi.json';
import { QSERVER_ENDPOINTS, getReadOnlyEndpoints } from '../../api/qServer/endpointRegistry';
import { QServerApiClient } from '../../api/qServer/client/QServerApiClient';
import {
    BODY_REQUIRED_GET_ENDPOINT_IDS,
    NO_BROWSER_PATH_ENDPOINT_IDS,
    PAYLOAD_GET_ENDPOINT_IDS,
} from '../../api/qServer/client/getBodySupport';
import { QSERVER_PATHS } from '../../api/qServer/types/paths';
import * as facade from '../../api/qServer/client/facade';

type SpecPaths = Record<string, Record<string, { requestBody?: unknown }>>;
const paths = spec.paths as unknown as SpecPaths;

/** Every `(METHOD, path)` pair the spec declares. */
function specOperations(): string[] {
    const operations: string[] = [];
    for (const [path, methods] of Object.entries(paths)) {
        for (const method of Object.keys(methods)) {
            operations.push(`${method.toUpperCase()} ${path}`);
        }
    }
    return operations.sort();
}

/**
 * These assertions are the completeness proof for the client: if the spec is regenerated
 * and gains, loses or reshapes an operation, this file fails rather than the client quietly
 * lacking a method.
 */
describe('qServer endpoint registry', () => {
    it('covers every operation in openapi.json, and no others', () => {
        const registryOperations = QSERVER_ENDPOINTS.map(
            (endpoint) => `${endpoint.method} ${endpoint.path}`,
        ).sort();
        expect(registryOperations).toEqual(specOperations());
    });

    it('describes 70 operations across 68 paths', () => {
        expect(QSERVER_ENDPOINTS).toHaveLength(70);
        expect(Object.keys(paths)).toHaveLength(68);
    });

    it('has unique endpoint ids', () => {
        const ids = QSERVER_ENDPOINTS.map((endpoint) => endpoint.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('names a real client method for every descriptor', () => {
        for (const endpoint of QSERVER_ENDPOINTS) {
            const method = (QServerApiClient.prototype as unknown as Record<string, unknown>)[
                endpoint.fn
            ];
            expect(typeof method, `${endpoint.id} -> ${endpoint.fn}`).toBe('function');
        }
    });

    it('exports a free function per descriptor', () => {
        const exported = facade as unknown as Record<string, unknown>;
        for (const endpoint of QSERVER_ENDPOINTS) {
            expect(typeof exported[endpoint.fn], `facade.${endpoint.fn}`).toBe('function');
        }
    });

    it('registers every spec path in QSERVER_PATHS', () => {
        expect(new Set(Object.values(QSERVER_PATHS))).toEqual(new Set(Object.keys(paths)));
    });

    it('flags exactly the GETs that read a request body', () => {
        const fromSpec = Object.entries(paths)
            .filter(([, methods]) => methods.get && 'requestBody' in methods.get)
            .map(([path]) => path)
            .sort();
        const fromRegistry = QSERVER_ENDPOINTS.filter((endpoint) => endpoint.payloadGet)
            .map((endpoint) => endpoint.path)
            .sort();

        expect(fromRegistry).toEqual(fromSpec);
        expect(fromRegistry).toHaveLength(18);
        expect(PAYLOAD_GET_ENDPOINT_IDS).toHaveLength(18);
    });

    it('agrees with getBodySupport about payload-GET ids', () => {
        const registryIds = QSERVER_ENDPOINTS.filter((endpoint) => endpoint.payloadGet)
            .map((endpoint) => endpoint.id)
            .sort();
        expect(registryIds).toEqual([...PAYLOAD_GET_ENDPOINT_IDS].sort());

        const bodyRequiredIds = QSERVER_ENDPOINTS.filter((endpoint) => endpoint.bodyRequired)
            .map((endpoint) => endpoint.id)
            .sort();
        expect(bodyRequiredIds).toEqual([...BODY_REQUIRED_GET_ENDPOINT_IDS].sort());
    });

    it('marks only the task endpoints as unusable from a browser', () => {
        const notBrowserSafe = QSERVER_ENDPOINTS.filter((endpoint) => !endpoint.browserSafe).map(
            (endpoint) => endpoint.id,
        );
        expect(notBrowserSafe.sort()).toEqual([...NO_BROWSER_PATH_ENDPOINT_IDS].sort());
    });

    it('gives every body-required payload-GET either a fallback or a browser-safe:false flag', () => {
        for (const endpoint of QSERVER_ENDPOINTS.filter((e) => e.bodyRequired)) {
            expect(
                endpoint.hasFallback || !endpoint.browserSafe,
                `${endpoint.id} needs a body a browser cannot send, so it must declare a fallback`,
            ).toBe(true);
        }
    });

    it('keeps destructive and parameterised endpoints out of the read-only sweep', () => {
        for (const endpoint of getReadOnlyEndpoints()) {
            expect(endpoint.method).toBe('GET');
            expect(endpoint.destructive).toBeFalsy();
            expect(endpoint.streaming).toBeFalsy();
            expect(endpoint.params?.some((param) => param.required)).toBeFalsy();
        }
    });
});
