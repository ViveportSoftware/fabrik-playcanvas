import {fromEvent} from 'rxjs';
import * as Fabrik from '../../fabrik';
import * as IK from '../ik';

const NameChainHingeRotateY = 'chainHingeRotateY';
const NameChainHingeRotateX = 'chainHingeRotateX';
const NameChainHingeRotateZ = 'chainHingeRotateZ';

export class IKDemoGlobalHinge01 extends IK.Base implements IK.IK {
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
        IK.Util.applyApproximatelyEqualsTolerance(3),
        IK.Util.applyApproximatelyEqualsTolerance(-3)
      )
    );
    this.addTarget(
      NameChainHingeRotateX,
      new Fabrik.Vec3(
        IK.Util.applyApproximatelyEqualsTolerance(1),
        IK.Util.applyApproximatelyEqualsTolerance(3),
        IK.Util.applyApproximatelyEqualsTolerance(-3)
      )
    );
    this.addTarget(
      NameChainHingeRotateZ,
      new Fabrik.Vec3(
        IK.Util.applyApproximatelyEqualsTolerance(-1),
        IK.Util.applyApproximatelyEqualsTolerance(3),
        IK.Util.applyApproximatelyEqualsTolerance(-3)
      )
    );

    // this.randomMoveTarget(NameChainHingeRotateY);
    // this.randomMoveTarget(NameChainHingeRotateX);
    // this.randomMoveTarget(NameChainHingeRotateZ);

    this.addChains();

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
      0.5
    );

    chain.addBone(basebone);

    chain.setHingeBaseboneConstraint(
      Fabrik.BaseboneConstraintType3D.GLOBAL_HINGE,
      Fabrik.Y_AXE,
      IK.Util.applyApproximatelyEqualsTolerance(0),
      IK.Util.applyApproximatelyEqualsTolerance(0),
      Fabrik.X_AXE
    );

    this.solver.addChain(chain);
  }

  private addChainHingeRotateX(): void {
    const chain = new Fabrik.FabrikChain3D(NameChainHingeRotateX);

    const basebone = IK.Util.createRootBone(
      new Fabrik.Vec3(1, 0, 0),
      Fabrik.Y_AXE,
      0.5
    );

    chain.addBone(basebone);

    chain.setHingeBaseboneConstraint(
      Fabrik.BaseboneConstraintType3D.GLOBAL_HINGE,
      Fabrik.X_AXE,
      IK.Util.applyApproximatelyEqualsTolerance(0),
      IK.Util.applyApproximatelyEqualsTolerance(0),
      Fabrik.Z_NEG
    );

    this.solver.addChain(chain);
  }

  private addChainHingeRotateZ(): void {
    const chain = new Fabrik.FabrikChain3D(NameChainHingeRotateZ);

    const basebone = IK.Util.createRootBone(
      new Fabrik.Vec3(-1, 0, 0),
      Fabrik.Y_AXE,
      0.5
    );

    chain.addBone(basebone);

    chain.setHingeBaseboneConstraint(
      Fabrik.BaseboneConstraintType3D.GLOBAL_HINGE,
      Fabrik.Z_AXE,
      IK.Util.applyApproximatelyEqualsTolerance(0),
      IK.Util.applyApproximatelyEqualsTolerance(0),
      Fabrik.X_AXE
    );

    this.solver.addChain(chain);
  }

  private printRotation(): void {
    const boneHingeRotateY = this.getBoneFromCache(NameChainHingeRotateY, 0);
    const boneHingeRotateX = this.getBoneFromCache(NameChainHingeRotateX, 0);
    const boneHingeRotateZ = this.getBoneFromCache(NameChainHingeRotateZ, 0);

    console.log('boneHingeRotateY:', boneHingeRotateY?.getEulerAngles());
    console.log('boneHingeRotateX:', boneHingeRotateX?.getEulerAngles());
    console.log('boneHingeRotateZ:', boneHingeRotateZ?.getEulerAngles());
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

    console.log(chainHingeRotateY);
    console.log(chainHingeRotateX);
    console.log(chainHingeRotateZ);

    chainHingeRotateY?.setHingeBaseboneConstraint(
      Fabrik.BaseboneConstraintType3D.GLOBAL_HINGE,
      Fabrik.Y_AXE,
      IK.Util.applyApproximatelyEqualsTolerance(0),
      IK.Util.applyApproximatelyEqualsTolerance(angle),
      Fabrik.X_AXE
    );

    chainHingeRotateX?.setHingeBaseboneConstraint(
      Fabrik.BaseboneConstraintType3D.GLOBAL_HINGE,
      Fabrik.X_AXE,
      IK.Util.applyApproximatelyEqualsTolerance(angle),
      IK.Util.applyApproximatelyEqualsTolerance(0),
      Fabrik.Z_NEG
    );

    chainHingeRotateZ?.setHingeBaseboneConstraint(
      Fabrik.BaseboneConstraintType3D.GLOBAL_HINGE,
      Fabrik.Z_AXE,
      IK.Util.applyApproximatelyEqualsTolerance(0),
      IK.Util.applyApproximatelyEqualsTolerance(angle),
      Fabrik.X_AXE
    );
  }
}
