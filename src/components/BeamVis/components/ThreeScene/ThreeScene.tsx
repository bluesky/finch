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
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { ArrowUp } from 'lucide-react';

/** Types for photon streaming */
interface Photon {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  active: boolean;
}

export type HoveredAxis = { axis: 'X' | 'Y' | 'Z'; dirSign: 1 | -1 } | null;
interface ThreeSceneProps {
  sceneConfig: ComponentConfig[];
  // Optionally, if you want to control camera x externally:
  // cameraX: number;
  highlightedAxis: HoveredAxis;
  motionState: {
    isMoving: boolean;
    objectId: string | null;
    startPosition: THREE.Vector3 | null;
  };
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


const ThreeScene: React.FC<ThreeSceneProps> = ({ sceneConfig, highlightedAxis, motionState /*, cameraX */ }) => {
  /********************************************************
   * Refs for Scene, Cameras, Renderer, etc.
   ********************************************************/
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const mainCameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const objectMapRef = useRef<Record<string, THREE.Object3D>>({});
  const ghostObjectRef = useRef<THREE.Object3D | null>(null);

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
        ghostMaterial: new THREE.MeshLambertMaterial({
          color: 0x00ff00,
          transparent: true,
          wireframe: true,
        }),
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

  const hoveredRef = useRef<HoveredAxis>(highlightedAxis);
  useEffect(() => { hoveredRef.current = highlightedAxis; }, [highlightedAxis]);


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
    const viewSize = 1.5;
    const size = new THREE.Vector2(w, h);


    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#c6c6c6');
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
    mainCamera.position.set(-10, 7, 12); // initial x set to -10; if using cameraX, update below
    mainCamera.lookAt(0, 0, 0);
    // mainCamera.layers.enable(1);
    mainCameraRef.current = mainCamera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;


    // if (renderer) {
    //   const controls = new OrbitControls(mainCamera, renderer.domElement);
    //   controls.enableDamping = true;
    //   controls.dampingFactor = 0.05;
    //   controlsRef.current = controls;
    // }


    // Postprocessing Composer
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, mainCamera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.25;
    bloomPass.strength = 0.1;
    bloomPass.radius = 0.03;
    composer.addPass(bloomPass);
    composerRef.current = composer;

    // Lights
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.5);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight('#ffffff', 0.5);
    dirLight.position.set(-5, 12, 12);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    scene.add(dirLight);
    // Configure shadow camera for directional light
    const d = 30;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.bias = -0.001
    dirLight.shadow.camera.updateProjectionMatrix();

