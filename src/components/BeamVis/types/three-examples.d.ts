// types/three-examples.d.ts

declare module 'three/examples/jsm/postprocessing/EffectComposer' {
    import { WebGLRenderer, Scene, Camera, Texture } from 'three';
    import { Pass } from 'three/examples/jsm/postprocessing/Pass';
  
    export class EffectComposer {
      constructor(renderer: WebGLRenderer, renderTarget?: any);
      addPass(pass: Pass): void;
      render(delta?: number): void;
      setSize(width: number, height: number): void;
    }
  }
  
  declare module 'three/examples/jsm/postprocessing/RenderPass' {
    import { Scene, Camera } from 'three';
    import { Pass } from 'three/examples/jsm/postprocessing/Pass';
  
    export class RenderPass extends Pass {
      constructor(scene: Scene, camera: Camera);
    }
  }
  
  declare module 'three/examples/jsm/postprocessing/UnrealBloomPass' {
    import { Vector2, Texture } from 'three';
    import { Pass } from 'three/examples/jsm/postprocessing/Pass';
  
    export class UnrealBloomPass extends Pass {
      constructor(
        resolution: Vector2,
        strength?: number,
        radius?: number,
        threshold?: number
      );
      threshold: number;
      strength: number;
      radius: number;
      renderToScreen: boolean;
      setSize(width: number, height: number): void;
    }
  }
  
  declare module 'three/examples/jsm/loaders/FBXLoader' {
    import { Loader, Object3D } from 'three';
  
    export class FBXLoader extends Loader {
      constructor(manager?: any);
      load(
        url: string,
        onLoad: (object: Object3D) => void,
        onProgress?: (event: ProgressEvent<EventTarget>) => void,
        onError?: (event: ErrorEvent) => void
      ): void;
      parse(data: string | ArrayBuffer): Object3D;
    }
  }