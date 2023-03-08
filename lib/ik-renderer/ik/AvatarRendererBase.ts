import * as Fabrik from '../../fabrik';
import * as Renderer from '../renderer';

import {Humanoid} from './Humanoid';
import {HumanoidNormal} from './HumanoidNormal';
import {IK} from './IK';

export class AvatarRendererBase {
  protected ik: IK | undefined;
  protected renderer: Renderer.AvatarRenderer | undefined;
  protected ikHumanoid: Humanoid = new HumanoidNormal();
  // protected avatarRenderer: AvatarRenderer = new AvatarRenderer();
  protected printOnceFlag = false;

  constructor(
    ik: IK | undefined,
    renderer: Renderer.AvatarRenderer | undefined
  ) {
    this.ik = ik;
    this.renderer = renderer;
  }

  public getSolver(): Fabrik.FabrikStructure3D {
    return this.ikHumanoid.getSolver();
  }

  public solveForTargets(targets: Map<string, Fabrik.Vec3>): void {
    this.ikHumanoid.solveForTargets(targets);
  }

  public run(): void {
    throw new Error('must implement');
  }

  public update(): void {
    throw new Error('must implement');
  }
}
