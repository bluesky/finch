import axios, { AxiosInstance } from 'axios';

export type QServerApiConfig = {
    baseURL: string;
    apiKey: string;
};

export function createQServerApiClient(config: QServerApiConfig): AxiosInstance {
    return axios.create({
        baseURL: config.baseURL,
        headers: {
            Authorization: `ApiKey ${config.apiKey}`,
        },
    });
}
