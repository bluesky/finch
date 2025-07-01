import * as THREE from 'three';
import { MotorConfig } from '../../../types/ComponentConfig';

export function createMotor(cfg: MotorConfig): THREE.Object3D {
  const group = new THREE.Group();
  group.name = cfg.id;

  const geom = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const mat = new THREE.MeshPhongMaterial({ color: '#888888' });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  // group.add(mesh);
  return group;
}
