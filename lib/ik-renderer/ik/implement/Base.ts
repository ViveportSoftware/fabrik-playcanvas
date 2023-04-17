import * as TWEEN from '@tweenjs/tween.js';
import * as pc from 'playcanvas';

import * as Fabrik from '../../../fabrik';
import * as Renderer from '../../renderer';

import {IK} from '../core/IK';
import {Target} from '../core/Target';
import {HumanoidPart} from '../core/humanoid/HumanoidPart';

export class Base implements IK {
  private boneEntityCacheMap: Map<string, Map<number, pc.Entity>> = new Map();
  private targetCacheMap: Map<string, Target> = new Map();

  private needToSolve: boolean = true;
  private renderForwardLine: boolean = false;
  protected renderer: Renderer.Renderer | Renderer.AvatarRenderer | undefined;

  private renderIKBone: boolean = true;

  constructor() {}

  public setRenderer(
    renderer: Renderer.Renderer | Renderer.AvatarRenderer
  ): void {
    this.renderer = renderer;
  }

  public setRenderIKBone(renderIKBone: boolean): void {
    this.renderIKBone = renderIKBone;
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
      const targetEntity = this.renderer?.addTarget(id);
      if (targetEntity) {
        targetEntity.setPosition(pos.x, pos.y, pos.z);
        const target = new Target(id, targetEntity);
        this.targetCacheMap.set(target.id, target);
        if (!this.renderIKBone) {
          targetEntity.enabled = false;
        }
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

    new TWEEN.Tween(target.getPosition())
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
        tick.call(this, target.getPosition());
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

      // scaling entity not effect local position
      const avatarScale = (
        this.renderer as Renderer.AvatarRenderer
      ).getAvatarScale();

      this.targetCacheMap.forEach((target, part) => {
        const localPos = target.getLocalPosition();
        const globalPos = target.getPosition();

        switch (part) {
          case HumanoidPart.RightArm:
            this.renderer?.setTextInputSourceRightPos(
              `${globalPos.x.toFixed(4)},${globalPos.y.toFixed(
                4
              )},${globalPos.z.toFixed(4)}`
            );

            this.renderer?.setTextTargetRightPos(
              `${(localPos.x * avatarScale).toFixed(4)},${(
                localPos.y * avatarScale
              ).toFixed(4)},${(localPos.z * avatarScale).toFixed(4)}`
            );
            break;

          case HumanoidPart.LeftArm:
            this.renderer?.setTextInputSourceLeftPos(
              `${globalPos.x.toFixed(4)},${globalPos.y.toFixed(
                4
              )},${globalPos.z.toFixed(4)}`
            );

            this.renderer?.setTextTargetLeftPos(
              `${(localPos.x * avatarScale).toFixed(4)},${(
                localPos.y * avatarScale
              ).toFixed(4)},${(localPos.z * avatarScale).toFixed(4)}`
            );
            break;
        }

        const hipsPos = (
          this.renderer as Renderer.AvatarRenderer
        ).getAvatarHipsPosition();

        if (hipsPos) {
          (this.renderer as Renderer.AvatarRenderer).setLocalTargetWithLocalPos(
            target.entity.name,
            new pc.Vec3(
              localPos.x * avatarScale,
              localPos.y * avatarScale,
              localPos.z * avatarScale
            )
          );
        }

        targetPosMap.set(
          target.id,
          new Fabrik.Vec3(
            localPos.x * avatarScale,
            localPos.y * avatarScale,
            localPos.z * avatarScale
          )
        );

        // targetPosMap.set(target.id, target.getPosition());
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

  public render(): void {
    const ikSolver = this.getSolver();
    if (!ikSolver) {
      return;
    }
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

        if (!this.renderIKBone) {
          boneEntity.enabled = false;
        }

        const startLocation = bone.getStartLocation();
        const endLocation = bone.getEndLocation();
        boneEntity.setLocalPosition(
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

        if (this.renderForwardLine && this.renderIKBone) {
          this.renderEntityForwardLine(boneEntity);
        }
      }
    }
  }

  private renderEntityForwardLine(e: pc.Entity): void {
    if (!this.renderer) {
      throw new Error('renderer is undefined');
    }

    const v1 = e.getLocalPosition();
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

  public getSolver(): Fabrik.FabrikStructure3D | undefined {
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
