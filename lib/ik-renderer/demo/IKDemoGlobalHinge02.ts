import {fromEvent} from 'rxjs';
import * as Fabrik from '../../fabrik';
import * as IK from '../ik';

const NameChainHingeRotateY = 'chainHingeRotateY';
const NameChainHingeRotateX = 'chainHingeRotateX';
const NameChainHingeRotateZ = 'chainHingeRotateZ';

export class IKDemoGlobalHinge02 extends IK.Base implements IK.IK {
  private solver: Fabrik.FabrikStructure3D;
  private angle: number = 0;

  constructor() {
    super();
    this.solver = new Fabrik.FabrikStructure3D();
    fromEvent(document, 'click').subscribe(() => {
      this.angle = this.angle === 0 ? 90 : 0;
      this.updateChainsConstraint(this.angle);
      this.setNeedToSolve(true);
      this.solveIK();
      this.render();
      this.printRotation();
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
      NameChainHingeRotateY,
      new Fabrik.Vec3(
        IK.Util.applyApproximatelyEqualsTolerance(0),
        IK.Util.applyApproximatelyEqualsTolerance(1),
        IK.Util.applyApproximatelyEqualsTolerance(-1)
      )
    );
    this.addTarget(
      NameChainHingeRotateX,
      new Fabrik.Vec3(
        IK.Util.applyApproximatelyEqualsTolerance(1),
        IK.Util.applyApproximatelyEqualsTolerance(1),
        IK.Util.applyApproximatelyEqualsTolerance(-1)
      )
    );
    this.addTarget(
      NameChainHingeRotateZ,
      new Fabrik.Vec3(
        IK.Util.applyApproximatelyEqualsTolerance(-1),
        IK.Util.applyApproximatelyEqualsTolerance(1),
        IK.Util.applyApproximatelyEqualsTolerance(-1)
      )
    );

    // this.randomMoveTarget(NameChainHingeRotateY);
    // this.randomMoveTarget(NameChainHingeRotateX);
    // this.randomMoveTarget(NameChainHingeRotateZ);

    console.log('======== all constraint angles zero ========');

    this.addChains();

    this.solveIK();
    this.render();

    this.printRotation();

    console.log('======== update all constraint angles to 90 degree ========');

    this.updateChainsConstraint(0);

    this.setNeedToSolve(true);
    this.solveIK();
    this.render();

    this.printRotation();
  }

  private addChains(): void {
    this.addChainHingeRotateY();
    this.addChainHingeRotateX();
    this.addChainHingeRotateZ();
  }

  private addChainHingeRotateY(): void {
    const chain = new Fabrik.FabrikChain3D(NameChainHingeRotateY);

    const basebone = IK.Util.createRootBone(
      new Fabrik.Vec3(0, 0, 0),
      Fabrik.Y_AXE,
      1
    );

    chain.addBone(basebone);

    chain.addConsecutiveHingedBone(
      Fabrik.Y_AXE,
      0.5,
      Fabrik.JointType.GLOBAL_HINGE,
      Fabrik.Y_AXE,
      IK.Util.applyApproximatelyEqualsTolerance(0),
      IK.Util.applyApproximatelyEqualsTolerance(0),
      Fabrik.X_AXE
    );

    chain.setRotorBaseboneConstraint(
      Fabrik.BaseboneConstraintType3D.GLOBAL_ROTOR,
      Fabrik.Y_AXE,
      IK.Util.applyApproximatelyEqualsTolerance(0)
    );

    this.solver.addChain(chain);
  }

  private addChainHingeRotateX(): void {
    const chain = new Fabrik.FabrikChain3D(NameChainHingeRotateX);

    const basebone = IK.Util.createRootBone(
      new Fabrik.Vec3(1, 0, 0),
      Fabrik.Y_AXE,
      1
    );

    chain.addBone(basebone);

    chain.addConsecutiveHingedBone(
      Fabrik.Y_AXE,
      0.5,
      Fabrik.JointType.GLOBAL_HINGE,
      Fabrik.X_AXE,
      IK.Util.applyApproximatelyEqualsTolerance(0),
      IK.Util.applyApproximatelyEqualsTolerance(0),
      Fabrik.Z_NEG
    );

    chain.setRotorBaseboneConstraint(
      Fabrik.BaseboneConstraintType3D.GLOBAL_ROTOR,
      Fabrik.Y_AXE,
      IK.Util.applyApproximatelyEqualsTolerance(0)
    );

    this.solver.addChain(chain);
  }

  private addChainHingeRotateZ(): void {
    const chain = new Fabrik.FabrikChain3D(NameChainHingeRotateZ);

    const basebone = IK.Util.createRootBone(
      new Fabrik.Vec3(-1, 0, 0),
      Fabrik.Y_AXE,
      1
    );

    chain.addBone(basebone);

    chain.addConsecutiveHingedBone(
      Fabrik.Y_AXE,
      0.5,
      Fabrik.JointType.GLOBAL_HINGE,
      Fabrik.Z_AXE,
      IK.Util.applyApproximatelyEqualsTolerance(0),
      IK.Util.applyApproximatelyEqualsTolerance(0),
      Fabrik.X_AXE
    );

    chain.setRotorBaseboneConstraint(
      Fabrik.BaseboneConstraintType3D.GLOBAL_ROTOR,
      Fabrik.Y_AXE,
      IK.Util.applyApproximatelyEqualsTolerance(0)
    );

    this.solver.addChain(chain);
  }

  private printRotation(): void {
    const boneHingeRotateY = this.getBoneFromCache(NameChainHingeRotateY, 1);
    const boneHingeRotateX = this.getBoneFromCache(NameChainHingeRotateX, 1);
    const boneHingeRotateZ = this.getBoneFromCache(NameChainHingeRotateZ, 1);

    console.log('boneHingeRotateY:', boneHingeRotateY?.getLocalEulerAngles());
    console.log('boneHingeRotateX:', boneHingeRotateX?.getLocalEulerAngles());
    console.log('boneHingeRotateZ:', boneHingeRotateZ?.getLocalEulerAngles());
  }

  private updateChainsConstraint(angle: number): void {
    const chainHingeRotateY = this.getSolver().getChainByName(
      NameChainHingeRotateY
    );
    const chainHingeRotateX = this.getSolver().getChainByName(
      NameChainHingeRotateX
    );
    const chainHingeRotateZ = this.getSolver().getChainByName(
      NameChainHingeRotateZ
    );

    const boneHingeRotateY = chainHingeRotateY?.getBone(1);
    const boneHingeRotateX = chainHingeRotateX?.getBone(1);
    const boneHingeRotateZ = chainHingeRotateZ?.getBone(1);

    console.log(boneHingeRotateY);
    console.log(boneHingeRotateX);
    console.log(boneHingeRotateZ);

    boneHingeRotateY?.setHingeJointClockwiseConstraintDegs(0);
    boneHingeRotateY?.setHingeJointAnticlockwiseConstraintDegs(
      IK.Util.applyApproximatelyEqualsTolerance(angle)
    );

    boneHingeRotateX?.setHingeJointClockwiseConstraintDegs(angle);
    boneHingeRotateX?.setHingeJointAnticlockwiseConstraintDegs(
      IK.Util.applyApproximatelyEqualsTolerance(0)
    );

    boneHingeRotateZ?.setHingeJointClockwiseConstraintDegs(0);
    boneHingeRotateZ?.setHingeJointAnticlockwiseConstraintDegs(
      IK.Util.applyApproximatelyEqualsTolerance(angle)
    );
  }
}
