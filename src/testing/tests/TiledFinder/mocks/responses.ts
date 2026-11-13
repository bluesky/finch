import { TiledInfoResponse, TiledSearchResult } from '@/components/Tiled/types';

export const mockTiledResponse: TiledSearchResult = {
    data: [
        {
            id: 'sampleFolder',
            attributes: {
                ancestors: [],
                structure_family: 'container',
                specs: [],
                metadata: {
                    multiscales: [
                        {
                            '@type': 'ngff:Image',
                            axes: [
                                {
                                    name: 'z',
                                    type: 'space',
                                    unit: 'micrometer',
                                },
                                {
                                    name: 'y',
                                    type: 'space',
                                    unit: 'micrometer',
                                },
                                {
                                    name: 'x',
                                    type: 'space',
                                    unit: 'micrometer',
                                },
                            ],
                            datasets: [
                                {
                                    coordinateTransformations: [
                                        {
                                            scale: [0.639, 0.639, 0.639],
                                            type: 'scale',
                                        },
                                        {
                                            translation: [0.0, 0.0, 0.0],
                                            type: 'translation',
                                        },
                                    ],
                                    path: 'scale0/image',
                                },
                                {
                                    coordinateTransformations: [
                                        {
                                            scale: [1.278, 1.278, 1.278],
                                            type: 'scale',
                                        },
                                        {
                                            translation: [0.3195, 0.3195, 0.3195],
                                            type: 'translation',
                                        },
                                    ],
                                    path: 'scale1/image',
                                },
                                {
                                    coordinateTransformations: [
                                        {
                                            scale: [2.556, 2.556, 2.556],
                                            type: 'scale',
                                        },
                                        {
                                            translation: [0.9585, 0.9585, 0.9585],
                                            type: 'translation',
                                        },
                                    ],
                                    path: 'scale2/image',
                                },
                                {
                                    coordinateTransformations: [
                                        {
                                            scale: [5.112, 5.112, 5.112],
                                            type: 'scale',
                                        },
                                        {
                                            translation: [2.2365, 2.2365, 2.2365],
                                            type: 'translation',
                                        },
                                    ],
                                    path: 'scale3/image',
                                },
                                {
                                    coordinateTransformations: [
                                        {
                                            scale: [10.224, 10.224, 10.224],
                                            type: 'scale',
                                        },
                                        {
                                            translation: [4.7925, 4.7925, 4.7925],
                                            type: 'translation',
                                        },
                                    ],
                                    path: 'scale4/image',
                                },
                                {
                                    coordinateTransformations: [
                                        {
                                            scale: [20.448, 10.224, 10.224],
                                            type: 'scale',
                                        },
                                        {
                                            translation: [9.9045, 4.7925, 4.7925],
                                            type: 'translation',
                                        },
                                    ],
                                    path: 'image',
                                },
                            ],
                            name: 'image',
                            version: '0.4',
                        },
                    ],
                },
                structure: {
                    contents: null,
                    count: 0,
                },
                sorting: [
                    {
                        key: '',
                        direction: 1,
                    },
                ],
                data_sources: null,
            },
            links: {
                self: 'http://localhost:8000/api/v1/metadata/sampleFolder',
                search: 'http://localhost:8000/api/v1/search/sampleFolder',
                full: 'http://localhost:8000/api/v1/container/full/sampleFolder',
            },
            meta: null,
        },
    ],
    error: null,
    links: {
        self: 'http://localhost:8000/api/v1/search/?page[offset]=0&page[limit]=100',
        first: 'http://localhost:8000/api/v1/search/?page[offset]=0&page[limit]=100',
        last: 'http://localhost:8000/api/v1/search/?page[offset]=0&page[limit]=100',
        next: null,
        prev: null,
    },
    meta: {
        count: 1,
    },
};

