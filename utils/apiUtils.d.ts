export declare function useOphydApiUrls(): {
    httpBaseUrl: string;
    wsBaseUrl: string;
    getRestUrl: (path: string) => string;
    getWsUrl: (path: string) => string;
};
export declare function useQueueServerApiUrls(): {
    httpBaseUrl: string;
    apiKey: string;
    getRestUrl: (path: string) => string;
};
export declare function useTiledApiUrls(): {
    httpBaseUrl: string;
    apiKey: string | null;
    getRestUrl: (path: string) => string;
};
export declare const useAllApiUrls: () => {
    ophyd: {
        httpBaseUrl: string;
        wsBaseUrl: string;
        getRestUrl: (path: string) => string;
        getWsUrl: (path: string) => string;
    };
    queueServer: {
        httpBaseUrl: string;
        apiKey: string;
        getRestUrl: (path: string) => string;
    };
    tiled: {
        httpBaseUrl: string;
        apiKey: string | null;
        getRestUrl: (path: string) => string;
    };
};
//# sourceMappingURL=apiUtils.d.ts.map