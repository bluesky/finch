// types/three-examples.d.ts

declare module 'three/examples/jsm/postprocessing/Pass' {
    import { WebGLRenderer, WebGLRenderTarget, Material } from 'three';

    export class Pass {
        enabled: boolean;
        needsSwap: boolean;
        clear: boolean;
        renderToScreen: boolean;

        setSize(width: number, height: number): void;
        render(
            renderer: WebGLRenderer,
            writeBuffer: WebGLRenderTarget,
            readBuffer: WebGLRenderTarget,
            deltaTime?: number,
            maskActive?: boolean,
        ): void;
    }

    export class FullScreenQuad {
        constructor(material: Material);
        material: Material;
        render(renderer: WebGLRenderer): void;
        dispose(): void;
    }
}

declare module 'three/examples/jsm/postprocessing/EffectComposer' {
    import {
        WebGLRenderer,
        WebGLRenderTarget,
        Scene as _Scene,
        Camera as _Camera,
        Texture as _Texture,
    } from 'three';
    import { Pass } from 'three/examples/jsm/postprocessing/Pass';

    export class EffectComposer {
        constructor(renderer: WebGLRenderer, renderTarget?: WebGLRenderTarget);
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
    import { Vector2, Texture as _Texture } from 'three';
    import { Pass } from 'three/examples/jsm/postprocessing/Pass';

    export class UnrealBloomPass extends Pass {
        constructor(resolution: Vector2, strength?: number, radius?: number, threshold?: number);
        threshold: number;
        strength: number;
        radius: number;
        renderToScreen: boolean;
        setSize(width: number, height: number): void;
    }
}

declare module 'three/examples/jsm/loaders/FBXLoader' {
    import { Loader, LoadingManager, Object3D } from 'three';

    export class FBXLoader extends Loader {
        constructor(manager?: LoadingManager);
        load(
            url: string,
            onLoad: (object: Object3D) => void,
            onProgress?: (event: ProgressEvent<EventTarget>) => void,
            onError?: (event: ErrorEvent) => void,
        ): void;
        parse(data: string | ArrayBuffer): Object3D;
    }
}
