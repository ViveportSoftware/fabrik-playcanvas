import * as Fabrik from '../../fabrik';
import * as IK from '../ik';
import * as Renderer from '../renderer';

export class IKDemoHumanoidVRM extends IK.Base implements IK.IK {
  private ikAvatarRenderer: IK.AvatarRenderer | undefined;

  constructor() {
    super();

    this.init();
  }

  public getSolver(): Fabrik.FabrikStructure3D {
    if (!this.ikAvatarRenderer) {
      throw new Error('ikAvatarRenderer is undefined');
    }
    return this.ikAvatarRenderer.getSolver();
  }

  public solveForTargets(targets: Map<string, Fabrik.Vec3>): void {
    if (!this.ikAvatarRenderer) {
      throw new Error('ikAvatarRenderer is undefined');
    }
    this.ikAvatarRenderer.solveForTargets(targets);
  }

  private init(): void {}

  public run(): void {
    if (this.renderer) {
      this.ikAvatarRenderer = new IK.AvatarRendererNormal(
        this,
        this.renderer as Renderer.AvatarRenderer
      );
    }

    // this.addTarget(IK.HumanoidPart.Spine, new Fabrik.Vec3(0.001, 4, -0.1));
    // this.addTarget(IK.HumanoidPart.Head, new Fabrik.Vec3(0.001, 4, -0.1));
    // this.addTarget(IK.HumanoidPart.RightArm, new Fabrik.Vec3(4, 1.6, -0.2));
    // this.addTarget(IK.HumanoidPart.LeftArm, new Fabrik.Vec3(-4, 1.6, -0.2));
    // this.addTarget(IK.HumanoidPart.RightLeg, new Fabrik.Vec3(0.3, -5, -0.1));
    // this.addTarget(IK.HumanoidPart.LeftLeg, new Fabrik.Vec3(-0.3, -5, -0.1));

    const offsetX = 0;

    this.addTarget(
      IK.HumanoidPart.Spine,
      new Fabrik.Vec3(offsetX + 0.001, 1.5, -0.01)
    );
    this.addTarget(
      IK.HumanoidPart.Head,
      new Fabrik.Vec3(offsetX + 0.001, 1.5, -0.01)
    );
    this.addTarget(
      IK.HumanoidPart.RightArm,
      new Fabrik.Vec3(offsetX + 0.5, 1, -0.01)
    );
    this.addTarget(
      IK.HumanoidPart.LeftArm,
      new Fabrik.Vec3(offsetX - 0.5, 1, -0.01)
    );
    // this.addTarget(
    //   IK.HumanoidPart.RightLeg,
    //   new Fabrik.Vec3(offsetX + 0.3, -3, -2)
    // );
    // this.addTarget(
    //   IK.HumanoidPart.LeftLeg,
    //   new Fabrik.Vec3(offsetX + -0.3, -3, 2)
    // );

    // this.randomMoveTarget(
    //   IK.HumanoidPart.Spine,
    //   new Fabrik.Vec3(-0.5, -1.5, -1.5),
    //   new Fabrik.Vec3(0.5, 3.5, 0.5)
    // );

    // this.randomMoveTarget(
    //   IK.HumanoidPart.RightArm,
    //   new Fabrik.Vec3(4, 3, 2),
    //   new Fabrik.Vec3(-0.5, -3, -2.5),
    //   dt => {
    //     this.setNeedToSolve(true);
    //     this.solveIK();
    //     this.render();

    //     if (this.ikAvatarRenderer) {
    //       this.ikAvatarRenderer.update();
    //     }
    //   }
    // );

    // this.randomMoveTarget(
    //   IK.HumanoidPart.LeftArm,
    //   new Fabrik.Vec3(-4, 3, 2),
    //   new Fabrik.Vec3(0.5, -3, -2.5),
    //   dt => {
    //     this.setNeedToSolve(true);
    //     this.solveIK();
    //     this.render();

    //     if (this.ikAvatarRenderer) {
    //       this.ikAvatarRenderer.update();
    //     }
    //   }
    // );

    if (this.ikAvatarRenderer) {
      this.ikAvatarRenderer.run();
    }

    this.solveIK();
    this.render();
  }

  public update(): void {
    this.solveIK();
    this.render();

    if (this.ikAvatarRenderer) {
      this.ikAvatarRenderer.update();
    }
  }
}
