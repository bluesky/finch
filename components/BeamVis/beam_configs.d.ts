import { ComponentConfig } from './types/ComponentConfig';
/**
 * Interface for a beamline configuration.
 */
export interface BeamlineDefinition {
    /** The 3D scene configuration (array of component definitions) */
    sceneConfig: ComponentConfig[];
    /** Layout information for the control panel */
    controlLayout: {
        common?: {
            camera?: boolean;
            beam?: boolean;
            shutter?: boolean;
        };
        stages?: any[];
        sample?: any;
    };
    /** The display name for the beamline */
    name: string;
}
/**
 * Beamline configuration for beamline 7.3.3.
 */
export declare const bl733Definition: BeamlineDefinition;
/**
 * Beamline configuration for beamline 8.3.2.
 */
export declare const bl832Definition: BeamlineDefinition;
/**
 * Beamline configuration for the example beamline.
 */
export declare const exampleDefinition: BeamlineDefinition;
export declare const bl531Definition: BeamlineDefinition;
/**
 * Export the available beamline definitions as a lookup.
 */
export declare const beamlineDefinitions: Record<string, BeamlineDefinition>;
//# sourceMappingURL=beam_configs.d.ts.map