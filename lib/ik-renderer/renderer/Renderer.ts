import * as pc from 'playcanvas';
import {fromEvent} from 'rxjs';

// @ts-ignore
import {createMouseInput} from '../playcanvas/scripts/mouse-input';
// @ts-ignore
import {createOrbitCamera} from '../playcanvas/scripts/orbit-camera';

import assetsGLBAvatar from '../assets/glbs/avatar.glb?url';
import assetsImagesGrid from '../assets/images/grid.png';

export class Renderer {
  protected app?: pc.Application;

  private camera?: pc.Entity;
  private vrCamera?: pc.Entity;
  private xrInputSources: Array<pc.XrInputSource> = new Array();
  private xrStartCallback: (vrCamera: pc.Entity) => void = () => {};

  private updateCallbacks: Array<(dt: number) => void> = new Array();
  private rootEntity?: pc.Entity;

  constructor(
    app: pc.Application | undefined = undefined,
    rootEntity: pc.Entity | undefined = undefined
  ) {
    if (app) {
      this.app = app;
    }
    if (rootEntity) {
      this.rootEntity = rootEntity;
    }
  }

  public async init() {
    if (this.app) {
      return;
    }

    this.initApplication();

    await this.loadAssets();

    this.initVRCamera();
    this.initCamera();
    this.initLight();
    this.initPlane();

    this.runApplication();

    this.drawBaseLines();

    fromEvent<KeyboardEvent>(document, 'keyup').subscribe(e => {
      if (e.key === '`') {
        this.startXR();
        if (this.vrCamera && this.vrCamera.camera) {
          this.vrCamera.camera.rect = new pc.Vec4(0, 0.5, 1, 0.5);
        }
        if (this.camera && this.camera.camera) {
          this.camera.camera.rect = new pc.Vec4(0, 0, 1, 0.5);
        }
      }
    });
  }

  private initApplication() {
    const canvas = document.getElementById('canvas');
    this.app = new pc.Application(canvas as HTMLCanvasElement, {
      graphicsDeviceOptions: {
        antialias: true,
        alpha: false,
        preserveDrawingBuffer: false,
        preferWebGl2: true,
        powerPreference: 'high-performance',
        xrCompatible: true,
      },
      mouse: new pc.Mouse(document.body),
    });

    this.app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    this.app.setCanvasResolution(pc.RESOLUTION_AUTO);

    createMouseInput();
    createOrbitCamera();

    this.app.on('update', dt => {
      this.updateCallbacks.forEach(cb => {
        cb.call(this, dt);
      });

      this.drawBaseLines();
    });
  }

  private async loadAssets(): Promise<void> {
    const assets = [
      new pc.Asset('grid', 'texture', {url: assetsImagesGrid}),
      new pc.Asset('avatar', 'container', {url: assetsGLBAvatar}),
    ];

    const assetListLoader = new pc.AssetListLoader(
      assets,
      this.app?.assets as pc.AssetRegistry
    );

    return new Promise<void>((resolve, reject) => {
      assetListLoader.load(() => {
        resolve();
      });
    });
  }

  private initCamera(): void {
    this.camera = new pc.Entity('camera');
    this.camera.addComponent('camera', {
      clearColor: new pc.Color(0.5, 0.6, 0.9),
      nearClip: 0.1,
      farClip: 1000,
      fov: 55,
    });

    this.camera.addComponent('script');
    this.camera.script?.create('orbitCamera', {
      attributes: {
        inertiaFactor: 0.2,
      },
    });

    this.camera.script?.create('mouseInput', {
      attributes: {},
    });

    this.camera.setPosition(0, 8, 16);

    this.app?.root.addChild(this.camera);
  }

  private initVRCamera(): void {
    this.vrCamera = new pc.Entity('vrCamera');

    this.vrCamera.addComponent('camera', {
      clearColor: new pc.Color(0.5, 0.6, 0.9),
      nearClip: 0.1,
      farClip: 1000,
      fov: 55,
    });

    this.vrCamera.setPosition(0, 4, 16);

    this.app?.root.addChild(this.vrCamera);
  }

  private initLight(): void {
    const light = new pc.Entity('light');
    light.addComponent('light');
    light.setEulerAngles(45, 0, 0);
    this.app?.root.addChild(light);
  }

  private initPlane(): void {
    const plane = new pc.Entity('plane');

    plane.addComponent('render', {
      type: 'plane',
      receiveShadows: true,
      renderStyle: pc.RENDERSTYLE_WIREFRAME,
    });

    plane.setLocalScale(10, 1, 10);

    this.app?.root.addChild(plane);
  }

