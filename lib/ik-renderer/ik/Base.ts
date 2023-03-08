import * as TWEEN from '@tweenjs/tween.js';
import * as pc from 'playcanvas';

import * as Fabrik from '../../fabrik';
import * as Renderer from '../renderer';
import {IK} from './IK';
import {Target} from './Target';

export class Base implements IK {
  private boneEntityCacheMap: Map<string, Map<number, pc.Entity>> = new Map();
  private targetCacheMap: Map<string, Target> = new Map();

  private needToSolve: boolean = true;
  private renderForwardLine: boolean = true;
  protected renderer: Renderer.Renderer | Renderer.AvatarRenderer | undefined;

  constructor() {}

  public setRenderer(
    renderer: Renderer.Renderer | Renderer.AvatarRenderer
  ): void {
    this.renderer = renderer;
  }

  public addTarget(
    id: string,
    pos: Fabrik.Vec3 = new Fabrik.Vec3(
      Number.MAX_VALUE,
      Number.MAX_VALUE,
      Number.MAX_VALUE
    )
  ): void {
    const cacheTarget = this.targetCacheMap.get(id);
    if (cacheTarget) {
      cacheTarget.entity.setPosition(pos.x, pos.y, pos.z);
    } else {
      const targetEntity = this.renderer?.addTarget();
      if (targetEntity) {
        targetEntity.setPosition(pos.x, pos.y, pos.z);
        const target = new Target(id, pos, targetEntity);
        this.targetCacheMap.set(target.id, target);
      }
    }
  }

  public getTarget(id: string): Target | undefined {
    return this.targetCacheMap.get(id);
  }

  public randomMoveTarget(
    id: string,
    max: Fabrik.Vec3 = new Fabrik.Vec3(2, 2, 2),
    min: Fabrik.Vec3 = new Fabrik.Vec3(-2, -2, -2),
    tick: (pos: Fabrik.Vec3) => void = () => {}
  ): void {
    const randX = Fabrik.Utils.randRangeFloat(min.x, max.x);
    const randY = Fabrik.Utils.randRangeFloat(min.y, max.y);
    const randZ = Fabrik.Utils.randRangeFloat(min.z, max.z);

    const target = this.getTarget(id);

    if (!target) return;

    new TWEEN.Tween(target.pos)
      .to(
        {
          x: randX,
          y: randY,
          z: randZ,
        },
        1000
      )
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() => {
        this.solveIK();
        this.render();
        tick.call(this, target.pos);
      })
      .onComplete(() => {
        this.randomMoveTarget(id, max, min, tick);
      })
      .start();
  }

  public setNeedToSolve(needToSolve: boolean): void {
    this.needToSolve = needToSolve;
  }

  public solveIK() {
    if (this.needToSolve) {
      const targetPosMap: Map<string, Fabrik.Vec3> = new Map();

      this.targetCacheMap.forEach(target => {
        targetPosMap.set(target.id, target.pos);
        target.entity.setPosition(target.pos.x, target.pos.y, target.pos.z);
      });

      this.solveForTargets(targetPosMap);
    }

    this.needToSolve = false;
  }

  public getBoneFromCache(
    chainName: string,
    boneIndex: number
  ): pc.Entity | undefined {
    return this.boneEntityCacheMap.get(chainName)?.get(boneIndex);
  }

  public setBoneToCache(chainName: string, boneIndex: number, bone: pc.Entity) {
    let chain = this.boneEntityCacheMap.get(chainName);
    if (!chain) {
      chain = new Map<number, pc.Entity>();
      this.boneEntityCacheMap.set(chainName, chain);
    }

    chain.set(boneIndex, bone);
  }

  private addBoneEntity(bone: Fabrik.FabrikBone3D, prefix = ''): pc.Entity {
    if (!this.renderer) {
      throw new Error('renderer is undefined');
    }

    const color = bone.getColor();

    return this.renderer.addBone(
      bone.length(),
      new pc.Color(color.r, color.g, color.b),
      prefix
    );
  }

  public render(renderEntity: boolean = true) {
    const ikSolver = this.getSolver();
    const numChains = ikSolver.getNumChains();

    for (let chainIndex = 0; chainIndex < numChains; chainIndex++) {
      const chain = ikSolver.getChain(chainIndex);
      const numBones = chain.getNumBones();

      for (let boneIndex = 0; boneIndex < numBones; boneIndex++) {
        const bone = chain.getBone(boneIndex);
        const boneEntityCache = this.getBoneFromCache(
          chain.getName(),
          boneIndex
        );
        let boneEntity: pc.Entity;
        if (boneEntityCache) {
          boneEntity = boneEntityCache;
        } else {
          const name = `${chain.getName()}_${boneIndex}`;
          bone.setName(name);
          boneEntity = this.addBoneEntity(bone, name);
          this.setBoneToCache(chain.getName(), boneIndex, boneEntity);
        }

        if (!renderEntity) {
          boneEntity.enabled = false;
        }

        const startLocation = bone.getStartLocation();
        const endLocation = bone.getEndLocation();
        boneEntity.setPosition(
          startLocation.x,
          startLocation.y,
          startLocation.z
        );

        const joint = bone.getJoint();

        const rotationAxis =
          joint.getJointType() == Fabrik.JointType.BALL
            ? new Fabrik.Vec3(0, 0, 0)
            : joint.getHingeRotationAxis();

        const lookAtPos = new pc.Vec3(
          endLocation.x,
          endLocation.y,
          endLocation.z
        );
        let rotateAxis = boneEntity.up;

        switch (joint.getJointType()) {
          case Fabrik.JointType.BALL:
          case Fabrik.JointType.GLOBAL_HINGE:
          case Fabrik.JointType.LOCAL_HINGE:
            switch (bone.getName()) {
              case 'RightLeg_1':
              case 'RightLeg_2':
              case 'RightLeg_3':
                rotateAxis = new pc.Vec3(1, 0, 0);
                break;

              case 'LeftLeg_2':
              case 'LeftLeg_3':
                rotateAxis = new pc.Vec3(1, 0, 0);
                break;
            }

            boneEntity.lookAt(lookAtPos, rotateAxis);

            break;
        }

        if (this.renderForwardLine) {
          this.renderEntityForwardLine(boneEntity);
        }
      }
    }
  }

  private renderEntityForwardLine(e: pc.Entity): void {
    if (!this.renderer) {
      throw new Error('renderer is undefined');
    }

    const v1 = e.getPosition();
    const v2 = e.forward;

    this.renderer.drawLine(
      new pc.Vec3(v1.x, v1.y, v1.z),
      new pc.Vec3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z),
      new pc.Color(0, 0, 1, 1)
    );

    const v3 = e.up;
    this.renderer.drawLine(
      new pc.Vec3(v1.x, v1.y, v1.z),
      new pc.Vec3(v1.x + v3.x, v1.y + v3.y, v1.z + v3.z),
      new pc.Color(0, 1, 0, 1)
    );

    const v4 = e.right;
    this.renderer.drawLine(
      new pc.Vec3(v1.x, v1.y, v1.z),
      new pc.Vec3(v1.x + v4.x, v1.y + v4.y, v1.z + v4.z),
      new pc.Color(1, 0, 0, 1)
    );
  }

  public getSolver(): Fabrik.FabrikStructure3D {
    throw new Error('Method not implemented.');
  }

  public solveForTargets(targets: Map<string, Fabrik.Vec3>): void {
    throw new Error('Method not implemented.');
  }

  public run(): void {
    throw new Error('Method not implemented.');
  }

  public update(): void {
    throw new Error('Method not implemented.');
  }
}
