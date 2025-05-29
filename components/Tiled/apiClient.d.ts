declare const getDefaultTiledUrl: () => string;
declare const getSearchResults: (searchPath?: string, cb?: Function, url?: string, mock?: boolean) => Promise<any>;
declare const getTableData: (searchPath: string, partition: number, cb?: Function, url?: string) => Promise<void>;
export { getSearchResults, getDefaultTiledUrl, getTableData, };
//# sourceMappingURL=apiClient.d.ts.map