    // Ground Plane
    const planeGeom = new THREE.PlaneGeometry(1000, 1000);
    const planeMat = new THREE.MeshPhongMaterial({ color: '#ffffff' });
    const plane = new THREE.Mesh(planeGeom, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -1.0;
    plane.receiveShadow = true;
    scene.add(plane);

    // Ground plane grid helper
    const grid = new THREE.GridHelper(100, 100, '#888888', '#444444');
    grid.position.y = -1.0;
    scene.add(grid);

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
      renderer.setSize(newW, newH);
      composer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

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


    // Custom axes dashed lines creation
    const stage = objectMapRef.current['horizontalStage'];
    if (stage) {

      const L = 3;
      const axesMat = {
        dashed: true,
        dashScale: 1,
        dashSize: 0.25,
        gapSize: 0.1,
        linewidth: 3,
      };
      function makeAxis(dir: THREE.Vector3, hexColor: number, axis: 'X' | 'Y' | 'Z' = 'X') {
        const mat = new LineMaterial({ ...axesMat, color: hexColor });
        const dirSign = Math.sign(dir.x + dir.y + dir.z) as 1 | -1;
        mat.userData = { axis, dirSign };
        const pts = [new THREE.Vector3(0, 0, 0), dir.clone().multiplyScalar(L)];
        const geom = new LineGeometry().setFromPoints(pts);
        const line = new Line2(geom, mat);
        line.computeLineDistances();
        return line;
      }
      stage.add(
        makeAxis(new THREE.Vector3(1, 0, 0), 0xff0000, 'X'), // Red X-axis
        makeAxis(new THREE.Vector3(-1, 0, 0), 0xff0000, 'X'), // Red -X-axis
        makeAxis(new THREE.Vector3(0, 1, 0), 0x00cd00, 'Y'), // Green Y-axis
        makeAxis(new THREE.Vector3(0, -1, 0), 0x00cd00, 'Y'), // Green -Y-axis
        makeAxis(new THREE.Vector3(0, 0, 1), 0x0000ff, 'Z'), // Blue Z-axis
        makeAxis(new THREE.Vector3(0, 0, -1), 0x0000ff, 'Z') // Blue -Z-axis
      );
    }


    // Animation loop (store animationId for cleanup)
    let animationId: number;
    const clock = new THREE.Clock();
    const animate = () => {
      //controlsRef.current?.update();

      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      // Use latest sceneConfig from the ref
      const currentConfig = sceneConfigRef.current;
      // animate dashed axis lines
      const h = hoveredRef.current;
      if (h) {
        const { axis: hoverAxis, dirSign: hoverSide } = h;
        scene.traverse(obj => {
          if (!(obj instanceof Line2 && obj.material instanceof LineMaterial)) return;
          const mat = obj.material as LineMaterial & {
            dashOffset?: number;
            userData: { axis: string; dirSign: 1 | -1 };
          };
          const { axis, dirSign } = mat.userData;

          // only the exact half‐axis hovered
          if (axis === hoverAxis && dirSign === hoverSide) {
            const baseSpeed = 0.75;
            // always add a positive offset
            mat.dashOffset = (mat.dashOffset ?? 0) + delta * baseSpeed * -1;
            mat.needsUpdate = true;
          }
        });
      }

      // 2) Render bloom pass
      composer.render();

      const mount = objectMapRef.current['horizontalStage'];
      const cam = mainCameraRef.current;


      if (mount && cam) {
        const OFFSET = new THREE.Vector3(-10, 7, 12);
        cam.position.copy(mount.position.clone().add(OFFSET));
        cam.lookAt(mount.position);
      }


      if (mount) {
        const cfg = sceneConfigRef.current.find(c => c.id === 'horizontalStage');
        if (cfg) {
          const [tx, ty, tz] = cfg.transform.position;
          mount.position.lerp(new THREE.Vector3(tx, ty, tz), 0.1);
        }
      }


    };
    animate();

    return () => {
      //scene.remove(axesHelper, gridHelper)
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      scene.clear();
      //controlsRef.current?.dispose();
    };
  }, []
  ); // initialization runs only once


  // Ghosting effect
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // A move has STARTED
    if (motionState.isMoving && motionState.objectId && motionState.startPosition && !ghostObjectRef.current) {
      // Find the config for the object that's moving by matching its synopticId (or its regular id as a fallback).
      const configForGhost = sceneConfigRef.current.find(
        cfg => (cfg.synopticId || cfg.id) === motionState.objectId
      );

      // If we found a matching config, we can get its REAL 3D id.
      if (configForGhost) {
        const realObjectId = configForGhost.id;
        const realObject = objectMapRef.current[realObjectId];

        if (realObject) {
          let meshToClone: THREE.Mesh | null = null;
          realObject.traverse((child) => {
            if (child instanceof THREE.Mesh && !meshToClone) {
              meshToClone = child;
            }
          });

          if (meshToClone) {
            const ghost = meshToClone.clone();
            ghost.material = sharedResources.materials.ghostMaterial;
            ghost.position.copy(motionState.startPosition);
            ghost.rotation.copy(realObject.rotation);
            ghost.scale.copy(realObject.scale);
            scene.add(ghost);
            ghostObjectRef.current = ghost;
          }
        }
      }
    }
    // A move has ENDED
    else if (!motionState.isMoving && ghostObjectRef.current) {
      scene.remove(ghostObjectRef.current);
      ghostObjectRef.current = null;
    }
  }, [motionState, sharedResources.materials.ghostMaterial]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }} ref={containerRef}>
      <canvas id="three-canvas" style={{ width: '100%', height: '100%' }} />
      <div
        style={{
          position: 'absolute',
          bottom: '5px',
          right: '5px',
          textAlign: 'center',
          pointerEvents: 'none'
        }}
      >
        <ArrowUp
          style={{
            width: '24px',
            height: '24px',
            transform: 'rotate(-60deg)',
            color: 'orangered'
          }}
        />
        <div style={{ fontSize: '10px', color: 'black' }}>
          Beam Direction
        </div>
      </div>
    </div>
  );
};

export default ThreeScene;
