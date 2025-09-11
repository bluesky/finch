import { StageConfig } from '../../../../types/ComponentConfig';
/**
 * createRADIUSStage.ts
 *
 * This module exports a function to create a RADIUS stage that loads a sample bar
 * from an OBJ file. The loaded object is locked in place (i.e. its transformation
 * is frozen) by default. A locking control is exposed via the returned object's
 * userData.toggleLock function to allow external toggling of the lock state.
 */
import * as THREE from 'three';
/**
 * Creates a RADIUS stage by loading an OBJ file.
 *
 * The sample bar is locked in place by disabling matrix auto‐updates on the loaded
 * object. The lock state can be toggled later via the exposed `toggleLock` method.
 *
 * @param {StageConfig} cfg - The configuration for the stage.
 * @returns {THREE.Object3D} A THREE.Group containing the loaded OBJ.
 */
export declare function createRADIUSStage(cfg: StageConfig): THREE.Object3D;
//# sourceMappingURL=createRADIUSStage.d.ts.map