export const mockTiledResponseFolder: TiledSearchResult = {
    data: [
        {
            id: 'image',
            attributes: {
                ancestors: ['sampleFolder'],
                structure_family: 'array',
                specs: [],
                metadata: {},
                structure: {
                    data_type: {
                        endianness: 'little',
                        kind: 'f',
                        itemsize: 4,
                        dt_units: null,
                    },
                    chunks: [
                        [128, 7],
                        [128, 32],
                        [128, 32],
                    ],
                    shape: [135, 160, 160],
                    dims: null,
                    resizable: false,
                },
                sorting: null,
                data_sources: null,
            },
            links: {
                self: 'https://tiled-demo.blueskyproject.io/api/v1/metadata/sampleFolder/image',
                full: 'https://tiled-demo.blueskyproject.io/api/v1/array/full/sampleFolder/image',
                block: 'https://tiled-demo.blueskyproject.io/api/v1/array/block/sampleFolder/image?block={0},{1},{2}',
            },
            meta: null,
        },
    ],
    error: null,
    links: {
        self: 'https://tiled-demo.blueskyproject.io/api/v1/search/sampleFolder?page[offset]=0&page[limit]=100',
        first: 'https://tiled-demo.blueskyproject.io/api/v1/search/sampleFolder?page[offset]=0&page[limit]=100',
        last: 'https://tiled-demo.blueskyproject.io/api/v1/search/sampleFolder?page[offset]=0&page[limit]=100',
        next: null,
        prev: null,
    },
    meta: {
        count: 1,
    },
};

