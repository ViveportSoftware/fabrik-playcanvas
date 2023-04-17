import * as IK from '..';
import * as Fabrik from '../../../fabrik';

export class Humanoid01 extends IK.Base implements IK.IK {
  private solver: Fabrik.FabrikStructure3D;

  private chains: Map<IK.HumanoidPart, Fabrik.FabrikChain3D> = new Map();

  private boneScale = 0.05;

  constructor() {
    super();

    this.solver = new Fabrik.FabrikStructure3D();

    this.init();
  }

  public getSolver(): Fabrik.FabrikStructure3D {
    return this.solver;
  }

  public solveForTargets(targets: Map<string, Fabrik.Vec3>): void {
    this.solver.solveForTargets(targets);
  }

  private init(): void {
    this.initSpine();
    this.initRightArm();
    this.initLeftArm();
  }

  private initSpine(): void {
    const rootbone = IK.Util.createRootBone();

    const chain = new Fabrik.FabrikChain3D(IK.HumanoidPart.Spine);

    console.log('rootbone:', rootbone);

    chain.addBone(rootbone);

    chain.addConsecutiveRotorConstrainedBone(
      Fabrik.Y_AXE,
      3 * this.boneScale,
      10
    );
    chain.addConsecutiveRotorConstrainedBone(
      Fabrik.Y_AXE,
      3 * this.boneScale,
      10
    );
    chain.addConsecutiveRotorConstrainedBone(
      Fabrik.Y_AXE,
      3 * this.boneScale,
      10
    );
    chain.addConsecutiveRotorConstrainedBone(
      Fabrik.Y_AXE,
      8 * this.boneScale,
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

    this.chains.set(IK.HumanoidPart.Spine, chain);

    this.solver.addChain(chain);

    console.log(chain);
  }

  private initRightArm(): void {
    const rootBone = IK.Util.createRootBone();

    const chain = new Fabrik.FabrikChain3D(IK.HumanoidPart.RightArm);

    const boneColor = new Fabrik.Color(1, 1, 0);

    rootBone.setColor(boneColor);

    chain.addBone(rootBone);

    chain.addConsecutiveRotorConstrainedBone(
      new Fabrik.Vec3(1, 0, 0),
      5 * this.boneScale,
      0.1,
      boneColor
    );

    chain.addConsecutiveRotorConstrainedBone(
      new Fabrik.Vec3(1, 0, 0),
      8 * this.boneScale,
      90,
      boneColor
    );

    chain.addConsecutiveRotorConstrainedBone(
      new Fabrik.Vec3(1, 0, 0),
      7 * this.boneScale,
      90,
      boneColor
    );

    chain.setRotorBaseboneConstraint(
      Fabrik.BaseboneConstraintType3D.LOCAL_ROTOR,
      new Fabrik.Vec3(1, 0, 0),
      0
    );

    this.chains.set(IK.HumanoidPart.RightArm, chain);

    this.solver.connectChainByName(
      chain,
      IK.HumanoidPart.Spine,
      4,
      Fabrik.BoneConnectionPoint.END
    );

    console.log(chain);
  }

  private initLeftArm(): void {
    const rootBone = IK.Util.createRootBone();

    const chain = new Fabrik.FabrikChain3D(IK.HumanoidPart.LeftArm);

    const boneColor = new Fabrik.Color(0, 1, 1);

    rootBone.setColor(boneColor);

    chain.addBone(rootBone);

    chain.addConsecutiveRotorConstrainedBone(
      new Fabrik.Vec3(-1, 0, 0),
      5 * this.boneScale,
      0.1,
      boneColor
    );

    chain.addConsecutiveRotorConstrainedBone(
      new Fabrik.Vec3(-1, 0, 0),
      8 * this.boneScale,
      90,
      boneColor
    );

    chain.addConsecutiveRotorConstrainedBone(
      new Fabrik.Vec3(-1, 0, 0),
      7 * this.boneScale,
      90,
      boneColor
    );

    chain.setRotorBaseboneConstraint(
      Fabrik.BaseboneConstraintType3D.LOCAL_ROTOR,
      new Fabrik.Vec3(-1, 0, 0),
      0
    );

    this.chains.set(IK.HumanoidPart.LeftArm, chain);

    this.solver.connectChainByName(
      chain,
      IK.HumanoidPart.Spine,
      4,
      Fabrik.BoneConnectionPoint.END
    );

    console.log(chain);
  }

  public run(): void {
    this.addTarget(IK.HumanoidPart.Spine, new Fabrik.Vec3(0.01, 1, -2.0));
    this.addTarget(IK.HumanoidPart.RightArm, new Fabrik.Vec3(1.5, 1, -0.5));
    this.addTarget(IK.HumanoidPart.LeftArm, new Fabrik.Vec3(-1.5, 1, -0.5));

    this.randomMoveTarget(
      IK.HumanoidPart.Spine,
      new Fabrik.Vec3(-0.5, -1.5, -1.5),
      new Fabrik.Vec3(0.5, 3.5, 0.5)
    );

    this.randomMoveTarget(
      IK.HumanoidPart.RightArm,
      new Fabrik.Vec3(1.5, 2.5, 0.5),
      new Fabrik.Vec3(0.5, -0.5, -1.5)
    );

    this.randomMoveTarget(
      IK.HumanoidPart.LeftArm,
      new Fabrik.Vec3(-1.5, 2.5, 0.5),
      new Fabrik.Vec3(-0.5, -0.5, -1.5)
    );

    this.solveIK();
    this.render();
  }

  public update(): void {}
}
