/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_QSERVER_POLLING_INTERVAL: string;
    readonly VITE_QSERVER_KEY: string;
    readonly VITE_QS_CONSOLE_URL: string;
    readonly VITE_PROXY_WS: string;
    readonly VITE_API_TILED_URL: string;
    readonly VITE_API_TILED_API_KEY: string;
    // Add other environment variables here
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
