import * as Fabrik from '../../fabrik';
import {AvatarPart} from '../renderer';
import {Humanoid} from './Humanoid';
import {HumanoidBase} from './HumanoidBase';
import {HumanoidBoneLength} from './HumanoidBoneLength';
import {HumanoidPart} from './HumanoidPart';
import {Util} from './Util';

export class HumanoidNormal extends HumanoidBase implements Humanoid {
  private boneLengthMap: Map<AvatarPart, number> = new Map();
  private hipsPos: Fabrik.Vec3 = new Fabrik.Vec3();

  constructor(
    hipsPos: Fabrik.Vec3,
    boneLengthMap: Map<AvatarPart, number> | undefined
  ) {
    super();

    if (hipsPos) {
      this.hipsPos = hipsPos;
    }

    if (boneLengthMap) {
      this.boneLengthMap = boneLengthMap;
    }

    this.init();
  }

  private init(): void {
    this.initSpine();
    this.initHead();

    this.initRightArm();
    this.initLeftArm();

    this.initRightLeg();
    this.initLeftLeg();
  }

  private initSpine(): void {
    const rootBone = Util.createRootBone(new Fabrik.Vec3(0, this.hipsPos.y, 0));

    const chain = new Fabrik.FabrikChain3D(HumanoidPart.Spine);

    chain.addBone(rootBone);

    const hipsBoneLength = this.boneLengthMap?.get(AvatarPart.Hips);
    const spineBoneLength = this.boneLengthMap?.get(AvatarPart.Spine);
    const chestBoneLength = this.boneLengthMap?.get(AvatarPart.Chest);
    const upperChestBoneLength = this.boneLengthMap?.get(AvatarPart.UpperChest);

    if (
      !hipsBoneLength ||
      !spineBoneLength ||
      !chestBoneLength ||
      !upperChestBoneLength
    ) {
      throw new Error('bone length is undefined');
    }

    chain.addConsecutiveRotorConstrainedBone(Fabrik.Y_AXE, hipsBoneLength, 10);
    chain.addConsecutiveRotorConstrainedBone(Fabrik.Y_AXE, spineBoneLength, 10);
    chain.addConsecutiveRotorConstrainedBone(Fabrik.Y_AXE, chestBoneLength, 10);
    chain.addConsecutiveRotorConstrainedBone(
      Fabrik.Y_AXE,
      upperChestBoneLength,
      30
    );

    chain.setColor(new Fabrik.Color(0.2, 0.2, 0.2));

    chain.setHingeBaseboneConstraint(
      Fabrik.BaseboneConstraintType3D.GLOBAL_HINGE,
      Fabrik.X_AXE,
      90,
      0,
      Fabrik.Y_AXE
    );

    this.chains.set(HumanoidPart.Spine, chain);

    this.solver.addChain(chain);
  }

  private initHead(): void {
    const rootBone = Util.createRootBone();

    const chain = new Fabrik.FabrikChain3D(HumanoidPart.Head);

    const boneColor = new Fabrik.Color(1, 0, 1);

    chain.addBone(rootBone);

    const neckBoneLength = this.boneLengthMap.get(AvatarPart.Neck);

    if (!neckBoneLength) {
      throw new Error('bone length is undefined');
    }

    chain.addConsecutiveRotorConstrainedBone(
      new Fabrik.Vec3(0, 1, -0.1),
      neckBoneLength,
      0.1,
      boneColor
    );

    chain.setRotorBaseboneConstraint(
      Fabrik.BaseboneConstraintType3D.LOCAL_ROTOR,
      Fabrik.Z_AXE,
      20
    );

    this.chains.set(HumanoidPart.Head, chain);

    this.solver.connectChainByName(
      chain,
      HumanoidPart.Spine,
      4,
      Fabrik.BoneConnectionPoint.END
    );
  }

