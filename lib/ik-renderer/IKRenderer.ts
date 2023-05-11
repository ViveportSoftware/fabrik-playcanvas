import * as pc from 'playcanvas';
import * as Fabrik from '../fabrik';

import {Logger} from './Logger';
import * as IK from './ik';
import {HumanoidPart} from './ik/core/humanoid/HumanoidPart';
import {IM01} from './ik/implement/IM01';
import * as Renderer from './renderer';

export class IKRenderer {
  private ik: IK.IK = new IM01();
  private renderer: Renderer.Renderer | Renderer.AvatarRenderer;

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

  constructor(renderer: Renderer.Renderer | Renderer.AvatarRenderer) {
    if (!renderer) {
      throw new Error('Renderer is undefined');
    }
    this.renderer = renderer;
    this.renderer.addUpdateCallback(this.update.bind(this));
    this.renderer.init();
  }

  public setIK(ik: IK.IK): void {
    this.ik = ik;
    this.ik.setRenderer(this.renderer);
  }

  public setDebug(debug: boolean): void {
    Logger.getInstance().setDebug(debug);
  }

  public run(): void {
    this.ik?.run();
  }

  private update(dt: number): void {
    this.ik?.update();
    this.updateTargetsByXRInputSources();
  }

  public stop(): void {
    this.renderer.stop();
  }

  public resume(): void {
    this.renderer.resume();
  }

  private updateTargetsByXRInputSources(): void {
    if (this.renderer && this.renderer.isLocalDemo) {
      this.renderer.getXRInputSources()?.forEach(inputSource => {
        if (inputSource) {
          if (inputSource.handedness === pc.XRHAND_LEFT) {
            this.updateTargetByXRInputSource(HumanoidPart.LeftArm, inputSource);
          } else if (inputSource.handedness === pc.XRHAND_RIGHT) {
            this.updateTargetByXRInputSource(
              HumanoidPart.RightArm,
              inputSource
            );
          }
        }
      });

      const xrCameraPos = this.renderer.getXRCameraPos();

      if (xrCameraPos) {
        const target = this.ik.getTarget(HumanoidPart.Head);
        target?.setPosition(
          new Fabrik.Vec3(xrCameraPos?.x, xrCameraPos?.y, xrCameraPos?.z)
        );
        this.ik?.setNeedToSolve(true);
        this.ik?.update();
      }
    }
  }

  public updateTargetByXRInputSource(
    targetPart: HumanoidPart,
    inputSource: pc.XrInputSource
  ): void {
    const target = this.ik.getTarget(targetPart);
    if (target && inputSource) {
      const inputPos = inputSource.getPosition() as pc.Vec3;
      const inputRotation = inputSource.getRotation() as pc.Quat;
      const targetPos = target.getPosition();
      const targetRotation = target.getRotation();

      if (this.renderer && this.renderer.isLocalDemo) {
        const targetLocalPos = target.getLocalPosition();
        switch (targetPart) {
          case HumanoidPart.LeftArm:
            this.renderer.setTextTargetLeftPos(
              `${targetLocalPos.x.toFixed(4)},${targetLocalPos.y.toFixed(
                4
              )},${targetLocalPos.z.toFixed(4)}`
            );
            break;
          case HumanoidPart.RightArm:
            this.renderer.setTextTargetRightPos(
              `${targetLocalPos.x.toFixed(4)},${targetLocalPos.y.toFixed(
                4
              )},${targetLocalPos.z.toFixed(4)}`
            );
            break;
        }
      }

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

  public setAvatarPartMap(part: Renderer.AvatarPart, name: string): void {
    Renderer.AvatarPartMap.set(part, name);
  }
}
