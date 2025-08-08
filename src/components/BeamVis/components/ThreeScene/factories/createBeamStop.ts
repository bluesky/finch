// factories/createBeamStop.ts
import * as THREE from 'three';
import { BeamStopConfig
 } from '../../../types/ComponentConfig';

/** Moved from your original createBeamStop function */
function buildBeamStop(
  width: number,
  height: number,
  depth: number,
  // color: string,
  shutterOpen: boolean
): THREE.Object3D {
  const pivot = new THREE.Object3D();
  pivot.position.set(0, 0, 0);

  const geometry = new THREE.BoxGeometry(width, height, depth);
  geometry.translate(-width * 2, 0, 0);

  const material = new THREE.MeshPhongMaterial({
    color: shutterOpen ? 'rgb(40, 167, 69)' : '#DA2828',
    transparent: true,
    opacity: shutterOpen ? 0.5 : 1,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = 'beamStop-shutter';
  pivot.add(mesh);

  return pivot;
}

export function createBeamStop(
  cfg: BeamStopConfig,
  // shared: {
  //   materials: Record<string, THREE.Material>;
  // }
): THREE.Object3D {
  const pivot = buildBeamStop(
    cfg.geometry?.width ?? 0.2,
    cfg.geometry?.height ?? 1,
    cfg.geometry?.depth ?? 1,
    // '#DA2828',
    cfg.shutterOpen ?? false
  );

  pivot.name = 'beamStop-pivot';
  return pivot;
}
