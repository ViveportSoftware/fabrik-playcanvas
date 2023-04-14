import * as Fabrik from '../../fabrik';

export interface AvatarRenderer {
  getSolver(): Fabrik.FabrikStructure3D | undefined;
  solveForTargets(targets: Map<string, Fabrik.Vec3>): void;
  run(): void;
  update(): void;
}
