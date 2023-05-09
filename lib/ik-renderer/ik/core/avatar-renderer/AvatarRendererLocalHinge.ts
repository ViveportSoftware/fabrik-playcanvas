import * as pc from 'playcanvas';
import * as Fabrik from '../../../../fabrik';

import * as Renderer from '../../../renderer';
import {Base} from '../../implement/Base';
import {Util} from '../Util';
import {HumanoidLocalHinge} from '../humanoid/HumanoidLocalHinge';
import {HumanoidPart} from '../humanoid/HumanoidPart';
import {AvatarRenderer} from './AvatarRenderer';
import {AvatarRendererBase} from './AvatarRendererBase';

export class AvatarRendererLocalHinge
  extends AvatarRendererBase
  implements AvatarRenderer
{
  constructor(
    ik: Base | undefined,
    renderer: Renderer.AvatarRenderer | undefined
  ) {
    super(ik, renderer);
    this.ik = ik;

    this.ikHumanoid = new HumanoidLocalHinge();
  }

  public update(): void {
    if (this.renderer) {
      this.renderer.update();
    }

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
    dest.setRotation(q1.mul(q2));
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
    const avatarHips = avatarEntity.findByName(Renderer.AvatarPartMap.Head);
    const avatarChest = avatarEntity.findByName(Renderer.AvatarPartMap.Chest);
    const avatarUpperChest = avatarEntity.findByName(
      Renderer.AvatarPartMap.UpperChest
    );

    const chain = this.getSolver()?.getChainByName(
      Renderer.AvatarPartMap.Spine
    );
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
    const avatarNeck = avatarEntity.findByName(Renderer.AvatarPartMap.Neck);

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
      Renderer.AvatarPartMap.RightUpperArm
    );
    const avatarRightLowerArm = avatarEntity.findByName(
      Renderer.AvatarPartMap.RightLowerArm
    );
    const avatarRightHand = avatarEntity.findByName(
      Renderer.AvatarPartMap.RightHand
    );

    const chain = this.getSolver()?.getChainByName(HumanoidPart.RightArm);
    const chainName = chain?.getName() as string;

    const ikRightSoulderBone = chain?.getBone(1);
    const ikRightUpperArmBone01 = chain?.getBone(2);
    const ikRightUpperArmBone02 = chain?.getBone(3);
    const ikRightUpperArmBone03 = chain?.getBone(4);
    const ikRightLowerArmBone01 = chain?.getBone(4);
    const ikRightLowerArmBone02 = chain?.getBone(6);
    const ikRightLowerArmBone03 = chain?.getBone(7);
    const ikRightHandBone = chain?.getBone(8);

    const ikRightSoulderBoneEntity = this.ik?.getBoneFromCache(chainName, 1);
    const ikRightUpperArmBoneEntity01 = this.ik?.getBoneFromCache(chainName, 2);
    const ikRightUpperArmBoneEntity02 = this.ik?.getBoneFromCache(chainName, 3);
    const ikRightUpperArmBoneEntity03 = this.ik?.getBoneFromCache(chainName, 4);
    const ikRightLowerArmBoneEntity01 = this.ik?.getBoneFromCache(chainName, 4);
    const ikRightLowerArmBoneEntity02 = this.ik?.getBoneFromCache(chainName, 6);
    const ikRightLowerArmBoneEntity03 = this.ik?.getBoneFromCache(chainName, 7);
    const ikRightHandBoneEntity = this.ik?.getBoneFromCache(chainName, 8);

    const eulerAnglesRightArm = new Fabrik.Vec3(
      Util.applyApproximatelyEqualsTolerance(0),
      Util.applyApproximatelyEqualsTolerance(-90),
      Util.applyApproximatelyEqualsTolerance(0)
    );

    if (!this.printOnceFlag) {
      this.printOnceFlag = true;
      // console.log('ikRightUpperArmBone01:', ikRightUpperArmBone01);
      // console.log('ikRightUpperArmBone02:', ikRightUpperArmBone02);
      // console.log('ikRightUpperArmBone03:', ikRightUpperArmBone03);

      // console.log('ikRightUpperArmBoneEntity01:', ikRightUpperArmBoneEntity01);
      // console.log('ikRightUpperArmBoneEntity02:', ikRightUpperArmBoneEntity02);
      // console.log('ikRightUpperArmBoneEntity03:', ikRightUpperArmBoneEntity03);

      // console.log(
      //   'ikRightUpperArmBoneEntity01:',
      //   ikRightUpperArmBoneEntity01?.getEulerAngles()
      // );
      // console.log(
      //   'ikRightUpperArmBoneEntity02:',
      //   ikRightUpperArmBoneEntity02?.getEulerAngles()
      // );
      // console.log(
      //   'ikRightUpperArmBoneEntity03:',
      //   ikRightUpperArmBoneEntity03?.getEulerAngles()
      // );
      console.log('ikRightLowerArmBone01:', ikRightLowerArmBone01);
      console.log('ikRightLowerArmBoneEntity01:', ikRightLowerArmBoneEntity01);
    }

    if (
      avatarRightUpperArm &&
      ikRightUpperArmBone01 &&
      ikRightUpperArmBone02 &&
      // ikRightUpperArmBone03
      ikRightUpperArmBoneEntity01 &&
      ikRightUpperArmBoneEntity02
      // ikRightUpperArmBoneEntity03
    ) {
      this.applyRotationByJoints(
        // [ikRightUpperArmBone01, ikRightUpperArmBone02, ikRightUpperArmBone03],
        [ikRightUpperArmBone01, ikRightUpperArmBone02],
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
        new Fabrik.Vec3(
          Util.applyApproximatelyEqualsTolerance(0),
          Util.applyApproximatelyEqualsTolerance(90),
          Util.applyApproximatelyEqualsTolerance(0)
        )
      );
    }

    if (avatarRightHand && ikRightHandBone && ikRightHandBoneEntity) {
      this.applyRotation(
        ikRightHandBoneEntity,
        avatarRightHand,
        eulerAnglesRightArm
      );
    }
  }

  private applyIKToAvatarLeftArm(avatarEntity: pc.Entity): void {
    const avatarLeftUpperArm = avatarEntity.findByName(
      Renderer.AvatarPartMap.LeftUpperArm
    );
    const avatarLeftLowerArm = avatarEntity.findByName(
      Renderer.AvatarPartMap.LeftLowerArm
    );
    const avatarLeftHand = avatarEntity.findByName(
      Renderer.AvatarPartMap.LeftHand
    );

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
      this.applyRotation(
        ikLeftHandBoneEntity,
        avatarLeftHand,
        eulerAnglesLeftArm
      );
    }
  }

  private applyIKToAvatarRightLeg(avatarEntity: pc.Entity): void {
    const avatarRightUpperLeg = avatarEntity.findByName(
      Renderer.AvatarPartMap.RightUpperLeg
    );
    const avatarRightLowerLeg = avatarEntity.findByName(
      Renderer.AvatarPartMap.RightLowerLeg
    );
    const avatarRightFoot = avatarEntity.findByName(
      Renderer.AvatarPartMap.RightFoot
    );

    const chain = this.getSolver()?.getChainByName(HumanoidPart.RightLeg);
    const chainName = chain?.getName() as string;

    const ikRightUpperLegBone = chain?.getBone(2);
    const ikRightLowerLegBone = chain?.getBone(3);
    const ikRightFootBone = chain?.getBone(4);

    const ikRightUpperLegBoneEntity = this.ik?.getBoneFromCache(chainName, 2);
    const ikRightLowerLegBoneEntity = this.ik?.getBoneFromCache(chainName, 3);
    const ikRightFootBoneEntity = this.ik?.getBoneFromCache(chainName, 4);

    const eulerAngles = new Fabrik.Vec3(90, 0, 0);
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

    if (avatarRightFoot && ikRightFootBone && ikRightFootBoneEntity) {
      this.applyRotation(ikRightFootBoneEntity, avatarRightFoot, eulerAngles);
    }
  }

  private applyIKToAvatarLeftLeg(avatarEntity: pc.Entity): void {
    const avatarLeftUpperLeg = avatarEntity.findByName(
      Renderer.AvatarPartMap.LeftUpperLeg
    );
    const avatarLeftLowerLeg = avatarEntity.findByName(
      Renderer.AvatarPartMap.LeftLowerLeg
    );
    const avatarLeftFoot = avatarEntity.findByName(
      Renderer.AvatarPartMap.LeftFoot
    );

    const chain = this.getSolver()?.getChainByName(HumanoidPart.LeftLeg);
    const chainName = chain?.getName() as string;

    const ikLeftUpperLegBone = chain?.getBone(2);
    const ikLeftLowerLegBone = chain?.getBone(3);
    const ikLeftFootBone = chain?.getBone(4);

    const ikLeftUpperLegBoneEntity = this.ik?.getBoneFromCache(chainName, 2);
    const ikLeftLowerLegBoneEntity = this.ik?.getBoneFromCache(chainName, 3);
    const ikLeftFootBoneEntity = this.ik?.getBoneFromCache(chainName, 4);

    const eulerAngles = new Fabrik.Vec3(90, 0, 0);
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

    if (avatarLeftFoot && ikLeftFootBone && ikLeftFootBoneEntity) {
      this.applyRotation(ikLeftFootBoneEntity, avatarLeftFoot, eulerAngles);
    }
  }

  private applyIKToAvatar(avatarEntity: pc.Entity): void {
    this.applyIKToAvatarSpine(avatarEntity);
    this.applyIKToAvatarHead(avatarEntity);
    this.applyIKToAvatarRightArm(avatarEntity);
    this.applyIKToAvatarLeftArm(avatarEntity);
    this.applyIKToAvatarRightLeg(avatarEntity);
    this.applyIKToAvatarLeftLeg(avatarEntity);
  }
}
