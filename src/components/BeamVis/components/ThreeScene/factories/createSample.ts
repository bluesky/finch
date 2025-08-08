import * as THREE from 'three';
import { SampleConfig } from '../../../types/ComponentConfig';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

export function createSample(cfg: SampleConfig): THREE.Object3D {
  const group = new THREE.Group();
  group.name = cfg.id;

  switch (cfg.meshType) {
    case 'cube': {
      const width = cfg.geometry?.width ?? 0.4;
      const height = cfg.geometry?.height ?? 0.4;
      const depth = cfg.geometry?.depth ?? 0.4;
      const geom = new THREE.BoxGeometry(width, height, depth);
      const mat = new THREE.MeshPhongMaterial({ color: '#8c564b' });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.layers.enable(1);
      group.add(mesh);
      break;
    }
    case 'cylinder': {
      const radius = cfg.geometry?.radius ?? 0.2;
      const height = cfg.geometry?.height ?? 0.4;
      const geom = new THREE.CylinderGeometry(radius, radius, height, 16);
      const mat = new THREE.MeshPhongMaterial({ color: '#8c564b' });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.layers.enable(1);
      group.add(mesh);
      break;
    }
    case 'fbx': {
      const loader = new FBXLoader();
      loader.load(
        cfg.meshUrl ?? 'beam_vis/assets/bananas.fbx',
        (fbx) => {
          fbx.scale.set(0.02, 0.02, 0.02);
          fbx.traverse((child: any) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          fbx.layers.enable(1);
          group.add(fbx);
        },
        undefined,
        (err) => console.error('Error loading FBX:', err)
      );
      break;
    }
    case 'obj': {
      const loader = new OBJLoader();
      loader.load(
        cfg.meshUrl ?? 'beam_vis/assets/al-1795-0875.obj',
        (obj) => {
          obj.scale.set(0.01,0.01,0.01);
          obj.traverse((child: any) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          obj.layers.enable(1);
          group.add(obj);
        },
        undefined,
        (err) => console.error('Error loading OBJ:', err)
      );
      break;
    }
    default: {
      const fallbackGeom = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      const fallbackMat = new THREE.MeshPhongMaterial({ color: 'gray' });
      const fallbackMesh = new THREE.Mesh(fallbackGeom, fallbackMat);
      fallbackMesh.castShadow = true;
      fallbackMesh.receiveShadow = true;
      group.add(fallbackMesh);
      break;
    }
  }
  group.layers.enable(1);
  return group;
}
