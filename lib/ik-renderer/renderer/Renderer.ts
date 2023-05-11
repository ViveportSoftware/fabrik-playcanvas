import * as pc from 'playcanvas';
import {fromEvent} from 'rxjs';
import {Logger} from '../Logger';

// // assets for local demo
// // font
// import RobotoMediumUrl from '../assets/fonts/Roboto-Medium.json?url';
// import RobotoMediumTextureUrl from '../assets/fonts/Roboto-Medium.png';
// import assetsGLBAvatar from '../assets/glbs/avatar.glb?url';
// import assetsImagesGrid from '../assets/images/grid.png';
// // @ts-ignore
// import {createMouseInput} from '../playcanvas/scripts/mouse-input';
// // @ts-ignore
// import {createOrbitCamera} from '../playcanvas/scripts/orbit-camera';

export class Renderer {
  protected app?: pc.Application;

  private camera?: pc.Entity;
  protected xrCamera?: pc.Entity;
  protected xrCameraRoot?: pc.Entity;

  private hud?: pc.Entity;
  protected textHMDPos?: pc.Entity;
  protected textHMDRotation?: pc.Entity;
  protected textInputSourceLeftPos?: pc.Entity;
  protected textTargetLeftPos?: pc.Entity;
  protected textInputSourceRightPos?: pc.Entity;
  protected textTargetRightPos?: pc.Entity;
  protected textAvatarForward?: pc.Entity;
  protected textTargetRootForward?: pc.Entity;

  private xrInputSources: Array<pc.XrInputSource> = new Array();
  private xrStartCallback: (xrCamera: pc.Entity) => void = () => {};

  private updateCallbacks: Array<(dt: number) => void> = new Array();
  protected rootEntity?: pc.Entity;
  public isLocalDemo: boolean = true;

  private isRunning = true;

  constructor(
    app: pc.Application | undefined = undefined,
    rootEntity: pc.Entity | undefined = undefined,
    isLocalDemo: boolean = true
  ) {
    if (app) {
      this.app = app;
      this.app.on('update', dt => {
        if (!this.isRunning) return;

        this.updateCallbacks.forEach(cb => {
          cb.call(this, dt);
        });

        this.drawBaseLines();
      });

      this.registerXRInputEvent();
    }

    if (rootEntity) {
      this.rootEntity = rootEntity;
    }

    this.isLocalDemo = isLocalDemo;
  }

  public async init() {
    if (this.app) {
      console.warn('PlayCanvas application is already initial');
      return;
    }

    this.initApplication();

    await this.loadAssets();
    await this.loadFontAssets();

    this.initXRCamera();
    this.initCamera();
    this.initLight();
    this.initPlane();

    this.initHUD();
    this.initTextHMDPos();
    this.initTextHMDRotation();
    this.initTextInputSourceLeftPos();
    this.initTextTargetLeftPos();
    this.initTextInputSourceRightPos();
    this.initTextTargetRightPos();
    this.initTextAvatarForward();

    this.runApplication();

    this.drawBaseLines();

    fromEvent<TouchEvent>(document, 'touchend').subscribe(e => {
      this.startXR();
    });

    fromEvent<MouseEvent>(document, 'click').subscribe(e => {
      this.startXR();
    });

    fromEvent<KeyboardEvent>(document, 'keyup').subscribe(e => {
      if (e.key === '`') {
        this.startXR();
      }
    });
  }

  public stop(): void {
    this.isRunning = false;
  }

  public resume(): void {
    this.isRunning = true;
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

    if (this.isLocalDemo) {
      // createMouseInput();
      // createOrbitCamera();
    }

    if (!this.rootEntity) {
      this.rootEntity = new pc.Entity('avatarRoot');
      this.app?.root.addChild(this.rootEntity);
    }

    this.app.on('update', dt => {
      if (!this.isRunning) return;

      this.updateCallbacks.forEach(cb => {
        cb.call(this, dt);
      });

      this.drawBaseLines();
    });
  }

