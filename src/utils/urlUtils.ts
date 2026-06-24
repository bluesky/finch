export function httpToWsUrl(httpUrl: string): string {
    return httpUrl.replace(/^https:\/\//, 'wss://').replace(/^http:\/\//, 'ws://');
}
