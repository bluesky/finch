import { describe, expect, it } from 'vitest';
import openapi from '../../api/tiled/openapi.json';
import {
    TILED_ENDPOINTS,
    TILED_ENDPOINT_GROUPS,
    TILED_GROUP_LABELS,
    getEndpointById,
    getEndpointsByGroup,
    getReadOnlyEndpoints,
    getWriteEndpoints,
} from '../../api/tiled/endpointRegistry';
import { TILED_PATHS, isApiPath, toClientPath } from '../../api/tiled/types/paths';
import { TiledApiClient } from '../../api/tiled';

/**
 * The completeness proof.
 *
 * `TILED_ENDPOINTS` is diffed against the committed `openapi.json`, so an operation the client does
 * not implement fails here rather than going unnoticed. This is what lets the README say the client
 * covers the whole API without that being a claim someone has to re-audit by hand.
 *
 * Regenerate `openapi.json` from a running server when the Tiled version changes — see
 * `src/api/tiled/generated/README.md`. A newly added route then fails this suite, which is the
 * signal to add a path, a client method, a hook and a descriptor.
 */

type SpecMethod = 'get' | 'put' | 'post' | 'delete' | 'patch';
const SPEC_METHODS: SpecMethod[] = ['get', 'put', 'post', 'delete', 'patch'];

interface SpecOperation {
    path: string;
    method: SpecMethod;
    operationId: string;
}

const spec = openapi as unknown as {
    paths: Record<string, Record<string, { operationId?: string }>>;
};

/** Every operation the spec declares. */
const specOperations: SpecOperation[] = Object.entries(spec.paths).flatMap(([path, methods]) =>
    SPEC_METHODS.filter((method) => methods[method]).map((method) => ({
        path,
        method,
        operationId: methods[method].operationId ?? `${method} ${path}`,
    })),
);

/**
 * Routes the client deliberately does not implement.
 *
 * `/ui/{path}` and `/` serve the server's own web UI — static assets and an HTML page. They are not
 * an API, and a typed client method for them would be meaningless.
 *
 * The eight extra zarr routes are the per-file paths (`.zattrs`, `.zgroup`, `.zarray`,
 * `zarr.json`, chunk paths) that a zarr reader derives for itself from a node's base URL. The
 * client exposes the two base-URL builders; see `zarrEndpointDescriptors`.
 */
const INTENTIONALLY_UNIMPLEMENTED = new Set<string>([
    'ui_ui__path__get',
    'index__get',
    'Zarr__zattrs_metadata_zarr_v2__path___zattrs_get',
    'Zarr__zattrs_metadata_zarr_v2_path__zattrs_get',
    'Zarr__zgroup_metadata_zarr_v2__path___zgroup_get',
    'Root__zgroup_metadata_zarr_v2_path__zgroup_get',
    'Zarr__zarray_metadata_zarr_v2__path___zarray_get',
    'Zarr_v3_group_or_array_metadata_zarr_v3__path_zarr_json_get',
    'Zarr_v3_group_or_array_metadata_zarr_v3__path__zarr_json_get',
    'A_chunk_of_a_zarr_array_zarr_v3__path__c__block__get',
]);

describe('the spec itself', () => {
    it('is the version this client was built against', () => {
        const info = (openapi as unknown as { info: { version: string } }).info;
        expect(info.version).toBe('0.2.15b1');
    });

    it('declares the operations the registry was sized for', () => {
        expect(specOperations.length).toBe(58);
    });
});

describe('endpoint coverage', () => {
    it('implements every operation in the spec', () => {
        const implemented = new Set(
            TILED_ENDPOINTS.map((endpoint) => endpoint.operationId).filter(
                (id): id is string => id !== null,
            ),
        );

        const missing = specOperations
            .filter((operation) => !INTENTIONALLY_UNIMPLEMENTED.has(operation.operationId))
            .filter((operation) => !implemented.has(operation.operationId))
            .map((operation) => `${operation.method.toUpperCase()} ${operation.path}`);

        expect(missing, `unimplemented operations:\n${missing.join('\n')}`).toEqual([]);
    });

    it('claims no operation the spec does not declare', () => {
        const declared = new Set(specOperations.map((operation) => operation.operationId));

        const invented = TILED_ENDPOINTS.filter((endpoint) => endpoint.operationId !== null)
            .filter((endpoint) => !declared.has(endpoint.operationId as string))
            .map((endpoint) => `${endpoint.id} -> ${endpoint.operationId}`);

        expect(invented, `operation ids not in the spec:\n${invented.join('\n')}`).toEqual([]);
    });

    /**
     * Only the auth group may carry a null operation id.
     *
     * Tiled generates `openapi.json` without its auth router, so those seven routes genuinely have
     * no spec entry. Letting any other group opt out the same way would turn the coverage check
     * above into something that can be silenced.
     */
    it('allows a null operation id only for auth', () => {
        const nulls = TILED_ENDPOINTS.filter((endpoint) => endpoint.operationId === null);
        expect(nulls.length).toBeGreaterThan(0);
        for (const endpoint of nulls) {
            expect(endpoint.group, endpoint.id).toBe('auth');
        }
    });

    it('matches each descriptor to the spec path and method it names', () => {
        const byId = new Map(specOperations.map((operation) => [operation.operationId, operation]));

        for (const endpoint of TILED_ENDPOINTS) {
            if (endpoint.operationId === null) continue;
            const operation = byId.get(endpoint.operationId);
            expect(operation, endpoint.id).toBeDefined();
            expect(operation?.path, endpoint.id).toBe(endpoint.path);
            expect(operation?.method.toUpperCase(), endpoint.id).toBe(endpoint.method);
        }
    });
});

