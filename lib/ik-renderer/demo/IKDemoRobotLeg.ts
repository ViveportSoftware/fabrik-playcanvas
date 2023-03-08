import {fromEvent} from 'rxjs';
import * as Fabrik from '../../fabrik';
import * as IK from '../ik';

const targetDistance = 3;

export class IKDemoRobotLeg extends IK.Base implements IK.IK {
  private solver: Fabrik.FabrikStructure3D;
  private boneScale: number = 0.1;
  private targetIndex: number = 0;
  private targetPosList: Array<Fabrik.Vec3> = [
    new Fabrik.Vec3(
      IK.Util.applyApproximatelyEqualsTolerance(0),
      IK.Util.applyApproximatelyEqualsTolerance(0),
      IK.Util.applyApproximatelyEqualsTolerance(targetDistance)
    ),
    new Fabrik.Vec3(
      IK.Util.applyApproximatelyEqualsTolerance(0),
      IK.Util.applyApproximatelyEqualsTolerance(targetDistance),
      IK.Util.applyApproximatelyEqualsTolerance(targetDistance)
    ),
    new Fabrik.Vec3(
      IK.Util.applyApproximatelyEqualsTolerance(0),
      IK.Util.applyApproximatelyEqualsTolerance(targetDistance),
      IK.Util.applyApproximatelyEqualsTolerance(0)
    ),
    new Fabrik.Vec3(
      IK.Util.applyApproximatelyEqualsTolerance(0),
      IK.Util.applyApproximatelyEqualsTolerance(targetDistance),
      IK.Util.applyApproximatelyEqualsTolerance(-targetDistance)
    ),
    new Fabrik.Vec3(
      IK.Util.applyApproximatelyEqualsTolerance(0),
      IK.Util.applyApproximatelyEqualsTolerance(0),
      IK.Util.applyApproximatelyEqualsTolerance(-targetDistance)
    ),
    new Fabrik.Vec3(
      IK.Util.applyApproximatelyEqualsTolerance(0),
      IK.Util.applyApproximatelyEqualsTolerance(-targetDistance),
      IK.Util.applyApproximatelyEqualsTolerance(-targetDistance)
    ),
    new Fabrik.Vec3(
      IK.Util.applyApproximatelyEqualsTolerance(0),
      IK.Util.applyApproximatelyEqualsTolerance(-targetDistance),
      IK.Util.applyApproximatelyEqualsTolerance(0)
    ),
    new Fabrik.Vec3(
      IK.Util.applyApproximatelyEqualsTolerance(0),
      IK.Util.applyApproximatelyEqualsTolerance(-targetDistance),
      IK.Util.applyApproximatelyEqualsTolerance(targetDistance)
    ),
  ];
  constructor() {
    super();
    this.solver = new Fabrik.FabrikStructure3D();
    fromEvent(document, 'keyup').subscribe(e => {
      const target = this.getTarget(IK.HumanoidPart.RightLeg);
      if (target) {
        const pos = target.getPosition();
        this.targetIndex++;
        const targetPos =
          this.targetPosList[this.targetIndex % this.targetPosList.length];
        target.setPosition(targetPos);
        this.setNeedToSolve(true);
      }
    });
  }

  public getSolver(): Fabrik.FabrikStructure3D {
    return this.solver;
  }

  public update(): void {
    this.solveIK();
    this.render();
  }

  public solveForTarget(target: Fabrik.Vec3): void {
    this.solver.solveForTarget(target);
  }

  public solveForTargets(targets: Map<string, Fabrik.Vec3>): void {
    this.solver.solveForTargets(targets);
  }

  public run(): void {
    this.solver = new Fabrik.FabrikStructure3D();

    this.addTarget(
      IK.HumanoidPart.RightLeg,
      new Fabrik.Vec3(
        IK.Util.applyApproximatelyEqualsTolerance(0),
        IK.Util.applyApproximatelyEqualsTolerance(0),
        IK.Util.applyApproximatelyEqualsTolerance(0)
      )
    );

    this.addChains();

    this.solveIK();
    this.render();
  }

  private addChains(): void {
    this.initRobotLeg();
  }

  private initRobotLeg(): void {
    const rootBone = IK.Util.createRootBone();

    const chain = new Fabrik.FabrikChain3D(IK.HumanoidPart.RightLeg);

    const boneColor = new Fabrik.Color(1, 1, 0);

    rootBone.setColor(boneColor);

    chain.addBone(rootBone);

    // chain.addConsecutiveRotorConstrainedBone(
    //   new Fabrik.Vec3(1, -0.2, 0),
    //   IK.HumanoidBoneLength.Hip * this.boneScale,
    //   0.1,
    //   boneColor
    // );

    // chain.addConsecutiveHingedBone(
    //   Fabrik.Y_NEG,
    //   IK.HumanoidBoneLength.UpperLeg * this.boneScale,
    //   Fabrik.JointType.GLOBAL_HINGE,
    //   Fabrik.X_AXE,
    //   90,
    //   135,
    //   Fabrik.Y_NEG,
    //   boneColor
    // );

    // chain.addConsecutiveRotorConstrainedBone(
    //   Fabrik.Y_NEG,
    //   IK.HumanoidBoneLength.UpperLeg * this.boneScale,
    //   90,
    //   boneColor
    // );

    chain.addConsecutiveHingedBone(
      Fabrik.Y_NEG,
      IK.HumanoidBoneLength.UpperLeg * this.boneScale,
      Fabrik.JointType.LOCAL_HINGE,
      Fabrik.Z_AXE,
      135,
      135,
      Fabrik.Y_NEG,
      boneColor
    );

    // chain.addConsecutiveHingedBone(
    //   Fabrik.Y_NEG,
    //   IK.HumanoidBoneLength.LowerLeg * this.boneScale,
    //   Fabrik.JointType.GLOBAL_HINGE,
    //   Fabrik.X_AXE,
    //   135,
    //   0,
    //   Fabrik.Y_NEG,
    //   boneColor
    // );

    chain.addConsecutiveHingedBone(
      Fabrik.Y_NEG,
      IK.HumanoidBoneLength.LowerLeg * this.boneScale,
      Fabrik.JointType.LOCAL_HINGE,
      Fabrik.X_AXE,
      0,
      90,
      Fabrik.Z_AXE,
      boneColor
    );

    chain.setRotorBaseboneConstraint(
      Fabrik.BaseboneConstraintType3D.LOCAL_ROTOR,
      Fabrik.X_AXE,
      0
    );

    this.solver.addChain(chain);
  }
}
