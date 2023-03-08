import * as Fabrik from '../../fabrik';

export class Util {
  public static createRootBone(
    startPos: Fabrik.Vec3 = new Fabrik.Vec3(0, 0, 0),
    directionUV: Fabrik.Vec3 = Fabrik.Y_AXE,
    length: number = 0.0001
  ): Fabrik.FabrikBone3D {
    const bone = new Fabrik.FabrikBone3D(
      startPos,
      new Fabrik.Vec3(
        startPos.x + directionUV.x * length,
        startPos.y + directionUV.y * length,
        startPos.z + directionUV.z * length
      )
    );

    return bone;
  }

  public static applyApproximatelyEqualsTolerance(v: number): number {
    if (v >= 0) {
      return v + Fabrik.FabrikChain3D.DefaultApproximatelyEqualsTolerance;
    } else {
      return v - Fabrik.FabrikChain3D.DefaultApproximatelyEqualsTolerance;
    }
  }
}
