import * as Fabrik from '../../../../fabrik';

export interface Humanoid {
  getSolver(): Fabrik.FabrikStructure3D;
  solveForTargets(targets: Map<string, Fabrik.Vec3>): void;
}
