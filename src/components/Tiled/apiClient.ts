import axios from "axios";
axios.defaults.withCredentials = true; // allow cookies to be sent with requests
import { sampleTiledSearchData } from "./sampleData";
import { TiledSearchResult } from "./types";

// Getting a CORS error?
// when you start tiled, need to pass in CORS
//ex) TILED_ALLOW_ORIGINS=http://localhost:5174 tiled serve demo

const getDefaultTiledUrl = () => {
    const address = window.location.hostname;
    try{
        if (import.meta.env.VITE_API_TILED_URL) {
            console.log('using env variable for tiled url: ', import.meta.env.VITE_API_TILED_URL);
            return import.meta.env.VITE_API_TILED_URL;
        } else {
            return `http://${address}:8000/api/v1`;
        }
    } catch(e) {
        console.error('error parsing VITE_API_TILED_URL env: ', e)
        return `http://${address}:8000/api/v1`;
    }
};

const getTiledApiKey = () => {
    try{
        if (import.meta.env.VITE_API_TILED_API_KEY) {
            return import.meta.env.VITE_API_TILED_API_KEY;
        } else {
            return null;
        }
    } catch(e) {
        console.error('error parsing VITE_API_TILED_API_KEY: ', e)
        return null;
    }
}

const setBearerToken = (token:string) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
};
// const sampleTableUrl = http://localhost:8000/api/v1/table/partition/short_table?partition=0&format=application/json-seq

const defaultTiledUrl = getDefaultTiledUrl();
const tiledApiKey = getTiledApiKey();
//add return type of tiledresponse or null
const getSearchResults = async (searchPath?:string, url?:string, cb?:(res:TiledSearchResult)=>void, mock?:boolean):Promise<TiledSearchResult | null> => {
    if (mock) {
        cb && cb(sampleTiledSearchData.data);
        return sampleTiledSearchData.data;
    }
    try {
        console.log('doing search')
        const baseUrl = url ? url : defaultTiledUrl;
        const response = await axios.get(baseUrl + '/search/' + (searchPath ? searchPath : ''));
        cb && cb(response.data as TiledSearchResult);
        return response.data as TiledSearchResult;
    } catch (error) {
        console.error('Error searching path: ', error);
        console.log('If you are getting a CORS error, make sure to start tiled with the TILED_ALLOW_ORIGINS environment variable set to your frontend URL');
        return null;
    }
};

const getFirstSearchWithApiKey = async (apiKey:string, searchPath?:string, url?:string, cb?:(res:TiledSearchResult)=>void,  mock?:boolean):Promise<TiledSearchResult | null> => {
    //after first successful GET using apikey, tiled stores a cookie and the apiKey is no longer required for subsequent requests
    if (mock) {
        cb && cb(sampleTiledSearchData.data);
        return sampleTiledSearchData.data as TiledSearchResult;
    }
    try {
        const baseUrl = url ? url : defaultTiledUrl;
        const response = await axios.get(baseUrl + '/search/' + (searchPath ? searchPath : '') + '?api_key=' + apiKey);
        return response.data;
    } catch (error) {
        console.error('Error searching path: ', error);
        console.log('If you are getting a CORS error, make sure to start tiled with the TILED_ALLOW_ORIGINS environment variable set to your frontend URL');
        return null;
    }
};

const getTableData = async(searchPath:string, partition:number, url?:string) => {
    try {
        const baseUrl = url ? url : defaultTiledUrl;
        const response = await axios.get(baseUrl + '/table/partition/' + searchPath + '?partition=' + partition + '&format=application/json-seq');
        //the data comes as a long string that unfortunately does not comply with JSON.parse(data)
        const parsedData = response.data
            .trim() // Remove any extra newlines at start or end
            .split("\n") // Split by line
            .map((line:any) => JSON.parse(line)); // Parse each line as JSON

        //console.log(parsedData); // Now it's an array of objects
        // [{ A: 0.5699, B: 1.1398, C: 1.7098 }, ...]
        return parsedData;
    } catch (error) {
        console.error('Error searching table data: ', error);
    }
}

