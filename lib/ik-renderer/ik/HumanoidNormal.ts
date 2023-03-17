import * as Fabrik from '../../fabrik';
import {Humanoid} from './Humanoid';
import {HumanoidBase} from './HumanoidBase';
import {HumanoidBoneLength} from './HumanoidBoneLength';
import {HumanoidPart} from './HumanoidPart';
import {Util} from './Util';

export class HumanoidNormal extends HumanoidBase implements Humanoid {
  constructor() {
    super();

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
    const rootBone = Util.createRootBone(new Fabrik.Vec3(0, 0, 0));

    const chain = new Fabrik.FabrikChain3D(HumanoidPart.Spine);

    chain.addBone(rootBone);

    chain.addConsecutiveRotorConstrainedBone(
      Fabrik.Y_AXE,
      HumanoidBoneLength.Spine01 * this.boneScale,
      10
    );
    chain.addConsecutiveRotorConstrainedBone(
      Fabrik.Y_AXE,
      HumanoidBoneLength.Spine02 * this.boneScale,
      10
    );
    chain.addConsecutiveRotorConstrainedBone(
      Fabrik.Y_AXE,
      HumanoidBoneLength.Spine03 * this.boneScale,
      10
    );
    chain.addConsecutiveRotorConstrainedBone(
      Fabrik.Y_AXE,
      HumanoidBoneLength.Spine04 * this.boneScale,
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

    chain.addConsecutiveRotorConstrainedBone(
      new Fabrik.Vec3(0, 1, -0.1),
      HumanoidBoneLength.Neck * this.boneScale,
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

    chain.addConsecutiveRotorConstrainedBone(
      Fabrik.X_AXE,
      HumanoidBoneLength.Shoulder * this.boneScale,
      10,
      boneColor
    );

    chain.addConsecutiveRotorConstrainedBone(
      Fabrik.X_AXE,
      HumanoidBoneLength.UpperArm * this.boneScale,
      180,
      boneColor
    );

    chain.addConsecutiveHingedBone(
      Fabrik.X_AXE,
      HumanoidBoneLength.LowerArm * this.boneScale,
      Fabrik.JointType.LOCAL_HINGE,
      Fabrik.Y_AXE,
      0,
      160,
      Fabrik.Z_AXE,
      boneColor
    );

    chain.addConsecutiveRotorConstrainedBone(
      Fabrik.X_AXE,
      HumanoidBoneLength.Hand * this.boneScale,
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

    chain.addConsecutiveRotorConstrainedBone(
      Fabrik.X_NEG,
      HumanoidBoneLength.Shoulder * this.boneScale,
      0.1,
      boneColor
    );

    chain.addConsecutiveRotorConstrainedBone(
      Fabrik.X_NEG,
      HumanoidBoneLength.UpperArm * this.boneScale,
      180,
      boneColor
    );

    chain.addConsecutiveHingedBone(
      Fabrik.X_NEG,
      HumanoidBoneLength.LowerArm * this.boneScale,
      Fabrik.JointType.LOCAL_HINGE,
      Fabrik.Y_AXE,
      160,
      0,
      Fabrik.Z_AXE,
      boneColor
    );

    chain.addConsecutiveRotorConstrainedBone(
      Fabrik.X_NEG,
      HumanoidBoneLength.Hand * this.boneScale,
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

    chain.addConsecutiveRotorConstrainedBone(
      new Fabrik.Vec3(1, -0.2, 0),
      HumanoidBoneLength.Hip * this.boneScale,
      0.1,
      boneColor
    );

    chain.addConsecutiveHingedBone(
      Fabrik.Y_NEG,
      HumanoidBoneLength.UpperLeg * this.boneScale,
      Fabrik.JointType.GLOBAL_HINGE,
      Fabrik.X_AXE,
      90,
      170,
      Fabrik.Y_NEG,
      boneColor
    );

    chain.addConsecutiveHingedBone(
      Fabrik.Y_NEG,
      HumanoidBoneLength.LowerLeg * this.boneScale,
      Fabrik.JointType.LOCAL_HINGE,
      Fabrik.X_AXE,
      0,
      0,
      Fabrik.Z_AXE,
      boneColor
    );

    // chain.addConsecutiveRotorConstrainedBone(
    //   Fabrik.Z_NEG,
    //   HumanoidBoneLength.Foot * this.boneScale,
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

    chain.addConsecutiveRotorConstrainedBone(
      new Fabrik.Vec3(-1, -0.2, 0),
      HumanoidBoneLength.Hip * this.boneScale,
      0.1,
      boneColor
    );

    chain.addConsecutiveHingedBone(
      Fabrik.Y_NEG,
      HumanoidBoneLength.UpperLeg * this.boneScale,
      Fabrik.JointType.GLOBAL_HINGE,
      Fabrik.X_AXE,
      90,
      170,
      Fabrik.Y_NEG,
      boneColor
    );

    chain.addConsecutiveHingedBone(
      Fabrik.Y_NEG,
      HumanoidBoneLength.LowerLeg * this.boneScale,
      Fabrik.JointType.LOCAL_HINGE,
      Fabrik.X_AXE,
      0,
      0,
      Fabrik.Z_AXE,
      boneColor
    );

    // chain.addConsecutiveRotorConstrainedBone(
    //   Fabrik.Z_NEG,
    //   HumanoidBoneLength.Foot * this.boneScale,
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