  private initRightArm(): void {
    const rootBone = Util.createRootBone();

    const chain = new Fabrik.FabrikChain3D(HumanoidPart.RightArm);

    const boneColor = new Fabrik.Color(1, 1, 0);

    rootBone.setColor(boneColor);

    chain.setMinIterationChange(HumanoidBoneLength.Min * 0.1);

    chain.addBone(rootBone);

    const rightShoulderBoneLength = this.boneLengthMap.get(
      AvatarPart.RightShoulder
    );
    const rightUpperArmBoneLength = this.boneLengthMap.get(
      AvatarPart.RightUpperArm
    );
    const rightLowerArmBoneLength = this.boneLengthMap.get(
      AvatarPart.RightLowerArm
    );
    const rightHandBoneLength = this.boneLengthMap.get(AvatarPart.RightHand);

    if (
      !rightShoulderBoneLength ||
      !rightUpperArmBoneLength ||
      !rightLowerArmBoneLength ||
      !rightHandBoneLength
    ) {
      throw new Error('bone length is undefined');
    }

    chain.addConsecutiveRotorConstrainedBone(
      Fabrik.X_AXE,
      rightShoulderBoneLength,
      10,
      boneColor
    );

    chain.addConsecutiveRotorConstrainedBone(
      Fabrik.X_AXE,
      rightUpperArmBoneLength,
      180,
      boneColor
    );

    chain.addConsecutiveHingedBone(
      Fabrik.X_AXE,
      rightLowerArmBoneLength,
      Fabrik.JointType.LOCAL_HINGE,
      Fabrik.Y_AXE,
      0,
      160,
      Fabrik.Z_AXE,
      boneColor
    );

    chain.addConsecutiveRotorConstrainedBone(
      Fabrik.X_AXE,
      rightHandBoneLength,
      45,
      boneColor
    );

    chain.setRotorBaseboneConstraint(
      Fabrik.BaseboneConstraintType3D.LOCAL_ROTOR,
      Fabrik.X_AXE,
      10
    );

    this.chains.set(HumanoidPart.RightArm, chain);

    this.solver.connectChainByName(
      chain,
      HumanoidPart.Spine,
      4,
      Fabrik.BoneConnectionPoint.END
    );
  }

  private initLeftArm(): void {
    const rootBone = Util.createRootBone();

    const chain = new Fabrik.FabrikChain3D(HumanoidPart.LeftArm);

    const boneColor = new Fabrik.Color(0, 1, 1);

    rootBone.setColor(boneColor);

    chain.addBone(rootBone);

    const leftShoulderBoneLength = this.boneLengthMap.get(
      AvatarPart.LeftShoulder
    );
    const leftUpperArmBoneLength = this.boneLengthMap.get(
      AvatarPart.LeftUpperArm
    );
    const leftLowerArmBoneLength = this.boneLengthMap.get(
      AvatarPart.LeftUpperArm
    );
    const leftHandBoneLength = this.boneLengthMap.get(AvatarPart.LeftHand);

    if (
      !leftShoulderBoneLength ||
      !leftUpperArmBoneLength ||
      !leftLowerArmBoneLength ||
      !leftHandBoneLength
    ) {
      throw new Error('bone length is undefined');
    }

    chain.addConsecutiveRotorConstrainedBone(
      Fabrik.X_NEG,
      leftShoulderBoneLength,
      0.1,
      boneColor
    );

    chain.addConsecutiveRotorConstrainedBone(
      Fabrik.X_NEG,
      leftUpperArmBoneLength,
      180,
      boneColor
    );

    chain.addConsecutiveHingedBone(
      Fabrik.X_NEG,
      leftLowerArmBoneLength,
      Fabrik.JointType.LOCAL_HINGE,
      Fabrik.Y_AXE,
      160,
      0,
      Fabrik.Z_AXE,
      boneColor
    );

    chain.addConsecutiveRotorConstrainedBone(
      Fabrik.X_NEG,
      leftHandBoneLength,
      45,
      boneColor
    );

    chain.setRotorBaseboneConstraint(
      Fabrik.BaseboneConstraintType3D.LOCAL_ROTOR,
      Fabrik.X_NEG,
      0
    );

    this.chains.set(HumanoidPart.LeftArm, chain);

    this.solver.connectChainByName(
      chain,
      HumanoidPart.Spine,
      4,
      Fabrik.BoneConnectionPoint.END
    );
  }