export const mockTiledInfoResponse: TiledInfoResponse = {
    api_version: 0,
    library_version: '0.1.dev2523+g6314f1d.d20250507',
    formats: {
        container: ['application/x-hdf5', 'application/json'],
        array: [
            'application/octet-stream',
            'application/json',
            'text/csv',
            'text/x-comma-separated-values',
            'text/plain',
            'image/png',
            'image/tiff',
            'text/html',
        ],
        awkward: [
            'application/zip',
            'application/json',
            'application/vnd.apache.arrow.file',
            'application/x-parquet',
        ],
        table: [
            'application/vnd.apache.arrow.file',
            'application/x-parquet',
            'text/csv',
            'text/x-comma-separated-values',
            'text/plain',
            'text/html',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/json',
            'application/json-seq',
            'application/x-hdf5',
        ],
        sparse: [
            'application/x-hdf5',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.apache.arrow.file',
            'application/x-parquet',
            'text/csv',
            'text/plain',
            'text/html',
            'application/json',
        ],
        xarray_dataset: [
            'application/netcdf',
            'application/x-netcdf',
            'application/vnd.apache.arrow.file',
            'application/x-parquet',
            'text/csv',
            'text/comma-separated-values',
            'text/plain',
            'text/html',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/json',
            'application/x-hdf5',
        ],
    },
    aliases: {
        container: {
            'application/x-hdf5': ['h5', 'hdf5'],
            'application/json': ['json'],
            'application/x-parquet': ['parquet'],
            'application/vnd.apache.arrow.file': ['arrow', 'feather'],
            'application/netcdf': ['nc'],
            'text/plain': ['text', 'txt'],
        },
        array: {
            'application/json': ['json'],
            'text/csv': ['csv'],
            'image/png': ['png'],
            'image/tiff': ['tiff', 'tif'],
            'text/html': ['html', 'htm'],
            'application/x-hdf5': ['h5', 'hdf5'],
            'application/x-parquet': ['parquet'],
            'application/vnd.apache.arrow.file': ['arrow', 'feather'],
            'application/netcdf': ['nc'],
            'text/plain': ['text', 'txt'],
        },
        awkward: {
            'application/zip': ['zip'],
            'application/json': ['json'],
            'application/x-hdf5': ['h5', 'hdf5'],
            'application/x-parquet': ['parquet'],
            'application/vnd.apache.arrow.file': ['arrow', 'feather'],
            'application/netcdf': ['nc'],
            'text/plain': ['text', 'txt'],
        },
        table: {
            'text/csv': ['csv'],
            'text/html': ['html', 'htm'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
            'application/json': ['json'],
            'application/x-hdf5': ['h5', 'hdf5'],
            'application/x-parquet': ['parquet'],
            'application/vnd.apache.arrow.file': ['arrow', 'feather'],
            'application/netcdf': ['nc'],
            'text/plain': ['text', 'txt'],
        },
        sparse: {
            'application/x-hdf5': ['h5', 'hdf5'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
            'text/csv': ['csv'],
            'text/html': ['html', 'htm'],
            'application/json': ['json'],
            'application/x-parquet': ['parquet'],
            'application/vnd.apache.arrow.file': ['arrow', 'feather'],
            'application/netcdf': ['nc'],
            'text/plain': ['text', 'txt'],
        },
        xarray_dataset: {
            'application/x-netcdf': ['cdf', 'nc'],
            'text/csv': ['csv'],
            'text/html': ['html', 'htm'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
            'application/json': ['json'],
            'application/x-hdf5': ['h5', 'hdf5'],
            'application/x-parquet': ['parquet'],
            'application/vnd.apache.arrow.file': ['arrow', 'feather'],
            'application/netcdf': ['nc'],
            'text/plain': ['text', 'txt'],
        },
    },
    queries: [
        'fulltext',
        'lookup',
        'keys_filter',
        'regex',
        'eq',
        'noteq',
        'comparison',
        'contains',
        'in',
        'notin',
        'specs',
        'structure_family',
    ],
    authentication: {
        required: true,
        providers: [
            {
                provider: 'toy',
                mode: 'password',
                links: {
                    auth_endpoint: 'http://localhost:8000/api/v1/auth/provider/toy/token',
                },
                confirmation_message: 'You have logged in as {id}.',
            },
            {
                provider: 'orcid',
                mode: 'external',
                links: {
                    auth_endpoint: 'http://localhost:8000/api/v1/auth/provider/orcid/authorize',
                },
                confirmation_message: 'You have logged in with ORCID as {id}.',
            },
        ],
        links: {
            whoami: 'http://localhost:8000/api/v1/auth/whoami',
            apikey: 'http://localhost:8000/api/v1/auth/apikey',
            refresh_session: 'http://localhost:8000/api/v1/auth/session/refresh',
            revoke_session: 'http://localhost:8000/api/v1/auth/session/revoke/{session_id}',
            logout: 'http://localhost:8000/api/v1/auth/logout',
        },
    },
    links: {
        self: 'http://localhost:8000/api/v1',
        documentation: 'http://localhost:8000/api/v1/docs',
    },
    meta: {
        root_path: '/api',
    },
};

export const mockTiled401Response = {
    detail: 'Could not validate credentials',
};

export const mockTiled404Response = {
    detail: 'Not Found',
};

//a search result from http://tiled.localhost:8000/api/v1/search/?page%5Blimit%5D=2&sort=-
export const mockTiledSearch2PageLimitResponse: TiledSearchResult = {
    data: [
        {
            id: '0e0699be-aaec-432f-b373-b19b95bbef5d',
            attributes: {
                ancestors: [],
                structure_family: 'container',
                specs: [
                    {
                        name: 'BlueskyRun',
                        version: '3.0',
                    },
                ],
                metadata: {
                    start: {
                        uid: '0e0699be-aaec-432f-b373-b19b95bbef5d',
                        time: 1764698478.53384,
                        versions: {
                            ophyd: '1.11.0',
                            bluesky: '1.14.4',
                        },
                        scan_id: 1,
                        plan_type: 'generator',
                        plan_name: 'count',
                        detectors: ['jittery_motor1'],
                        num_points: 5,
                        num_intervals: 4,
                        plan_args: {
                            detectors: [
                                "SynAxis(prefix='', name='jittery_motor1', read_attrs=['readback', 'setpoint'], configuration_attrs=['velocity', 'acceleration'])",
                            ],
                            num: 5,
                            delay: 1,
                        },
                        hints: {
                            dimensions: [[['time'], 'primary']],
                        },
                    },
                    stop: {
                        uid: 'e4790eba-2eae-4a33-abd5-30dcbabb649c',
                        time: 1764698483.965216,
                        run_start: '0e0699be-aaec-432f-b373-b19b95bbef5d',
                        exit_status: 'success',
                        reason: '',
                        num_events: {
                            baseline: 2,
                            primary: 5,
                        },
                    },
                },
                structure: {
                    contents: null,
                    count: 1,
                },
                access_blob: {},
                sorting: [
                    {
                        key: '',
                        direction: 1,
                    },
                ],
                data_sources: null,
            },
            links: {
                self: 'http://tiled.localhost:8000/api/v1/metadata/0e0699be-aaec-432f-b373-b19b95bbef5d',
                search: 'http://tiled.localhost:8000/api/v1/search/0e0699be-aaec-432f-b373-b19b95bbef5d',
                full: 'http://tiled.localhost:8000/api/v1/container/full/0e0699be-aaec-432f-b373-b19b95bbef5d',
            },
            meta: null,
        },
        {
            id: '547e809b-57ed-488b-897e-4595ccb17efa',
            attributes: {
                ancestors: [],
                structure_family: 'container',
                specs: [
                    {
                        name: 'BlueskyRun',
                        version: '3.0',
                    },
                ],
                metadata: {
                    start: {
                        uid: '547e809b-57ed-488b-897e-4595ccb17efa',
                        time: 1764111549.736429,
                        versions: {
                            ophyd: '1.11.0',
                            bluesky: '1.14.4',
                        },
                        scan_id: 2,
                        plan_type: 'generator',
                        plan_name: 'count',
                        detectors: ['det'],
                        num_points: 10,
                        num_intervals: 9,
                        plan_args: {
                            detectors: [
                                "SynGauss(prefix='', name='det', read_attrs=['val'], configuration_attrs=['Imax', 'center', 'sigma', 'noise', 'noise_multiplier'])",
                            ],
                            num: 10,
                            delay: 10,
                        },
                        hints: {
                            dimensions: [[['time'], 'primary']],
                        },
                    },
                    stop: {
                        uid: '255a9f7c-9ff7-4fa6-8644-c16bce61330e',
                        time: 1764114304.857074,
                        run_start: '547e809b-57ed-488b-897e-4595ccb17efa',
                        exit_status: 'abort',
                        reason: '',
                        num_events: {
                            primary: 3,
                        },
                    },
                },
                structure: {
                    contents: null,
                    count: 1,
                },
                access_blob: {},
                sorting: [
                    {
                        key: '',
                        direction: 1,
                    },
                ],
                data_sources: null,
            },
            links: {
                self: 'http://tiled.localhost:8000/api/v1/metadata/547e809b-57ed-488b-897e-4595ccb17efa',
                search: 'http://tiled.localhost:8000/api/v1/search/547e809b-57ed-488b-897e-4595ccb17efa',
                full: 'http://tiled.localhost:8000/api/v1/container/full/547e809b-57ed-488b-897e-4595ccb17efa',
            },
            meta: null,
        },
    ],
    error: null,
    links: {
        self: 'http://tiled.localhost:8000/api/v1/search/?page[offset]=0&page[limit]=2',
        first: 'http://tiled.localhost:8000/api/v1/search/?page[offset]=0&page[limit]=2',
        last: 'http://tiled.localhost:8000/api/v1/search/?page[offset]=62&page[limit]=2',
        next: 'http://tiled.localhost:8000/api/v1/search/?page[offset]=2&page[limit]=2',
        prev: null,
    },
    meta: {
        count: 62,
    },
};
