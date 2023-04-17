import * as Fabrik from '../../../fabrik';
import * as Renderer from '../../renderer';
import {Target} from './Target';

export interface IK {
  getTarget(id: string): Target | undefined;
  getBoneFromCache(chainName: string, boneIndex: number): pc.Entity | undefined;
  getSolver(): Fabrik.FabrikStructure3D | undefined;
  setNeedToSolve(needToSolve: boolean): void;
  setRenderer(renderer: Renderer.Renderer | Renderer.AvatarRenderer): void;
  setRenderIKBone(renderIKBone: boolean): void;
  solveForTargets(targets: Map<string, Fabrik.Vec3>): void;
  run(): void;
  update(): void;
}
