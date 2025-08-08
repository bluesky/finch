/**
 * createRADIUSStage.ts
 *
 * This module exports a function to create a RADIUS stage that loads a sample bar
 * from an OBJ file. The loaded object is locked in place (i.e. its transformation
 * is frozen) by default. A locking control is exposed via the returned object's
 * userData.toggleLock function to allow external toggling of the lock state.
 */

import * as THREE from 'three';
import { StageConfig } from '../../../../types/ComponentConfig';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

/**
 * Creates a RADIUS stage by loading an OBJ file.
 *
 * The sample bar is locked in place by disabling matrix auto‐updates on the loaded
 * object. The lock state can be toggled later via the exposed `toggleLock` method.
 *
 * @param {StageConfig} cfg - The configuration for the stage.
 * @returns {THREE.Object3D} A THREE.Group containing the loaded OBJ.
 */
export function createRADIUSStage(cfg: StageConfig): THREE.Object3D {
  const group = new THREE.Group();
  group.name = cfg.id;

  // Variable to hold the loaded OBJ for later lock toggling.
  let loadedObj: THREE.Object3D | null = null;

  /**
   * Sets the lock state on the provided object.
   *
   * When locked, matrix auto-update is disabled on the object and all its meshes,
   * preventing any external movement or transformations.
   *
   * @param {THREE.Object3D} object - The object to lock or unlock.
   * @param {boolean} locked - True to lock the object; false to unlock.
   */
  const setLock = (object: THREE.Object3D, locked: boolean): void => {
    object.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // Disables transformation updates when locked.
        child.matrixAutoUpdate = !locked;
      }
    });
    // Also lock/unlock the parent object.
    object.matrixAutoUpdate = !locked;
    object.userData.locked = locked;
  };

  /**
   * Toggles the lock state of the loaded OBJ.
   *
   * Exposed via group.userData for external controls.
   *
   * @param {boolean} locked - True to lock the object; false to unlock.
   */
  const toggleLock = (locked: boolean): void => {
    if (loadedObj) {
      setLock(loadedObj, locked);
    }
  };

  // Expose the toggle function on the returned group for later control.
  group.userData.toggleLock = toggleLock;

  // Create the OBJ loader and specify the asset URL.
  const loader = new OBJLoader();
  // The OBJ file is assumed to be served from the public folder under /assets.
  const objUrl = '/assets/al-1795-0875.obj';

  loader.load(
    objUrl,
    (obj) => {
      // Apply a default scale if needed (adjust as required).
      obj.scale.set(1, 1, 1);

      // Lock the loaded object so it remains static.
      setLock(obj, true);
      loadedObj = obj;

      // Add the loaded OBJ to the group.
      group.add(obj);
    },
    // Optional progress callback; not used here.
    undefined,
    (error) => {
      console.error('Error loading OBJ in createRADIUSStage:', error);
    }
  );

  return group;
}
