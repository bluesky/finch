import * as THREE from 'three';
import { StageConfig } from '../../../../types/ComponentConfig';

export function createXYZStage(cfg: StageConfig): THREE.Object3D {
  const group = new THREE.Group();
  group.name = cfg.id;

  const width = cfg.geometry?.width ?? 1;
  const height = cfg.geometry?.height ?? 0.2;
  const depth = cfg.geometry?.depth ?? 1;

  const geom = new THREE.BoxGeometry(width, height, depth);
  const mat = new THREE.MeshPhongMaterial({ color: '#818181' });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  group.add(mesh);

  return group;
}
