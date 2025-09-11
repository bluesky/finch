import { default as React } from '../../../node_modules/react';
interface PlayContextValue {
    isPlaying: boolean;
    playAngle: number;
    setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
    handleStageRotationChange: (val: number) => void;
}
export declare const PlayProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare function usePlay(): PlayContextValue;
export {};
//# sourceMappingURL=PlayContext.d.ts.map