  private drawBaseLines(): void {
    this.drawLine(
      new pc.Vec3(-100, 0, 0),
      new pc.Vec3(100, 0, 0),
      new pc.Color(1, 0, 0, 0.2)
    );

    this.drawLine(
      new pc.Vec3(0, -100, 0),
      new pc.Vec3(0, 100, 0),
      new pc.Color(0, 1, 0, 0.2)
    );

    this.drawLine(
      new pc.Vec3(0, 0, -100),
      new pc.Vec3(0, 0, 100),
      new pc.Color(0, 0, 1, 0.2)
    );
  }

  private runApplication(): void {
    this.app?.start();
  }

  public addUpdateCallback(cb: (dt: number) => void = (): void => {}) {
    this.updateCallbacks.push(cb);
  }

  public addBone(length: number, color: pc.Color, prefix = ''): pc.Entity {
    const jointEntity = new pc.Entity(`${prefix}_joint`);

    const graphicsDevice = this.app?.graphicsDevice as pc.GraphicsDevice;

    const jointMesh = pc.createSphere(graphicsDevice, {
      radius: 0.1,
    });

    const jointMaterial = new pc.BasicMaterial();
    jointMaterial.color = pc.Color.RED;

    const jointMeshInstance = new pc.MeshInstance(jointMesh, jointMaterial);

    jointEntity.addComponent('render', {
      meshInstances: [jointMeshInstance],
      renderStyle: pc.RENDERSTYLE_WIREFRAME,
    });

    const boneEntity = new pc.Entity(`${prefix}_bone`);

    const boneMesh = pc.createCone(graphicsDevice, {
      baseRadius: 0.1,
      peakRadius: 0.05,
      height: length,
      capSegments: 5,
    });

    let m = new pc.StandardMaterial();

    m.emissive = color;
    m.update();

    const boneMeshInstance = new pc.MeshInstance(boneMesh, m);

    boneEntity.addComponent('render', {
      meshInstances: [boneMeshInstance],
      renderStyle: pc.RENDERSTYLE_WIREFRAME,
    });

    // https://developer.playcanvas.com/en/api/pc.Entity.html#lookAt
    // Reorients the graph node so that the negative z-axis points towards the target.
    //
    // Force bone grow on Z_NEG (-Z)
    boneEntity.rotate(-90, 0, 0);
    boneEntity.translate(0, 0, -length * 0.5);

    jointEntity.addChild(boneEntity);

    if (this.rootEntity) {
      this.rootEntity.addChild(jointEntity);
    } else {
      this.app?.root.addChild(jointEntity);
    }

    return jointEntity;
  }

  public addTarget(): pc.Entity {
    const targetEntity = new pc.Entity('target');

    const graphicsDevice = this.app?.graphicsDevice as pc.GraphicsDevice;

    const jointMesh = pc.createSphere(graphicsDevice, {
      radius: 0.1,
    });

    const jointMaterial = new pc.BasicMaterial();
    jointMaterial.color = pc.Color.YELLOW;

    const jointMeshInstance = new pc.MeshInstance(jointMesh, jointMaterial);

    targetEntity.addComponent('render', {
      meshInstances: [jointMeshInstance],
      renderStyle: pc.RENDERSTYLE_WIREFRAME,
    });

    if (this.rootEntity) {
      this.rootEntity.addChild(targetEntity);
    } else {
      this.app?.root.addChild(targetEntity);
    }

    return targetEntity;
  }

  public drawLine(
    v1: pc.Vec3,
    v2: pc.Vec3,
    c: pc.Color | undefined,
    depthTest: boolean | undefined = true
  ): void {
    this.app?.drawLine(v1, v2, c, depthTest);
  }

  public getXRInputSources(): pc.XrInputSource[] {
    return this.xrInputSources;
  }

  public addXRStartCallback(fn: (vrCamera: pc.Entity) => void): void {
    this.xrStartCallback = fn;
  }

  public isInXR(): boolean {
    if (this.app) {
      return this.app.xr.active;
    }
    return false;
  }

  public startXR(): void {
    if (this.app?.xr.isAvailable(pc.XRTYPE_VR)) {
      this.app.xr.input.on(
        'add',
        (inputSource: pc.XrInputSource) => {
          this.xrInputSources.push(inputSource);
        },
        this
      );

      this.app.xr.on('start', () => {
        if (this.vrCamera) {
          this.xrStartCallback.call(this, this.vrCamera);
        }
      });

      const cameraComponent = this.vrCamera?.findComponent(
        'camera'
      ) as pc.CameraComponent;
      cameraComponent.startXr(pc.XRTYPE_VR, pc.XRSPACE_LOCAL);
    }
  }

  public getVRCameraPos(): pc.Vec3 | undefined {
    return this.vrCamera?.getPosition();
  }
}