  private async loadAssets(): Promise<void> {
    const assets: Array<pc.Asset> = [];

    if (this.isLocalDemo) {
      // assets.push(new pc.Asset('grid', 'texture', {url: assetsImagesGrid}));
      // assets.push(new pc.Asset('avatar', 'container', {url: assetsGLBAvatar}));
      // assets.push(
      //   new pc.Asset('RobotoMedium.json', 'json', {url: RobotoMediumUrl})
      // );
    }

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

  private async loadFontAssets(): Promise<void> {
    const fontAssets: Array<pc.Asset> = [];
    // fontAssets.push(
    //   new pc.Asset('RobotoMedium', 'font', {url: RobotoMediumTextureUrl})
    // );

    fontAssets.forEach(fontAsset => {
      const resource = this.app?.assets.find(
        `${fontAsset.name}.json`
      )?.resource;

      if (resource) {
        fontAsset.data = resource;
      } else {
        Logger.getInstance().error(
          `Font Loading: You did'nt loaded ${fontAsset.name} json file`
        );
      }
    });

    const assetListLoader = new pc.AssetListLoader(
      fontAssets,
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
      // fov: 55,
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

  private initXRCamera(): void {
    this.xrCamera = new pc.Entity('xrCamera');

    this.xrCamera.addComponent('camera', {
      clearColor: new pc.Color(0.5, 0.6, 0.9),
      nearClip: 0.001,
      farClip: 1000,
      // fov: 55,
    });

    this.xrCamera.setPosition(0, 0, 0);

    this.xrCameraRoot = new pc.Entity('xrCamera');
    this.xrCameraRoot.addChild(this.xrCamera);

    if (this.rootEntity) {
      this.rootEntity.addChild(this.xrCameraRoot);
    } else {
      this.app?.root.addChild(this.xrCameraRoot);
    }
  }

  private initHUD(): void {
    this.hud = new pc.Entity('HUD');

    this.hud.addComponent('screen', {
      screenSpace: true,
      referenceResolution: new pc.Vec2(1280, 720),
      scaleBlend: 0.5,
      scaleMode: pc.SCALEMODE_BLEND,
    });

    this.app?.root.addChild(this.hud);

    this.hud.setPosition(0, 4, 0);
  }

  private initTextHMDPos(): void {
    this.textHMDPos = new pc.Entity('HMDPos');
    this.textHMDPos.addComponent('element', {
      anchor: [0.5, 0.5, 0.5, 0.5],
      pivot: [0.5, 0.5],
      fontSize: 24,
      autoWidth: true,
      autoHeight: true,
      type: pc.ELEMENTTYPE_TEXT,
      color: new pc.Color().fromString('#FF0000'),
      alignment: [0.5, 0.5],
      useInput: true,
      text: '0,0,0',
      fontAsset: this.app?.assets.find('RobotoMedium'),
    });

    this.hud?.addChild(this.textHMDPos);
  }

  private initTextHMDRotation(): void {
    this.textHMDRotation = new pc.Entity('HMDRotation');
    this.textHMDRotation.addComponent('element', {
      anchor: [0.5, 0.5, 0.5, 0.5],
      pivot: [0.5, 0.5],
      fontSize: 24,
      autoWidth: true,
      autoHeight: true,
      type: pc.ELEMENTTYPE_TEXT,
      color: new pc.Color().fromString('#00FF00'),
      alignment: [0.5, 0.5],
      useInput: true,
      text: '0,0,0,0',
      fontAsset: this.app?.assets.find('RobotoMedium'),
    });

    this.textHMDRotation.setLocalPosition(0, 32, 0);

    this.hud?.addChild(this.textHMDRotation);
  }

  private initTextInputSourceLeftPos(): void {
    this.textInputSourceLeftPos = new pc.Entity('InputSourceLeftPos');
    this.textInputSourceLeftPos.addComponent('element', {
      anchor: [0.5, 0.5, 0.5, 0.5],
      pivot: [0.5, 0.5],
      fontSize: 24,
      autoWidth: true,
      autoHeight: true,
      type: pc.ELEMENTTYPE_TEXT,
      color: new pc.Color().fromString('#FFFF00'),
      alignment: [0.5, 0.5],
      useInput: true,
      text: '0,0,0',
      fontAsset: this.app?.assets.find('RobotoMedium'),
    });

    this.textInputSourceLeftPos.setLocalPosition(-128, 128, 0);

    this.hud?.addChild(this.textInputSourceLeftPos);
  }

  private initTextTargetLeftPos(): void {
    this.textTargetLeftPos = new pc.Entity('TargetLeftPos');
    this.textTargetLeftPos.addComponent('element', {
      anchor: [0.5, 0.5, 0.5, 0.5],
      pivot: [0.5, 0.5],
      fontSize: 24,
      autoWidth: true,
      autoHeight: true,
      type: pc.ELEMENTTYPE_TEXT,
      color: new pc.Color().fromString('#FFFF00'),
      alignment: [0.5, 0.5],
      useInput: true,
      text: '0,0,0',
      fontAsset: this.app?.assets.find('RobotoMedium'),
    });

    this.textTargetLeftPos.setLocalPosition(-128, 160, 0);

    this.hud?.addChild(this.textTargetLeftPos);
  }

  private initTextInputSourceRightPos(): void {
    this.textInputSourceRightPos = new pc.Entity('InputSourceRightPos');
    this.textInputSourceRightPos.addComponent('element', {
      anchor: [0.5, 0.5, 0.5, 0.5],
      pivot: [0.5, 0.5],
      fontSize: 24,
      autoWidth: true,
      autoHeight: true,
      type: pc.ELEMENTTYPE_TEXT,
      color: new pc.Color().fromString('#FFFF00'),
      alignment: [0.5, 0.5],
      useInput: true,
      text: '0,0,0',
      fontAsset: this.app?.assets.find('RobotoMedium'),
    });

    this.textInputSourceRightPos.setLocalPosition(128, 128, 0);

    this.hud?.addChild(this.textInputSourceRightPos);
  }

  private initTextTargetRightPos(): void {
    this.textTargetRightPos = new pc.Entity('TargetRightPos');
    this.textTargetRightPos.addComponent('element', {
      anchor: [0.5, 0.5, 0.5, 0.5],
      pivot: [0.5, 0.5],
      fontSize: 24,
      autoWidth: true,
      autoHeight: true,
      type: pc.ELEMENTTYPE_TEXT,
      color: new pc.Color().fromString('#FFFF00'),
      alignment: [0.5, 0.5],
      useInput: true,
      text: '0,0,0',
      fontAsset: this.app?.assets.find('RobotoMedium'),
    });

    this.textTargetRightPos.setLocalPosition(128, 160, 0);

    this.hud?.addChild(this.textTargetRightPos);
  }

  private initTextAvatarForward(): void {
    this.textAvatarForward = new pc.Entity('AvatarForward');
    this.textAvatarForward.addComponent('element', {
      anchor: [0.5, 0.5, 0.5, 0.5],
      pivot: [0.5, 0.5],
      fontSize: 24,
      autoWidth: true,
      autoHeight: true,
      type: pc.ELEMENTTYPE_TEXT,
      color: new pc.Color().fromString('#0000FF'),
      alignment: [0.5, 0.5],
      useInput: true,
      text: '0,0,0',
      fontAsset: this.app?.assets.find('RobotoMedium'),
    });

    this.textAvatarForward.setLocalPosition(0, 64, 0);

    this.hud?.addChild(this.textAvatarForward);
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
      radius: 0.02,
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
      baseRadius: 0.02,
      peakRadius: 0.005,
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

  public addTarget(name: string = 'target'): pc.Entity {
    const targetEntity = new pc.Entity(name);

    const graphicsDevice = this.app?.graphicsDevice as pc.GraphicsDevice;

    const jointMesh = pc.createSphere(graphicsDevice, {
      radius: 0.02,
    });

    const jointMaterial = new pc.BasicMaterial();
    jointMaterial.color = pc.Color.YELLOW;

    const jointMeshInstance = new pc.MeshInstance(jointMesh, jointMaterial);

    targetEntity.addComponent('render', {
      meshInstances: [jointMeshInstance],
      renderStyle: pc.RENDERSTYLE_WIREFRAME,
    });

    this.app?.root.addChild(targetEntity);

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

  public addXRStartCallback(fn: (xrCamera: pc.Entity) => void): void {
    this.xrStartCallback = fn;
  }

  public isInXR(): boolean {
    if (this.app) {
      return this.app.xr.active;
    }
    return false;
  }

  private xrInputAddCallback(inputSource: pc.XrInputSource): void {
    this.xrInputSources.push(inputSource);
  }

  private registerXRInputEvent(): void {
    if (this.app?.xr.isAvailable(pc.XRTYPE_VR)) {
      this.app.xr.input.on('add', this.xrInputAddCallback, this);

      this.app.xr.on('end', () => {
        this.app?.xr.input.off('add', this.xrInputAddCallback, this);
        this.xrInputSources = [];
      });
    }
  }

  public startXR(): void {
    if (this.app?.xr.isAvailable(pc.XRTYPE_VR) && !this.app?.xr.active) {
      if (this.isLocalDemo) {
        this.registerXRInputEvent();

        this.app.xr.on('start', () => {
          if (this.xrCamera && this.xrCamera.camera) {
            this.xrCamera.camera.rect = new pc.Vec4(0, 0, 1, 1);
          }
          if (this.camera && this.camera.camera) {
            this.camera.camera.rect = new pc.Vec4(0, 0, 1, 0);
          }

          if (this.xrCamera) {
            this.xrStartCallback.call(this, this.xrCamera);
          }
        });

        this.app.xr.on('end', () => {
          if (this.xrCamera && this.xrCamera.camera) {
            this.xrCamera.camera.rect = new pc.Vec4(0, 0, 1, 0);
          }
          if (this.camera && this.camera.camera) {
            this.camera.camera.rect = new pc.Vec4(0, 0, 1, 1);
          }
        });

        this.app.xr.on('update', () => {
          if (this.xrCamera && this.xrCamera.camera) {
            const xrCameraPos = this.xrCamera.getPosition();
            if (
              this.textHMDPos &&
              this.textHMDPos.element &&
              this.textHMDPos.element.text &&
              this.isLocalDemo
            ) {
              this.textHMDPos.element.text = `${xrCameraPos.x.toFixed(
                4
              )}, ${xrCameraPos.y.toFixed(4)}, ${xrCameraPos.z.toFixed(4)}`;
            }
          }

          this.xrInputSources.forEach(inputSource => {
            if (inputSource) {
              const inputPos = inputSource.getPosition() as pc.Vec3;
              if (inputSource.handedness === pc.XRHAND_LEFT) {
                if (
                  this.textInputSourceLeftPos &&
                  this.textInputSourceLeftPos.element &&
                  this.textInputSourceLeftPos.element.text
                ) {
                  this.textInputSourceLeftPos.element.text = `${inputPos.x.toFixed(
                    4
                  )},${inputPos.y.toFixed(4)},${inputPos.z.toFixed(4)}`;
                }
              } else {
                if (
                  this.textInputSourceRightPos &&
                  this.textInputSourceRightPos.element &&
                  this.textInputSourceRightPos.element.text
                ) {
                  this.textInputSourceRightPos.element.text = `${inputPos.x.toFixed(
                    4
                  )},${inputPos.y.toFixed(4)},${inputPos.z.toFixed(4)}`;
                }
              }
            }
          });
        });

        this.xrCamera?.camera?.startXr(pc.XRTYPE_VR, pc.XRSPACE_LOCALFLOOR, {
          callback: err => {
            Logger.getInstance().error('startXr callback err:', err);
          },
        });
      }
    }
  }

  public getXRCameraPos(): pc.Vec3 | undefined {
    return this.xrCamera?.getPosition();
  }

  public setTextInputSourceLeftPos(text: string): void {
    if (!this.isLocalDemo) return;
    if (
      this.textInputSourceLeftPos &&
      this.textInputSourceLeftPos.element &&
      this.textInputSourceLeftPos.element.text &&
      this.isLocalDemo
    ) {
      this.textInputSourceLeftPos.element.text = text;
    }
  }

  public setTextTargetLeftPos(text: string): void {
    if (!this.isLocalDemo) return;
    if (
      this.textTargetLeftPos &&
      this.textTargetLeftPos.element &&
      this.textTargetLeftPos.element.text &&
      this.isLocalDemo
    ) {
      this.textTargetLeftPos.element.text = text;
    }
  }

  public setTextInputSourceRightPos(text: string): void {
    if (!this.isLocalDemo) return;
    if (
      this.textInputSourceRightPos &&
      this.textInputSourceRightPos.element &&
      this.textInputSourceRightPos.element.text &&
      this.isLocalDemo
    ) {
      this.textInputSourceRightPos.element.text = text;
    }
  }

  public setTextTargetRightPos(text: string): void {
    if (!this.isLocalDemo) return;
    if (
      this.textTargetRightPos &&
      this.textTargetRightPos.element &&
      this.textTargetRightPos.element.text &&
      this.isLocalDemo
    ) {
      this.textTargetRightPos.element.text = text;
    }
  }

  public setXRCamera(xrCamera: pc.Entity): void {
    this.xrCamera = xrCamera;
  }
}
