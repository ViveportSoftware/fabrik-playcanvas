import * as Fabrik from '../../../../fabrik';
import * as Renderer from '../../../renderer';
import {IK} from '../IK';
import {Humanoid} from '../humanoid/Humanoid';

export class AvatarRendererBase {
  protected ik: IK | undefined;
  protected renderer: Renderer.AvatarRenderer | undefined;
  protected ikHumanoid?: Humanoid;
  protected printOnceFlag = false;

  constructor(
    ik: IK | undefined,
    renderer: Renderer.AvatarRenderer | undefined
  ) {
    this.ik = ik;
    this.renderer = renderer;
  }

  public getSolver(): Fabrik.FabrikStructure3D | undefined {
    if (!this.ikHumanoid) {
      return undefined;
    }
    return this.ikHumanoid.getSolver();
  }

  public solveForTargets(targets: Map<string, Fabrik.Vec3>): void {
    if (this.ikHumanoid) {
      this.ikHumanoid.solveForTargets(targets);
    }
  }

  public run(): void {
    throw new Error('must implement');
  }

  public update(): void {
    throw new Error('must implement');
  }
}
