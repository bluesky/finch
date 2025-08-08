import * as THREE from 'three';
import { BeamConfig } from '../../../types/ComponentConfig';
import type { SharedResources } from '../ThreeScene';

/**
 * Creates a beam group.
 * - If "cylinder" is enabled, creates the cylinder beam.
 * - Photon stream logic is handled globally in ThreeScene.
 */
export function createBeam(cfg: BeamConfig, shared: SharedResources): THREE.Object3D {
  const group = new THREE.Group();
  group.name = 'beamGroup';

  // Cylinder beam (if enabled)
  if (cfg.beamModes?.includes('cylinder')) {
    const radius = cfg.geometry?.radius ?? 0.05;
    const height = cfg.geometry?.height ?? 8;
    const geom = new THREE.CylinderGeometry(radius, radius, height, 16);
    geom.rotateZ(Math.PI / 2);

    const beamMat = shared.materials.beam;
    beamMat.emissiveIntensity = cfg.beamPower ? cfg.beamPower / 20 : 1;

    const beamMesh = new THREE.Mesh(geom, beamMat);
    beamMesh.castShadow = false;
    beamMesh.receiveShadow = false;
    beamMesh.name = 'beam-cylinder';
    group.add(beamMesh);
  }

  // Remove or comment out the photon stream instanced mesh creation.
  // The global photon pool in ThreeScene will be used instead.

  return group;
}
