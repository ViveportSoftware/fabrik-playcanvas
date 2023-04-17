import * as IK from '..';
import * as Fabrik from '../../../fabrik';

export class IM02 extends IK.Base implements IK.IK {
  private solver: Fabrik.FabrikStructure3D;

  constructor() {
    super();
    this.solver = new Fabrik.FabrikStructure3D();
  }

  public getSolver(): Fabrik.FabrikStructure3D {
    return this.solver;
  }

  public update(): void {}

  public solveForTarget(target: Fabrik.Vec3): void {
    this.solver.solveForTarget(target);
  }

  public solveForTargets(targets: Map<string, Fabrik.Vec3>): void {
    this.solver.solveForTargets(targets);
  }

  public run(): void {
    this.solver = new Fabrik.FabrikStructure3D();

    const chain = new Fabrik.FabrikChain3D('default');

    const basebone = IK.Util.createRootBone(
      new Fabrik.Vec3(0, 0, 0),
      Fabrik.Y_AXE,
      0.1
    );

    console.log(basebone);

    chain.addBone(basebone);

    chain.addConsecutiveRotorConstrainedBone(Fabrik.Y_AXE, 0.5, 90);
    chain.addConsecutiveRotorConstrainedBone(Fabrik.Y_AXE, 0.5, 90);
    chain.addConsecutiveRotorConstrainedBone(Fabrik.Y_AXE, 0.5, 90);
    chain.addConsecutiveRotorConstrainedBone(Fabrik.Y_AXE, 0.5, 90);

    chain.setRotorBaseboneConstraint(
      Fabrik.BaseboneConstraintType3D.GLOBAL_ROTOR,
      Fabrik.Y_AXE,
      45
    );

    this.solver.addChain(chain);

    const targetName = 'default';

    this.addTarget(targetName, new Fabrik.Vec3(0.01, 3, 0));

    this.randomMoveTarget(targetName);

    this.solveIK();
    this.render();
  }
}
