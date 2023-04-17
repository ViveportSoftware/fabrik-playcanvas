import * as pc from 'playcanvas';
import * as Fabrik from '../../../../fabrik';

import {IKRenderer} from '../../../IKRenderer';
import * as Renderer from '../../../renderer';
import {AvatarPart} from '../../../renderer';
import {IK} from '../IK';
import {Util} from '../Util';
import {HumanoidNormal} from '../humanoid/HumanoidNormal';
import {HumanoidPart} from '../humanoid/HumanoidPart';
import {AvatarRenderer} from './AvatarRenderer';
import {AvatarRendererBase} from './AvatarRendererBase';

export class AvatarRendererNormal
  extends AvatarRendererBase
  implements AvatarRenderer
{
  constructor(
    ik: IK | undefined,
    renderer: Renderer.AvatarRenderer | undefined
  ) {
    super(ik, renderer);

    if (this.renderer) {
      // @ts-ignore
      this.renderer.addXRCalculateScaleCallback(boneLengthMap => {
        const hipsPos = this.renderer?.getAvatarHipsPosition();
        if (hipsPos) {
          const fabrikHipsPos = IKRenderer.pcV3ToFabrikV3(hipsPos);

          this.ikHumanoid = new HumanoidNormal(fabrikHipsPos, boneLengthMap);
        }
      });
    }
  }

  public run(): void {}

  public update(): void {
    const avatarEntity = this.renderer?.getAvatarEntity();
    if (avatarEntity) {
      this.applyIKToAvatar(avatarEntity);
    }
  }

  private applyRotation(
    src: pc.Entity,
    dest: pc.GraphNode,
    angles: Fabrik.Vec3
  ): void {
    const q1 = src.getRotation();
    const q2 = new pc.Quat().setFromEulerAngles(angles.x, angles.y, angles.z);

    const avatarAngles = this.renderer?.getAvatarEntity()?.getEulerAngles();
    if (avatarAngles) {
      const q3 = new pc.Quat().setFromEulerAngles(0, avatarAngles.y, 0);
      dest.setRotation(q3.mul(q1).mul(q2));
    } else {
      dest.setRotation(q1.mul(q2));
    }
  }

  private applyRotationByInputSource(
    src: pc.Entity,
    dest: pc.GraphNode,
    angles: Fabrik.Vec3,
    q: pc.Quat
  ): void {
    const q1 = src.getRotation();
    const q2 = new pc.Quat().setFromEulerAngles(angles.x, angles.y, angles.z);
    dest.setRotation(q1.mul2(q, q2));
  }

  private applyRotationForceFront(
    src: pc.Entity,
    dest: pc.GraphNode,
    angles: Fabrik.Vec3
  ): void {
    const q1 = src.getRotation();
    const q2 = new pc.Quat().setFromEulerAngles(angles.x, angles.y, angles.z);

    let q = q1.mul(q2);

    dest.setRotation(q);

    if (dest.forward.z > 0.01) {
      // console.log(dest.forward.z);
      dest.rotateLocal(0, 180, 0);
    }
  }

  private applyRotationByJoints(
    joints: Fabrik.FabrikBone3D[],
    dest: pc.GraphNode,
    angles: Fabrik.Vec3
  ) {
    const q = new pc.Quat().setFromEulerAngles(angles.x, angles.y, angles.z);

    const startLocation = joints[0].getStartLocation();
    const endLocation = joints[joints.length - 1].getEndLocation();
    const direction = Fabrik.Vec3.getDirectionUV(
      startLocation,
      endLocation
    ).normalised();

    const q1 = Renderer.Util.vec3LookRotation(
      new pc.Vec3(direction.x, direction.y, direction.z),
      dest.up
    );

    dest.setRotation(q1.mul(q));
  }

  private applyIKToAvatarSpine(avatarEntity: pc.Entity): void {
    const avatarHead = avatarEntity.findByName(AvatarPart.Head);
    const avatarChest = avatarEntity.findByName(AvatarPart.Chest);
    const avatarUpperChest = avatarEntity.findByName(AvatarPart.UpperChest);

    const chain = this.getSolver()?.getChainByName(HumanoidPart.Spine);
    const chainName = chain?.getName() as string;

    const ikChest = chain?.getBone(1);
    const ikUpperChest = chain?.getBone(2);

    const ikChestBoneEntity = this.ik?.getBoneFromCache(chainName, 1);
    const ikUpperChestBoneEntity = this.ik?.getBoneFromCache(chainName, 2);

    const eulerAnglesSpine = new Fabrik.Vec3(-90, 0, 0);

    if (ikChestBoneEntity && ikChest && avatarChest) {
      this.applyRotation(ikChestBoneEntity, avatarChest, eulerAnglesSpine);
    }

    if (ikUpperChestBoneEntity && ikUpperChest && avatarUpperChest) {
      this.applyRotation(
        ikUpperChestBoneEntity,
        avatarUpperChest,
        eulerAnglesSpine
      );
    }
  }

  private applyIKToAvatarHead(avatarEntity: pc.Entity): void {
    const avatarNeck = avatarEntity.findByName(AvatarPart.Neck);

    const chain = this.getSolver()?.getChainByName(HumanoidPart.Head);
    const chainName = chain?.getName() as string;

    const iKNeck = chain?.getBone(1);

    const iKNeckBoneEntity = this.ik?.getBoneFromCache(chainName, 1);

    const eulerAngles = new Fabrik.Vec3(-90, 0, 0);

    if (iKNeckBoneEntity && iKNeck && avatarNeck) {
      this.applyRotation(iKNeckBoneEntity, avatarNeck, eulerAngles);
    }
  }

  private applyIKToAvatarRightArm(avatarEntity: pc.Entity): void {
    const avatarRightUpperArm = avatarEntity.findByName(
      AvatarPart.RightUpperArm
    );
    const avatarRightLowerArm = avatarEntity.findByName(
      AvatarPart.RightLowerArm
    );
    const avatarRightHand = avatarEntity.findByName(AvatarPart.RightHand);

    const chain = this.getSolver()?.getChainByName(HumanoidPart.RightArm);
    const chainName = chain?.getName() as string;

    const ikRightSoulderBone = chain?.getBone(1);
    const ikRightUpperArmBone01 = chain?.getBone(2);
    const ikRightLowerArmBone01 = chain?.getBone(3);
    const ikRightHandBone = chain?.getBone(4);

    const ikRightSoulderBoneEntity = this.ik?.getBoneFromCache(chainName, 1);
    const ikRightUpperArmBoneEntity01 = this.ik?.getBoneFromCache(chainName, 2);
    const ikRightLowerArmBoneEntity01 = this.ik?.getBoneFromCache(chainName, 3);
    const ikRightHandBoneEntity = this.ik?.getBoneFromCache(chainName, 4);

    const eulerAnglesRightArm = new Fabrik.Vec3(
      Util.applyApproximatelyEqualsTolerance(0),
      Util.applyApproximatelyEqualsTolerance(90),
      Util.applyApproximatelyEqualsTolerance(0)
    );

    if (!this.printOnceFlag) {
      this.printOnceFlag = true;
    }

    if (
      avatarRightUpperArm &&
      ikRightUpperArmBone01 &&
      ikRightUpperArmBoneEntity01
    ) {
      this.applyRotation(
        ikRightUpperArmBoneEntity01,
        avatarRightUpperArm,
        eulerAnglesRightArm
      );
    }

    if (
      avatarRightLowerArm &&
      ikRightLowerArmBone01 &&
      ikRightLowerArmBoneEntity01
    ) {
      this.applyRotation(
        ikRightLowerArmBoneEntity01,
        avatarRightLowerArm,
        eulerAnglesRightArm
      );
    }

    if (avatarRightHand && ikRightHandBone && ikRightHandBoneEntity) {
      const target = this.ik?.getTarget(HumanoidPart.RightArm);
      if (target) {
        const rotation = target?.getRotation();
        if (this.renderer?.isInXR()) {
          this.applyRotationByInputSource(
            ikRightHandBoneEntity,
            avatarRightHand,
            eulerAnglesRightArm,
            rotation
          );
        } else {
          this.applyRotation(
            ikRightHandBoneEntity,
            avatarRightHand,
            eulerAnglesRightArm
          );
        }
      }
    }
  }

  private applyIKToAvatarLeftArm(avatarEntity: pc.Entity): void {
    const avatarLeftUpperArm = avatarEntity.findByName(AvatarPart.LeftUpperArm);
    const avatarLeftLowerArm = avatarEntity.findByName(AvatarPart.LeftLowerArm);
    const avatarLeftHand = avatarEntity.findByName(AvatarPart.LeftHand);

    const chain = this.getSolver()?.getChainByName(HumanoidPart.LeftArm);
    const chainName = chain?.getName() as string;

    const ikLeftSoulderBone = chain?.getBone(1);
    const ikLeftUpperArmBone = chain?.getBone(2);
    const ikLeftLowerArmBone = chain?.getBone(3);
    const ikLeftHandBone = chain?.getBone(4);

    const ikLeftSoulderBoneEntity = this.ik?.getBoneFromCache(chainName, 1);
    const ikLeftUpperArmBoneEntity = this.ik?.getBoneFromCache(chainName, 2);
    const ikLeftLowerArmBoneEntity = this.ik?.getBoneFromCache(chainName, 3);
    const ikLeftHandBoneEntity = this.ik?.getBoneFromCache(chainName, 4);

    const eulerAnglesLeftArm = new Fabrik.Vec3(0, -90, 0);

    if (avatarLeftUpperArm && ikLeftUpperArmBone && ikLeftUpperArmBoneEntity) {
      this.applyRotation(
        ikLeftUpperArmBoneEntity,
        avatarLeftUpperArm,
        eulerAnglesLeftArm
      );
    }

    if (avatarLeftLowerArm && ikLeftLowerArmBone && ikLeftLowerArmBoneEntity) {
      this.applyRotation(
        ikLeftLowerArmBoneEntity,
        avatarLeftLowerArm,
        eulerAnglesLeftArm
      );
    }

    if (avatarLeftHand && ikLeftHandBone && ikLeftHandBoneEntity) {
      const target = this.ik?.getTarget(HumanoidPart.LeftArm);
      if (target) {
        const rotation = target?.getRotation();
        if (this.renderer?.isInXR()) {
          this.applyRotationByInputSource(
            ikLeftHandBoneEntity,
            avatarLeftHand,
            eulerAnglesLeftArm,
            rotation
          );
        } else {
          this.applyRotation(
            ikLeftHandBoneEntity,
            avatarLeftHand,
            eulerAnglesLeftArm
          );
        }
      }
    }
  }

  private applyIKToAvatarRightLeg(avatarEntity: pc.Entity): void {
    const avatarRightUpperLeg = avatarEntity.findByName(
      AvatarPart.RightUpperLeg
    );
    const avatarRightLowerLeg = avatarEntity.findByName(
      AvatarPart.RightLowerLeg
    );
    const avatarRightFoot = avatarEntity.findByName(AvatarPart.RightFoot);

    const chain = this.getSolver()?.getChainByName(HumanoidPart.RightLeg);
    const chainName = chain?.getName() as string;

    const ikRightUpperLegBone = chain?.getBone(2);
    const ikRightLowerLegBone = chain?.getBone(3);
    const ikRightFootBone = chain?.getBone(4);

    const ikRightUpperLegBoneEntity = this.ik?.getBoneFromCache(chainName, 2);
    const ikRightLowerLegBoneEntity = this.ik?.getBoneFromCache(chainName, 3);
    const ikRightFootBoneEntity = this.ik?.getBoneFromCache(chainName, 4);

    const eulerAngles = new Fabrik.Vec3(90, 0, 90);

    if (
      avatarRightUpperLeg &&
      ikRightUpperLegBone &&
      ikRightUpperLegBoneEntity
    ) {
      this.applyRotation(
        ikRightUpperLegBoneEntity,
        avatarRightUpperLeg,
        eulerAngles
      );
    }

    if (
      avatarRightLowerLeg &&
      ikRightLowerLegBone &&
      ikRightLowerLegBoneEntity
    ) {
      this.applyRotation(
        ikRightLowerLegBoneEntity,
        avatarRightLowerLeg,
        eulerAngles
      );
    }

    // if (avatarRightFoot && ikRightFootBone && ikRightFootBoneEntity) {
    //   this.applyRotation(
    //     ikRightFootBoneEntity,
    //     avatarRightFoot,
    //     new Fabrik.Vec3(0, 0, 0)
    //   );
    // }
  }

  private applyIKToAvatarLeftLeg(avatarEntity: pc.Entity): void {
    const avatarLeftUpperLeg = avatarEntity.findByName(AvatarPart.LeftUpperLeg);
    const avatarLeftLowerLeg = avatarEntity.findByName(AvatarPart.LeftLowerLeg);
    const avatarLeftFoot = avatarEntity.findByName(AvatarPart.LeftFoot);

    const chain = this.getSolver()?.getChainByName(HumanoidPart.LeftLeg);
    const chainName = chain?.getName() as string;

    const ikLeftUpperLegBone = chain?.getBone(2);
    const ikLeftLowerLegBone = chain?.getBone(3);
    const ikLeftFootBone = chain?.getBone(4);

    const ikLeftUpperLegBoneEntity = this.ik?.getBoneFromCache(chainName, 2);
    const ikLeftLowerLegBoneEntity = this.ik?.getBoneFromCache(chainName, 3);
    const ikLeftFootBoneEntity = this.ik?.getBoneFromCache(chainName, 4);

    const eulerAngles = new Fabrik.Vec3(90, 0, 90);
    if (avatarLeftUpperLeg && ikLeftUpperLegBone && ikLeftUpperLegBoneEntity) {
      this.applyRotation(
        ikLeftUpperLegBoneEntity,
        avatarLeftUpperLeg,
        eulerAngles
      );
    }

    if (avatarLeftLowerLeg && ikLeftLowerLegBone && ikLeftLowerLegBoneEntity) {
      this.applyRotation(
        ikLeftLowerLegBoneEntity,
        avatarLeftLowerLeg,
        eulerAngles
      );
    }

    // if (avatarLeftFoot && ikLeftFootBone && ikLeftFootBoneEntity) {
    //   this.applyRotation(
    //     ikLeftFootBoneEntity,
    //     avatarLeftFoot,
    //     new Fabrik.Vec3(0, 0, 0)
    //   );
    // }
  }

  private applyIKToAvatar(avatarEntity: pc.Entity): void {
    if (!this.getSolver()) return;

    // this.applyIKToAvatarSpine(avatarEntity);
    this.applyIKToAvatarHead(avatarEntity);
    this.applyIKToAvatarRightArm(avatarEntity);
    this.applyIKToAvatarLeftArm(avatarEntity);
    // this.applyIKToAvatarRightLeg(avatarEntity);
    // this.applyIKToAvatarLeftLeg(avatarEntity);
  }
}
