import * as THREE from 'three';
import { StageConfig } from '../../../../types/ComponentConfig';

export function createTiltStage(cfg: StageConfig): THREE.Object3D {
  const group = new THREE.Group();
  group.name = cfg.id;

  const width = cfg.geometry?.width ?? 1;
  const depth = cfg.geometry?.depth ?? 1;
  const height = cfg.geometry?.height ?? 0.2;

  // We'll treat this as a box with a pivot that can tilt
  const baseGeom = new THREE.BoxGeometry(width, height, depth);
  const mat = new THREE.MeshPhongMaterial({ color: '#7FD6FF' }); // light blue
  const mesh = new THREE.Mesh(baseGeom, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  // Add a pivot axis for tilt. For example, pivot about the front edge
  const pivot = new THREE.Object3D();
  pivot.position.set(0, 0, -depth/2); // pivot at the "back" or "front"
  group.add(pivot);
  pivot.add(mesh);

  return group;
}
