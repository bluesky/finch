declare const cameraFormData: {
    title: string;
    icon: null;
    inputs: ({
        pv: string;
        label: string;
        type: string;
        enums: string[];
        min?: undefined;
        max?: undefined;
    } | {
        pv: string;
        label: string;
        type: string;
        min: number;
        max: number;
        enums?: undefined;
    })[];
}[];
export { cameraFormData };
//# sourceMappingURL=formData.d.ts.map