  private initRightLeg(): void {
    const rootBone = Util.createRootBone();

    const chain = new Fabrik.FabrikChain3D(HumanoidPart.RightLeg);

    const boneColor = new Fabrik.Color(1, 1, 0);

    rootBone.setColor(boneColor);

    chain.addBone(rootBone);

    const rightHipBoneLength = this.boneLengthMap.get(AvatarPart.RightHip);
    const rightUpperLegBoneLength = this.boneLengthMap.get(
      AvatarPart.RightUpperLeg
    );
    const rightLowerLegBoneLength = this.boneLengthMap.get(
      AvatarPart.RightLowerLeg
    );
    const rightFootBoneLength = this.boneLengthMap.get(AvatarPart.RightFoot);

    if (
      !rightHipBoneLength ||
      !rightUpperLegBoneLength ||
      !rightLowerLegBoneLength ||
      !rightFootBoneLength
    ) {
      throw new Error('bone length is undefined');
    }

    chain.addConsecutiveRotorConstrainedBone(
      new Fabrik.Vec3(1, -0.2, 0),
      rightHipBoneLength,
      0.1,
      boneColor
    );

    chain.addConsecutiveHingedBone(
      Fabrik.Y_NEG,
      rightUpperLegBoneLength,
      Fabrik.JointType.GLOBAL_HINGE,
      Fabrik.X_AXE,
      90,
      170,
      Fabrik.Y_NEG,
      boneColor
    );

    chain.addConsecutiveHingedBone(
      Fabrik.Y_NEG,
      rightLowerLegBoneLength,
      Fabrik.JointType.LOCAL_HINGE,
      Fabrik.X_AXE,
      0,
      0,
      Fabrik.Z_AXE,
      boneColor
    );

    // chain.addConsecutiveRotorConstrainedBone(
    //   Fabrik.Z_NEG,
    //   rightFootBoneLength,
    //   10,
    //   boneColor
    // );

    chain.setRotorBaseboneConstraint(
      Fabrik.BaseboneConstraintType3D.LOCAL_ROTOR,
      Fabrik.X_AXE,
      0
    );

    this.chains.set(HumanoidPart.RightLeg, chain);

    this.solver.connectChainByName(
      chain,
      HumanoidPart.Spine,
      0,
      Fabrik.BoneConnectionPoint.START
    );
  }

  private initLeftLeg(): void {
    const rootBone = Util.createRootBone();

    const chain = new Fabrik.FabrikChain3D(HumanoidPart.LeftLeg);

    const boneColor = new Fabrik.Color(0, 1, 1);

    rootBone.setColor(boneColor);

    chain.addBone(rootBone);

    const leftHipBoneLength = this.boneLengthMap.get(AvatarPart.LeftHip);
    const leftUpperLegBoneLength = this.boneLengthMap.get(
      AvatarPart.LeftUpperLeg
    );
    const leftLowerLegBoneLength = this.boneLengthMap.get(
      AvatarPart.LeftLowerLeg
    );
    const leftFootBoneLength = this.boneLengthMap.get(AvatarPart.LeftFoot);

    if (
      !leftHipBoneLength ||
      !leftUpperLegBoneLength ||
      !leftLowerLegBoneLength ||
      !leftFootBoneLength
    ) {
      throw new Error('bone length is undefined');
    }

    chain.addConsecutiveRotorConstrainedBone(
      new Fabrik.Vec3(-1, -0.2, 0),
      leftHipBoneLength,
      0.1,
      boneColor
    );

    chain.addConsecutiveHingedBone(
      Fabrik.Y_NEG,
      leftUpperLegBoneLength,
      Fabrik.JointType.GLOBAL_HINGE,
      Fabrik.X_AXE,
      90,
      170,
      Fabrik.Y_NEG,
      boneColor
    );

    chain.addConsecutiveHingedBone(
      Fabrik.Y_NEG,
      leftLowerLegBoneLength,
      Fabrik.JointType.LOCAL_HINGE,
      Fabrik.X_AXE,
      0,
      0,
      Fabrik.Z_AXE,
      boneColor
    );

    // chain.addConsecutiveRotorConstrainedBone(
    //   Fabrik.Z_NEG,
    //   leftFootBoneLength,
    //   10,
    //   boneColor
    // );

    chain.setRotorBaseboneConstraint(
      Fabrik.BaseboneConstraintType3D.LOCAL_ROTOR,
      Fabrik.X_NEG,
      0
    );

    this.chains.set(HumanoidPart.LeftLeg, chain);

    this.solver.connectChainByName(
      chain,
      HumanoidPart.Spine,
      0,
      Fabrik.BoneConnectionPoint.START
    );
  }
}
