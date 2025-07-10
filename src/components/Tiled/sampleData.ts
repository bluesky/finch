import { TiledSearchResult } from "./types";

const sampleTiledSearchData: TiledSearchResult = {
    "data": [
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
        {
            "id": "awkward_array",
            "attributes": {
                "ancestors": [],
                "structure_family": "awkward",
                "specs": [],
                "metadata": {},
                "structure": {
                    "length": 3,
                    "form": {
                        "class": "ListOffsetArray",
                        "offsets": "i64",
                        "content": {
                            "class": "RecordArray",
                            "fields": [
                                "x",
                                "y"
                            ],
                            "contents": [
                                {
                                    "class": "NumpyArray",
                                    "primitive": "float64",
                                    "inner_shape": [],
                                    "parameters": {},
                                    "form_key": "node2"
                                },
                                {
                                    "class": "ListOffsetArray",
                                    "offsets": "i64",
                                    "content": {
                                        "class": "NumpyArray",
                                        "primitive": "int64",
                                        "inner_shape": [],
                                        "parameters": {},
                                        "form_key": "node4"
                                    },
                                    "parameters": {},
                                    "form_key": "node3"
                                }
                            ],
                            "parameters": {},
                            "form_key": "node1"
                        },
                        "parameters": {},
                        "form_key": "node0"
                    }
                },
                "sorting": null,
                "data_sources": null
            },
            "links": {
                "self": "http://127.0.0.1:8000/api/v1/metadata/awkward_array",
                "buffers": "http://127.0.0.1:8000/api/v1/awkward/buffers/awkward_array",
                "full": "http://127.0.0.1:8000/api/v1/awkward/full/awkward_array"
            },
            "meta": null
        },
        {
            "id": "tiny_image",
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
                            50
                        ],
                        [
                            50
                        ]
                    ],
                    "shape": [
                        50,
                        50
                    ],
                    "dims": null,
                    "resizable": false
                },
                "sorting": null,
                "data_sources": null
            },
            "links": {
                "self": "http://127.0.0.1:8000/api/v1/metadata/tiny_image",
                "full": "http://127.0.0.1:8000/api/v1/array/full/tiny_image",
                "block": "http://127.0.0.1:8000/api/v1/array/block/tiny_image?block={0},{1}"
            },
            "meta": null
        },
        {
            "id": "tiny_cube",
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
                            50
                        ],
                        [
                            50
                        ],
                        [
                            50
                        ]
                    ],
                    "shape": [
                        50,
                        50,
                        50
                    ],
                    "dims": null,
                    "resizable": false
                },
                "sorting": null,
                "data_sources": null
            },
            "links": {
                "self": "http://127.0.0.1:8000/api/v1/metadata/tiny_cube",
                "full": "http://127.0.0.1:8000/api/v1/array/full/tiny_cube",
                "block": "http://127.0.0.1:8000/api/v1/array/block/tiny_cube?block={0},{1},{2}"
            },
            "meta": null
        },
        {
            "id": "tiny_hypercube",
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
                            27,
                            23
                        ],
                        [
                            27,
                            23
                        ],
                        [
                            27,
                            23
                        ],
                        [
                            27,
                            23
                        ],
                        [
                            27,
                            23
                        ]
                    ],
                    "shape": [
                        50,
                        50,
                        50,
                        50,
                        50
                    ],
                    "dims": null,
                    "resizable": false
                },
                "sorting": null,
                "data_sources": null
            },
            "links": {
                "self": "http://127.0.0.1:8000/api/v1/metadata/tiny_hypercube",
                "full": "http://127.0.0.1:8000/api/v1/array/full/tiny_hypercube",
                "block": "http://127.0.0.1:8000/api/v1/array/block/tiny_hypercube?block={0},{1},{2},{3},{4}"
            },
            "meta": null
        },
        {
            "id": "short_table",
            "attributes": {
                "ancestors": [],
                "structure_family": "table",
                "specs": [
                    {
                        "name": "dataframe",
                        "version": null
                    }
                ],
                "metadata": {
                    "animal": "dog",
                    "color": "red"
                },
                "structure": {
                    "arrow_schema": "data:application/vnd.apache.arrow.file;base64,/////+gDAAAQAAAAAAAKAA4ABgAFAAgACgAAAAABBAAQAAAAAAAKAAwAAAAEAAgACgAAAOACAAAEAAAAAQAAAAwAAAAIAAwABAAIAAgAAAC4AgAABAAAAKkCAAB7ImluZGV4X2NvbHVtbnMiOiBbImluZGV4Il0sICJjb2x1bW5faW5kZXhlcyI6IFt7Im5hbWUiOiBudWxsLCAiZmllbGRfbmFtZSI6IG51bGwsICJwYW5kYXNfdHlwZSI6ICJ1bmljb2RlIiwgIm51bXB5X3R5cGUiOiAib2JqZWN0IiwgIm1ldGFkYXRhIjogeyJlbmNvZGluZyI6ICJVVEYtOCJ9fV0sICJjb2x1bW5zIjogW3sibmFtZSI6ICJBIiwgImZpZWxkX25hbWUiOiAiQSIsICJwYW5kYXNfdHlwZSI6ICJmbG9hdDY0IiwgIm51bXB5X3R5cGUiOiAiZmxvYXQ2NCIsICJtZXRhZGF0YSI6IG51bGx9LCB7Im5hbWUiOiAiQiIsICJmaWVsZF9uYW1lIjogIkIiLCAicGFuZGFzX3R5cGUiOiAiZmxvYXQ2NCIsICJudW1weV90eXBlIjogImZsb2F0NjQiLCAibWV0YWRhdGEiOiBudWxsfSwgeyJuYW1lIjogIkMiLCAiZmllbGRfbmFtZSI6ICJDIiwgInBhbmRhc190eXBlIjogImZsb2F0NjQiLCAibnVtcHlfdHlwZSI6ICJmbG9hdDY0IiwgIm1ldGFkYXRhIjogbnVsbH0sIHsibmFtZSI6ICJpbmRleCIsICJmaWVsZF9uYW1lIjogImluZGV4IiwgInBhbmRhc190eXBlIjogImludDY0IiwgIm51bXB5X3R5cGUiOiAiaW50NjQiLCAibWV0YWRhdGEiOiBudWxsfV0sICJjcmVhdG9yIjogeyJsaWJyYXJ5IjogInB5YXJyb3ciLCAidmVyc2lvbiI6ICIxOC4xLjAifSwgInBhbmRhc192ZXJzaW9uIjogIjIuMi4zIn0AAAAGAAAAcGFuZGFzAAAEAAAAqAAAAGwAAABAAAAABAAAAHj///8AAAECEAAAACAAAAAEAAAAAAAAAAUAAABpbmRleAAAAAgADAAIAAcACAAAAAAAAAFAAAAAsP///wAAAQMQAAAAFAAAAAQAAAAAAAAAAQAAAEMAAACi////AAACANj///8AAAEDEAAAABQAAAAEAAAAAAAAAAEAAABCAAAAyv///wAAAgAQABQACAAGAAcADAAAABAAEAAAAAAAAQMQAAAAGAAAAAQAAAAAAAAAAQAAAEEABgAIAAYABgAAAAAAAgAAAAAA",
                    "npartitions": 1,
                    "columns": [
                        "A",
                        "B",
                        "C"
                    ],
                    "resizable": false
                },
                "sorting": null,
                "data_sources": null
            },
            "links": {
                "self": "http://127.0.0.1:8000/api/v1/metadata/short_table",
                "full": "http://127.0.0.1:8000/api/v1/table/full/short_table",
                "partition": "http://127.0.0.1:8000/api/v1/table/partition/short_table?partition={index}"
            },
            "meta": null
        },
        {
            "id": "long_table",
            "attributes": {
                "ancestors": [],
                "structure_family": "table",
                "specs": [
                    {
                        "name": "dataframe",
                        "version": null
                    }
                ],
                "metadata": {
                    "animal": "dog",
                    "color": "green"
                },
                "structure": {
                    "arrow_schema": "data:application/vnd.apache.arrow.file;base64,/////+gDAAAQAAAAAAAKAA4ABgAFAAgACgAAAAABBAAQAAAAAAAKAAwAAAAEAAgACgAAAOACAAAEAAAAAQAAAAwAAAAIAAwABAAIAAgAAAC4AgAABAAAAKkCAAB7ImluZGV4X2NvbHVtbnMiOiBbImluZGV4Il0sICJjb2x1bW5faW5kZXhlcyI6IFt7Im5hbWUiOiBudWxsLCAiZmllbGRfbmFtZSI6IG51bGwsICJwYW5kYXNfdHlwZSI6ICJ1bmljb2RlIiwgIm51bXB5X3R5cGUiOiAib2JqZWN0IiwgIm1ldGFkYXRhIjogeyJlbmNvZGluZyI6ICJVVEYtOCJ9fV0sICJjb2x1bW5zIjogW3sibmFtZSI6ICJBIiwgImZpZWxkX25hbWUiOiAiQSIsICJwYW5kYXNfdHlwZSI6ICJmbG9hdDY0IiwgIm51bXB5X3R5cGUiOiAiZmxvYXQ2NCIsICJtZXRhZGF0YSI6IG51bGx9LCB7Im5hbWUiOiAiQiIsICJmaWVsZF9uYW1lIjogIkIiLCAicGFuZGFzX3R5cGUiOiAiZmxvYXQ2NCIsICJudW1weV90eXBlIjogImZsb2F0NjQiLCAibWV0YWRhdGEiOiBudWxsfSwgeyJuYW1lIjogIkMiLCAiZmllbGRfbmFtZSI6ICJDIiwgInBhbmRhc190eXBlIjogImZsb2F0NjQiLCAibnVtcHlfdHlwZSI6ICJmbG9hdDY0IiwgIm1ldGFkYXRhIjogbnVsbH0sIHsibmFtZSI6ICJpbmRleCIsICJmaWVsZF9uYW1lIjogImluZGV4IiwgInBhbmRhc190eXBlIjogImludDY0IiwgIm51bXB5X3R5cGUiOiAiaW50NjQiLCAibWV0YWRhdGEiOiBudWxsfV0sICJjcmVhdG9yIjogeyJsaWJyYXJ5IjogInB5YXJyb3ciLCAidmVyc2lvbiI6ICIxOC4xLjAifSwgInBhbmRhc192ZXJzaW9uIjogIjIuMi4zIn0AAAAGAAAAcGFuZGFzAAAEAAAAqAAAAGwAAABAAAAABAAAAHj///8AAAECEAAAACAAAAAEAAAAAAAAAAUAAABpbmRleAAAAAgADAAIAAcACAAAAAAAAAFAAAAAsP///wAAAQMQAAAAFAAAAAQAAAAAAAAAAQAAAEMAAACi////AAACANj///8AAAEDEAAAABQAAAAEAAAAAAAAAAEAAABCAAAAyv///wAAAgAQABQACAAGAAcADAAAABAAEAAAAAAAAQMQAAAAGAAAAAQAAAAAAAAAAQAAAEEABgAIAAYABgAAAAAAAgAAAAAA",
                    "npartitions": 5,
                    "columns": [
                        "A",
                        "B",
                        "C"
                    ],
                    "resizable": false
                },
                "sorting": null,
                "data_sources": null
            },
            "links": {
                "self": "http://127.0.0.1:8000/api/v1/metadata/long_table",
                "full": "http://127.0.0.1:8000/api/v1/table/full/long_table",
                "partition": "http://127.0.0.1:8000/api/v1/table/partition/long_table?partition={index}"
            },
            "meta": null
        },
        {
            "id": "wide_table",
            "attributes": {
                "ancestors": [],
                "structure_family": "table",
                "specs": [
                    {
                        "name": "dataframe",
                        "version": null
                    }
                ],
                "metadata": {
                    "animal": "dog",
                    "color": "red"
                },
                "structure": {
                    "arrow_schema": "data:application/vnd.apache.arrow.file;base64,/////xgRAAAQAAAAAAAKAA4ABgAFAAgACgAAAAABBAAQAAAAAAAKAAwAAAAEAAgACgAAACAMAAAEAAAAAQAAAAwAAAAIAAwABAAIAAgAAAD4CwAABAAAAOoLAAB7ImluZGV4X2NvbHVtbnMiOiBbImluZGV4Il0sICJjb2x1bW5faW5kZXhlcyI6IFt7Im5hbWUiOiBudWxsLCAiZmllbGRfbmFtZSI6IG51bGwsICJwYW5kYXNfdHlwZSI6ICJ1bmljb2RlIiwgIm51bXB5X3R5cGUiOiAib2JqZWN0IiwgIm1ldGFkYXRhIjogeyJlbmNvZGluZyI6ICJVVEYtOCJ9fV0sICJjb2x1bW5zIjogW3sibmFtZSI6ICJBIiwgImZpZWxkX25hbWUiOiAiQSIsICJwYW5kYXNfdHlwZSI6ICJmbG9hdDY0IiwgIm51bXB5X3R5cGUiOiAiZmxvYXQ2NCIsICJtZXRhZGF0YSI6IG51bGx9LCB7Im5hbWUiOiAiQiIsICJmaWVsZF9uYW1lIjogIkIiLCAicGFuZGFzX3R5cGUiOiAiZmxvYXQ2NCIsICJudW1weV90eXBlIjogImZsb2F0NjQiLCAibWV0YWRhdGEiOiBudWxsfSwgeyJuYW1lIjogIkMiLCAiZmllbGRfbmFtZSI6ICJDIiwgInBhbmRhc190eXBlIjogImZsb2F0NjQiLCAibnVtcHlfdHlwZSI6ICJmbG9hdDY0IiwgIm1ldGFkYXRhIjogbnVsbH0sIHsibmFtZSI6ICJEIiwgImZpZWxkX25hbWUiOiAiRCIsICJwYW5kYXNfdHlwZSI6ICJmbG9hdDY0IiwgIm51bXB5X3R5cGUiOiAiZmxvYXQ2NCIsICJtZXRhZGF0YSI6IG51bGx9LCB7Im5hbWUiOiAiRSIsICJmaWVsZF9uYW1lIjogIkUiLCAicGFuZGFzX3R5cGUiOiAiZmxvYXQ2NCIsICJudW1weV90eXBlIjogImZsb2F0NjQiLCAibWV0YWRhdGEiOiBudWxsfSwgeyJuYW1lIjogIkYiLCAiZmllbGRfbmFtZSI6ICJGIiwgInBhbmRhc190eXBlIjogImZsb2F0NjQiLCAibnVtcHlfdHlwZSI6ICJmbG9hdDY0IiwgIm1ldGFkYXRhIjogbnVsbH0sIHsibmFtZSI6ICJHIiwgImZpZWxkX25hbWUiOiAiRyIsICJwYW5kYXNfdHlwZSI6ICJmbG9hdDY0IiwgIm51bXB5X3R5cGUiOiAiZmxvYXQ2NCIsICJtZXRhZGF0YSI6IG51bGx9LCB7Im5hbWUiOiAiSCIsICJmaWVsZF9uYW1lIjogIkgiLCAicGFuZGFzX3R5cGUiOiAiZmxvYXQ2NCIsICJudW1weV90eXBlIjogImZsb2F0NjQiLCAibWV0YWRhdGEiOiBudWxsfSwgeyJuYW1lIjogIkkiLCAiZmllbGRfbmFtZSI6ICJJIiwgInBhbmRhc190eXBlIjogImZsb2F0NjQiLCAibnVtcHlfdHlwZSI6ICJmbG9hdDY0IiwgIm1ldGFkYXRhIjogbnVsbH0sIHsibmFtZSI6ICJKIiwgImZpZWxkX25hbWUiOiAiSiIsICJwYW5kYXNfdHlwZSI6ICJmbG9hdDY0IiwgIm51bXB5X3R5cGUiOiAiZmxvYXQ2NCIsICJtZXRhZGF0YSI6IG51bGx9LCB7Im5hbWUiOiAiSyIsICJmaWVsZF9uYW1lIjogIksiLCAicGFuZGFzX3R5cGUiOiAiZmxvYXQ2NCIsICJudW1weV90eXBlIjogImZsb2F0NjQiLCAibWV0YWRhdGEiOiBudWxsfSwgeyJuYW1lIjogIkwiLCAiZmllbGRfbmFtZSI6ICJMIiwgInBhbmRhc190eXBlIjogImZsb2F0NjQiLCAibnVtcHlfdHlwZSI6ICJmbG9hdDY0IiwgIm1ldGFkYXRhIjogbnVsbH0sIHsibmFtZSI6ICJNIiwgImZpZWxkX25hbWUiOiAiTSIsICJwYW5kYXNfdHlwZSI6ICJmbG9hdDY0IiwgIm51bXB5X3R5cGUiOiAiZmxvYXQ2NCIsICJtZXRhZGF0YSI6IG51bGx9LCB7Im5hbWUiOiAiTiIsICJmaWVsZF9uYW1lIjogIk4iLCAicGFuZGFzX3R5cGUiOiAiZmxvYXQ2NCIsICJudW1weV90eXBlIjogImZsb2F0NjQiLCAibWV0YWRhdGEiOiBudWxsfSwgeyJuYW1lIjogIk8iLCAiZmllbGRfbmFtZSI6ICJPIiwgInBhbmRhc190eXBlIjogImZsb2F0NjQiLCAibnVtcHlfdHlwZSI6ICJmbG9hdDY0IiwgIm1ldGFkYXRhIjogbnVsbH0sIHsibmFtZSI6ICJQIiwgImZpZWxkX25hbWUiOiAiUCIsICJwYW5kYXNfdHlwZSI6ICJmbG9hdDY0IiwgIm51bXB5X3R5cGUiOiAiZmxvYXQ2NCIsICJtZXRhZGF0YSI6IG51bGx9LCB7Im5hbWUiOiAiUSIsICJmaWVsZF9uYW1lIjogIlEiLCAicGFuZGFzX3R5cGUiOiAiZmxvYXQ2NCIsICJudW1weV90eXBlIjogImZsb2F0NjQiLCAibWV0YWRhdGEiOiBudWxsfSwgeyJuYW1lIjogIlIiLCAiZmllbGRfbmFtZSI6ICJSIiwgInBhbmRhc190eXBlIjogImZsb2F0NjQiLCAibnVtcHlfdHlwZSI6ICJmbG9hdDY0IiwgIm1ldGFkYXRhIjogbnVsbH0sIHsibmFtZSI6ICJTIiwgImZpZWxkX25hbWUiOiAiUyIsICJwYW5kYXNfdHlwZSI6ICJmbG9hdDY0IiwgIm51bXB5X3R5cGUiOiAiZmxvYXQ2NCIsICJtZXRhZGF0YSI6IG51bGx9LCB7Im5hbWUiOiAiVCIsICJmaWVsZF9uYW1lIjogIlQiLCAicGFuZGFzX3R5cGUiOiAiZmxvYXQ2NCIsICJudW1weV90eXBlIjogImZsb2F0NjQiLCAibWV0YWRhdGEiOiBudWxsfSwgeyJuYW1lIjogIlUiLCAiZmllbGRfbmFtZSI6ICJVIiwgInBhbmRhc190eXBlIjogImZsb2F0NjQiLCAibnVtcHlfdHlwZSI6ICJmbG9hdDY0IiwgIm1ldGFkYXRhIjogbnVsbH0sIHsibmFtZSI6ICJWIiwgImZpZWxkX25hbWUiOiAiViIsICJwYW5kYXNfdHlwZSI6ICJmbG9hdDY0IiwgIm51bXB5X3R5cGUiOiAiZmxvYXQ2NCIsICJtZXRhZGF0YSI6IG51bGx9LCB7Im5hbWUiOiAiVyIsICJmaWVsZF9uYW1lIjogIlciLCAicGFuZGFzX3R5cGUiOiAiZmxvYXQ2NCIsICJudW1weV90eXBlIjogImZsb2F0NjQiLCAibWV0YWRhdGEiOiBudWxsfSwgeyJuYW1lIjogIlgiLCAiZmllbGRfbmFtZSI6ICJYIiwgInBhbmRhc190eXBlIjogImZsb2F0NjQiLCAibnVtcHlfdHlwZSI6ICJmbG9hdDY0IiwgIm1ldGFkYXRhIjogbnVsbH0sIHsibmFtZSI6ICJZIiwgImZpZWxkX25hbWUiOiAiWSIsICJwYW5kYXNfdHlwZSI6ICJmbG9hdDY0IiwgIm51bXB5X3R5cGUiOiAiZmxvYXQ2NCIsICJtZXRhZGF0YSI6IG51bGx9LCB7Im5hbWUiOiAiWiIsICJmaWVsZF9uYW1lIjogIloiLCAicGFuZGFzX3R5cGUiOiAiZmxvYXQ2NCIsICJudW1weV90eXBlIjogImZsb2F0NjQiLCAibWV0YWRhdGEiOiBudWxsfSwgeyJuYW1lIjogImluZGV4IiwgImZpZWxkX25hbWUiOiAiaW5kZXgiLCAicGFuZGFzX3R5cGUiOiAiaW50NjQiLCAibnVtcHlfdHlwZSI6ICJpbnQ2NCIsICJtZXRhZGF0YSI6IG51bGx9XSwgImNyZWF0b3IiOiB7ImxpYnJhcnkiOiAicHlhcnJvdyIsICJ2ZXJzaW9uIjogIjE4LjEuMCJ9LCAicGFuZGFzX3ZlcnNpb24iOiAiMi4yLjMifQAABgAAAHBhbmRhcwAAGwAAAJwEAABgBAAANAQAAAgEAADcAwAAsAMAAIQDAABYAwAALAMAAAADAADUAgAAqAIAAHwCAABQAgAAJAIAAPgBAADMAQAAoAEAAHQBAABIAQAAHAEAAPAAAADEAAAAmAAAAGwAAABAAAAABAAAAOD7//8AAAECEAAAACAAAAAEAAAAAAAAAAUAAABpbmRleAAAAAgADAAIAAcACAAAAAAAAAFAAAAAGPz//wAAAQMQAAAAFAAAAAQAAAAAAAAAAQAAAFoAAAAK/P//AAACAED8//8AAAEDEAAAABQAAAAEAAAAAAAAAAEAAABZAAAAMvz//wAAAgBo/P//AAABAxAAAAAUAAAABAAAAAAAAAABAAAAWAAAAFr8//8AAAIAkPz//wAAAQMQAAAAFAAAAAQAAAAAAAAAAQAAAFcAAACC/P//AAACALj8//8AAAEDEAAAABQAAAAEAAAAAAAAAAEAAABWAAAAqvz//wAAAgDg/P//AAABAxAAAAAUAAAABAAAAAAAAAABAAAAVQAAANL8//8AAAIACP3//wAAAQMQAAAAFAAAAAQAAAAAAAAAAQAAAFQAAAD6/P//AAACADD9//8AAAEDEAAAABQAAAAEAAAAAAAAAAEAAABTAAAAIv3//wAAAgBY/f//AAABAxAAAAAUAAAABAAAAAAAAAABAAAAUgAAAEr9//8AAAIAgP3//wAAAQMQAAAAFAAAAAQAAAAAAAAAAQAAAFEAAABy/f//AAACAKj9//8AAAEDEAAAABQAAAAEAAAAAAAAAAEAAABQAAAAmv3//wAAAgDQ/f//AAABAxAAAAAUAAAABAAAAAAAAAABAAAATwAAAML9//8AAAIA+P3//wAAAQMQAAAAFAAAAAQAAAAAAAAAAQAAAE4AAADq/f//AAACACD+//8AAAEDEAAAABQAAAAEAAAAAAAAAAEAAABNAAAAEv7//wAAAgBI/v//AAABAxAAAAAUAAAABAAAAAAAAAABAAAATAAAADr+//8AAAIAcP7//wAAAQMQAAAAFAAAAAQAAAAAAAAAAQAAAEsAAABi/v//AAACAJj+//8AAAEDEAAAABQAAAAEAAAAAAAAAAEAAABKAAAAiv7//wAAAgDA/v//AAABAxAAAAAUAAAABAAAAAAAAAABAAAASQAAALL+//8AAAIA6P7//wAAAQMQAAAAFAAAAAQAAAAAAAAAAQAAAEgAAADa/v//AAACABD///8AAAEDEAAAABQAAAAEAAAAAAAAAAEAAABHAAAAAv///wAAAgA4////AAABAxAAAAAUAAAABAAAAAAAAAABAAAARgAAACr///8AAAIAYP///wAAAQMQAAAAFAAAAAQAAAAAAAAAAQAAAEUAAABS////AAACAIj///8AAAEDEAAAABQAAAAEAAAAAAAAAAEAAABEAAAAev///wAAAgCw////AAABAxAAAAAUAAAABAAAAAAAAAABAAAAQwAAAKL///8AAAIA2P///wAAAQMQAAAAFAAAAAQAAAAAAAAAAQAAAEIAAADK////AAACABAAFAAIAAYABwAMAAAAEAAQAAAAAAABAxAAAAAYAAAABAAAAAAAAAABAAAAQQAGAAgABgAGAAAAAAACAA==",
                    "npartitions": 1,
                    "columns": [
                        "A",
                        "B",
                        "C",
                        "D",
                        "E",
                        "F",
                        "G",
                        "H",
                        "I",
                        "J",
                        "K",
                        "L",
                        "M",
                        "N",
                        "O",
                        "P",
                        "Q",
                        "R",
                        "S",
                        "T",
                        "U",
                        "V",
                        "W",
                        "X",
                        "Y",
                        "Z"
                    ],
                    "resizable": false
                },
                "sorting": null,
                "data_sources": null
            },
            "links": {
                "self": "http://127.0.0.1:8000/api/v1/metadata/wide_table",
                "full": "http://127.0.0.1:8000/api/v1/table/full/wide_table",
                "partition": "http://127.0.0.1:8000/api/v1/table/partition/wide_table?partition={index}"
            },
            "meta": null
        },
        {
            "id": "structured_data",
            "attributes": {
                "ancestors": [],
                "structure_family": "container",
                "specs": [],
                "metadata": {
                    "animal": "cat",
                    "color": "green"
                },
                "structure": {
                    "contents": null,
                    "count": 2
                },
                "sorting": [
                    {
                        "key": "_",
                        "direction": 1
                    }
                ],
                "data_sources": null
            },
            "links": {
                "self": "http://127.0.0.1:8000/api/v1/metadata/structured_data",
                "search": "http://127.0.0.1:8000/api/v1/search/structured_data",
                "full": "http://127.0.0.1:8000/api/v1/container/full/structured_data"
            },
            "meta": null
        },
        {
            "id": "flat_array",
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
                            100
                        ]
                    ],
                    "shape": [
                        100
                    ],
                    "dims": null,
                    "resizable": false
                },
                "sorting": null,
                "data_sources": null
            },
            "links": {
                "self": "http://127.0.0.1:8000/api/v1/metadata/flat_array",
                "full": "http://127.0.0.1:8000/api/v1/array/full/flat_array",
                "block": "http://127.0.0.1:8000/api/v1/array/block/flat_array?block={0}"
            },
            "meta": null
        },
        {
            "id": "low_entropy",
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
                            100
                        ],
                        [
                            100
                        ]
                    ],
                    "shape": [
                        100,
                        100
                    ],
                    "dims": null,
                    "resizable": false
                },
                "sorting": null,
                "data_sources": null
            },
            "links": {
                "self": "http://127.0.0.1:8000/api/v1/metadata/low_entropy",
                "full": "http://127.0.0.1:8000/api/v1/array/full/low_entropy",
                "block": "http://127.0.0.1:8000/api/v1/array/block/low_entropy?block={0},{1}"
            },
            "meta": null
        },
        {
            "id": "high_entropy",
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
                            100
                        ],
                        [
                            100
                        ]
                    ],
                    "shape": [
                        100,
                        100
                    ],
                    "dims": null,
                    "resizable": false
                },
                "sorting": null,
                "data_sources": null
            },
            "links": {
                "self": "http://127.0.0.1:8000/api/v1/metadata/high_entropy",
                "full": "http://127.0.0.1:8000/api/v1/array/full/high_entropy",
                "block": "http://127.0.0.1:8000/api/v1/array/block/high_entropy?block={0},{1}"
            },
            "meta": null
        },
        {
            "id": "dynamic",
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
                            3
                        ],
                        [
                            3
                        ]
                    ],
                    "shape": [
                        3,
                        3
                    ],
                    "dims": null,
                    "resizable": false
                },
                "sorting": null,
                "data_sources": null
            },
            "links": {
                "self": "http://127.0.0.1:8000/api/v1/metadata/dynamic",
                "full": "http://127.0.0.1:8000/api/v1/array/full/dynamic",
                "block": "http://127.0.0.1:8000/api/v1/array/block/dynamic?block={0},{1}"
            },
            "meta": null
        }
    ],
    "error": null,
    "links": {
        "self": "http://127.0.0.1:8000/api/v1/search/?page[offset]=0&page[limit]=100",
        "first": "http://127.0.0.1:8000/api/v1/search/?page[offset]=0&page[limit]=100",
        "last": "http://127.0.0.1:8000/api/v1/search/?page[offset]=0&page[limit]=100",
        "next": null,
        "prev": null
    },
    "meta": {
        "count": 16
    }
};

export { sampleTiledSearchData };