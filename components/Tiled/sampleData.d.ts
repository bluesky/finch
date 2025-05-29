declare const sampleTiledSearchData: {
    data: ({
        id: string;
        attributes: {
            ancestors: never[];
            structure_family: string;
            specs: never[];
            metadata: {
                animal?: undefined;
                color?: undefined;
            };
            structure: {
                data_type: {
                    endianness: string;
                    kind: string;
                    itemsize: number;
                    dt_units: null;
                };
                chunks: number[][];
                shape: number[];
                dims: null;
                resizable: boolean;
                layout?: undefined;
                length?: undefined;
                form?: undefined;
                arrow_schema?: undefined;
                npartitions?: undefined;
                columns?: undefined;
                contents?: undefined;
                count?: undefined;
            };
            sorting: null;
            data_sources: null;
        };
        links: {
            self: string;
            full: string;
            block: string;
            buffers?: undefined;
            partition?: undefined;
            search?: undefined;
        };
        meta: null;
    } | {
        id: string;
        attributes: {
            ancestors: never[];
            structure_family: string;
            specs: never[];
            metadata: {
                animal?: undefined;
                color?: undefined;
            };
            structure: {
                shape: number[];
                chunks: number[][];
                dims: null;
                resizable: boolean;
                layout: string;
                data_type?: undefined;
                length?: undefined;
                form?: undefined;
                arrow_schema?: undefined;
                npartitions?: undefined;
                columns?: undefined;
                contents?: undefined;
                count?: undefined;
            };
            sorting: null;
            data_sources: null;
        };
        links: {
            self: string;
            full: string;
            block: string;
            buffers?: undefined;
            partition?: undefined;
            search?: undefined;
        };
        meta: null;
    } | {
        id: string;
        attributes: {
            ancestors: never[];
            structure_family: string;
            specs: never[];
            metadata: {
                animal?: undefined;
                color?: undefined;
            };
            structure: {
                length: number;
                form: {
                    class: string;
                    offsets: string;
                    content: {
                        class: string;
                        fields: string[];
                        contents: ({
                            class: string;
                            primitive: string;
                            inner_shape: never[];
                            parameters: {};
                            form_key: string;
                            offsets?: undefined;
                            content?: undefined;
                        } | {
                            class: string;
                            offsets: string;
                            content: {
                                class: string;
                                primitive: string;
                                inner_shape: never[];
                                parameters: {};
                                form_key: string;
                            };
                            parameters: {};
                            form_key: string;
                            primitive?: undefined;
                            inner_shape?: undefined;
                        })[];
                        parameters: {};
                        form_key: string;
                    };
                    parameters: {};
                    form_key: string;
                };
                data_type?: undefined;
                chunks?: undefined;
                shape?: undefined;
                dims?: undefined;
                resizable?: undefined;
                layout?: undefined;
                arrow_schema?: undefined;
                npartitions?: undefined;
                columns?: undefined;
                contents?: undefined;
                count?: undefined;
            };
            sorting: null;
            data_sources: null;
        };
        links: {
            self: string;
            buffers: string;
            full: string;
            block?: undefined;
            partition?: undefined;
            search?: undefined;
        };
        meta: null;
    } | {
        id: string;
        attributes: {
            ancestors: never[];
            structure_family: string;
            specs: {
                name: string;
                version: null;
            }[];
            metadata: {
                animal: string;
                color: string;
            };
            structure: {
                arrow_schema: string;
                npartitions: number;
                columns: string[];
                resizable: boolean;
                data_type?: undefined;
                chunks?: undefined;
                shape?: undefined;
                dims?: undefined;
                layout?: undefined;
                length?: undefined;
                form?: undefined;
                contents?: undefined;
                count?: undefined;
            };
            sorting: null;
            data_sources: null;
        };
        links: {
            self: string;
            full: string;
            partition: string;
            block?: undefined;
            buffers?: undefined;
            search?: undefined;
        };
        meta: null;
    } | {
        id: string;
        attributes: {
            ancestors: never[];
            structure_family: string;
            specs: never[];
            metadata: {
                animal: string;
                color: string;
            };
            structure: {
                contents: null;
                count: number;
                data_type?: undefined;
                chunks?: undefined;
                shape?: undefined;
                dims?: undefined;
                resizable?: undefined;
                layout?: undefined;
                length?: undefined;
                form?: undefined;
                arrow_schema?: undefined;
                npartitions?: undefined;
                columns?: undefined;
            };
            sorting: {
                key: string;
                direction: number;
            }[];
            data_sources: null;
        };
        links: {
            self: string;
            search: string;
            full: string;
            block?: undefined;
            buffers?: undefined;
            partition?: undefined;
        };
        meta: null;
    })[];
    error: null;
    links: {
        self: string;
        first: string;
        last: string;
        next: null;
        prev: null;
    };
    meta: {
        count: number;
    };
};
export { sampleTiledSearchData };
//# sourceMappingURL=sampleData.d.ts.map