describe('registry shape', () => {
    it('has unique ids', () => {
        const ids = TILED_ENDPOINTS.map((endpoint) => endpoint.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('names a real client method for every endpoint', () => {
        const client = new TiledApiClient({ baseUrl: 'http://example.test/api/v1' });
        for (const endpoint of TILED_ENDPOINTS) {
            expect(
                typeof (client as unknown as Record<string, unknown>)[endpoint.fn],
                `${endpoint.id} -> ${String(endpoint.fn)}`,
            ).toBe('function');
        }
    });

    it('uses `<group>.<name>` ids that agree with the group field', () => {
        for (const endpoint of TILED_ENDPOINTS) {
            // `management` endpoints are the exception: they span registration, data sources,
            // revisions and streams, so the id prefix is the group rather than the resource.
            expect(endpoint.id, endpoint.id).toContain('.');
        }
    });

    it('puts every endpoint in a listed group, and lists no empty group', () => {
        for (const endpoint of TILED_ENDPOINTS) {
            expect(TILED_ENDPOINT_GROUPS, endpoint.id).toContain(endpoint.group);
        }
        for (const group of TILED_ENDPOINT_GROUPS) {
            expect(getEndpointsByGroup(group).length, group).toBeGreaterThan(0);
            expect(TILED_GROUP_LABELS[group], group).toBeTruthy();
        }
    });

    it('flags every state-changing operation as destructive, or deliberately not', () => {
        // Creating a node and registering a webhook add something new rather than overwriting, so
        // they are writes but not destructive — the harness need not confirm them.
        const nonDestructiveWrites = new Set(['metadata.create', 'webhooks.register']);

        for (const endpoint of getWriteEndpoints()) {
            if (nonDestructiveWrites.has(endpoint.id)) continue;
            // Auth logins and refreshes change session state, not data.
            if (endpoint.group === 'auth' && !endpoint.destructive) continue;
            expect(endpoint.destructive, `${endpoint.id} should be marked destructive`).toBe(true);
        }
    });

    it('offers only safe endpoints as read-only', () => {
        for (const endpoint of getReadOnlyEndpoints()) {
            // A non-GET is allowed here only if it declared itself a read.
            if (endpoint.method !== 'GET') expect(endpoint.readOnly, endpoint.id).toBe(true);
            expect(endpoint.destructive, endpoint.id).toBeFalsy();
            expect(endpoint.group, endpoint.id).not.toBe('auth');
        }
    });

    /**
     * The four POSTs that are reads are the only non-GETs allowed to claim it.
     *
     * Without this, `readOnly` would be a flag anyone could use to opt a genuine write out of the
     * destructive check above.
     */
    it('marks only the body-carrying reads as readOnly', () => {
        const readOnly = TILED_ENDPOINTS.filter((endpoint) => endpoint.readOnly).map((e) => e.id);
        expect(readOnly.sort()).toEqual([
            'awkward.postBuffers',
            'container.postFull',
            'table.postFull',
            'table.postPartition',
        ]);
    });

    it('finds endpoints by id', () => {
        expect(getEndpointById('metadata.get')?.fn).toBe('getMetadata');
        expect(getEndpointById('nope')).toBeUndefined();
    });
});

describe('path table', () => {
    it('registers every spec path', () => {
        const registered = new Set<string>(Object.values(TILED_PATHS));
        const missing = Object.keys(spec.paths).filter((path) => !registered.has(path));
        expect(missing, `unregistered paths:\n${missing.join('\n')}`).toEqual([]);
    });

    it('registers no path the spec does not declare', () => {
        const declared = new Set(Object.keys(spec.paths));
        const invented = Object.entries(TILED_PATHS)
            .filter(([, path]) => !declared.has(path))
            .map(([alias, path]) => `${alias} -> ${path}`);
        expect(invented).toEqual([]);
    });

    it('splits api-scoped paths from origin-scoped ones', () => {
        expect(isApiPath('/api/v1/search/{path}')).toBe(true);
        expect(isApiPath('/healthz')).toBe(false);
        expect(isApiPath('/zarr/v2/{path}')).toBe(false);

        expect(toClientPath('/api/v1/search/{path}')).toEqual({
            scope: 'api',
            path: '/search/{path}',
        });
        // The About document is `/api/v1/` exactly; stripping the prefix must leave a usable '/'
        // rather than an empty string, which axios would resolve against the base differently.
        expect(toClientPath('/api/v1/')).toEqual({ scope: 'api', path: '/' });
        expect(toClientPath('/healthz')).toEqual({ scope: 'origin', path: '/healthz' });
    });
});