const sampleImgUrl = 'http://127.0.0.1:8000/api/v1/array/full/small_image?format=image/png&slice=';
const sample3dCubeUrlat50thStack = 'http://127.0.0.1:8000/api/v1/array/full/tiny_cube?format=image/png&slice=49,::1,::1'

const sampleSearchData = [
    {
        "id": "big_image",
        "attributes": {
            "ancestors": [],
            "structure_family": "array",
            "specs": [],
            "metadata": {},
            "structure": {
                "data_type": {
                    "endianness": "little",
                    "kind": "f",
                    "itemsize": 8,
                    "dt_units": null
                },
                "chunks": [
                    [
                        4096,
                        4096,
                        1808
                    ],
                    [
                        4096,
                        4096,
                        1808
                    ]
                ],
                "shape": [
                    10000,
                    10000
                ],
                "dims": null,
                "resizable": false
            },
            "sorting": null,
            "data_sources": null
        },
        "links": {
            "self": "http://127.0.0.1:8000/api/v1/metadata/big_image",
            "full": "http://127.0.0.1:8000/api/v1/array/full/big_image",
            "block": "http://127.0.0.1:8000/api/v1/array/block/big_image?block={0},{1}"
        },
        "meta": null
    },
    {
        "id": "small_image",
        "attributes": {
            "ancestors": [],
            "structure_family": "array",
            "specs": [],
            "metadata": {},
            "structure": {
                "data_type": {
                    "endianness": "little",
                    "kind": "f",
                    "itemsize": 8,
                    "dt_units": null
                },
                "chunks": [
                    [
                        300
                    ],
                    [
                        300
                    ]
                ],
                "shape": [
                    300,
                    300
                ],
                "dims": null,
                "resizable": false
            },
            "sorting": null,
            "data_sources": null
        },
        "links": {
            "self": "http://127.0.0.1:8000/api/v1/metadata/small_image",
            "full": "http://127.0.0.1:8000/api/v1/array/full/small_image",
            "block": "http://127.0.0.1:8000/api/v1/array/block/small_image?block={0},{1}"
        },
        "meta": null
    },
    {
        "id": "medium_image",
        "attributes": {
            "ancestors": [],
            "structure_family": "array",
            "specs": [],
            "metadata": {},
            "structure": {
                "data_type": {
                    "endianness": "little",
                    "kind": "f",
                    "itemsize": 8,
                    "dt_units": null
                },
                "chunks": [
                    [
                        1000
                    ],
                    [
                        1000
                    ]
                ],
                "shape": [
                    1000,
                    1000
                ],
                "dims": null,
                "resizable": false
            },
            "sorting": null,
            "data_sources": null
        },
        "links": {
            "self": "http://127.0.0.1:8000/api/v1/metadata/medium_image",
            "full": "http://127.0.0.1:8000/api/v1/array/full/medium_image",
            "block": "http://127.0.0.1:8000/api/v1/array/block/medium_image?block={0},{1}"
        },
        "meta": null
    },
    {
        "id": "sparse_image",
        "attributes": {
            "ancestors": [],
            "structure_family": "sparse",
            "specs": [],
            "metadata": {},
            "structure": {
                "shape": [
                    100,
                    100
                ],
                "chunks": [
                    [
                        100
                    ],
                    [
                        100
                    ]
                ],
                "dims": null,
                "resizable": false,
                "layout": "COO"
            },
            "sorting": null,
            "data_sources": null
        },
        "links": {
            "self": "http://127.0.0.1:8000/api/v1/metadata/sparse_image",
            "full": "http://127.0.0.1:8000/api/v1/array/full/sparse_image",
            "block": "http://127.0.0.1:8000/api/v1/array/block/sparse_image?block={0},{1}"
        },
        "meta": null
    },
];

const paths:string[] = [
    'structured_data',
    'big_image'
];


const sampleColumnData = [
    sampleTiledSearchData.data,
    sampleTiledSearchData.data,
    sampleTiledSearchData.data
];


export { getSearchResults, getDefaultTiledUrl, getTableData, getFirstSearchWithApiKey, setBearerToken}