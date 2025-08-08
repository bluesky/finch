// factories/createDetector.ts
import * as THREE from 'three';
import { DetectorConfig } from '../../../types/ComponentConfig';

export function createDetector(
  cfg: DetectorConfig,
  shared: {
    xRayMaterial: THREE.ShaderMaterial;
    materials: Record<string, THREE.Material>;
  }
): THREE.Object3D {
  const group = new THREE.Group();
  group.name = cfg.id;

  const w = cfg.geometry?.width ?? 1;
  const h = cfg.geometry?.height ?? 1;
  const d = cfg.geometry?.depth ?? 0.2;

  // Build a BoxGeometry on the fly
  const geom = new THREE.BoxGeometry(w, h, d);

  // Use an array of materials with one face using the xRayMaterial.
  const matArray: THREE.Material[] = [
    shared.materials.detector,
    shared.materials.detector,
    shared.materials.detector,
    shared.materials.detector,
    shared.materials.detector,
    shared.xRayMaterial, // the xRay face
  ];

  const mesh = new THREE.Mesh(geom, matArray);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = 'detector';

  // **Important:** Ensure the detector is in layer 1 so that the xRay camera sees it.
  mesh.layers.enable(1);

  group.add(mesh);
  return group;
}
