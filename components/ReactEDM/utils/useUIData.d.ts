import { Entry } from '../types/UIEntry';
export interface UseUIDataOptions {
    fileName?: string;
    children?: Entry[];
    mock: boolean;
    args: {
        [key: string]: any;
    };
}
export interface UseUIDataReturn {
    UIData: Entry[] | null;
    loading: boolean;
    error: string | null;
    devices: any;
    onSubmitSettings: (deviceName: string, value: any) => void;
}
export declare function useUIData({ fileName, children, mock, args, }: UseUIDataOptions): UseUIDataReturn;
//# sourceMappingURL=useUIData.d.ts.map