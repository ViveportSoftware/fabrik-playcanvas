import * as Fabrik from '../../../../fabrik';
import {HumanoidPart} from './HumanoidPart';

export class HumanoidBase {
  protected solver: Fabrik.FabrikStructure3D = new Fabrik.FabrikStructure3D();

  protected chains: Map<HumanoidPart, Fabrik.FabrikChain3D> = new Map();

  protected boneScale = 0.1;

  constructor() {}

  public getSolver(): Fabrik.FabrikStructure3D {
    return this.solver;
  }

  public solveForTargets(targets: Map<string, Fabrik.Vec3>): void {
    this.solver.solveForTargets(targets);
  }
}
