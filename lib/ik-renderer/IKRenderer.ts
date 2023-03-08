import * as pc from 'playcanvas';
import * as Fabrik from '../fabrik';

import {IKDemo01} from './demo/IKDemo01';
import * as IK from './ik';
import {HumanoidPart} from './ik/HumanoidPart';
import * as Renderer from './renderer';

export class IKRenderer {
  private ik: IK.IK = new IKDemo01();
  private renderer: Renderer.Renderer | Renderer.AvatarRenderer;

  constructor(renderer: Renderer.Renderer | Renderer.AvatarRenderer) {
    this.renderer = renderer;
    this.renderer.addUpdateCallback(this.update.bind(this));
    this.renderer.init();
  }

  public static pcV3ToFabrikV3(v: pc.Vec3): Fabrik.Vec3 {
    return new Fabrik.Vec3(v.x, v.y, v.z);
  }

  public static fabrikV3ToPCV3(v: Fabrik.Vec3): pc.Vec3 {
    return new pc.Vec3(v.x, v.y, v.z);
  }

  public static equalV3BetweenPCV3(v1: Fabrik.Vec3, v2: pc.Vec3): boolean {
    return v1.x == v2.x && v1.y == v2.y && v1.z == v2.z;
  }

  public static equalV3BetweenV3(v1: Fabrik.Vec3, v2: Fabrik.Vec3): boolean {
    return v1.x == v2.x && v1.y == v2.y && v1.z == v2.z;
  }

  public static equalBetweenQuat(q1: pc.Quat, q2: pc.Quat): boolean {
    return q1.x == q2.x && q1.y == q2.y && q1.z == q2.z && q1.w == q2.w;
  }

  public setIK(ik: IK.IK): void {
    this.ik = ik;
    this.ik.setRenderer(this.renderer);
  }

  public run(): void {
    this.ik?.run();
  }

  private update(dt: number): void {
    this.ik?.update();

    this.updateTargetsByXRInputSources();
  }

  private updateTargetsByXRInputSources(): void {
    if (this.renderer) {
      this.renderer.getXRInputSources()?.forEach(inputSource => {
        if (inputSource) {
          if (inputSource.handedness === pc.XRHAND_LEFT) {
            this.updateTargetByXRInputSource(inputSource, HumanoidPart.LeftArm);
          } else if (inputSource.handedness === pc.XRHAND_RIGHT) {
            this.updateTargetByXRInputSource(
              inputSource,
              HumanoidPart.RightArm
            );
          }

          const vrCameraPos = this.renderer.getVRCameraPos();
          if (vrCameraPos) {
            const target = this.ik.getTarget(HumanoidPart.Head);
            target?.setPosition(
              new Fabrik.Vec3(vrCameraPos?.x, vrCameraPos?.y, vrCameraPos?.z)
            );
            this.ik?.setNeedToSolve(true);
            this.ik?.update();
          }
        }
      });
    }
  }

  private updateTargetByXRInputSource(
    inputSource: pc.XrInputSource,
    targetPart: HumanoidPart
  ): void {
    const target = this.ik.getTarget(targetPart);
    if (target && inputSource) {
      const inputPos = inputSource.getPosition() as pc.Vec3;
      const inputRotation = inputSource.getRotation() as pc.Quat;
      const targetPos = target.getPosition();
      const targetRotation = target.getRotation();
      if (
        !IKRenderer.equalV3BetweenPCV3(targetPos, inputPos) ||
        !IKRenderer.equalBetweenQuat(targetRotation, inputRotation)
      ) {
        target.setPosition(
          new Fabrik.Vec3(inputPos?.x, inputPos?.y, inputPos?.z)
        );
        target.setRotation(inputRotation);
        this.ik?.setNeedToSolve(true);
        this.ik?.update();
      }
    }
  }
}