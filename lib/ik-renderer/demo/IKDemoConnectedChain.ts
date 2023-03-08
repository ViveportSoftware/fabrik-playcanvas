import * as Fabrik from '../../fabrik';
import * as IK from '../ik';

export class IKDemoConnectedChain extends IK.Base implements IK.IK {
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

    const chain1 = new Fabrik.FabrikChain3D('chain1');

    const basebone1 = IK.Util.createRootBone(
      new Fabrik.Vec3(0, 0, 0),
      Fabrik.Y_AXE,
      1
    );

    chain1.addBone(basebone1);

    chain1.addConsecutiveRotorConstrainedBone(Fabrik.Y_AXE, 0.5, 90);
    chain1.addConsecutiveRotorConstrainedBone(Fabrik.Y_AXE, 0.5, 90);
    chain1.addConsecutiveRotorConstrainedBone(Fabrik.Y_AXE, 0.5, 90);

    // chain.setHingeBaseboneConstraint(
    //   Fabrik.BaseboneConstraintType3D.GLOBAL_HINGE,
    //   Fabrik.Y_AXE,
    //   90,
    //   90,
    //   Fabrik.X_AXE
    // );

    chain1.setColor(new Fabrik.Color(1, 0, 0));

    this.solver.addChain(chain1);

    const chain2 = new Fabrik.FabrikChain3D('chain2');

    const basebone2 = IK.Util.createRootBone(
      new Fabrik.Vec3(0, 0, 0),
      Fabrik.X_AXE,
      1
    );

    chain2.addBone(basebone2);
    chain2.addConsecutiveRotorConstrainedBone(Fabrik.X_AXE, 0.5, 90);
    chain2.addConsecutiveRotorConstrainedBone(Fabrik.X_AXE, 0.5, 90);

    chain2.setColor(new Fabrik.Color(0, 1, 0));

    chain2.setRotorBaseboneConstraint(
      Fabrik.BaseboneConstraintType3D.LOCAL_ROTOR,
      Fabrik.X_AXE,
      45
    );

    // this.solver.addChain(chain2);
    this.solver.connectChain(chain2, 0, 1, Fabrik.BoneConnectionPoint.END);

    this.addTarget('chain1', new Fabrik.Vec3(0.01, 3, -1));
    this.addTarget('chain2', new Fabrik.Vec3(0.01, 3, 1));

    this.randomMoveTarget('chain1');
    this.randomMoveTarget('chain2');

    this.solveIK();
    this.render();
  }
}
