import * as THREE from 'three';
import { StageConfig } from '../../../../types/ComponentConfig';

export function createCylindricalStage(cfg: StageConfig): THREE.Object3D {
  const group = new THREE.Group();
  group.name = cfg.id;

  const radius = cfg.geometry?.radius ?? 0.4;
  const height = cfg.geometry?.height ?? 0.4;

  // Create a cylinder
  const geom = new THREE.CylinderGeometry(radius, radius, height, 32);
  const mat = new THREE.MeshPhongMaterial({ color: '#3B83F6' });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  group.add(mesh);

  // Now the group’s rotation will come from cfg.transform.rotation
  group.rotation.set(
    cfg.transform.rotation[0],
    cfg.transform.rotation[1],
    cfg.transform.rotation[2]
  );

  return group;
}
