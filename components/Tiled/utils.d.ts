import { TiledSearchItem, TiledStructures, Slider } from './types';
export declare const generateLinksForCallback: (item: TiledSearchItem<TiledStructures>, url?: string) => {
    self: string;
    full?: string;
    block?: string;
    buffers?: string;
    partition?: string;
    search?: string;
    default?: string;
};
export declare const getTiledStructureIcon: (structureFamily: string) => import("react/jsx-runtime").JSX.Element;
export declare const generateSearchPath: (item: TiledSearchItem<TiledStructures>, extra?: string) => string;
export declare const generateFullImagePngPath: (searchPath?: string, stepY?: number, stepX?: number, stack?: number[], url?: string) => string;
export declare const numpyTypeSizesBytes: Record<string, number>;
export declare const onPopoutClick: (popoutUrl: string) => void;
export declare const createSliders: (sliderCount: number, shape: number[]) => Slider[];
//# sourceMappingURL=utils.d.ts.map