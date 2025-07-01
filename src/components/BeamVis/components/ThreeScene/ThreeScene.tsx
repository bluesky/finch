// beam_vis/src/components/ThreeScene/ThreeScene.tsx
import React, {
  useEffect,
  useRef,
  useMemo,
} from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { createObjectFromConfig } from './factories';
import { ComponentConfig } from '../../types/ComponentConfig';
import { beamColorMap } from '../../types/ComponentConfig';

/** Types for photon streaming */
interface Photon {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  active: boolean;
}

interface ThreeSceneProps {
  sceneConfig: ComponentConfig[];
  // Optionally, if you want to control camera x externally:
  // cameraX: number;
}

export interface SharedResources {
  xRayMaterial: THREE.ShaderMaterial;
  materials: {
    detector: THREE.MeshPhongMaterial;
    beam: THREE.MeshStandardMaterial;
    sampleCube: THREE.MeshPhongMaterial;
    // Additional materials can be added here.
  };
  geometries?: object;
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ sceneConfig /*, cameraX */ }) => {
  /********************************************************
   * Refs for Scene, Cameras, Renderer, etc.
   ********************************************************/
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const mainCameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const xRayCameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const xRayRenderTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);
  const objectMapRef = useRef<Record<string, THREE.Object3D>>({});

  /********************************************************
   * Photon-related Refs
   ********************************************************/
  const photonPoolRef = useRef<THREE.InstancedMesh | null>(null);
  const maxPhotons = 500;
  const photonsRef = useRef<Photon[]>(
    Array.from({ length: maxPhotons }, () => ({
      position: new THREE.Vector3(-4, 0, 0),
      velocity: new THREE.Vector3(1, 0, 0).multiplyScalar(0.05),
      active: false,
    }))
  );
  const lastPhotonEmitRef = useRef<number>(0);

  /********************************************************
   * Shared / Memoized Resources for Factories
   ********************************************************/


  const sharedResources = useMemo(() => {
    const xRayMaterial = new THREE.ShaderMaterial({
      uniforms: {
        xRayTexture: { value: null as unknown as THREE.Texture },
        shutterOpen: { value: 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D xRayTexture;
        uniform float shutterOpen;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(xRayTexture, vUv);
          float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
          gray = 1.0 - gray;
          vec3 finalColor = vec3(gray);
          finalColor = mix(vec3(0.0), finalColor, shutterOpen);
          gl_FragColor = vec4(finalColor, color.a);
        }
      `,
    });
    return {
      xRayMaterial,
      materials: {
        detector: new THREE.MeshPhongMaterial({ color: '#1f77b4' }),
        beam: new THREE.MeshStandardMaterial({ color: '#BF83FC' }),
        sampleCube: new THREE.MeshPhongMaterial({ color: '#8c564b' }),
        // Additional materials can be added here.
      },
      geometries: {
        // Shared geometries if needed.
      },
    };
  }, []);

  /********************************************************
   * Use a ref to always have the latest sceneConfig
   ********************************************************/
  const sceneConfigRef = useRef(sceneConfig);
  useEffect(() => {
    sceneConfigRef.current = sceneConfig;
  }, [sceneConfig]);

  /********************************************************
   * 1) Initialization (runs only once)
   ********************************************************/
  useEffect(() => {
    if (!containerRef.current) return;
    const canvas = document.getElementById('three-canvas') as HTMLCanvasElement;
    if (!canvas) {
      console.error("No <canvas id='three-canvas'> found!");
      return;
    }
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    const aspect = w / h;
    const viewSize = 3;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f0f0f0');
    sceneRef.current = scene;

    // Main Orthographic Camera
    const mainCamera = new THREE.OrthographicCamera(
      -viewSize * aspect,
      viewSize * aspect,
      viewSize,
      -viewSize,
      0.1,
      100
    );
    mainCamera.position.set(-10, 10, 10); // initial x set to -10; if using cameraX, update below
    mainCamera.lookAt(0, 0, 0);
    // mainCamera.layers.enable(1);
    mainCameraRef.current = mainCamera;

    // (Optional) If you want to update cameraX externally, add an effect below.
    // useEffect(() => {
    //   if (mainCameraRef.current) {
    //     mainCameraRef.current.position.x = cameraX;
    //     mainCameraRef.current.updateProjectionMatrix();
    //   }
    // }, [cameraX]);

    // X-Ray Orthographic Camera
    const xRayCamViewSize = 0.5;
    const xRayCamera = new THREE.OrthographicCamera(
      -xRayCamViewSize * aspect,
      xRayCamViewSize * aspect,
      xRayCamViewSize,
      -xRayCamViewSize,
      0.1,
      100
    );
    xRayCamera.position.set(-1, 0, 0);
    xRayCamera.lookAt(4, 0, 0);
    xRayCamera.layers.set(1);
    xRayCameraRef.current = xRayCamera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Postprocessing Composer
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, mainCamera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.25;
    bloomPass.strength = 0.3;
    bloomPass.radius = 0.03;
    composer.addPass(bloomPass);
    composerRef.current = composer;

    // X-Ray Render Target
    const xRayRenderTarget = new THREE.WebGLRenderTarget(256, 256);
    xRayRenderTargetRef.current = xRayRenderTarget;

    // Lights
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.0);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight('#ffffff', 0.8);
    dirLight.position.set(-5, 12, 12);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    scene.add(dirLight);

    // Ground Plane
    const planeGeom = new THREE.PlaneGeometry(20, 20);
    const planeMat = new THREE.MeshPhongMaterial({ color: '#64768D' });
    const plane = new THREE.Mesh(planeGeom, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.5;
    plane.receiveShadow = true;
    scene.add(plane);

    // Photon InstancedMesh for Photon Stream (global pool)
    const sphereGeom = new THREE.SphereGeometry(0.05, 8, 8);
    const photonMat = new THREE.MeshStandardMaterial({
      color: '#BF83FC',
      transparent: true,
      opacity: 0.8,
      emissive: '#BF83FC',
      // Adjust emissiveIntensity as needed
      emissiveIntensity: 1,
      depthWrite: true,
      blending: THREE.AdditiveBlending,
    });
    const instancedMesh = new THREE.InstancedMesh(sphereGeom, photonMat, maxPhotons);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instancedMesh);
    photonPoolRef.current = instancedMesh;

    // Resize handling
    const handleResize = () => {
      if (!containerRef.current) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight;
      const newAspect = newW / newH;
      mainCamera.left = -viewSize * newAspect;
      mainCamera.right = viewSize * newAspect;
      mainCamera.top = viewSize;
      mainCamera.bottom = -viewSize;
      mainCamera.updateProjectionMatrix();
      xRayCamera.left = -xRayCamViewSize * newAspect;
      xRayCamera.right = xRayCamViewSize * newAspect;
      xRayCamera.top = xRayCamViewSize;
      xRayCamera.bottom = -xRayCamViewSize;
      xRayCamera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
      xRayRenderTarget.setSize(256, 256);
      composer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Update xRay shader uniform
    sharedResources.xRayMaterial.uniforms.xRayTexture.value = xRayRenderTarget.texture;

    // Animation loop (store animationId for cleanup)
    let animationId: number;
    const clock = new THREE.Clock();
    const animate = () => {

      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      // Use latest sceneConfig from the ref
      const currentConfig = sceneConfigRef.current;
      const beamCfg = currentConfig.find((c) => c.type === 'beam');

      // 5) Update Beam Stop (shutter) pivot and color
      const stopCfg = currentConfig.find((c) => c.type === 'beamStop');
      const isOpen = stopCfg?.shutterOpen || false;
      const beamStopPivot = stopCfg ? objectMapRef.current[stopCfg.id] : undefined;
      const beamObj = beamCfg ? objectMapRef.current[beamCfg.id] as THREE.Group : undefined;
      const beamCyl = beamObj?.getObjectByName('beam-cylinder') as THREE.Mesh;
      const detectorObj = scene.getObjectByName('detector');
      const beamMaterial = sharedResources.materials.beam;

      if (beamCfg?.beamMono) {
        const targetColor = beamColorMap[beamCfg.beamMono];
        if (beamMaterial.color.getStyle() !== targetColor) {
          beamMaterial.color.set(targetColor);
          beamMaterial.needsUpdate = true;
        }
      }

      let stopX = -2;
      let detectorX = 4;
      const beamStartX = -6;

      if (detectorObj && beamStopPivot) {
        const vec1 = new THREE.Vector3();
        const vec2 = new THREE.Vector3();
        detectorObj.getWorldPosition(vec1);
        beamStopPivot.getWorldPosition(vec2);
        detectorX = vec1.x;
        stopX = vec2.x;
      }
      else if (!detectorObj) {console.warn('Detector object not found in scene.');}
      else if (!beamStopPivot) {console.warn('Beam Stop pivot not found in scene.');}

      if (beamCyl) {
        const targetX = isOpen ? detectorX : stopX;
        const beamLength = targetX - beamStartX;
        beamCyl.scale.x = beamLength / 8;
        beamCyl.position.x = beamStartX + beamLength / 2;
      }

      if (beamStopPivot) {
        // Smoothly animate pivot rotation (optional)
        beamStopPivot.rotation.y = isOpen ? -Math.PI / 2 : 0;
        // Update material on the child shutter mesh:
        const shutterMesh = beamStopPivot.getObjectByName('beamStop-shutter') as THREE.Mesh | undefined;
        if (shutterMesh && shutterMesh.material instanceof THREE.MeshPhongMaterial) {
          shutterMesh.material.opacity = isOpen ? 0.5 : 1;
          shutterMesh.material.color.set(isOpen ? '#17A34B' : '#DA2828');
          shutterMesh.material.needsUpdate = true;
      }
    }
      const { xRayMaterial } = sharedResources;
      xRayMaterial.uniforms.shutterOpen.value = isOpen ? 1.0 : 0.0;

      // 1) Offscreen render for xRay
      renderer.setRenderTarget(xRayRenderTarget);
      renderer.render(scene, xRayCamera);
      renderer.setRenderTarget(null);

      // 2) Render bloom pass
      composer.render();

      // 3) Photon stream updates:
      if (beamCfg?.beamModes?.includes('photonStream') && beamCfg.visible) {
        const now = performance.now();
        // Emission interval depends on beam power (dynamic)
        const emissionInterval = Math.max(50, 200 - (beamCfg.beamPower || 25) * 3);
        if (now - lastPhotonEmitRef.current > emissionInterval) {
          lastPhotonEmitRef.current = now;
          const photons = photonsRef.current;
          const idx = photons.findIndex((p) => !p.active);
          if (idx !== -1) {
            photons[idx].active = true;
            photons[idx].position.set(-4, 0, 0);
            const baseSpeed = 0.05;
            const powerVal = beamCfg.beamPower || 25;
            // Speed increases slightly with beam power
            photons[idx].velocity.set(1, 0, 0).multiplyScalar(baseSpeed + powerVal * 0.001);
            const mtx = new THREE.Matrix4().setPosition(photons[idx].position);
            photonPoolRef.current?.setMatrixAt(idx, mtx);
            photonPoolRef.current!.instanceMatrix.needsUpdate = true;
          }
        }
      }

      // 4) Update active photons
      if (photonPoolRef.current) {
        const photons = photonsRef.current;
        const mat4 = new THREE.Matrix4();
        let maxActiveIndex = -1;
        photons.forEach((photon, i) => {
          if (photon.active) {
            photon.position.add(photon.velocity.clone().multiplyScalar(delta * 60));
            // Use beamStop config to determine bounds
            const stopCfg = currentConfig.find((c) => c.type === 'beamStop');
            const open = stopCfg?.shutterOpen || false;

            if ((!open && photon.position.x >= -2) || (open && photon.position.x >= 4)) {
              photon.active = false;
              return;
            }
            mat4.setPosition(photon.position);
            photonPoolRef.current?.setMatrixAt(i, mat4);
            if (i > maxActiveIndex) maxActiveIndex = i;
          }
        });
        photonPoolRef.current.count = maxActiveIndex + 1;
        photonPoolRef.current.instanceMatrix.needsUpdate = true;
      }


    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      xRayRenderTarget.dispose();
      scene.clear();
    };
  }, []
); // initialization runs only once

  /********************************************************
   * 2) Rebuild Scene Objects on sceneConfig Changes
   ********************************************************/
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove old objects from our objectMap (but keep lights, ground, photon mesh, etc.)
    Object.keys(objectMapRef.current).forEach((id) => {
      const obj = objectMapRef.current[id];
      if (obj.parent) {
        obj.parent.remove(obj);
      }
    });
    objectMapRef.current = {};

    // Create new objects using createObjectFromConfig
    const createdObjects: Record<string, THREE.Object3D> = {};
    sceneConfig.forEach((cfg) => {
      const obj = createObjectFromConfig(cfg, sharedResources);
      if (obj) {
        obj.position.fromArray(cfg.transform.position);
        obj.rotation.set(...cfg.transform.rotation);
        if (cfg.transform.scale) {
          obj.scale.fromArray(cfg.transform.scale);
        }
        obj.visible = cfg.visible !== false;
        obj.name = cfg.id;
        createdObjects[cfg.id] = obj;
      }
    });

    // Parenting: attach children if a parentId exists
    sceneConfig.forEach((cfg) => {
      const obj = createdObjects[cfg.id];
      if (!obj) return;
      if (cfg.parentId && createdObjects[cfg.parentId]) {
        createdObjects[cfg.parentId].add(obj);
      } else {
        scene.add(obj);
      }
    });
    objectMapRef.current = createdObjects;
  }, [sceneConfig, sharedResources]);

  return (
    <div style={{ width: '100%', height: '100%' }} ref={containerRef}>
      <canvas id="three-canvas" style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default ThreeScene;
